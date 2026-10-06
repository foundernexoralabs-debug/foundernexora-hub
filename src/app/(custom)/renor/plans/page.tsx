// @polsia:user-owned — Renor's proposed plans. Not a price list: nothing here is on sale.
import { ArrowUpRight, CircleCheck, CircleDashed } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { Button } from '@/components/ui/button';
import { RENOR_APP_URL } from '@/lib/business/ecosystem';
import { PLAN_PRINCIPLES, PLANS } from '@/lib/business/plans';
import { pageMetadata } from '@/lib/business/seo';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: 'Renor plans — Free, Pro and Advanced (proposed)',
  description:
    'Renor’s proposed Free, Pro and Advanced plans. Nothing is on sale and no price is set; this page shows what each plan is designed to include.',
  path: '/renor/plans',
});

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Renor plans · Proposed"
        title="Free to start. Fair as you grow."
        lede={
          <>
            These plans are a proposal, published so you can see where Renor is going.{' '}
            <strong className="font-semibold text-foreground">
              Nothing is on sale, no price is set, and no payment is taken.
            </strong>{' '}
            Everyone using the preview today is on Free.
          </>
        }
      >
        <Button
          asChild
          size="lg"
          className="min-h-12 rounded-full bg-brand-500 px-7 text-white hover:bg-brand-400"
        >
          <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
            Start free <ArrowUpRight aria-hidden="true" className="ml-2 size-4" />
          </a>
        </Button>
      </PageHero>

      <section aria-labelledby="plans" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <h2 id="plans" className="sr-only">
            Plans
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CircleCheck aria-hidden="true" className="size-4 text-emerald-500" /> Works in the
              preview today
            </span>
            <span className="inline-flex items-center gap-2">
              <CircleDashed aria-hidden="true" className="size-4" /> Planned, not available yet
            </span>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                aria-labelledby={`plan-${plan.id}`}
                className={cn(
                  'flex flex-col rounded-3xl border bg-card/60 p-7 sm:p-8',
                  plan.id === 'free'
                    ? 'border-brand-500/45 shadow-xl shadow-brand-900/10'
                    : 'border-border/70',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 id={`plan-${plan.id}`} className="font-display text-2xl font-semibold">
                    {plan.name}
                  </h3>
                  <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {plan.id === 'free' ? 'Available' : 'Proposed'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.forWho}</p>
                <p className="mt-6 font-display text-3xl font-semibold tracking-tight">
                  {plan.price}
                </p>
                <ul className="mt-6 grid gap-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex gap-3 text-sm leading-relaxed">
                      {feature.availability === 'today' ? (
                        <CircleCheck
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-emerald-500"
                        />
                      ) : (
                        <CircleDashed
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />
                      )}
                      <span
                        className={
                          feature.availability === 'today' ? undefined : 'text-muted-foreground'
                        }
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
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="principles"
        className="border-y border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
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
                className="rounded-2xl border border-border/70 bg-background/70 p-7"
              >
                <h3 className="text-lg font-semibold">{principle.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {principle.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-screen-xl text-sm leading-relaxed text-muted-foreground">
          <p className="max-w-3xl">
            Prices will be set from measured running costs and announced here before anything can be
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
