// @polsia:user-owned — the home page's sections below the hero, each with its own layout:
// a bento of the four Renor areas (real captures), an editorial "How we work", a build-log
// teaser and a closing call to action. Server components; every claim, status and picture
// comes from RENOR_TABS, MILESTONES, NEEDS and TOUR, never from this file.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BuildLogTimeline } from '@/components/custom/build-log';
import { Eyebrow, StatusBadge } from '@/components/custom/ecosystem';
import { NeedActionButton } from '@/components/custom/need-guide';
import { Button } from '@/components/ui/button';
import { MILESTONES, RENOR_APP_URL } from '@/lib/business/ecosystem';
import { NEEDS } from '@/lib/business/guide';
import { TOUR_CAPTURED, type TourShot, tourImage } from '@/lib/business/launch';
import { RENOR_TABS, type RenorTab } from '@/lib/business/renor-tabs';
import { cn } from '@/lib/utils';
import './home.css';

/* ── Bento: the four Renor areas ───────────────────────────────────────── */

/** A tour capture cropped into a tile, in the visitor's theme. Top-left is the app's chrome. */
function TileCapture({
  shot,
  sizes,
  className,
}: {
  shot: TourShot;
  sizes: string;
  className?: string;
}) {
  const common = { alt: shot.alt, width: shot.width, height: shot.height, sizes } as const;
  return (
    <div className={cn('bento-capture', className)}>
      <Image {...common} src={tourImage(shot, 'light')} className="dark:hidden" />
      <Image {...common} src={tourImage(shot, 'dark')} className="hidden dark:block" />
    </div>
  );
}

type TileSize = 'feature' | 'stack' | 'wide';

const TILE_LAYOUT: Record<RenorTab['id'], TileSize> = {
  'chat-ai': 'feature',
  'code-ai': 'stack',
  'website-builder': 'stack',
  'project-office': 'wide',
};

const TILE_CLASS: Record<TileSize, string> = {
  feature: 'lg:col-span-7 lg:row-span-2',
  stack: 'lg:col-span-5',
  wide: 'lg:col-span-12 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch',
};

const TILE_SIZES: Record<TileSize, string> = {
  feature: '(min-width: 1024px) 44rem, 100vw',
  stack: '(min-width: 1024px) 32rem, 100vw',
  wide: '(min-width: 1024px) 46rem, 100vw',
};

function BentoTile({ tab }: { tab: RenorTab }) {
  const size = TILE_LAYOUT[tab.id];
  const headingId = `bento-${tab.id}`;
  return (
    <li className={cn('bento-tile group', TILE_CLASS[size])} data-size={size}>
      <div className="relative z-10 flex flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-[0.12em] text-link uppercase">{tab.label}</p>
          <StatusBadge status={tab.area.status} />
        </div>
        <h3
          id={headingId}
          className={cn(
            'mt-4 font-display text-balance',
            size === 'feature' ? 'type-heading' : 'type-subheading',
          )}
        >
          {tab.value}
        </h3>
        {size !== 'stack' ? (
          <p className="mt-3 max-w-[52ch] type-copy text-pretty text-muted-foreground">
            {tab.area.summary}
          </p>
        ) : null}
        <Link
          href={`/renor#${tab.id}`}
          aria-describedby={headingId}
          className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
        >
          See {tab.label} in the tour
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
      <TileCapture shot={tab.shot} sizes={TILE_SIZES[size]} />
    </li>
  );
}

