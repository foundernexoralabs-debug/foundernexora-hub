// @vitest-environment node
// @polsia:user-owned — the privacy gate for the Renor Guide and its report bridge, one block per
// review point: redaction before persistence/logging/model calls, opt-in email and wording,
// enforced retention, no report data to GitHub/analytics/model prompts, an isolated store, and a
// fail-closed admin API.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  adminLimiter,
  askLimiter,
  createAdminHandlers,
  createAskHandler,
  createReportHandler,
  readAdminToken,
  reportLimiter,
} from '../../src/lib/business/receptionist/handlers';
import type { ModelConfig } from '../../src/lib/business/receptionist/model';
import {
  createMemoryStore,
  REPORT_KEY_PREFIX,
  type ReportStore,
  readReportStore,
} from '../../src/lib/business/receptionist/report-store';
import type { StoredReport } from '../../src/lib/business/receptionist/reports';

const SECRETS = {
  email: 'jane.doe@example.com',
  phone: '+44 7700 900123',
  card: '4242 4242 4242 4242',
  key: 'sk-live-abcdefghijklmnopqrstu',
} as const;
const PRIVATE_TEXT = `The plans page Join button does nothing. Contact ${SECRETS.email} or ${SECRETS.phone}, card ${SECRETS.card}, my key ${SECRETS.key}.`;

const MODEL: ModelConfig = {
  baseUrl: 'https://models.example.test/v1',
  apiKey: 'test-model-key-000000',
  model: 'example',
  timeoutMs: 5000,
};

let ipCounter = 0;
const post = (url: string, body: unknown) =>
  new Request(`http://localhost${url}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${++ipCounter}` },
    body: JSON.stringify(body),
  });

const reportBody = (overrides: Record<string, unknown> = {}) => ({
  clientId: crypto.randomUUID(),
  type: 'bug',
  description: PRIVATE_TEXT,
  page: '/renor/plans',
  ...overrides,
});

/** A memory store whose writes are recorded for inspection. */
function spiedStore() {
  const inner = createMemoryStore();
  const writes: StoredReport[] = [];
  const store: ReportStore = {
    ...inner,
    kind: inner.kind,
    retentionDays: inner.retentionDays,
    save: async (record) => {
      writes.push(structuredClone(record));
      await inner.save(record);
    },
  };
  return { store, writes };
}

const expectNoSecrets = (text: string) => {
  for (const secret of Object.values(SECRETS)) expect(text).not.toContain(secret);
};

afterEach(() => vi.restoreAllMocks());

describe('1. redaction happens before any persistence, logging or model call', () => {
  it('report: the store write and every log line hold only redacted text', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const { store, writes } = spiedStore();
    const handler = createReportHandler({
      store: () => store,
      handoff: () => null,
      limiter: reportLimiter(),
    });
    const res = await handler(post('/api/reports', reportBody({ shareDescription: true })));
    expect((await res.json()).status).toBe('stored');
    expect(writes).toHaveLength(1);
    expectNoSecrets(JSON.stringify(writes));
    expect(writes[0]?.description).toContain('[email]');
    expect(writes[0]?.description).toContain('[key]');
    expect(log).toHaveBeenCalled();
    expectNoSecrets(log.mock.calls.map((call) => String(call[0])).join('\n'));
  });

  it('question: every log line and the model request hold only redacted text', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const fetchImpl = vi.fn(async () =>
      Response.json({ choices: [{ message: { content: 'Free is £0 [1].' } }] }),
    );
    const ask = createAskHandler({ config: () => MODEL, limiter: askLimiter(), fetchImpl });
    const answered = `Is Renor free? ${SECRETS.email} ${SECRETS.phone} ${SECRETS.card} ${SECRETS.key}`;
    await ask(post('/api/receptionist', { message: answered }));
    // An unanswered question is the one whose (redacted) text is logged.
    await ask(
      post('/api/receptionist', {
        message: `Do you ship to Mars? ${SECRETS.email} ${SECRETS.phone}`,
      }),
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const modelBody = String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body);
    expectNoSecrets(modelBody);
    expect(modelBody).toContain('[email]');
    const lines = log.mock.calls.map((call) => String(call[0])).join('\n');
    expectNoSecrets(lines);
    expect(lines).toContain('[email]');
  });

  it('history sent back to the model is redacted too', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ choices: [{ message: { content: 'Every week [1].' } }] }),
    );
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const ask = createAskHandler({ config: () => MODEL, limiter: askLimiter(), fetchImpl });
    await ask(
      post('/api/receptionist', {
        message: 'When do credits reset?',
        history: [{ role: 'user', content: `What is an AI credit? I am ${SECRETS.email}` }],
      }),
    );
    expectNoSecrets(String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body));
  });
});

