// @polsia:user-owned — /renor/capabilities: everything Renor can do today, room by room, each
// with its honest status (live, preview or planned) and the main known limit of each room.
// Every line comes from src/lib/business/capabilities.ts; the same list feeds the featureList in
// Renor's structured data, so search engines read exactly what people read.
import { ArrowRight, ArrowUpRight, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AREA_ICONS } from '@/components/custom/capability-icons';
import { CapabilityIndex } from '@/components/custom/capability-index';
import { PageHero, StatusBadge } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { RenorIdentityJsonLd } from '@/components/custom/structured-data';
import { Button } from '@/components/ui/button';
import {
  CAPABILITIES,
  CAPABILITIES_CHECKED,
  CAPABILITIES_PATH,
  CAPABILITY_AREAS,
  CAPABILITY_STATUS,
  CAPABILITY_STATUS_ORDER,
  type CapabilityArea,
  type CapabilityStatus,
  capabilitiesIn,
  RENOR_APP_ADDRESS,
  RENOR_APP_HOST,
  roomUrl,
  statusCounts,
} from '@/lib/business/capabilities';
import { SEARCH_DESCRIPTIONS } from '@/lib/business/search-identity';
import { pageMetadata } from '@/lib/business/seo';
import { cn } from '@/lib/utils';

const TITLE = 'Renor AI capabilities — what Renor can do today';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: SEARCH_DESCRIPTIONS.capabilities,
  path: CAPABILITIES_PATH,
  socialTitle: 'What Renor AI can do today, with every status',
});

const counts = statusCounts();

/** The status dot on its own, in the badge tones: solid for live and preview, hollow for planned. */
const STATUS_DOT: Record<CapabilityStatus, string> = {
  live: 'size-2 shrink-0 rounded-full bg-live shadow-[0_0_0_3px_color-mix(in_oklch,var(--live)_28%,transparent)]',
  preview: 'size-2 shrink-0 rounded-full bg-preview',
  planned: 'size-2 shrink-0 rounded-full border-[1.5px] border-ink-3',
};

