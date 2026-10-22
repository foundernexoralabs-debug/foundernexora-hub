// @polsia:user-owned — Renor's Free, Pro and Max plans. Free is open; Pro and Max are proposed.
// No paid plan can be bought: there is no approved checkout, so their buttons join an
// early list by email. The rules are enforced by tests/unit/plans.test.ts.
import { ArrowUpRight, CircleCheck, CircleDashed, Info, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { Button } from '@/components/ui/button';
import { RENOR_APP_URL } from '@/lib/business/ecosystem';
import { PAID_PLANS_NOTICE, PLAN_PRINCIPLES, PLANS, type Plan } from '@/lib/business/plans';
import { pageMetadata } from '@/lib/business/seo';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: 'Renor plans — Free, Pro and Max',
  description:
    'Start Renor free today. Pro and Max are proposed: no price is set and they open once prices are approved. Join the early list by email.',
  path: '/renor/plans',
});

function PlanButton({ plan }: { plan: Plan }) {
  const { action } = plan;
  if (action.kind === 'signup') {
    return (
      <Button asChild variant="brand" size="xl" className="w-full">
        <a href={action.href} target="_blank" rel="noopener noreferrer">
          {action.label} <ArrowUpRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> (opens Renor in a new tab)</span>
        </a>
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size="xl" className="w-full">
      <a href={action.href}>
        <Mail aria-hidden="true" className="size-4" /> {action.label}
        <span className="sr-only"> for {plan.name}, by email</span>
      </a>
    </Button>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const open = plan.state === 'open';
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      className={cn(
        'relative flex flex-col rounded-3xl border bg-card p-7 sm:p-8',
        open ? 'border-brand-500/60 shadow-lg ring-1 ring-brand-500/20' : 'border-border',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id={`plan-${plan.id}`}
          className="font-display text-[1.75rem] font-semibold tracking-tight"
        >
          {plan.name}
        </h3>
        <span
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.06em] uppercase',
            open
              ? 'border-emerald-600/35 bg-emerald-50 text-emerald-800 dark:border-emerald-400/35 dark:bg-emerald-400/10 dark:text-emerald-200'
              : 'border-border bg-muted text-muted-foreground',
          )}
        >
          {open ? 'Open now' : 'Proposed'}
        </span>
      </div>
      <p className="mt-2 type-copy text-muted-foreground">{plan.forWho}</p>
      <p className="mt-7 font-display text-[2rem] leading-tight font-semibold tracking-tight">
        {plan.price}
        {open ? null : (
          <span className="ml-2 align-middle text-base font-medium tracking-normal text-muted-foreground">
            (proposed)
          </span>
        )}
      </p>
      <div className="mt-7">
        <PlanButton plan={plan} />
        <p className="mt-3 type-meta text-muted-foreground">{plan.action.note}</p>
      </div>
      <ul className="mt-8 grid gap-3.5 border-t border-border pt-7">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex gap-3 type-copy">
            {feature.availability === 'today' ? (
              <CircleCheck
                aria-hidden="true"
                className="mt-1 size-[1.125rem] shrink-0 text-emerald-600 dark:text-emerald-400"
              />
            ) : (
              <CircleDashed
                aria-hidden="true"
                className="mt-1 size-[1.125rem] shrink-0 text-muted-foreground"
              />
            )}
            <span
              className={feature.availability === 'today' ? undefined : 'text-muted-foreground'}
            >
              {feature.text}
              <span className="sr-only">
                {feature.availability === 'today' ? ' (works today)' : ' (planned)'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Renor plans"
        title="Free to start. Fair as you grow."
        lede={
          <>
            Sign up for Free today and use Renor in your browser.{' '}
            <strong className="font-semibold text-foreground">
              Pro and Max are proposed: their prices are not set and they cannot be bought yet.
            </strong>{' '}
            Join the early list and we will tell you when they open.
          </>
        }
      >
        <Button asChild variant="brand" size="xl">
          <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
            Sign up free <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only"> (opens Renor in a new tab)</span>
          </a>
        </Button>
        <Button asChild variant="outline" size="xl">
          <a href="#plans">Compare plans</a>
        </Button>
      </PageHero>

      <section
        id="plans"
        aria-labelledby="plans-title"
        className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <h2 id="plans-title" className="sr-only">
            Plans
          </h2>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <p className="flex max-w-3xl gap-3 rounded-2xl border border-border bg-band p-4 type-copy sm:p-5">
              <Info aria-hidden="true" className="mt-1 size-5 shrink-0 text-link" />
              <span>
                <span className="font-semibold">Paid plans are not on sale yet. </span>
                {PAID_PLANS_NOTICE}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 type-meta text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <CircleCheck
                  aria-hidden="true"
                  className="size-4 text-emerald-600 dark:text-emerald-400"
                />
                Works in Renor today
              </span>
              <span className="inline-flex items-center gap-2">
                <CircleDashed aria-hidden="true" className="size-4" /> Planned
              </span>
            </div>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="principles"
        className="border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="principles"
            eyebrow="How limits will work"
            title="Limits that protect the product, never your work."
            lede="Running AI models costs real money, so every plan has limits. These are the rules those limits are being built around."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {PLAN_PRINCIPLES.map((principle) => (
              <article
                key={principle.title}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <h3 className="text-xl font-semibold tracking-tight">{principle.title}</h3>
                <p className="mt-3 type-copy text-muted-foreground">{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-screen-xl type-copy text-muted-foreground">
          <p className="max-w-3xl">
            Prices will be set from measured running costs and published here before anything can be
            bought. If a plan changes later, the projects you made stay yours. Questions or
            suggestions are welcome on the{' '}
            <Link
              href="/contact"
              className="font-medium text-foreground underline underline-offset-4"
            >
              contact page
            </Link>
            .
          </p>
        </div>
      </section>
      <ExploreBand page="plans" />
    </main>
  );
}
