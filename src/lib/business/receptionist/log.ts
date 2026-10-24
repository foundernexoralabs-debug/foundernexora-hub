// @polsia:user-owned — structured, privacy-safe logging for the Guide and the report bridge.
//
// One JSON line per event. Callers pass ids, counts and modes; any free text is redacted and
// shortened here, so a visitor's email, phone number or a pasted key never reaches the logs.
// Keys, tokens and endpoints are never passed in at all.
import { redactPII } from '@/lib/business/receptionist/guard';

type Field = string | number | boolean | string[] | undefined;

export function logEvent(event: string, fields: Record<string, Field>, text?: string): void {
  const line = {
    event,
    at: new Date().toISOString(),
    ...fields,
    ...(text ? { text: redactPII(text).slice(0, 120) } : {}),
  };
  // biome-ignore lint/suspicious/noConsole: server-side structured log line, redacted above.
  console.info(JSON.stringify(line));
}
