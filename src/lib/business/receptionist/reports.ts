// @polsia:user-owned — the feedback bridge: turns a visitor's bug report, request or question
// into private, tracked work for the team.
//
// Privacy by design (founder decision, 24 October 2026):
//   - a report is stored privately server-side (see report-store.ts), never posted to GitHub or
//     any public tracker;
//   - free text is stripped of emails, phone numbers, card numbers, addresses and keys BEFORE it
//     is triaged, stored or handed to anything else;
//   - an email is kept only when the visitor ticks "email me about this";
//   - the optional engineering hand-off (handoff.ts, off by default) receives a structured,
//     PII-free summary, and the visitor's words only when they agreed to share them.
// Each report gets a reference number the visitor sees immediately. With no private store
// configured, the visitor sends the same report from their own email app and is told so.

import { randomBytes } from 'node:crypto';
import { CONTACT_EMAIL } from '@/lib/business/ecosystem';
import { redactPII } from '@/lib/business/receptionist/guard';
import { tokenize } from '@/lib/business/receptionist/retrieval';
import type { ParsedReport, ReportType } from '@/lib/contracts/receptionist';

// ---------------------------------------------------------------------------------------------
// Reference numbers

/** Crockford base32: no I, L, O or U, so a reference read aloud or typed is unambiguous. */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** e.g. "RNR-7K3QF9W2". 40 random bits: collisions are not a practical concern. */
export function createReference(bytes: Uint8Array = randomBytes(5)): string {
  let bits = 0n;
  for (const byte of bytes.slice(0, 5)) bits = (bits << 8n) | BigInt(byte);
  let out = '';
  for (let i = 0; i < 8; i++) {
    out = (ALPHABET[Number(bits & 31n)] ?? '0') + out;
    bits >>= 5n;
  }
  return `RNR-${out}`;
}

export const REFERENCE_PATTERN = /RNR-[0-9A-HJKMNP-TV-Z]{8}/;

// ---------------------------------------------------------------------------------------------
// Triage: a first guess for the team, always labelled as a guess.

export type Severity = 'high' | 'medium' | 'low';

export interface Triage {
  severity: Severity;
  severityReason: string;
  area: string;
  summary: string;
  steps: string[];
  expected?: string;
  actual?: string;
}

const HIGH_SIGNALS: readonly [RegExp, string][] = [
  [
    /\b(security|hack(ed)?|leak(ed)?|exposed|vulnerab\w*|phishing)\b/i,
    'mentions a security problem',
  ],
  [
    /\b(lost|deleted|disappeared|gone|wiped)\b.{0,30}\b(work|data|project|files?|notes?|account)\b/i,
    'mentions lost work or data',
  ],
  [/\b(charged|payment|billing|refund|money|card)\b/i, 'mentions payment or money'],
  [
    /\b(can['’]?t|cannot|unable to|won['’]?t let me)\s+(log ?in|sign ?in|access|open|use)\b/i,
    'blocks access',
  ],
  [
    /\b(crash(es|ed|ing)?|blank (page|screen)|white screen|down|outage|500|nothing loads?)\b/i,
    'page or app does not load',
  ],
];

