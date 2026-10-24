// @polsia:user-owned — private, server-side storage for visitor reports.
//
// This website has no database (src/lib/db.ts is disabled), so the store is a Redis-compatible
// REST endpoint the founder can switch on in one step: an Upstash Redis database (free tier, also
// offered through the Vercel Marketplace). Only these two variables are read, so the store is
// scoped to reports alone:
//
//   REPORTS_KV_REST_URL    the database's REST URL (https)
//   REPORTS_KV_REST_TOKEN  its REST token (read and write)
//   REPORTS_RETENTION_DAYS optional, 1–365, default 90: every report expires automatically
//
// For local development only, REPORTS_STORE=memory keeps reports in the server's memory (lost on
// restart, ignored in production). With no store configured, reports go by the visitor's email.

import type { ReportState, StoredReport } from '@/lib/business/receptionist/reports';

export interface ReportStore {
  readonly kind: 'kv' | 'memory';
  readonly retentionDays: number;
  save(record: StoredReport): Promise<void>;
  /** Newest first, expired reports excluded. */
  list(limit?: number): Promise<StoredReport[]>;
  setState(reference: string, state: ReportState): Promise<StoredReport | null>;
}

export const DEFAULT_RETENTION_DAYS = 90;
const DAY_MS = 86_400_000;

type Env = Record<string, string | undefined>;

function retentionDays(env: Env): number {
  const days = Number(env.REPORTS_RETENTION_DAYS);
  return Number.isInteger(days) && days >= 1 && days <= 365 ? days : DEFAULT_RETENTION_DAYS;
}

// ---------------------------------------------------------------------------------------------
// In-memory (development only)

export function createMemoryStore(
  days = DEFAULT_RETENTION_DAYS,
  now = () => Date.now(),
): ReportStore {
  const records = new Map<string, StoredReport>();
  const live = () =>
    [...records.values()].filter((r) => now() - Date.parse(r.receivedAt) < days * DAY_MS);
  return {
    kind: 'memory',
    retentionDays: days,
    async save(record) {
      records.set(record.reference, structuredClone(record));
    },
    async list(limit = 200) {
      return live()
        .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
        .slice(0, limit)
        .map((r) => structuredClone(r));
    },
    async setState(reference, state) {
      const record = records.get(reference);
      if (!record) return null;
      record.state = state;
      return structuredClone(record);
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Redis REST (Upstash-compatible)

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreError';
  }
}

const INDEX = 'renor:reports';
const keyOf = (reference: string) => `renor:report:${reference}`;

export function createKvStore(
  config: { url: string; token: string; retentionDays: number },
  fetchImpl: typeof fetch = fetch,
): ReportStore {
  const ttlSeconds = config.retentionDays * 86_400;

  async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    let res: Response;
    try {
      res = await fetchImpl(`${config.url}/pipeline`, {
        method: 'POST',
        headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
        body: JSON.stringify(commands),
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      });
    } catch {
      throw new StoreError('store unreachable');
    }
    if (!res.ok) throw new StoreError(`store HTTP ${res.status}`);
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    if (!Array.isArray(data) || data.some((item) => item?.error))
      throw new StoreError('store command failed');
    return data.map((item) => item.result);
  }

  const parse = (value: unknown): StoredReport | null => {
    if (typeof value !== 'string') return null;
    try {
      return JSON.parse(value) as StoredReport;
    } catch {
      return null;
    }
  };

  return {
    kind: 'kv',
    retentionDays: config.retentionDays,
    async save(record) {
      await pipeline([
        ['SET', keyOf(record.reference), JSON.stringify(record), 'EX', ttlSeconds],
        ['ZADD', INDEX, Date.parse(record.receivedAt), record.reference],
      ]);
    },
    async list(limit = 200) {
      const cutoff = Date.now() - ttlSeconds * 1000;
      const [, refs] = await pipeline([
        ['ZREMRANGEBYSCORE', INDEX, '-inf', cutoff],
        ['ZREVRANGE', INDEX, 0, limit - 1],
      ]);
      const references = Array.isArray(refs)
        ? refs.filter((r): r is string => typeof r === 'string')
        : [];
      if (references.length === 0) return [];
      const [values] = await pipeline([['MGET', ...references.map(keyOf)]]);
      return (Array.isArray(values) ? values : []).map(parse).filter((r): r is StoredReport => !!r);
    },
    async setState(reference, state) {
      const [value] = await pipeline([['GET', keyOf(reference)]]);
      const record = parse(value);
      if (!record) return null;
      record.state = state;
      await pipeline([['SET', keyOf(reference), JSON.stringify(record), 'KEEPTTL']]);
      return record;
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Selection

const memoryStores = new Map<number, ReportStore>();

/** The configured private store, or null (reports then go by email). */
export function readReportStore(
  env: Env = process.env,
  fetchImpl?: typeof fetch,
): ReportStore | null {
  const days = retentionDays(env);
  const url = env.REPORTS_KV_REST_URL?.trim().replace(/\/+$/, '');
  const token = env.REPORTS_KV_REST_TOKEN?.trim();
  if (url && token) {
    try {
      if (new URL(url).protocol === 'https:')
        return createKvStore({ url, token, retentionDays: days }, fetchImpl);
    } catch {
      return null;
    }
    return null;
  }
  if (env.REPORTS_STORE?.trim() === 'memory' && env.NODE_ENV !== 'production') {
    let store = memoryStores.get(days);
    if (!store) {
      store = createMemoryStore(days);
      memoryStores.set(days, store);
    }
    return store;
  }
  return null;
}