/** The one-glance fact sheet: what Renor is, who makes it, where to open it. */
function AtAGlance() {
  const facts = [
    { term: 'Name', detail: 'Renor, also called Renor AI' },
    { term: 'Made by', detail: 'FounderLab' },
    { term: 'What it is', detail: 'An AI operator that runs in your browser' },
    {
      term: 'Open it',
      detail: (
        <a
          href={RENOR_APP_ADDRESS}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-link underline-offset-4 hover:underline"
        >
          {RENOR_APP_HOST}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ),
    },
    { term: 'Price', detail: 'Free to start. Paid plans are not on sale yet.' },
  ];
  return (
    <aside
      aria-labelledby="glance-title"
      className="rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-7"
    >
      <h2 id="glance-title" className="text-sm font-semibold tracking-[0.12em] uppercase">
        Renor at a glance
      </h2>
      <dl className="mt-5 grid gap-3.5">
        {facts.map((fact) => (
          <div
            key={fact.term}
            className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] border-b border-border pb-3.5 last:border-b-0 last:pb-0"
          >
            <dt className="type-meta text-muted-foreground">{fact.term}</dt>
            <dd className="type-meta font-medium text-foreground">{fact.detail}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-6 grid grid-cols-3 gap-2.5 border-t border-border pt-6">
        {CAPABILITY_STATUS_ORDER.map((status) => (
          <li key={status}>
            <a
              href="#how-we-decide"
              title={CAPABILITY_STATUS[status].description}
              className="flex h-full flex-col gap-2.5 rounded-2xl border border-border bg-background/60 p-3.5 transition-colors hover:border-brand-500/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="font-display text-[2rem] leading-none font-semibold tracking-tight tabular-nums">
                {counts[status]}
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                <span aria-hidden="true" className={STATUS_DOT[status]} />
                {CAPABILITY_STATUS[status].label}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 type-meta text-muted-foreground">
        Checked against the app on{' '}
        <time dateTime={CAPABILITIES_CHECKED.iso}>{CAPABILITIES_CHECKED.label}</time> (
        {CAPABILITIES_CHECKED.release}).
      </p>
    </aside>
  );
}

function AreaSection({ area }: { area: CapabilityArea }) {
  const Icon = AREA_ICONS[area.icon];
  const items = capabilitiesIn(area.id);
  const headingId = `${area.id}-title`;
  return (
    <section
      id={area.id}
      aria-labelledby={headingId}
      className="scroll-mt-24 border-t border-border pt-12 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
        <div className="flex max-w-2xl items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-link"
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 id={headingId} className="font-display type-subheading">
              {area.name}
            </h2>
            <p className="mt-2 type-copy text-pretty text-muted-foreground">{area.summary}</p>
          </div>
        </div>
        <a
          href={roomUrl(area)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-[0.9375rem] font-semibold transition-colors hover:border-brand-500/60 hover:text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {area.room.label}
          <ArrowUpRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> in Renor (opens in a new tab)</span>
        </a>
      </div>

      <ul className="mt-7 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((capability) => (
          <li
            key={capability.id}
            className={cn('px-5 py-5 sm:px-6', capability.status === 'planned' && 'bg-muted/35')}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="pt-0.5 text-[1.0625rem] leading-snug font-semibold tracking-tight">
                {capability.name}
              </h3>
              <StatusBadge
                status={capability.status}
                description={CAPABILITY_STATUS[capability.status].description}
                className="shrink-0"
              />
            </div>
            <p className="mt-2 max-w-3xl type-copy text-pretty text-muted-foreground">
              {capability.text}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex gap-2.5 type-meta text-muted-foreground">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          <span className="font-semibold text-foreground">Known limit.</span> {area.limit}
        </span>
      </p>
    </section>
  );
}

export default function CapabilitiesPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <RenorIdentityJsonLd
        page={{
          path: CAPABILITIES_PATH,
          name: 'Renor AI capabilities',
          description: SEARCH_DESCRIPTIONS.capabilities,
          trail: [{ name: 'Renor AI', path: '/renor' }],
          dateModified: CAPABILITIES_CHECKED.iso,
        }}
      />
      <PageHero
        eyebrow="Renor capabilities"
        title="What Renor AI can do today."
        lede={
          <>
            Renor AI is the AI operator by FounderLab. Here is every capability, room by room, with
            its real status: {CAPABILITIES.length} in all, checked against the app. Nothing planned
            is described as ready.
          </>
        }
        aside={<AtAGlance />}
      >
        <Button asChild variant="brand" size="xl">
          <a href={RENOR_APP_ADDRESS} target="_blank" rel="noopener noreferrer">
            Open Renor <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link href="/renor/plans">
            Compare plans <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </PageHero>

      <div className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <CapabilityIndex
            entries={CAPABILITY_AREAS.map((area) => ({
              id: area.id,
              name: area.name,
              icon: area.icon,
              count: capabilitiesIn(area.id).length,
            }))}
          />
          <div className="grid gap-12">
            {CAPABILITY_AREAS.map((area) => (
              <AreaSection key={area.id} area={area} />
            ))}
          </div>
        </div>
      </div>

      <section
        id="how-we-decide"
        aria-labelledby="how-we-decide-title"
        className="scroll-mt-20 border-t border-border bg-band px-5 py-16 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-link uppercase">
            How a status is decided
          </p>
          <h2
            id="how-we-decide-title"
            className="mt-4 max-w-3xl font-display type-heading text-balance"
          >
            Checked against the app, not against the plan.
          </h2>
          <p className="mt-5 max-w-2xl type-lead text-pretty text-muted-foreground">
            Each status comes from the Renor app’s code and its test records, last checked on{' '}
            <time dateTime={CAPABILITIES_CHECKED.iso}>{CAPABILITIES_CHECKED.label}</time>. When
            something changes in the app, this page changes with it.
          </p>
          <dl className="mt-12 grid gap-4 md:grid-cols-3">
            {CAPABILITY_STATUS_ORDER.map((status) => (
              <div key={status} className="rounded-2xl border border-border bg-card p-6">
                <dt className="flex items-center justify-between gap-3">
                  <StatusBadge
                    status={status}
                    description={CAPABILITY_STATUS[status].description}
                  />
                  <span className="font-display text-2xl font-semibold tabular-nums">
                    {counts[status]}
                  </span>
                </dt>
                <dd className="mt-4 type-copy text-muted-foreground">
                  {CAPABILITY_STATUS[status].description}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 type-meta text-muted-foreground">
            Found something out of date?{' '}
            <Link
              href="/contact"
              className="font-semibold text-link underline-offset-4 hover:underline"
            >
              Tell us
            </Link>{' '}
            and we will correct it.
          </p>
        </div>
      </section>

      <ExploreBand page="capabilities" />
    </main>
  );
}
