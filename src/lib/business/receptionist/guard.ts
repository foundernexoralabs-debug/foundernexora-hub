// @polsia:user-owned — safety rails for the Renor Guide: input limits, prompt-injection refusal,
// PII redaction for logs and reports, and output checks before anything reaches a visitor.

/** Longest single message a visitor can send. The UI shows a counter near the limit. */
export const MAX_MESSAGE_CHARS = 600;
/** How many earlier turns are sent back for context (each also capped). */
export const MAX_HISTORY_TURNS = 6;

/**
 * Attempts to read or override the Guide's configuration. Matched case-insensitively against
 * the visitor's message. Deliberately broad: a false positive costs one polite refusal.
 */
const INJECTION_PATTERNS: readonly RegExp[] = [
  /\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(previous|prior|above|earlier|all|your|the)\b.{0,30}\b(instructions?|rules?|prompts?|guidelines?|context)\b/i,
  /\b(system|developer|hidden|initial|original)\s+(prompt|message|instructions?)\b/i,
  /\b(reveal|show|print|repeat|output|display|leak|dump|tell me|what (is|are))\b.{0,40}\b(your|the)\b.{0,20}\b(prompt|instructions?|config(uration)?|api[\s_-]?key|secret|token|env(ironment)?( var(iable)?s?)?|base[\s_-]?url|endpoint)\b/i,
  /\byour\s+(own\s+)?(rules|settings|configuration|instructions|api[\s_-]?keys?|tokens?|secrets?|credentials)\b/i,
  /\b(RECEPTIONIST_\w*|GITHUB_TOKEN|process\.env|\.env)\b/i,
  /\b(you are now|act as|pretend to be|roleplay as|jailbreak|DAN mode|developer mode)\b/i,
  /\b(which|what)\s+(llm|language model|ai model|model|provider)\b.{0,30}\b(are you|do you use|powers you|running|behind)\b/i,
  /<\/?(system|instructions?|context|question)>/i,
];

export function isPromptInjection(message: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}

/** The one reply to any attempt to read or change how the Guide is set up. */
export const INJECTION_REFUSAL =
  'I can’t share or change how I’m set up. I can help with questions about Renor, plans, the Plugin Store, getting started, privacy or contacting the team.';

/**
 * Affirmative claims the Guide must never make (RULES: FounderLab is not a registered company,
 * has no VAT number, legal address or certifications to state). Checked against model output.
 */
const FORBIDDEN_CLAIMS: readonly RegExp[] = [
  /\b(is|are|we're|we are|it's|it is|been)\s+(a\s+)?(registered|incorporated|certified|accredited)\b/i,
  /\b(company|registration|vat|tax)\s+(number|no\.?|id)\s*(is|:)/i,
  /\bvat[\s-]registered\b/i,
  /\b(iso\s?\d{4,5}|soc\s?2|pci[\s-]dss|hipaa)\b(?!.{0,30}\b(not|no|never|isn['’]?t|aren['’]?t)\b)/i,
  /\b(registered|legal|head|business)\s+(office|address)\s*(is|:)/i,
  /\bcompanies house\b/i,
  /\bunlimited\b(?!.{0,20}\b(not|no)\b)/i,
];

export function makesForbiddenClaim(text: string): boolean {
  // "No plan is unlimited" / "not registered" are honest; only flag affirmative phrasing.
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.some(
    (sentence) =>
      !/\b(not|no|never|isn['’]?t|aren['’]?t|doesn['’]?t|can['’]?t|cannot|won['’]?t)\b/i.test(
        sentence,
      ) && FORBIDDEN_CLAIMS.some((pattern) => pattern.test(sentence)),
  );
}

/** True when `text` contains any configured secret or endpoint, verbatim. */
export function leaksSecret(text: string, secrets: readonly (string | undefined)[]): boolean {
  return secrets.some(
    (secret) => typeof secret === 'string' && secret.length >= 6 && text.includes(secret),
  );
}

const REDACTIONS: readonly [RegExp, string][] = [
  // Credentials first, so a key inside a URL is not half-redacted as a URL.
  [/\b(sk|pk|rk|gh[pousr]|github_pat|xox[abpr]|AIza|gsk)[-_A-Za-z0-9]{12,}\b/g, '[key]'],
  [/\bBearer\s+[-._~+/A-Za-z0-9]{12,}=*/gi, 'Bearer [key]'],
  [/\b(password|passwd|pwd|passcode|pin)\s*[:=]\s*\S+/gi, '$1: [redacted]'],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]'],
  [/\b(?:\d[ -]?){13,19}\b/g, '[card]'],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]'],
  [/\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/g, '[postcode]'],
];

/** A run of digits and separators with 10–15 digits that is not an ISO date reads as a phone number. */
const PHONE_CANDIDATE = /\+?\(?\d[\d\s().-]{7,}\d/g;

function redactPhones(text: string): string {
  return text.replace(PHONE_CANDIDATE, (match) => {
    const digits = match.replace(/\D/g, '').length;
    if (/^\d{4}-\d{2}-\d{2}$/.test(match.trim())) return match;
    return digits >= 10 && digits <= 15 ? '[phone]' : match;
  });
}

/** Removes emails, phone numbers, card numbers, IPs, postcodes, passwords and keys. */
export function redactPII(text: string): string {
  return redactPhones(
    REDACTIONS.reduce((out, [pattern, replacement]) => out.replace(pattern, replacement), text),
  );
}

/** Trim, collapse runs of whitespace and cap at `max` characters. */
export function clampText(text: string, max: number): string {
  const cleaned = text
    .replace(/\p{Cc}/gu, (char) => (char === '\n' || char === '\t' ? char : ''))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned.length > max ? `${cleaned.slice(0, max - 1)}…` : cleaned;
}

/** Small talk the Guide answers without searching or calling a model. */
export function smallTalk(message: string): string | null {
  const text = message
    .trim()
    .toLowerCase()
    .replace(/[!.?]+$/, '');
  if (/^(hi|hello|hey|hiya|good (morning|afternoon|evening)|yo|howdy)( there)?$/.test(text)) {
    return 'Hello! I can answer questions about Renor, its plans, the Plugin Store, getting started, privacy and how to reach the team. What would you like to know?';
  }
  if (/^(thanks|thank you|cheers|ta|great|perfect|ok(ay)?|cool)( (so much|a lot))?$/.test(text)) {
    return 'You’re welcome. Ask me anything else about Renor, or use “Report a problem” if something isn’t working.';
  }
  return null;
}
