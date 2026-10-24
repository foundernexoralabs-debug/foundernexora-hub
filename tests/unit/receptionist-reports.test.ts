// @vitest-environment node
// @polsia:user-owned — the feedback bridge: reference numbers, triage, privacy-safe records,
// de-duplication groups, the private store, the optional PII-free hand-off and the email fallback.
import { describe, expect, it, vi } from 'vitest';
import { fileReport } from '../../src/lib/business/receptionist/bridge';
import { readHandoffConfig, signBody } from '../../src/lib/business/receptionist/handoff';
import {
  createKvStore,
  createMemoryStore,
  type ReportStore,
  readReportStore,
} from '../../src/lib/business/receptionist/report-store';
import {
  buildRecord,
  createReference,
  extractSteps,
  findDuplicate,
  guessArea,
  guessSeverity,
  handoffSummary,
  mailtoHref,
  REFERENCE_PATTERN,
  similarity,
  triage,
} from '../../src/lib/business/receptionist/reports';
import { type ParsedReport, ReportRequest } from '../../src/lib/contracts/receptionist';

const report = (overrides: Partial<ParsedReport> = {}): ParsedReport =>
  ReportRequest.parse({
    clientId: '6f1d3c2a-8b4e-4f5a-9c7d-1e2f3a4b5c6d',
    type: 'bug',
    description:
      'The Join the early list button on the plans page does nothing. 1. Open the plans page\n2. Click Join the early list on Pro\n3. Nothing happens. I expected my email app to open.',
    page: '/renor/plans',
    ...overrides,
  });

const NOW = new Date('2026-10-24T12:00:00.000Z');

describe('reference numbers', () => {
  it('are RNR- plus 8 unambiguous characters, and unique', () => {
    const refs = new Set(Array.from({ length: 500 }, () => createReference()));
    expect(refs.size).toBe(500);
    for (const ref of refs) expect(ref).toMatch(new RegExp(`^${REFERENCE_PATTERN.source}$`));
    expect(createReference(new Uint8Array([0, 0, 0, 0, 0]))).toBe('RNR-00000000');
  });
});

describe('triage', () => {
  it('guesses severity from what the visitor describes', () => {
    expect(guessSeverity('bug', 'I can’t sign in at all').severity).toBe('high');
    expect(guessSeverity('bug', 'I was charged twice').severity).toBe('high');
    expect(
      guessSeverity('bug', 'All my notes disappeared after reload: lost my work').severity,
    ).toBe('high');
    expect(guessSeverity('bug', 'The button is broken').severity).toBe('medium');
    expect(guessSeverity('bug', 'The heading spacing looks a bit off').severity).toBe('low');
    expect(guessSeverity('request', 'Everything is broken, add dark mode').severity).toBe('low');
  });

  it('guesses the area from words first, then the page', () => {
    expect(guessArea('/', 'Code AI preview stays blank')).toBe('Renor app · Code AI');
    expect(guessArea('/plugins', 'the image is cut off')).toBe('Website · Plugin Store');
    expect(guessArea('/', 'the footer overlaps')).toBe('Website · Home');
  });

  it('extracts numbered steps, or action sentences in order', () => {
    expect(extractSteps('1. Open the plans page\n2. Click Join\n3. Nothing happens')).toEqual([
      'Open the plans page',
      'Click Join',
      'Nothing happens',
    ]);
    expect(
      extractSteps(
        'I opened the plugin store, then clicked the electrician kit and the page went blank.',
      ),
    ).toEqual(['I opened the plugin store', 'clicked the electrician kit and the page went blank']);
  });

  it('finds the expected result', () => {
    expect(triage(report()).expected).toMatch(/expected my email app to open/);
  });
});

const PRIVATE =
  'Checkout fails for me, jane@example.com, phone 07700 900123, card 4242 4242 4242 4242, password: hunter22';

