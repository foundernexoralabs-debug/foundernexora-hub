// @vitest-environment node
// @polsia:user-owned — the /api/receptionist and /api/reports handlers end to end (mocked
// network): rate limits, length caps, validation, no-env fallbacks, idempotency and logs.
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  adminLimiter,
  askLimiter,
  createAdminHandlers,
  createAskHandler,
  createReportHandler,
  createStatusHandler,
  reportLimiter,
} from '../../src/lib/business/receptionist/handlers';
import { clientKey, createRateLimiter } from '../../src/lib/business/receptionist/rate-limit';
import { createMemoryStore } from '../../src/lib/business/receptionist/report-store';

const post = (path: string, body: unknown, ip = '198.51.100.7') =>
  new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const noEnv = { config: () => null, store: () => null, handoff: () => null };

afterEach(() => vi.restoreAllMocks());

describe('rate limiting', () => {
  it('allows up to the limit, then refuses with a retry time, then recovers', () => {
    const limiter = createRateLimiter([{ limit: 3, windowMs: 60_000 }]);
    const t0 = 1_000_000;
    expect([0, 1, 2].map((i) => limiter.check('k', t0 + i).allowed)).toEqual([true, true, true]);
    const blocked = limiter.check('k', t0 + 10);
    expect(blocked).toMatchObject({ allowed: false, remaining: 0 });
    expect(blocked.retryAfterSeconds).toBe(60);
    expect(limiter.check('other', t0 + 10).allowed).toBe(true);
    expect(limiter.check('k', t0 + 60_001).allowed).toBe(true);
  });

  it('applies every rule (per minute and per hour)', () => {
    const limiter = createRateLimiter([
      { limit: 100, windowMs: 60_000 },
      { limit: 2, windowMs: 3_600_000 },
    ]);
    limiter.check('k', 0);
    limiter.check('k', 120_000);
    expect(limiter.check('k', 240_000).allowed).toBe(false);
  });

  it('keys visitors by a salted hash, never the raw IP', () => {
    const key = clientKey(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' }), 'ask');
    expect(key).not.toContain('203.0.113.9');
    expect(key).toMatch(/^[0-9a-f]{24}$/);
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.9' }), 'ask')).toBe(key);
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.9' }), 'report')).not.toBe(key);
  });

  it('returns 429 from the Guide after 8 questions a minute from one visitor', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const handler = createAskHandler({ config: noEnv.config, limiter: askLimiter() });
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++)
      statuses.push(
        (await handler(post('/api/receptionist', { message: 'What is Renor?' }))).status,
      );
    expect(statuses.slice(0, 8)).toEqual(Array(8).fill(200));
    const last = await handler(post('/api/receptionist', { message: 'What is Renor?' }));
    expect(last.status).toBe(429);
    expect(Number(last.headers.get('retry-after'))).toBeGreaterThan(0);
    // A different visitor is unaffected.
    expect(
      (await handler(post('/api/receptionist', { message: 'What is Renor?' }, '192.0.2.1'))).status,
    ).toBe(200);
  });
});

describe('/api/receptionist', () => {
  const handler = () => createAskHandler({ config: noEnv.config, limiter: askLimiter() });

  it('answers offline with no env, citing the page', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const res = await handler()(
      post('/api/receptionist', { message: 'How do I get started?', page: '/renor' }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ kind: 'answer', mode: 'offline', degraded: false });
    expect(body.sources[0].href).toBe('/renor#access');
  });

  it('caps message length and rejects bad bodies', async () => {
    expect((await handler()(post('/api/receptionist', { message: 'x'.repeat(601) }))).status).toBe(
      400,
    );
    expect((await handler()(post('/api/receptionist', { message: '   ' }))).status).toBe(400);
    expect((await handler()(post('/api/receptionist', '{not json'))).status).toBe(400);
    expect(
      (await handler()(post('/api/receptionist', { message: 'hi', pad: 'x'.repeat(20_000) })))
        .status,
    ).toBe(413);
  });

  it('logs unanswered questions redacted, and never the answered ones', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    await handler()(
      post('/api/receptionist', { message: 'Do you ship to Mars? mail me at a.b@example.com' }),
    );
    await handler()(post('/api/receptionist', { message: 'What is Renor?' }));
    const lines = log.mock.calls.map((call) => String(call[0]));
    expect(lines.join('\n')).not.toContain('a.b@example.com');
    expect(lines[0]).toContain('[email]');
    expect(lines[1]).not.toContain('"text"');
  });

  it('reports the mode without exposing configuration', async () => {
    const offline = await (await createStatusHandler(noEnv)()).json();
    expect(offline).toEqual({ mode: 'offline', reports: 'email' });
    const live = createStatusHandler({
      config: () => ({
        baseUrl: 'https://secret-host.example.test/v1',
        apiKey: 'k-123456',
        model: 'm',
        timeoutMs: 1000,
      }),
      store: () => createMemoryStore(),
    });
    const text = await (await live()).text();
    expect(JSON.parse(text)).toEqual({ mode: 'live', reports: 'stored' });
    for (const secret of ['secret-host', 'k-123456']) expect(text).not.toContain(secret);
  });
});