const MEDIUM_SIGNALS: readonly [RegExp, string][] = [
  [
    /\b(error|broken|bug|fails?|failed|failing|doesn['’]?t work|not working|does nothing|nothing happens|unresponsive|stuck|freez\w*|wrong)\b/i,
    'something does not work as described',
  ],
  [/\b(404|dead link|broken link|missing)\b/i, 'a broken or missing link'],
  [/\b(slow|lag\w*|timeout|timed out)\b/i, 'performance'],
];

export function guessSeverity(
  type: ReportType,
  text: string,
): { severity: Severity; reason: string } {
  if (type !== 'bug')
    return {
      severity: 'low',
      reason: `a ${type === 'request' ? 'request' : 'question'}, not a fault`,
    };
  for (const [pattern, reason] of HIGH_SIGNALS)
    if (pattern.test(text)) return { severity: 'high', reason };
  for (const [pattern, reason] of MEDIUM_SIGNALS)
    if (pattern.test(text)) return { severity: 'medium', reason };
  return { severity: 'low', reason: 'no blocking signal in the description' };
}

const AREA_BY_WORD: readonly [RegExp, string][] = [
  [/\b(code ai|python|preview|compile|run(ning)? code)\b/i, 'Renor app · Code AI'],
  [/\b(website builder|builder|landing page|export zip)\b/i, 'Renor app · Website Builder'],
  [/\b(voice|microphone|hey renor|dictat\w*)\b/i, 'Renor app · Chat AI (voice)'],
  [/\b(chat|answer|reply|provider|model)\b/i, 'Renor app · Chat AI'],
  [/\b(notes?|tasks?|reminders?|dashboard|project office)\b/i, 'Renor app · Project Office'],
  [/\b(log ?in|sign ?in|sign ?up|account|password)\b/i, 'Renor app · Account and sign-in'],
  [/\b(plugin|store|tradelaunch|kit|plug&pay|checkout)\b/i, 'Website · Plugin Store'],
  [/\b(plans?|pricing|price|credits?)\b/i, 'Website · Plans'],
];

const AREA_BY_PAGE: readonly [RegExp, string][] = [
  [/^\/renor\/plans/, 'Website · Plans'],
  [/^\/plugins/, 'Website · Plugin Store'],
  [/^\/renor/, 'Website · Renor page'],
  [/^\/(privacy|terms|accessibility)/, 'Website · Legal pages'],
  [/^\/contact/, 'Website · Contact'],
];

export function guessArea(page: string, text: string): string {
  for (const [pattern, area] of AREA_BY_WORD) if (pattern.test(text)) return area;
  for (const [pattern, area] of AREA_BY_PAGE) if (pattern.test(page)) return area;
  return page === '/' ? 'Website · Home' : 'Website';
}

const STEP_LINE = /^\s*(?:\d+[.)]|[-*•]|step \d+:?)\s+(.+)$/i;
const ACTION_VERB =
  /\b(open(ed)?|click(ed)?|tap(ped)?|press(ed)?|go(ne)? to|went to|navigat\w+|type[ds]?|enter(ed)?|select(ed)?|scroll(ed)?|submit(ted)?|sign(ed)? in|log(ged)? in|upload(ed)?|chose|choose)\b/i;

const sentencesOf = (text: string) =>
  text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

/** Numbered or bulleted lines first; otherwise sentences that describe an action, in order. */
export function extractSteps(text: string): string[] {
  // "…does nothing. 1. Open the page 2. Click Join" → one numbered step per line.
  const listed = text
    .replace(/([.!?:])\s+(?=\d{1,2}[.)]\s)/g, '$1\n')
    .split('\n')
    .map((line) => STEP_LINE.exec(line)?.[1]?.trim())
    .filter((line): line is string => !!line);
  if (listed.length >= 2) return listed.slice(0, 8);
  const actions = sentencesOf(text).flatMap((sentence) =>
    sentence
      .split(
        /\b(?:and then|then|after that)\b|,\s*(?=(?:i\s+)?(?:open|click|tap|press|go|type|enter|select|scroll|submit))/i,
      )
      .map((part) =>
        part.trim().replace(/^(and|so|i)\s+/i, (match) => (/^i\s/i.test(match) ? 'I ' : '')),
      )
      .filter((part) => part.length > 3 && ACTION_VERB.test(part)),
  );
  return actions.slice(0, 8).map((step) => step.replace(/[.!,;:]+$/, ''));
}

export function triage(report: Pick<ParsedReport, 'type' | 'description' | 'page'>): Triage {
  const text = report.description;
  const { severity, reason } = guessSeverity(report.type, text);
  const sentences = sentencesOf(text);
  const expected = sentences.find((s) =>
    /\b(expect(ed)?|should|supposed to|want(ed)? it to)\b/i.test(s),
  );
  const actual = sentences.find(
    (s) =>
      s !== expected &&
      /\b(instead|but|actually|shows?|showed|got|get|happens?|happened)\b/i.test(s),
  );
  const first = sentences[0] ?? text;
  return {
    severity,
    severityReason: reason,
    area: guessArea(report.page, text),
    summary: first.length > 90 ? `${first.slice(0, 87).trimEnd()}…` : first,
    steps: report.type === 'bug' ? extractSteps(text) : [],
    expected,
    actual,
  };
}

// ---------------------------------------------------------------------------------------------
// De-duplication by similarity

/** Cosine similarity of two texts' term-frequency vectors (stopwords removed, light stemming). */
export function similarity(a: string, b: string): number {
  const vector = (text: string) => {
    const counts = new Map<string, number>();
    for (const term of tokenize(text)) counts.set(term, (counts.get(term) ?? 0) + 1);
    return counts;
  };
  const va = vector(a);
  const vb = vector(b);
  let dot = 0;
  for (const [term, count] of va) dot += count * (vb.get(term) ?? 0);
  const norm = (v: Map<string, number>) =>
    Math.sqrt([...v.values()].reduce((s, c) => s + c * c, 0));
  const denominator = norm(va) * norm(vb);
  return denominator === 0 ? 0 : dot / denominator;
}

/** At or above this, a new report is treated as the same problem as an open one. */
export const DUPLICATE_THRESHOLD = 0.6;

export const TYPE_LABEL: Record<ReportType, string> = {
  bug: 'Bug',
  request: 'Request',
  question: 'Question',
};

// ---------------------------------------------------------------------------------------------
// The stored record

export type ReportState = 'new' | 'triaged' | 'closed';