describe('privacy-safe records', () => {
  it('removes personal details and secrets before anything is kept', () => {
    const record = buildRecord(report({ description: PRIVATE }), 'RNR-ABCDEFGH', NOW);
    const text = JSON.stringify(record);
    for (const secret of ['jane@example.com', '07700 900123', '4242 4242', 'hunter22'])
      expect(text).not.toContain(secret);
    expect(record).toMatchObject({
      reference: 'RNR-ABCDEFGH',
      state: 'new',
      groupId: 'RNR-ABCDEFGH',
    });
    expect(record.receivedAt).toBe('2026-10-24T12:00:00.000Z');
  });

  it('keeps an email only when the visitor opted in to a reply', () => {
    expect(
      buildRecord(report({ email: 'reply@example.com' }), 'RNR-A0000000', NOW).contactEmail,
    ).toBeUndefined();
    expect(
      buildRecord(report({ email: 'reply@example.com', contactMe: true }), 'RNR-A0000000', NOW)
        .contactEmail,
    ).toBe('reply@example.com');
    expect(ReportRequest.safeParse({ ...report(), contactMe: true, email: '' }).success).toBe(
      false,
    );
  });

  it('hands engineering a summary with no contact details, and the words only with consent', () => {
    const base = report({ email: 'reply@example.com', contactMe: true });
    const quiet = handoffSummary(buildRecord(base, 'RNR-A0000000', NOW), 1);
    expect(JSON.stringify(quiet)).not.toContain('reply@example.com');
    expect(quiet.description).toBeUndefined();
    expect(quiet.steps).toBeUndefined();
    expect(quiet).toMatchObject({
      type: 'bug',
      severity: 'medium',
      area: 'Website · Plans',
      page: '/renor/plans',
      stepCount: 3,
    });
    const shared = handoffSummary(
      buildRecord({ ...base, shareWithEngineers: true }, 'RNR-A0000000', NOW),
      1,
    );
    expect(shared.description).toContain('early list');
    expect(JSON.stringify(shared)).not.toContain('reply@example.com');
  });
});

describe('de-duplication', () => {
  it('scores reworded reports of one problem as similar', () => {
    expect(
      similarity(
        'The join the early list button on the plans page does nothing when clicked',
        'Clicking join the early list on the plans page does nothing',
      ),
    ).toBeGreaterThan(0.6);
    expect(
      similarity('Code AI preview is blank', 'Checkout price shows wrong currency'),
    ).toBeLessThan(0.2);
  });

  it('matches an open report of the same type, never a closed one or another type', () => {
    const first = buildRecord(report(), 'RNR-00000001', NOW);
    const again = buildRecord(
      report({
        description:
          'Join the early list button on the plans page does nothing. Click Join the early list on Pro and nothing happens.',
      }),
      'RNR-00000002',
      NOW,
    );
    const other = buildRecord(
      report({ description: 'Website builder export zip fails on large sites' }),
      'RNR-00000003',
      NOW,
    );
    expect(findDuplicate(again, [other, first])?.match.reference).toBe('RNR-00000001');
    expect(findDuplicate(again, [{ ...first, state: 'closed' }])).toBeNull();
    expect(findDuplicate({ ...again, type: 'request' }, [first])).toBeNull();
  });
});

describe('filing a report', () => {
  it('with no store configured: files nothing and hands back a filled-in email', async () => {
    expect(readReportStore({})).toBeNull();
    const result = await fileReport(report(), 'RNR-ABCDEFGH', {
      store: null,
      handoff: null,
      now: NOW,
    });
    expect(result.status).toBe('email');
    if (result.status !== 'email') return;
    expect(result.reason).toBe('not-configured');
    expect(result.mailto).toMatch(/^mailto:founder\.nexoralabs@gmail\.com\?subject=/);
    expect(decodeURIComponent(result.mailto)).toContain('RNR-ABCDEFGH');
  });

  it('stores privately, then groups a matching report with the first', async () => {
    const store = createMemoryStore(90, () => NOW.getTime());
    const first = await fileReport(report(), 'RNR-00000001', { store, handoff: null, now: NOW });
    expect(first).toMatchObject({ status: 'stored', groupId: 'RNR-00000001', handedOff: false });
    const second = await fileReport(
      report({
        description:
          'On the plans page the Join the early list button does nothing when I click it on Pro.',
      }),
      'RNR-00000002',
      { store, handoff: null, now: NOW },
    );
    expect(second).toMatchObject({ status: 'duplicate', groupId: 'RNR-00000001', groupSize: 2 });
    const stored = await store.list();
    expect(stored.map((r) => r.groupId)).toEqual(['RNR-00000001', 'RNR-00000001']);
  });

  it('falls back to email when the store fails', async () => {
    const broken: ReportStore = {
      kind: 'kv',
      retentionDays: 90,
      list: async () => {
        throw new Error('down');
      },
      save: async () => {},
      setState: async () => null,
    };
    const result = await fileReport(report(), 'RNR-ABCDEFGH', {
      store: broken,
      handoff: null,
      now: NOW,
    });
    expect(result).toMatchObject({ status: 'email', reason: 'store-failed' });
  });

  it('expires reports after the retention period', async () => {
    let now = NOW.getTime();
    const store = createMemoryStore(90, () => now);
    await store.save(buildRecord(report(), 'RNR-00000001', NOW));
    expect(await store.list()).toHaveLength(1);
    now += 91 * 86_400_000;
    expect(await store.list()).toHaveLength(0);
  });
});