describe('2. email and wording are opt-in', () => {
  const file = async (overrides: Record<string, unknown>) => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const { store, writes } = spiedStore();
    const handoffCalls: string[] = [];
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      handoffCalls.push(String(init?.body));
      return new Response(null, { status: 202 });
    });
    const handler = createReportHandler({
      store: () => store,
      handoff: () => ({ url: 'https://bridge.example.test/in', secret: 's'.repeat(32) }),
      limiter: reportLimiter(),
      fetchImpl,
    });
    await handler(post('/api/reports', reportBody({ email: 'reply@example.org', ...overrides })));
    return { record: writes[0] as StoredReport, handoff: JSON.parse(handoffCalls[0] ?? '{}') };
  };

  it('both off: no email and no wording kept (record and hand-off)', async () => {
    const { record, handoff } = await file({ contactMe: false, shareDescription: false });
    expect(record.contactEmail).toBeUndefined();
    expect(JSON.stringify(record)).not.toContain('reply@example.org');
    expect(record.shareDescription).toBe(false);
    // Unticked: only reference, type, page, area, severity guess and time; no wording at all.
    expect(record.description).toBe('');
    expect(record.steps).toEqual([]);
    expect(record.summary).toBe('Bug on /renor/plans');
    expect(record.expected).toBeUndefined();
    expect(record.actual).toBeUndefined();
    expect(record.context).toEqual({});
    expect(JSON.stringify(record)).not.toContain('Join button');
    expect(handoff.report.description).toBeUndefined();
    expect(handoff.report.steps).toBeUndefined();
    expect(JSON.stringify(handoff)).not.toContain('Join button');
  });

  it('"Email me" on: the email is kept, and still never handed to engineers', async () => {
    const { record, handoff } = await file({ contactMe: true, shareDescription: false });
    expect(record.contactEmail).toBe('reply@example.org');
    expect(JSON.stringify(handoff)).not.toContain('reply@example.org');
  });

  it('"The Renor team may read my description" on: redacted wording kept and handed off', async () => {
    const { record, handoff } = await file({ contactMe: false, shareDescription: true });
    expect(record.shareDescription).toBe(true);
    expect(record.description).toContain('Join button');
    expect(record.description).toContain('[email]');
    expectNoSecrets(JSON.stringify(record));
    expect(handoff.report.description).toContain('Join button');
    expectNoSecrets(JSON.stringify(handoff));
  });
});

