// @polsia:user-owned — the Renor introduction: what it is, who it is for, how it works, a tour
// of real screens, every feature with its honest status, known limits, and the private beta.
// Launch content lives in src/lib/business/launch.ts; area limits in ecosystem.ts.
import { ArrowDown, ArrowRight, ArrowUpRight, Info, Megaphone, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BetaInvite } from '@/components/custom/beta-invite';
import { Eyebrow, HeroGrid, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { FeatureGrid, HowItWorks, ThemedShot } from '@/components/custom/launch';
import { ProductTour } from '@/components/custom/product-tour';
import { RenorOrb } from '@/components/custom/renor-orb';
import { Button } from '@/components/ui/button';
import { RENOR_APP_URL, RENOR_AREAS, RENOR_LABS_STORE_URL } from '@/lib/business/ecosystem';
import {
  AUDIENCES,
  BETA_EMAIL,
  DESCRIPTIONS,
  LAUNCH_SOCIAL_IMAGE,
  TOUR,
  TOUR_EXAMPLE,
} from '@/lib/business/launch';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Renor — one AI workspace for conversations, code, websites and projects',
  description: DESCRIPTIONS[25],
  path: '/renor',
  socialTitle: 'Meet Renor by FounderLab: think it, build it, keep it',
  image: LAUNCH_SOCIAL_IMAGE,
});

const control = [
  {
    title: 'Understand',
    detail: 'Renor works out whether you are researching, asking, deciding or building.',
  },
  { title: 'Plan', detail: 'It proposes the work before changing anything that matters.' },
  {
    title: 'Approve',
    detail: 'Consequential actions wait for you. Access is asked for, not assumed.',
  },
  { title: 'Verify', detail: 'It shows what actually ran, what passed, and what is still open.' },
] as const;

const heroShot = TOUR.find((shot) => shot.id === 'code');
/** Plan & usage: the one real screen not covered by the four-area tour. */
const planShot = TOUR.find((shot) => shot.id === 'plan');

