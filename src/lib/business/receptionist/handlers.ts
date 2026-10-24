// @polsia:user-owned — request handling for /api/receptionist, /api/reports and the private
// triage API /api/reports/admin, as factories so tests can inject config, store, fetch, clock and
// limiter. The route files only wire in the real env.

import { timingSafeEqual } from 'node:crypto';
import { answerQuestion } from '@/lib/business/receptionist/answer';
import { fileReport } from '@/lib/business/receptionist/bridge';
import { type HandoffConfig, readHandoffConfig } from '@/lib/business/receptionist/handoff';
import { logEvent } from '@/lib/business/receptionist/log';
import { type ModelConfig, readModelConfig } from '@/lib/business/receptionist/model';
import {
  clientKey,
  createRateLimiter,
  type RateLimiter,
} from '@/lib/business/receptionist/rate-limit';
import { type ReportStore, readReportStore } from '@/lib/business/receptionist/report-store';
import { createReference, deliveryMessage, mailtoHref } from '@/lib/business/receptionist/reports';
import {
  type AdminReportList,
  AdminUpdate,
  AskRequest,
  AskResponse,
  type GuideStatus,
  ReportRequest,
  type ReportResponse,
} from '@/lib/contracts/receptionist';

/** Request bodies larger than this are refused before parsing. */
const MAX_BODY_BYTES = 16_000;

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store', ...headers } });

async function readBody(request: Request): Promise<unknown | Response> {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return json({ error: 'Message too long' }, 413);
  const text = await request.text().catch(() => '');
  if (text.length > MAX_BODY_BYTES) return json({ error: 'Message too long' }, 413);
  try {
    return JSON.parse(text);
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
}

function fieldErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[key] ??= issue.message;
  }
  return errors;
}

const tooMany = (retryAfterSeconds: number) =>
  json(
    {
      error: `You’re sending messages quickly. Please wait ${retryAfterSeconds} seconds and try again.`,
      retryAfterSeconds,
    },
    429,
    { 'retry-after': String(retryAfterSeconds) },
  );

export interface GuideDeps {
  config: () => ModelConfig | null;
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
}

/** 8 questions a minute and 60 an hour per visitor. */
export const askLimiter = () =>
  createRateLimiter([
    { limit: 8, windowMs: 60_000 },
    { limit: 60, windowMs: 3_600_000 },
  ]);

export function createAskHandler(deps: GuideDeps) {
  return async function POST(request: Request): Promise<Response> {
    const limit = deps.limiter.check(clientKey(request.headers, 'ask'));
    if (!limit.allowed) {
      logEvent('guide.rate_limited', { retryAfter: limit.retryAfterSeconds });
      return tooMany(limit.retryAfterSeconds);
    }
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = AskRequest.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Check your message', errors: fieldErrors(parsed.error.issues) }, 400);
    }
    const started = Date.now();
    const { response, trace } = await answerQuestion(parsed.data, {
      config: deps.config(),
      fetchImpl: deps.fetchImpl,
    });
    logEvent(
      'guide.answer',
      { ...trace, page: parsed.data.page, ms: Date.now() - started },
      // Only unanswered questions are kept (redacted): they show the team what to add next.
      trace.kind === 'unknown' ? parsed.data.message : undefined,
    );
    return json(AskResponse.parse(response));
  };
}

export function createStatusHandler(deps: {
  config: () => ModelConfig | null;
  store: () => ReportStore | null;
}) {
  return async function GET(): Promise<Response> {
    const status: GuideStatus = {
      mode: deps.config() ? 'live' : 'offline',
      reports: deps.store() ? 'stored' : 'email',
    };
    return json(status);
  };
}

export interface ReportDeps {
  store: () => ReportStore | null;
  handoff: () => HandoffConfig | null;
  limiter: RateLimiter;
  fetchImpl?: typeof fetch;
  now?: () => Date;
  reference?: () => string;
}

/** 4 reports per 10 minutes and 12 a day per visitor. */
export const reportLimiter = () =>
  createRateLimiter([
    { limit: 4, windowMs: 600_000 },
    { limit: 12, windowMs: 86_400_000 },
  ]);

/** A retried submission (same clientId) gets the first answer back instead of filing twice. */
const recentSubmissions = new Map<string, { at: number; response: ReportResponse }>();
const IDEMPOTENCY_MS = 15 * 60_000;