describe('engineering hand-off', () => {
  it('is off unless an https URL and a long secret are both set', () => {
    expect(readHandoffConfig({})).toBeNull();
    expect(readHandoffConfig({ REPORTS_HANDOFF_URL: 'https://bridge.example.test/in' })).toBeNull();
    expect(
      readHandoffConfig({
        REPORTS_HANDOFF_URL: 'http://bridge.example.test/in',
        REPORTS_HANDOFF_SECRET: 'x'.repeat(32),
      }),
    ).toBeNull();
    expect(
      readHandoffConfig({
        REPORTS_HANDOFF_URL: 'https://bridge.example.test/in',
        REPORTS_HANDOFF_SECRET: 'x'.repeat(32),
      }),
    ).not.toBeNull();
  });

  it('posts a signed, PII-free summary and never posts to GitHub', async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 202 }));
    const handoff = { url: 'https://bridge.example.test/in', secret: 's'.repeat(32) };
    const store = createMemoryStore(90, () => NOW.getTime());
    const result = await fileReport(
      report({ description: PRIVATE, contactMe: true, email: 'reply@example.com' }),
      'RNR-ABCDEFGH',
      { store, handoff, fetchImpl, now: NOW },
    );
    expect(result.handedOff).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://bridge.example.test/in');
    expect(url).not.toContain('github');
    const body = String(init.body);
    for (const secret of [
      'reply@example.com',
      'jane@example.com',
      '07700',
      'hunter22',
      'Checkout fails',
    ])
      expect(body).not.toContain(secret);
    expect(new Headers(init.headers).get('x-renor-signature')).toBe(signBody(body, handoff.secret));
  });

  it('a failed hand-off does not affect the visitor', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const result = await fileReport(report(), 'RNR-ABCDEFGH', {
      store: createMemoryStore(),
      handoff: { url: 'https://bridge.example.test/in', secret: 's'.repeat(32) },
      fetchImpl,
      now: NOW,
    });
    expect(result).toMatchObject({ status: 'stored', handedOff: false });
  });
});

describe('Redis REST store', () => {
  it('saves with an expiry and an index, and reads newest first', async () => {
    const calls: unknown[] = [];
    const record = buildRecord(report(), 'RNR-00000001', NOW);
    const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe('https://kv.example.test/pipeline');
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer kv-token');
      const commands = JSON.parse(String(init?.body)) as string[][];
      calls.push(commands);
      return Response.json(
        commands.map((command) =>
          command[0] === 'ZREVRANGE'
            ? { result: ['RNR-00000001'] }
            : command[0] === 'MGET'
              ? { result: [JSON.stringify(record)] }
              : { result: 'OK' },
        ),
      );
    });
    const store = createKvStore(
      { url: 'https://kv.example.test', token: 'kv-token', retentionDays: 30 },
      fetchImpl,
    );
    await store.save(record);
    expect(calls[0]).toEqual([
      ['SET', 'renor:report:RNR-00000001', JSON.stringify(record), 'EX', 30 * 86_400],
      ['ZADD', 'renor:reports', NOW.getTime(), 'RNR-00000001'],
    ]);
    expect((await store.list())[0]?.reference).toBe('RNR-00000001');
  });

  it('is chosen only with an https URL and token; memory only outside production', () => {
    expect(
      readReportStore({
        REPORTS_KV_REST_URL: 'https://kv.example.test',
        REPORTS_KV_REST_TOKEN: 't',
      })?.kind,
    ).toBe('kv');
    expect(
      readReportStore({
        REPORTS_KV_REST_URL: 'http://kv.example.test',
        REPORTS_KV_REST_TOKEN: 't',
      }),
    ).toBeNull();
    expect(readReportStore({ REPORTS_STORE: 'memory', NODE_ENV: 'development' })?.kind).toBe(
      'memory',
    );
    expect(readReportStore({ REPORTS_STORE: 'memory', NODE_ENV: 'production' })).toBeNull();
    expect(
      readReportStore({
        REPORTS_KV_REST_URL: 'https://kv.example.test',
        REPORTS_KV_REST_TOKEN: 't',
        REPORTS_RETENTION_DAYS: '30',
      })?.retentionDays,
    ).toBe(30);
  });

  it('builds the email fallback with the reference in subject and body', () => {
    const href = decodeURIComponent(mailtoHref(report(), 'RNR-ABCDEFGH'));
    expect(href).toContain('[RNR-ABCDEFGH] Bug:');
    expect(href).toContain('Reference: RNR-ABCDEFGH');
  });
});
