// @polsia:user-owned — the build log as a vertical timeline: an orb node per entry, a mono
// date, the entry's Shipped / Fix / Test tag and where the work lives. Entries come only
// from MILESTONES in src/lib/business/ecosystem.ts; nothing here adds or rewrites one.
//
// <BuildLogTimeline> renders a list on the server (the home teaser uses it as is).
// <BuildLog> adds the filter chips; filtering is client-side over the same list, and the
// result count is announced to screen readers.
'use client';

import { useId, useState } from 'react';
import {
  MILESTONE_KIND,
  MILESTONE_WHERE,
  type Milestone,
  type MilestoneKind,
} from '@/lib/business/ecosystem';
import { cn } from '@/lib/utils';
import './build-log.css';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

/** Entries cross the server/client boundary as copies, so they are matched by key. */
const entryKey = (entry: Milestone) => `${entry.date}-${entry.title}`;

export function KindTag({ kind }: { kind: MilestoneKind }) {
  return (
    <span className="build-log-tag" data-kind={kind} title={MILESTONE_KIND[kind].description}>
      {MILESTONE_KIND[kind].label}
    </span>
  );
}

export function BuildLogTimeline({
  entries,
  newest,
  headingLevel = 'h3',
  className,
}: {
  entries: readonly Milestone[];
  /** The newest entry in the whole log: its node pulses while it is shown. */
  newest?: Milestone;
  headingLevel?: 'h3' | 'h4';
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <ol className={cn('build-log', className)}>
      {entries.map((entry) => (
        <li key={entryKey(entry)} className="build-log-entry">
          <time dateTime={entry.date} className="build-log-date type-mono">
            {formatDate(entry.date)}
          </time>
          <span
            aria-hidden="true"
            className="build-log-node"
            data-newest={newest && entryKey(entry) === entryKey(newest) ? 'true' : undefined}
          />
          <div className="build-log-body">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <KindTag kind={entry.kind} />
              <span className="type-meta text-muted-foreground">
                {MILESTONE_WHERE[entry.where]}
              </span>
            </div>
            <Heading className="mt-2.5 font-display type-subheading text-balance">
              {entry.title}
            </Heading>
            <p className="mt-2 max-w-[62ch] type-copy text-pretty text-muted-foreground">
              {entry.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

type Filter = 'all' | MilestoneKind;

export function BuildLog({ entries }: { entries: readonly Milestone[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const statusId = useId();
  const kinds = (Object.keys(MILESTONE_KIND) as MilestoneKind[]).filter((kind) =>
    entries.some((entry) => entry.kind === kind),
  );
  const shown = filter === 'all' ? entries : entries.filter((entry) => entry.kind === filter);
  const chips: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: entries.length },
    ...kinds.map((kind) => ({
      id: kind,
      label: MILESTONE_KIND[kind].label,
      count: entries.filter((entry) => entry.kind === kind).length,
    })),
  ];

  return (
    <div>
      <fieldset className="flex flex-wrap items-center gap-2" aria-describedby={statusId}>
        <legend className="sr-only">Filter the build log</legend>
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            aria-pressed={filter === chip.id}
            onClick={() => setFilter(chip.id)}
            className="build-log-chip"
            data-kind={chip.id}
          >
            {chip.label}
            <span className="type-mono text-[0.875rem]">{chip.count}</span>
          </button>
        ))}
      </fieldset>
      <p id={statusId} className="sr-only" aria-live="polite">
        {filter === 'all'
          ? `Showing all ${entries.length} entries.`
          : `Showing ${shown.length} ${MILESTONE_KIND[filter].label} ${shown.length === 1 ? 'entry' : 'entries'}.`}
      </p>
      <BuildLogTimeline entries={shown} newest={entries[0]} className="mt-10" />
    </div>
  );
}