export function createReportHandler(deps: ReportDeps) {
  return async function POST(request: Request): Promise<Response> {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = ReportRequest.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Check the form', errors: fieldErrors(parsed.error.issues) }, 400);
    }
    const report = parsed.data;
    const now = deps.now?.() ?? new Date();
    for (const [id, entry] of recentSubmissions) {
      if (now.getTime() - entry.at > IDEMPOTENCY_MS) recentSubmissions.delete(id);
    }
    const replay = recentSubmissions.get(report.clientId);
    if (replay) return json(replay.response);

    const limit = deps.limiter.check(clientKey(request.headers, 'report'));
    if (!limit.allowed) {
      logEvent('report.rate_limited', { retryAfter: limit.retryAfterSeconds });
      return json(
        {
          error: `That’s a lot of reports in a short time. Please wait ${Math.ceil(limit.retryAfterSeconds / 60)} minutes, or email the team.`,
          retryAfterSeconds: limit.retryAfterSeconds,
        },
        429,
        { 'retry-after': String(limit.retryAfterSeconds) },
      );
    }

    const reference = deps.reference?.() ?? createReference();
    // Honeypot filled: almost always a script. Store nothing, but hand back the email route, so
    // a person whose browser autofilled the hidden field can still send it themselves.
    if (report.website) {
      logEvent('report.honeypot', {});
      return json({
        reference,
        status: 'email',
        message: deliveryMessage({ status: 'email', mailto: '', reason: 'not-configured' }),
        mailto: mailtoHref(report, reference),
      } satisfies ReportResponse);
    }

    const result = await fileReport(report, reference, {
      store: deps.store(),
      handoff: deps.handoff(),
      fetchImpl: deps.fetchImpl,
      now,
    });
    const response: ReportResponse = {
      reference,
      status: result.status,
      message: deliveryMessage(result),
      ...(result.status === 'email' ? { mailto: result.mailto } : {}),
    };
    recentSubmissions.set(report.clientId, { at: now.getTime(), response });
    logEvent('report.filed', {
      reference,
      type: report.type,
      status: result.status,
      ...(result.status === 'email' ? { reason: result.reason } : { group: result.groupId }),
      handedOff: result.handedOff,
      page: report.page,
    });
    return json(response);
  };
}

// ---------------------------------------------------------------------------------------------
// Private triage API: Authorization: Bearer <REPORTS_ADMIN_TOKEN>. With no token configured the
// API does not exist (404), so there is nothing to guess at.

export interface AdminDeps {
  adminToken: () => string | null;
  store: () => ReportStore | null;
  limiter: RateLimiter;
}

/** 30 admin requests a minute per address: plenty for a person, useless for guessing tokens. */
export const adminLimiter = () => createRateLimiter([{ limit: 30, windowMs: 60_000 }]);

export function readAdminToken(
  env: Record<string, string | undefined> = process.env,
): string | null {
  const token = env.REPORTS_ADMIN_TOKEN?.trim();
  return token && token.length >= 24 ? token : null;
}

function authorised(request: Request, token: string): boolean {
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function guardAdmin(request: Request, deps: AdminDeps): Promise<ReportStore | Response> {
  const token = deps.adminToken();
  if (!token) return json({ error: 'Not found' }, 404);
  const limit = deps.limiter.check(clientKey(request.headers, 'admin'));
  if (!limit.allowed) return tooMany(limit.retryAfterSeconds);
  if (!authorised(request, token)) {
    logEvent('admin.denied', {});
    return json({ error: 'Wrong access key' }, 401);
  }
  const store = deps.store();
  if (!store) return json({ error: 'No private report store is configured' }, 503);
  return store;
}

export function createAdminHandlers(deps: AdminDeps) {
  return {
    async GET(request: Request): Promise<Response> {
      const store = await guardAdmin(request, deps);
      if (store instanceof Response) return store;
      try {
        const body: AdminReportList = {
          items: await store.list(200),
          store: store.kind,
          retentionDays: store.retentionDays,
        };
        return json(body);
      } catch {
        return json({ error: 'The report store did not respond' }, 502);
      }
    },
    async PATCH(request: Request): Promise<Response> {
      const store = await guardAdmin(request, deps);
      if (store instanceof Response) return store;
      const body = await readBody(request);
      if (body instanceof Response) return body;
      const parsed = AdminUpdate.safeParse(body);
      if (!parsed.success) return json({ error: 'Invalid update' }, 400);
      try {
        const updated = await store.setState(parsed.data.reference, parsed.data.state);
        if (!updated) return json({ error: 'No such report' }, 404);
        logEvent('admin.state', { reference: updated.reference, state: updated.state });
        return json(updated);
      } catch {
        return json({ error: 'The report store did not respond' }, 502);
      }
    },
  };
}

/** Production wiring: env read per request, so a new env var takes effect on the next call. */
export const productionDeps = {
  config: () => readModelConfig(),
  store: () => readReportStore(),
  handoff: () => readHandoffConfig(),
  adminToken: () => readAdminToken(),
};