export default function RenorPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-border px-5 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
        <HeroGrid />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-12rem] left-1/2 -z-10 size-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-500)_26%,transparent),transparent_65%)] blur-2xl"
        />
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <RenorOrb className="size-24 sm:size-28" sizes="7rem" preload />
          <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold tracking-[0.08em] uppercase shadow-xs">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
            Renor by FounderLab · Private beta
          </p>
          <h1 className="mt-6 font-display type-display text-balance">
            <span className="whitespace-nowrap">Think it.</span>{' '}
            <span className="whitespace-nowrap">Build it.</span>{' '}
            <span className="whitespace-nowrap text-link">Keep it.</span>
          </h1>
          <p className="mt-6 max-w-2xl type-lead text-pretty text-muted-foreground">
            Renor is one AI workspace for conversations, coding, websites and the projects that grow
            from them. It builds apps and sites that actually run, checks them against what you
            asked for, and keeps everything ready to pick up again.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild variant="brand" size="xl">
              <a href="#beta">
                Join the private beta <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
                Open Renor <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
          </div>
          <p className="mt-5 type-meta text-muted-foreground">
            Free to start while in preview. No card, no paid plan yet.
          </p>
        </div>
        <div className="mx-auto mt-14 max-w-6xl sm:mt-16">
          {heroShot ? (
            <ThemedShot
              shot={heroShot}
              preload
              className="rounded-b-none border-b-0"
              sizes="(min-width: 1200px) 72rem, 100vw"
            />
          ) : null}
        </div>
      </section>

      {/* ── Who it is for ────────────────────────────────────────────── */}
      <section aria-labelledby="who" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="who"
            eyebrow="Who it is for"
            title="For people who make things, and want to keep making them."
            lede="Renor suits work that starts as a conversation and turns into something real: an answer, an app, a website, a plan you come back to."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <article key={audience.title} className="rounded-2xl border border-border p-7">
                <h3 className="text-xl font-semibold tracking-tight">{audience.title}</h3>
                <p className="mt-3 type-copy text-muted-foreground">{audience.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="how"
        className="border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="how"
            eyebrow="How it works"
            title="Three steps, from a sentence to something you keep."
          />
          <div className="mt-12">
            <HowItWorks />
          </div>
        </div>
      </section>

      {/* ── Product tour ─────────────────────────────────────────────── */}
      <section
        id="tour"
        aria-labelledby="tour-title"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="tour-title"
            eyebrow="Product tour"
            title="Four rooms, one workspace. Real screens from the app."
            lede={
              <>
                Every screen is the real Renor app. To keep the story in one place, we invented an
                example: <strong className="text-foreground">{TOUR_EXAMPLE.name}</strong>,{' '}
                {TOUR_EXAMPLE.description}. It is not a customer.
              </>
            }
          />
          <ProductTour />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section
        id="features"
        aria-labelledby="features-title"
        className="scroll-mt-20 border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="features-title"
            eyebrow="Everything in Renor"
            title="What works today, what is in beta, what is next."
            lede="Each feature carries its real status, checked against the app. Planned means not built yet, and we say so."
          />
          <div className="mt-14">
            <FeatureGrid />
          </div>
        </div>
      </section>

      {/* ── Control and limits ───────────────────────────────────────── */}
      <section aria-labelledby="control" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-screen-xl gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              id="control"
              eyebrow="You stay in control"
              title="It asks before it acts, and shows what it did."
            />
            <ol className="mt-10 grid gap-4">
              {control.map((stage, index) => (
                <li
                  key={stage.title}
                  className="flex gap-5 rounded-2xl border border-border bg-card p-5"
                >
                  <span className="text-[0.9375rem] font-semibold text-link tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-semibold">{stage.title}</h3>
                    <p className="mt-1 type-copy text-muted-foreground">{stage.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Eyebrow>Known limits</Eyebrow>
            <h2 className="mt-4 font-display type-heading text-balance">What it cannot do yet.</h2>
            <ul className="mt-10 grid gap-4">
              {RENOR_AREAS.map((area) => (
                <li key={area.id} className="rounded-2xl border border-border p-5">
                  <h3 className="font-semibold">{area.name}</h3>
                  <p className="mt-2 flex gap-3 type-copy text-muted-foreground">
                    <Info aria-hidden="true" className="mt-1 size-4 shrink-0" />
                    <span>{area.limits}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Private beta ─────────────────────────────────────────────── */}
      <section
        id="beta"
        aria-labelledby="beta-title"
        className="relative isolate scroll-mt-20 overflow-hidden border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -bottom-40 -z-10 size-[36rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-500)_18%,transparent),transparent_65%)]"
        />
        <div className="mx-auto grid max-w-screen-xl items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <Eyebrow>Private beta</Eyebrow>
            <h2 id="beta-title" className="mt-4 font-display type-heading text-balance">
              Help shape Renor before everyone else.
            </h2>
            <p className="mt-5 type-lead text-pretty text-muted-foreground">
              Beta testers try new parts of Renor before they reach everyone, and tell us what works
              and what does not. Tell us a little about what you want to build.
            </p>
            <ul className="mt-8 grid gap-3 type-copy">
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                />
                The founder reads every request and replies by email.
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                />
                No payment: Renor is free while it is in preview.
              </li>
              <li className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-500"
                />
                Want to start straight away? The web preview is open to everyone.
              </li>
            </ul>
            <a
              href={RENOR_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
            >
              Open the web preview <ArrowUpRight aria-hidden="true" className="size-4" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <div>
            <BetaInvite />
            <p className="mt-4 type-meta text-muted-foreground">
              Prefer to write it yourself? Email{' '}
              <a
                href={`mailto:${BETA_EMAIL}`}
                className="font-semibold text-link underline-offset-4 hover:underline"
              >
                {BETA_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── Plans, Plugin Store, launch kit ──────────────────────────── */}
      <section aria-labelledby="more" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <h2 id="more" className="sr-only">
            Plans, the Plugin Store and the launch kit
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <article className="flex flex-col rounded-2xl border border-border bg-card p-7">
              <p className="text-sm font-semibold">Plans</p>
              <p className="mt-3 flex-1 type-copy text-muted-foreground">
                Free is open today. Pro, Plus and Max have proposed prices of £12, £29 and £79 a
                month. They are not approved, and nothing is on sale.
              </p>
              {planShot ? (
                <ThemedShot
                  shot={planShot}
                  sizes="(min-width: 768px) 24rem, 100vw"
                  className="mt-5 rounded-tile shadow-none"
                />
              ) : null}
              <Link
                href="/renor/plans"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
              >
                See the proposed plans <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>
            <article className="flex flex-col rounded-2xl border border-border bg-card p-7">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShoppingBag aria-hidden="true" className="size-4 text-link" /> Renor Plugin Store
              </p>
              <p className="mt-3 flex-1 type-copy text-muted-foreground">
                Ready-to-use digital kits, sold through our Renor Labs shop on Plug&amp;Pay once
                sales open.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5">
                <Link
                  href="/plugins"
                  className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
                >
                  Browse the Plugin Store <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <a
                  href={RENOR_LABS_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
                >
                  Renor Labs shop <ArrowUpRight aria-hidden="true" className="size-4" />
                  <span className="sr-only"> (opens Plug&amp;Pay in a new tab)</span>
                </a>
              </div>
            </article>
            <article className="flex flex-col rounded-2xl border border-border bg-card p-7">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Megaphone aria-hidden="true" className="size-4 text-link" /> Launch kit
              </p>
              <p className="mt-3 flex-1 type-copy text-muted-foreground">
                Graphics, short descriptions, the 60-second film storyboard and press contact, ready
                to share.
              </p>
              <Link
                href="/launch-kit"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
              >
                Open the launch kit <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>
      <ExploreBand page="renor" />
    </main>
  );
}
