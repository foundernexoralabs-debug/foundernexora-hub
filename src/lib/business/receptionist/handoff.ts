// @polsia:user-owned — optional engineering hand-off. OFF unless both variables are set.
//
//   REPORTS_HANDOFF_URL     https endpoint of a private bridge the team controls
//   REPORTS_HANDOFF_SECRET  shared secret; every POST carries an HMAC-SHA256 signature of its
//                           body in `x-renor-signature: sha256=<hex>` so the receiver can verify it
//
// It sends only a HandoffSummary (reports.ts): structured triage, no contact email, no IP, and
// the visitor's (already redacted) words only when they agreed to share them with engineers.
// A failed hand-off never affects the visitor: the report is already stored.

import { createHmac } from 'node:crypto';
import type { HandoffSummary } from '@/lib/business/receptionist/reports';

export interface HandoffConfig {
  url: string;
  secret: string;
}

export function readHandoffConfig(
  env: Record<string, string | undefined> = process.env,
): HandoffConfig | null {
  const url = env.REPORTS_HANDOFF_URL?.trim();
  const secret = env.REPORTS_HANDOFF_SECRET?.trim();
  if (!url || !secret || secret.length < 16) return null;
  try {
    return new URL(url).protocol === 'https:' ? { url, secret } : null;
  } catch {
    return null;
  }
}

export function signBody(body: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

/** True when the receiver accepted it. Never throws. */
export async function sendHandoff(
  summary: HandoffSummary,
  config: HandoffConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const body = JSON.stringify({ kind: 'renor.user-report', version: 1, report: summary });
  try {
    const res = await fetchImpl(config.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-renor-signature': signBody(body, config.secret),
      },
      body,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}