const capturedOn = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${TOUR_CAPTURED}T00:00:00Z`));

export function ProductBento() {
  return (
    <section
      id="products"
      aria-labelledby="products-title"
      className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <Eyebrow>Renor AI</Eyebrow>
            <h2 id="products-title" className="mt-4 font-display type-heading text-balance">
              Four rooms. One workspace.
            </h2>
            <p className="mt-5 type-lead text-pretty text-muted-foreground">
              Chat, Code AI, a Website Builder and a Project Office, each shown in a real capture of
              the app.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
          >
            Every project and its status <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-12">
          {RENOR_TABS.map((tab) => (
            <BentoTile key={tab.id} tab={tab} />
          ))}
        </ul>
        <p className="mt-5 type-meta text-muted-foreground">
          Captured from the production build of Renor on {capturedOn}, signed in to a demo account.
          Larkspur Cycles is an invented example, not a customer.
        </p>
      </div>
    </section>
  );
}

/* ── How we work: editorial ────────────────────────────────────────────── */

export interface Principle {
  title: string;
  text: string;
}

export function HowWeWork({ principles }: { principles: readonly Principle[] }) {
  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      className="scroll-mt-20 border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>How we work</Eyebrow>
          <h2 id="approach-title" className="mt-4 font-display type-display text-balance">
            Useful work comes first.
          </h2>
          <Link
            href="/company#how-we-work"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
          >
            The rules behind everything we ship <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ol className="grid">
          {principles.map((principle, index) => (
            <li
              key={principle.title}
              className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-5 border-t border-border py-8 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:py-10"
            >
              <span
                aria-hidden="true"
                className="type-mono text-[2rem] leading-none font-semibold text-link sm:text-[2.75rem]"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display type-subheading">{principle.title}</h3>
                <p className="mt-3 max-w-[48ch] type-lead text-pretty text-muted-foreground">
                  {principle.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Build-log teaser ──────────────────────────────────────────────────── */

export function BuildLogTeaser({ count = 3 }: { count?: number }) {
  return (
    <section
      id="updates"
      aria-labelledby="updates-title"
      className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Build log</Eyebrow>
              <h2 id="updates-title" className="mt-4 font-display type-heading">
                Progress you can inspect.
              </h2>
              <p className="mt-5 max-w-xl type-lead text-pretty text-muted-foreground">
                Each entry says where the work lives, so nothing unfinished is presented as shipped.
              </p>
            </div>
          </div>
          <BuildLogTimeline
            entries={MILESTONES.slice(0, count)}
            newest={MILESTONES[0]}
            className="mt-12"
          />
          <Link
            href="/zero-to-proof#log"
            className="mt-10 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline md:ml-[calc(7.5rem+1.5rem+1.125rem+1.5rem)]"
          >
            Full build log on Zero to Proof · {MILESTONES.length} entries
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Closing call to action ────────────────────────────────────────────── */

function CtaRow({
  title,
  benefit,
  children,
}: {
  title: string;
  benefit: string;
  children: ReactNode;
}) {
  return (
    <li className="grid gap-3 border-t border-border py-5 first:border-t-0 first:pt-2 last:pb-0">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 type-copy text-muted-foreground">{benefit}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </li>
  );
}

/**
 * The page's closing focal point: one orb glow behind the main action, and every reason
 * someone visits (the NEEDS guide) as a row with its own buttons. Keeps the `#guide` anchor
 * the hero links to.
 */
export function HomeCta() {
  const needs = NEEDS.filter((need) => need.id !== 'renor');
  return (
    <section
      id="guide"
      aria-labelledby="guide-title"
      className="relative isolate scroll-mt-24 overflow-hidden border-t border-border px-5 py-20 sm:px-8 sm:py-28"
    >
      <div aria-hidden="true" className="home-cta-glow" />
      <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Start here</Eyebrow>
          <h2 id="guide-title" className="mt-4 font-display type-display text-balance">
            Try Renor today. <span className="text-link">Free in preview.</span>
          </h2>
          <p className="mt-6 max-w-xl type-lead text-pretty text-muted-foreground">
            Open the web preview in your browser, or ask for a place in the private beta. Every
            feature shows its status, so you know what is ready.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="brand" size="xl">
              <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
                Open Renor <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="/renor#beta">Join the private beta</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-panel border border-border bg-card/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
          <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Or pick what you came for
          </p>
          <ul className="mt-3">
            {needs.map((need) => (
              <CtaRow key={need.id} title={need.title} benefit={need.benefit}>
                {need.actions.map((action) => (
                  <NeedActionButton key={action.href} action={action} quiet />
                ))}
              </CtaRow>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
