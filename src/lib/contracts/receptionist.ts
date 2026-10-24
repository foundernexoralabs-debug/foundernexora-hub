// @polsia:user-owned — shared zod contract for the Renor Guide (/api/receptionist) and the
// feedback bridge (/api/reports). The route handlers and the widget import the SAME schemas.
import { z } from 'zod';
import { MAX_HISTORY_TURNS, MAX_MESSAGE_CHARS } from '@/lib/business/receptionist/guard';

export const REPORT_MIN_CHARS = 12;
export const REPORT_MAX_CHARS = 2000;

const pagePath = z
  .string()
  .max(300)
  .regex(/^\/[^\s]*$/, 'Use a path on this site, like /renor/plans')
  .catch('/');

export const Source = z.object({ label: z.string(), href: z.string() });
export type Source = z.infer<typeof Source>;

export const AskRequest = z.object({
  message: z.string().trim().min(1, 'Type a question').max(MAX_MESSAGE_CHARS),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(MAX_MESSAGE_CHARS * 2),
      }),
    )
    .max(MAX_HISTORY_TURNS * 2)
    .default([]),
  page: pagePath.default('/'),
});
export type AskRequest = z.infer<typeof AskRequest>;

/**
 * - answer: grounded in the cited sources
 * - unknown: nothing on the site answers it; the widget offers to pass it to the team
 * - refusal: a configuration or prompt-injection request, declined
 * - smalltalk: a greeting or thanks
 */
export const AnswerKind = z.enum(['answer', 'unknown', 'refusal', 'smalltalk']);
export type AnswerKind = z.infer<typeof AnswerKind>;

/** live: a model wrote the answer from the sources. offline: the curated answer, retrieved. */
export const GuideMode = z.enum(['live', 'offline']);
export type GuideMode = z.infer<typeof GuideMode>;

export const AskResponse = z.object({
  reply: z.string(),
  kind: AnswerKind,
  sources: z.array(Source),
  mode: GuideMode,
  /** Set when live mode was configured but this answer had to come from offline mode. */
  degraded: z.boolean().default(false),
});
export type AskResponse = z.infer<typeof AskResponse>;

export const ReportType = z.enum(['bug', 'request', 'question']);
export type ReportType = z.infer<typeof ReportType>;

export const ReportRequest = z
  .object({
    /** Generated once per form submission so a retried request never files twice. */
    clientId: z.string().uuid(),
    type: ReportType,
    description: z
      .string()
      .trim()
      .min(REPORT_MIN_CHARS, `Add a little more detail (at least ${REPORT_MIN_CHARS} characters)`)
      .max(REPORT_MAX_CHARS, `Keep it under ${REPORT_MAX_CHARS} characters`),
    page: pagePath.default('/'),
    /** Opt-in: an email is kept only when the visitor asks to be contacted. */
    contactMe: z.boolean().default(false),
    email: z
      .string()
      .trim()
      .max(254)
      .email('Check the email address')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    /** Opt-in: engineers may read the description (with personal details removed). */
    shareWithEngineers: z.boolean().default(false),
    context: z
      .object({
        viewport: z
          .string()
          .regex(/^\d{2,5}x\d{2,5}$/)
          .optional()
          .catch(undefined),
        theme: z.enum(['light', 'dark']).optional().catch(undefined),
        browser: z
          .string()
          .regex(/^[A-Za-z ]{1,40}$/)
          .optional()
          .catch(undefined),
      })
      .default({}),
    /** Honeypot: hidden from people, filled in by scripts. Any value files nothing. */
    website: z.string().max(200).optional(),
  })
  .superRefine((report, ctx) => {
    if (report.contactMe && !report.email) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Add your email, or untick “Email me”',
      });
    }
  });
export type ReportRequest = z.input<typeof ReportRequest>;
export type ParsedReport = z.output<typeof ReportRequest>;

/**
 * - stored: saved privately for the team
 * - duplicate: saved and linked to an open report about the same problem
 * - email: no private store is switched on; the visitor sends it by email (mailto)
 */
export const ReportStatus = z.enum(['stored', 'duplicate', 'email']);
export type ReportStatus = z.infer<typeof ReportStatus>;

export const ReportResponse = z.object({
  reference: z.string(),
  status: ReportStatus,
  message: z.string(),
  /** Present when status is 'email': opens the visitor's email app with the report filled in. */
  mailto: z.string().optional(),
});
export type ReportResponse = z.infer<typeof ReportResponse>;

export const GuideStatus = z.object({
  mode: GuideMode,
  reports: z.enum(['stored', 'email']),
});
export type GuideStatus = z.infer<typeof GuideStatus>;

// --- Team triage (private, token-protected) ----------------------------------------------------

export const ReportState = z.enum(['new', 'triaged', 'closed']);
export type ReportState = z.infer<typeof ReportState>;

export const AdminReport = z.object({
  reference: z.string(),
  receivedAt: z.string(),
  type: ReportType,
  state: ReportState,
  page: z.string(),
  description: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  severityReason: z.string(),
  area: z.string(),
  summary: z.string(),
  steps: z.array(z.string()),
  expected: z.string().optional(),
  actual: z.string().optional(),
  context: z.object({
    viewport: z.string().optional(),
    theme: z.enum(['light', 'dark']).optional(),
    browser: z.string().optional(),
  }),
  contactEmail: z.string().optional(),
  shareWithEngineers: z.boolean(),
  groupId: z.string(),
});
export type AdminReport = z.infer<typeof AdminReport>;

export const AdminReportList = z.object({
  items: z.array(AdminReport),
  store: z.enum(['kv', 'memory']),
  retentionDays: z.number(),
});
export type AdminReportList = z.infer<typeof AdminReportList>;

export const AdminUpdate = z.object({
  reference: z.string().regex(/^RNR-[0-9A-Z]{8}$/),
  state: ReportState,
});

/** Error body for 400/429 responses. */
export const ErrorBody = z.object({
  error: z.string(),
  errors: z.record(z.string()).optional(),
  retryAfterSeconds: z.number().optional(),
});