describe('/api/reports', () => {
  const valid = {
    clientId: '0b8e2c4d-6f1a-4b3c-8d5e-7f9a1b2c3d4e',
    type: 'bug',
    description: 'The Plugin Store page shows a blank card on my phone.',
    page: '/plugins',
    email: '',
    context: { viewport: '390x844', theme: 'dark', browser: 'Safari on iOS' },
  };
  const reportHandler = (
    store = noEnv.store as () => ReturnType<typeof createMemoryStore> | null,
  ) => createReportHandler({ store, handoff: noEnv.handoff, limiter: reportLimiter() });

  it('with no store: gives a reference and an email to send, and says so', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const res = await reportHandler()(post('/api/reports', valid));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reference).toMatch(/^RNR-[0-9A-Z]{8}$/);
    expect(body.status).toBe('email');
    expect(body.message).toMatch(/isn’t switched on yet/);
    expect(decodeURIComponent(body.mailto)).toContain(body.reference);
  });

  it('with a store: saves privately and returns the same reference for a retry', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const store = createMemoryStore();
    const handler = reportHandler(() => store);
    const retry = { ...valid, clientId: '1c9f3d5e-7a2b-4c4d-9e6f-8a0b2c3d4e5f' };
    const first = await (await handler(post('/api/reports', retry))).json();
    const second = await (await handler(post('/api/reports', retry))).json();
    expect(first.status).toBe('stored');
    expect(first.message).toMatch(/stored privately/);
    expect(second.reference).toBe(first.reference);
    expect(await store.list()).toHaveLength(1);
  });

  it('validates fields with messages the form can show', async () => {
    const res = await reportHandler()(
      post('/api/reports', {
        ...valid,
        clientId: crypto.randomUUID(),
        description: 'short',
        contactMe: true,
        email: 'nope',
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.description).toMatch(/at least/);
    expect(body.errors.email).toMatch(/email/);
  });

  it('stores nothing for a filled honeypot but still lets a person email it', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const store = createMemoryStore();
    const body = await (
      await reportHandler(() => store)(
        post('/api/reports', {
          ...valid,
          clientId: crypto.randomUUID(),
          website: 'http://spam.example',
        }),
      )
    ).json();
    expect(await store.list()).toHaveLength(0);
    expect(body.status).toBe('email');
    expect(body.mailto).toMatch(/^mailto:/);
  });

  it('limits a visitor to 4 reports in 10 minutes', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const handler = reportHandler();
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++)
      statuses.push(
        (
          await handler(
            post('/api/reports', { ...valid, clientId: crypto.randomUUID() }, '203.0.113.50'),
          )
        ).status,
      );
    expect(statuses).toEqual([200, 200, 200, 200, 429]);
  });

  it('logs the outcome without the description or email', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    await reportHandler(() => createMemoryStore())(
      post(
        '/api/reports',
        { ...valid, clientId: crypto.randomUUID(), contactMe: true, email: 'me@example.com' },
        '203.0.113.60',
      ),
    );
    const line = String(log.mock.calls.at(-1)?.[0]);
    expect(line).toContain('report.filed');
    expect(line).not.toContain('me@example.com');
    expect(line).not.toContain('blank card');
  });
});

describe('/api/reports/admin (team triage)', () => {
  const TOKEN = 'a-long-test-access-key-0123456789';
  const get = (token?: string, ip = '198.51.100.90') =>
    new Request('http://localhost/api/reports/admin', {
      headers: { 'x-forwarded-for': ip, ...(token ? { authorization: `Bearer ${token}` } : {}) },
    });

  it('does not exist without REPORTS_ADMIN_TOKEN', async () => {
    const admin = createAdminHandlers({
      adminToken: () => null,
      store: () => createMemoryStore(),
      limiter: adminLimiter(),
    });
    expect((await admin.GET(get(TOKEN))).status).toBe(404);
  });

  it('refuses a missing or wrong key', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const admin = createAdminHandlers({
      adminToken: () => TOKEN,
      store: () => createMemoryStore(),
      limiter: adminLimiter(),
    });
    expect((await admin.GET(get())).status).toBe(401);
    expect((await admin.GET(get(`${TOKEN}x`))).status).toBe(401);
  });

  it('says when no store is configured', async () => {
    const admin = createAdminHandlers({
      adminToken: () => TOKEN,
      store: () => null,
      limiter: adminLimiter(),
    });
    expect((await admin.GET(get(TOKEN))).status).toBe(503);
  });

  it('lists stored reports and updates their state', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const store = createMemoryStore();
    const filed = await (
      await createReportHandler({
        store: () => store,
        handoff: () => null,
        limiter: reportLimiter(),
      })(post('/api/reports', { ...valid(), clientId: crypto.randomUUID() }, '198.51.100.91'))
    ).json();
    const admin = createAdminHandlers({
      adminToken: () => TOKEN,
      store: () => store,
      limiter: adminLimiter(),
    });
    const list = await (await admin.GET(get(TOKEN))).json();
    expect(list).toMatchObject({ store: 'memory', retentionDays: 90 });
    expect(list.items[0]).toMatchObject({
      reference: filed.reference,
      state: 'new',
      area: 'Website · Plugin Store',
    });
    const patch = new Request('http://localhost/api/reports/admin', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ reference: filed.reference, state: 'closed' }),
    });
    expect((await admin.PATCH(patch)).status).toBe(200);
    expect((await store.list())[0]?.state).toBe('closed');
  });

  function valid() {
    return {
      type: 'bug',
      description: 'The Plugin Store page shows a blank card on my phone.',
      page: '/plugins',
    };
  }
});
