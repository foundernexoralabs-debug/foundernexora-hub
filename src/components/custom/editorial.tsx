// @polsia:user-owned — editorial layout pieces for long-form pages (Company, Zero to Prove):
// numbered chapters, a pull quote and a facts rail. Server components; they only arrange
// copy and facts that pages pass in, so every word still comes from its single source.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Two-digit chapter number: 1 → "01". */
export const chapterNumber = (n: number) => String(n).padStart(2, '0');

/**
 * One numbered chapter: the number and kicker sit in a narrow left column on desktop and
 * above the heading on phones; a hairline opens each chapter.
 */
export function Chapter({
  number,
  kicker,
  title,
  id,
  children,
  className,
}: {
  number: number;
  kicker: string;
  title: ReactNode;
  /** The heading id, so the section can be labelled by it and linked to. */
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        'grid scroll-mt-24 gap-x-10 gap-y-5 border-t border-border pt-10 md:grid-cols-[8.5rem_minmax(0,1fr)] md:pt-12',
        className,
      )}
    >
      <p className="flex items-baseline gap-3 md:flex-col md:gap-2">
        <span className="type-mono text-[1.75rem] leading-none font-semibold text-link md:text-[2.25rem]">
          {chapterNumber(number)}
        </span>
        <span className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          {kicker}
        </span>
      </p>
      <div className="min-w-0">
        <h2 id={id} className="max-w-[24ch] font-display type-heading text-balance">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

/** A pull quote lifted from the page's own copy, with an optional attribution. */
export function PullQuote({
  children,
  cite,
  className,
}: {
  children: ReactNode;
  cite?: string;
  className?: string;
}) {
  return (
    <figure className={cn('relative md:pl-[calc(8.5rem+2.5rem)]', className)}>
      <blockquote className="relative border-l-2 border-orb-2 pl-6 font-display text-[1.625rem] leading-[1.25] font-medium tracking-[-0.02em] text-balance sm:text-[2rem] lg:text-[2.375rem]">
        <span aria-hidden="true" className="text-link">
          “
        </span>
        {children}
        <span aria-hidden="true" className="text-link">
          ”
        </span>
      </blockquote>
      {cite ? (
        <figcaption className="mt-4 pl-6 type-meta text-muted-foreground">{cite}</figcaption>
      ) : null}
    </figure>
  );
}

export interface Fact {
  label: string;
  value: ReactNode;
}

/** A quiet column of checkable facts; sticky beside the chapters on large screens. */
export function FactsRail({
  title = 'Facts',
  facts,
  footnote,
  className,
}: {
  title?: string;
  facts: readonly Fact[];
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <aside
      aria-label={title}
      className={cn(
        'h-fit rounded-panel border border-border bg-card p-6 lg:sticky lg:top-24',
        className,
      )}
    >
      <p className="text-sm font-semibold tracking-[0.12em] text-link uppercase">{title}</p>
      <dl className="mt-5 grid gap-5">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="grid gap-1 border-t border-border pt-4 first:border-0 first:pt-0"
          >
            <dt className="text-sm font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              {fact.label}
            </dt>
            <dd className="text-[1.0625rem] leading-snug font-medium text-foreground">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
      {footnote ? (
        <p className="mt-6 border-t border-border pt-4 type-meta text-muted-foreground">
          {footnote}
        </p>
      ) : null}
    </aside>
  );
}