describe('3. retention is enforced', () => {
  it('every Redis write sets a TTL of REPORTS_RETENTION_DAYS', async () => {
    const commands: unknown[][] = [];
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const batch = JSON.parse(String(init?.body)) as unknown[][];
      commands.push(...batch);
      return Response.json(
        batch.map(() => ({ result: batch[0]?.[0] === 'ZREVRANGE' ? [] : 'OK' })),
      );
    });
    const store = readReportStore(
      {
        REPORTS_KV_REST_URL: 'https://kv.example.test',
        REPORTS_KV_REST_TOKEN: 't',
        REPORTS_RETENTION_DAYS: '45',
      },
      fetchImpl,
    );
    expect(store?.retentionDays).toBe(45);
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const handler = createReportHandler({
      store: () => store,
      handoff: () => null,
      limiter: reportLimiter(),
    });
    await handler(post('/api/reports', reportBody()));
    const set = commands.find((c) => c[0] === 'SET');
    expect(set?.slice(-2)).toEqual(['EX', 45 * 86_400]);
  });

  it('defaults to 90 days and rejects out-of-range values', () => {
    const env = { REPORTS_KV_REST_URL: 'https://kv.example.test', REPORTS_KV_REST_TOKEN: 't' };
    expect(readReportStore(env)?.retentionDays).toBe(90);
    expect(readReportStore({ ...env, REPORTS_RETENTION_DAYS: '0' })?.retentionDays).toBe(90);
    expect(readReportStore({ ...env, REPORTS_RETENTION_DAYS: '9999' })?.retentionDays).toBe(90);
  });

  it('Redis: expired items are trimmed from the index and never returned', async () => {
    const seen: unknown[][] = [];
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const batch = JSON.parse(String(init?.body)) as unknown[][];
      seen.push(...batch);
      return Response.json(
        batch.map((c) =>
          c[0] === 'ZREVRANGE'
            ? { result: ['RNR-00000001'] }
            : c[0] === 'MGET'
              ? { result: [null] } // the key already expired
              : { result: 0 },
        ),
      );
    });
    const store = readReportStore(
      {
        REPORTS_KV_REST_URL: 'https://kv.example.test',
        REPORTS_KV_REST_TOKEN: 't',
        REPORTS_RETENTION_DAYS: '90',
      },
      fetchImpl,
    );
    const before = Date.now();
    expect(await store?.list()).toEqual([]);
    const trim = seen.find((c) => c[0] === 'ZREMRANGEBYSCORE');
    expect(Number(trim?.[3])).toBeLessThanOrEqual(before - 90 * 86_400_000 + 5000);
  });

  it('memory: a record older than the retention period is not returned', async () => {
    let now = Date.parse('2026-10-24T12:00:00Z');
    const store = createMemoryStore(90, () => now);
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const handler = createReportHandler({
      store: () => store,
      handoff: () => null,
      limiter: reportLimiter(),
      now: () => new Date(now),
    });
    await handler(post('/api/reports', reportBody()));
    expect(await store.list()).toHaveLength(1);
    now += 90 * 86_400_000 + 1;
    expect(await store.list()).toHaveLength(0);
  });
});

const srcDir = path.resolve(__dirname, '../../src');
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? files(full) : /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}
const read = (file: string) => readFileSync(file, 'utf-8');
const receptionistFiles = [
  ...files(path.join(srcDir, 'lib/business/receptionist')),
  ...files(path.join(srcDir, 'components/custom/receptionist')),
  ...files(path.join(srcDir, 'app/api/reports')),
  ...files(path.join(srcDir, 'app/api/receptionist')),
];

