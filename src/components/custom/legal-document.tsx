// @polsia:user-owned — the reading layout for Privacy, Terms and Accessibility: a 68ch
// column, an "On this page" contents list (sticky beside the text on desktop, folded above
// it on phones) and the page's own last-updated date. It only arranges the page's text;
// the words stay in each page. tests/unit/legal-pages.test.ts checks every contents entry
// points at a heading with the same words.
import type { ReactNode } from 'react';

export interface LegalSection {
  /** The heading's id: the contents link and any deep link (/privacy#guide) use it. */
  id: string;
  title: string;
}

function Contents({ sections }: { sections: readonly LegalSection[] }) {
  return (
    <ol className="grid gap-0.5">
      {sections.map((section, index) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="flex min-h-11 items-baseline gap-3 rounded-chip py-2 text-[0.9375rem] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <span className="type-mono text-[0.875rem] text-link">
              {String(index + 1).padStart(2, '0')}
            </span>
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function LegalDocument({
  sections,
  dateLabel,
  date,
  children,
}: {
  sections: readonly LegalSection[];
  /** "Last updated" or "Last reviewed", as the page already says it. */
  dateLabel: string;
  /** The date as the page already writes it, e.g. "24 October 2026". */
  date: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-screen-xl gap-10 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[15rem_minmax(0,68ch)] lg:justify-center lg:gap-16">
      <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
        <details className="group rounded-tile border border-border bg-card px-4 lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[0.9375rem] font-semibold [&::-webkit-details-marker]:hidden">
            On this page
            <span className="type-meta font-normal text-muted-foreground">
              {sections.length} sections
            </span>
          </summary>
          <div className="border-t border-border py-2">
            <Contents sections={sections} />
          </div>
        </details>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            On this page
          </p>
          <div className="mt-3">
            <Contents sections={sections} />
          </div>
          <p className="mt-6 border-t border-border pt-4 type-meta text-muted-foreground">
            {dateLabel}
            <br />
            <span className="type-mono text-foreground">{date}</span>
          </p>
        </div>
      </nav>
      <article className="min-w-0 max-w-[68ch] text-[1.0625rem] leading-[1.75] text-muted-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-[1.625rem] [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </article>
    </div>
  );
}