/** What is kept about a report. No IP address, no raw text, no email unless opted in. */
export interface StoredReport {
  reference: string;
  receivedAt: string;
  type: ReportType;
  state: ReportState;
  page: string;
  /** The visitor's description with personal details and secrets removed. */
  description: string;
  severity: Severity;
  severityReason: string;
  area: string;
  summary: string;
  steps: string[];
  expected?: string;
  actual?: string;
  /** Coarse, non-identifying: "390x844", "dark", "Safari on iOS". */
  context: { viewport?: string; theme?: 'light' | 'dark'; browser?: string };
  /** Present only when the visitor asked to be emailed about this report. */
  contactEmail?: string;
  /** The visitor agreed that engineers may read the (redacted) description. */
  shareWithEngineers: boolean;
  /** Reports about the same problem share a group: the reference of the first one. */
  groupId: string;
}

/** Redact first, then triage the redacted text, so nothing downstream sees the original. */
export function buildRecord(
  report: ParsedReport,
  reference: string,
  receivedAt: Date,
): StoredReport {
  const description = redactPII(report.description);
  const t = triage({ ...report, description });
  return {
    reference,
    receivedAt: receivedAt.toISOString(),
    type: report.type,
    state: 'new',
    page: report.page,
    description,
    severity: t.severity,
    severityReason: t.severityReason,
    area: t.area,
    summary: t.summary,
    steps: t.steps,
    ...(t.expected ? { expected: t.expected } : {}),
    ...(t.actual ? { actual: t.actual } : {}),
    context: report.context,
    ...(report.contactMe && report.email ? { contactEmail: report.email } : {}),
    shareWithEngineers: report.shareWithEngineers,
    groupId: reference,
  };
}

/** The most similar open report of the same type, when similar enough to be the same problem. */
export function findDuplicate(
  record: Pick<StoredReport, 'type' | 'page' | 'description'>,
  existing: readonly StoredReport[],
): { match: StoredReport; score: number } | null {
  let best: { match: StoredReport; score: number } | null = null;
  for (const other of existing) {
    if (other.type !== record.type || other.state === 'closed') continue;
    let score = similarity(record.description, other.description);
    // Same words on the same page is stronger evidence than the same words anywhere.
    if (other.page === record.page) score = Math.min(1, score + 0.05);
    if (score >= DUPLICATE_THRESHOLD && (!best || score > best.score))
      best = { match: other, score };
  }
  return best;
}

/**
 * What may leave the store for engineering: structured triage only. The visitor's words (already
 * redacted) are included only when they agreed; the contact email never is.
 */
export interface HandoffSummary {
  reference: string;
  groupId: string;
  groupSize: number;
  receivedAt: string;
  type: ReportType;
  severity: Severity;
  severityReason: string;
  area: string;
  page: string;
  stepCount: number;
  environment: string;
  description?: string;
  steps?: string[];
}

export function handoffSummary(record: StoredReport, groupSize: number): HandoffSummary {
  const environment = [record.context.viewport, record.context.theme, record.context.browser]
    .filter(Boolean)
    .join(' · ');
  return {
    reference: record.reference,
    groupId: record.groupId,
    groupSize,
    receivedAt: record.receivedAt,
    type: record.type,
    severity: record.severity,
    severityReason: record.severityReason,
    area: record.area,
    page: record.page,
    stepCount: record.steps.length,
    environment: environment || 'not provided',
    ...(record.shareWithEngineers ? { description: record.description, steps: record.steps } : {}),
  };
}

// ---------------------------------------------------------------------------------------------
// Email fallback (no private store configured): the visitor sends it from their own email app.

/** mailto bodies over ~2,000 characters are cut off by some email apps. */
const MAILTO_BODY_LIMIT = 1800;

export function mailtoHref(report: ParsedReport, reference: string): string {
  const t = triage(report);
  const body = [
    `Reference: ${reference}`,
    `Type: ${TYPE_LABEL[report.type]}`,
    `Page: ${report.page}`,
    '',
    report.description,
  ]
    .join('\n')
    .slice(0, MAILTO_BODY_LIMIT);
  const subject = `[${reference}] ${TYPE_LABEL[report.type]}: ${t.summary}`.slice(0, 120);
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export type DeliveryResult =
  | { status: 'stored'; groupId: string }
  | { status: 'duplicate'; groupId: string; groupSize: number }
  | { status: 'email'; mailto: string; reason: 'not-configured' | 'store-failed' };

/** What the visitor is told, per outcome. Honest about where the report went. */
export function deliveryMessage(result: DeliveryResult): string {
  switch (result.status) {
    case 'stored':
      return 'Sent. Your report is stored privately for the FounderLab team. Keep your reference number if you want to follow up.';
    case 'duplicate':
      return 'Sent. Someone has reported this too, so we linked your report to theirs: it shows the team how many people it affects.';
    case 'email':
      return result.reason === 'not-configured'
        ? 'Our private report inbox isn’t switched on yet, so this report goes by email. Open your email app to send it: everything is filled in, including your reference.'
        : 'We couldn’t save your report just now, so it goes by email instead. Open your email app to send it: everything is filled in, including your reference.';
  }
}