describe('4. no report data reaches GitHub, analytics or model prompts', () => {
  it('no Guide or report code talks to GitHub or analytics', () => {
    for (const file of receptionistFiles) {
      const code = read(file);
      const rel = path.relative(srcDir, file);
      expect(code, rel).not.toMatch(/api\.github\.com|@octokit|from ['"][^'"]*github/i);
      expect(code, rel).not.toMatch(/polsia-analytics|posthog|gtag|plausible|segment/i);
    }
  });

  it('nothing outside the bridge imports the report store or records', () => {
    const allowed =
      /receptionist\/(handlers|bridge|report-store|reports|handoff)\.ts$|receptionist\/reports-triage\.tsx$|api\/reports\//;
    for (const file of files(srcDir)) {
      if (allowed.test(file)) continue;
      expect(read(file), path.relative(srcDir, file)).not.toMatch(
        /receptionist\/(report-store|bridge|handoff)['"]/,
      );
    }
  });

  it('the answer pipeline (and so every model prompt) never reads the report store', () => {
    for (const name of ['answer.ts', 'model.ts', 'retrieval.ts', 'knowledge.ts', 'guard.ts']) {
      expect(read(path.join(srcDir, 'lib/business/receptionist', name)), name).not.toMatch(
        /report-store|bridge|reports['"]|handoff/,
      );
    }
  });

  it('a stored report never appears in a later model prompt', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const { store } = spiedStore();
    await createReportHandler({
      store: () => store,
      handoff: () => null,
      limiter: reportLimiter(),
    })(
      post(
        '/api/reports',
        reportBody({
          description: 'Unique-marker-QX7 the plans page Join button does nothing at all.',
        }),
      ),
    );
    const fetchImpl = vi.fn(async () =>
      Response.json({ choices: [{ message: { content: 'See the plans [1].' } }] }),
    );
    await createAskHandler({ config: () => MODEL, limiter: askLimiter(), fetchImpl })(
      post('/api/receptionist', { message: 'How much are the plans?' }),
    );
    const body = String((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body);
    expect(body).not.toContain('Unique-marker-QX7');
    expect(body).not.toMatch(/RNR-[0-9A-Z]{8}/);
  });

  it('the hand-off carries no identifiers beyond the reference: no email, IP or browser string', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    const bodies: string[] = [];
    const fetchImpl = vi.fn(async (_u: string | URL | Request, init?: RequestInit) => {
      bodies.push(String(init?.body));
      return new Response(null, { status: 202 });
    });
    await createReportHandler({
      store: () => createMemoryStore(),
      handoff: () => ({ url: 'https://bridge.example.test/in', secret: 's'.repeat(32) }),
      limiter: reportLimiter(),
      fetchImpl,
    })(post('/api/reports', reportBody({ contactMe: true, email: 'reply@example.org' })));
    const payload = JSON.parse(bodies[0] ?? '{}');
    expect(Object.keys(payload.report).sort()).toEqual(
      [
        'area',
        'environment',
        'groupId',
        'groupSize',
        'page',
        'receivedAt',
        'reference',
        'severity',
        'severityReason',
        'stepCount',
        'type',
      ].sort(),
    );
    expect(bodies[0]).not.toContain('reply@example.org');
    expect(bodies[0]).not.toMatch(/192\.0\.2\./);
  });
});

describe('5. the report store is isolated', () => {
  it('namespaces every key under its own prefix', async () => {
    const keys: string[] = [];
    const fetchImpl = vi.fn(async (_u: string | URL | Request, init?: RequestInit) => {
      const batch = JSON.parse(String(init?.body)) as unknown[][];
      for (const c of batch) if (typeof c[1] === 'string') keys.push(c[1]);
      return Response.json(batch.map(() => ({ result: 'OK' })));
    });
    const store = readReportStore(
      { REPORTS_KV_REST_URL: 'https://kv.example.test', REPORTS_KV_REST_TOKEN: 't' },
      fetchImpl,
    );
    await store?.save({
      reference: 'RNR-00000001',
      receivedAt: new Date().toISOString(),
    } as StoredReport);
    await store?.setState('RNR-00000001', 'closed');
    expect(REPORT_KEY_PREFIX).toBe('guide-reports:v1:');
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) expect(key.startsWith(REPORT_KEY_PREFIX), key).toBe(true);
  });

  it('uses only its own REPORTS_* credentials, never shared KV/Redis variables', () => {
    const shared = {
      KV_REST_API_URL: 'https://shared.example.test',
      KV_REST_API_TOKEN: 't',
      UPSTASH_REDIS_REST_URL: 'https://shared.example.test',
      UPSTASH_REDIS_REST_TOKEN: 't',
      REDIS_URL: 'rediss://shared.example.test',
    };
    expect(readReportStore(shared)).toBeNull();
    const code = read(path.join(srcDir, 'lib/business/receptionist/report-store.ts'));
    const envNames = [...code.matchAll(/env\.([A-Z_]+)/g)].map((m) => m[1]);
    expect(envNames.length).toBeGreaterThan(0);
    for (const name of envNames) expect(name, name).toMatch(/^(REPORTS_[A-Z_]+|NODE_ENV)$/);
  });
});

describe('6. admin fails closed', () => {
  const get = () =>
    new Request('http://localhost/api/reports/admin', {
      headers: { authorization: `Bearer ${'k'.repeat(32)}`, 'x-forwarded-for': '192.0.2.250' },
    });

  it.each([
    ['absent', {}],
    ['empty', { REPORTS_ADMIN_TOKEN: '' }],
    ['too short', { REPORTS_ADMIN_TOKEN: 'short-key' }],
  ])('API is a 404 when the key is %s', async (_label, env) => {
    const admin = createAdminHandlers({
      adminToken: () => readAdminToken(env),
      store: () => createMemoryStore(),
      limiter: adminLimiter(),
    });
    expect((await admin.GET(get())).status).toBe(404);
    const patch = new Request('http://localhost/api/reports/admin', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${'k'.repeat(32)}` },
      body: JSON.stringify({ reference: 'RNR-00000001', state: 'closed' }),
    });
    expect((await admin.PATCH(patch)).status).toBe(404);
  });
});
