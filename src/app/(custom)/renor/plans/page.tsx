// @polsia:user-owned — Renor's Free, Pro, Plus and Max plans. Free is open; every price and
// allowance is a proposal, labelled as one. No plan can be bought: there is no approved checkout,
// so paid buttons join an early list by email. Rules enforced by tests/unit/plans.test.ts.
import { ArrowUpRight, Boxes, Cpu, Gauge, Info, Layers, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { FaqList } from '@/components/custom/faq-list';
import { Button } from '@/components/ui/button';
import { RENOR_APP_URL } from '@/lib/business/ecosystem';
import {
  allowanceLines,
  PAID_PLANS_NOTICE,
  PLAN_FAQ,
  PLAN_PRINCIPLES,
  PLANS,
  type Plan,
  PROPOSED_LABEL,
} from '@/lib/business/plans';
import { pageMetadata } from '@/lib/business/seo';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: 'Renor plans — Free, Pro, Plus and Max',
  description:
    'Start Renor free today. Pro, Plus and Max have proposed prices of £12, £29 and £79 a month with weekly AI credits. Nothing is on sale yet: join the early list by email.',
  path: '/renor/plans',
});

const ALLOWANCE_ICONS = { credits: Gauge, projects: Boxes, jobs: Layers, models: Cpu } as const;

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
    <Button asChild variant={plan.highlight ? 'brand' : 'outline'} size="xl" className="w-full">
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
        'relative flex flex-col rounded-3xl border bg-card p-6 sm:p-7',
        plan.highlight
          ? 'border-brand-500/70 shadow-lg ring-1 ring-brand-500/25'
          : 'border-border shadow-xs',
      )}
    >
      {plan.highlight ? (
        <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-sm font-semibold tracking-[0.06em] text-white uppercase dark:bg-brand-400 dark:text-brand-900">
          Recommended
        </span>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h3 id={`plan-${plan.id}`} className="font-display text-2xl font-semibold tracking-tight">
          {plan.name}
        </h3>
        <span
          className={cn(
            'rounded-full border px-2.5 py-1 text-sm font-semibold tracking-[0.08em] uppercase',
            open
              ? 'border-emerald-600/35 bg-emerald-50 text-emerald-800 dark:border-emerald-400/35 dark:bg-emerald-400/10 dark:text-emerald-200'
              : 'border-border bg-muted text-muted-foreground',
          )}
        >
          {open ? 'Open now' : 'Not on sale'}
        </span>
      </div>
      <p className="mt-2 type-meta text-muted-foreground xl:min-h-[2.8125rem]">{plan.forWho}</p>

      <div className="mt-6">
        <p className="flex items-baseline gap-1.5">
          <span className="font-display text-[2.75rem] leading-none font-semibold tracking-tight">
            {plan.price.label}
          </span>
          <span className="type-meta text-muted-foreground">{plan.price.period}</span>
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-amber-600/30 bg-amber-50 px-2 py-0.5 text-sm font-semibold text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
          <Info aria-hidden="true" className="size-3.5" />
          {PROPOSED_LABEL}
          <span className="sr-only">: not approved yet</span>
        </p>
      </div>

      <div className="mt-6">
        <PlanButton plan={plan} />
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground xl:min-h-[4.0625rem]">
          {plan.action.note}
        </p>
      </div>

      <div className="mt-7 border-t border-border pt-6">
        <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Proposed allowances
        </p>
        <dl className="mt-4 grid gap-4">
          {allowanceLines(plan).map((line) => {
            const Icon = ALLOWANCE_ICONS[line.id as keyof typeof ALLOWANCE_ICONS];
            return (
              // dl > div > dt + dd only (valid definition list); the icon sits inside the dt.
              <div key={line.id} className="relative min-w-0 pl-[1.875rem]">
                <dt className="text-sm text-muted-foreground">
                  <Icon
                    aria-hidden="true"
                    className="absolute top-0.5 left-0 size-[1.125rem] shrink-0 text-link"
                  />
                  {line.label}
                </dt>
                <dd className="text-[0.9375rem] font-semibold leading-snug">{line.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
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
            Sign up for Free today and use Renor in your browser. Every plan runs on weekly AI
            credits with clear limits.{' '}
            <strong className="font-semibold text-foreground">
              Prices are proposed, not approved, and paid plans cannot be bought yet.
            </strong>
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
        className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-screen-xl">
          <h2 id="plans-title" className="sr-only">
            Plans
          </h2>
          <p className="flex max-w-3xl gap-3 rounded-2xl border border-border bg-band p-4 type-copy sm:p-5">
            <Info aria-hidden="true" className="mt-1 size-5 shrink-0 text-link" />
            <span>
              <span className="font-semibold">Paid plans are not on sale yet. </span>
              {PAID_PLANS_NOTICE} Prices are in pounds per month; credit, project and job numbers
              are proposed too.
            </span>
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="principles"
        className="border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-24"
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

      <section aria-labelledby="plan-faq" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 id="plan-faq" className="mt-4 font-display type-heading">
              Credits, limits and billing.
            </h2>
            <p className="mt-5 max-w-md type-copy text-muted-foreground">
              Something not covered here? Ask on the{' '}
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-4"
              >
                contact page
              </Link>
              . A person reads every message.
            </p>
          </div>
          <FaqList items={PLAN_FAQ} />
        </div>
      </section>
      <ExploreBand page="plans" />
    </main>
  );
}
