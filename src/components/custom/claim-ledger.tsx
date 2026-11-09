// @polsia:user-owned — the vision-to-proof ledger: Live today / In progress / Future vision.
// Data and rules: src/lib/business/vision.ts. A live row shows its capability's own status
// (Live or Preview) from capabilities.ts, so this ledger never says more than the app does.
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { STATUS } from '@/lib/business/ecosystem';
import {
  CLAIM_STATUS,
  type ClaimStatus,
  capabilityStatus,
  LEDGER_CHECKED,
  type LedgerEntry,
  ledgerBy,
} from '@/lib/business/vision';
import './operator.css';

const ORDER: readonly ClaimStatus[] = ['live', 'in-progress', 'future'];

function Evidence({ entry }: { entry: LedgerEntry }) {
  if (!entry.evidence) return null;
  const external = entry.evidence.href.startsWith('http');
  const className =
    'mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-link underline-offset-4 hover:underline sm:min-h-0';
  return external ? (
    <a href={entry.evidence.href} target="_blank" rel="noopener noreferrer" className={className}>
      Evidence: {entry.evidence.label}
      <ArrowUpRight aria-hidden="true" className="size-3.5" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link href={entry.evidence.href} className={className}>
      Evidence: {entry.evidence.label}
    </Link>
  );
}

function RowMeta({ entry }: { entry: LedgerEntry }) {
  if (entry.status === 'live') {
    const status = capabilityStatus(entry.capabilityId);
    return (
      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {status ? <span className="op-tag">{STATUS[status].label} in the app</span> : null}
        <span>Checked {LEDGER_CHECKED}</span>
      </p>
    );
  }
  return entry.since ? (
    <p className="mt-3 text-sm text-muted-foreground">Written down {entry.since}</p>
  ) : null;
}

export function ClaimLedger({ headingLevel = 'h3' }: { headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  return (
    <div className="op-ledger">
      {ORDER.map((status) => (
        <section
          key={status}
          className="op-ledger-col"
          data-status={status}
          aria-labelledby={`ledger-${status}`}
        >
          <div className="op-ledger-head">
            <Heading id={`ledger-${status}`} className="flex items-center gap-2">
              <span className="op-tag" data-tone={status}>
                {CLAIM_STATUS[status].label}
              </span>
            </Heading>
            <p className="mt-2 text-sm text-muted-foreground">{CLAIM_STATUS[status].description}</p>
          </div>
          <ul>
            {ledgerBy(status).map((entry) => (
              <li key={entry.id} id={`claim-${entry.id}`} className="op-ledger-row">
                <p className="font-semibold tracking-tight text-foreground">{entry.claim}</p>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                  {entry.detail}
                </p>
                <RowMeta entry={entry} />
                <Evidence entry={entry} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
