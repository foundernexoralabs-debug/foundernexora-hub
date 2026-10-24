// @polsia:user-owned — files one report: redact → triage → group with matching open reports →
// store privately → (optionally) hand a PII-free summary to engineering.
import { type HandoffConfig, sendHandoff } from '@/lib/business/receptionist/handoff';
import type { ReportStore } from '@/lib/business/receptionist/report-store';
import {
  buildRecord,
  type DeliveryResult,
  findDuplicate,
  handoffSummary,
  mailtoHref,
} from '@/lib/business/receptionist/reports';
import type { ParsedReport } from '@/lib/contracts/receptionist';

export interface BridgeDeps {
  store: ReportStore | null;
  handoff: HandoffConfig | null;
  fetchImpl?: typeof fetch;
  now?: Date;
}

export async function fileReport(
  report: ParsedReport,
  reference: string,
  deps: BridgeDeps,
): Promise<DeliveryResult & { handedOff: boolean }> {
  if (!deps.store) {
    return {
      status: 'email',
      mailto: mailtoHref(report, reference),
      reason: 'not-configured',
      handedOff: false,
    };
  }
  const record = buildRecord(report, reference, deps.now ?? new Date());
  let groupSize = 1;
  try {
    const recent = await deps.store.list(200);
    const duplicate = findDuplicate(record, recent);
    if (duplicate) {
      record.groupId = duplicate.match.groupId;
      groupSize = recent.filter((r) => r.groupId === record.groupId).length + 1;
    }
    await deps.store.save(record);
  } catch {
    return {
      status: 'email',
      mailto: mailtoHref(report, reference),
      reason: 'store-failed',
      handedOff: false,
    };
  }
  const handedOff = deps.handoff
    ? await sendHandoff(handoffSummary(record, groupSize), deps.handoff, deps.fetchImpl)
    : false;
  return groupSize > 1
    ? { status: 'duplicate', groupId: record.groupId, groupSize, handedOff }
    : { status: 'stored', groupId: record.groupId, handedOff };
}
