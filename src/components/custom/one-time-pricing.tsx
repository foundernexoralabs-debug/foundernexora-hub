// @polsia:user-owned — pricing when PRICING_MODEL is 'one-time': Free, Lifetime (£99 once) and
// one-time AI credit packs. Nothing is on sale: Lifetime's button joins an early list by email.
// Data: src/lib/business/pricing.ts.
import { ArrowRight, ArrowUpRight, Check, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { Eyebrow } from '@/components/custom/ecosystem';
import { FaqList } from '@/components/custom/faq-list';
import { Button } from '@/components/ui/button';
import { BILLING_PATH, BILLING_TITLE } from '@/lib/business/billing';
import {
  CREDIT_PACK_NOTE,
  CREDIT_PACKS,
  ONE_TIME_FAQ,
  ONE_TIME_NOTICE,
  ONE_TIME_OFFERS,
  type OneTimeOffer,
} from '@/lib/business/pricing';
import { cn } from '@/lib/utils';

const numberFormat = new Intl.NumberFormat('en-GB');

function OfferButton({ offer }: { offer: OneTimeOffer }) {
  if (offer.state === 'open') {
    return (
      <Button asChild variant="brand" size="xl" className="w-full">
        <a href={offer.action.href} target="_blank" rel="noopener noreferrer">
          {offer.action.label} <ArrowUpRight aria-hidden="true" className="size-4" />
          <span className="sr-only"> (opens Renor in a new tab)</span>
        </a>
      </Button>
    );
  }
  return (
    <Button asChild variant={offer.highlight ? 'brand' : 'outline'} size="xl" className="w-full">
      <a href={offer.action.href}>
        <Mail aria-hidden="true" className="size-4" /> {offer.action.label}
        <span className="sr-only"> for {offer.name}, by email</span>
      </a>
    </Button>
  );
}

function OfferCard({ offer }: { offer: OneTimeOffer }) {
  const open = offer.state === 'open';
  return (
    <article
      aria-labelledby={`offer-${offer.id}`}
      className={cn(
        'relative flex flex-col rounded-3xl border bg-card p-6 sm:p-8',
        offer.highlight
          ? 'border-brand-500/70 shadow-lg ring-1 ring-brand-500/25'
          : 'border-border shadow-xs',
      )}
    >
      {offer.highlight ? (
        <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-sm font-semibold tracking-[0.06em] text-white uppercase dark:bg-brand-400 dark:text-brand-900">
          Pay once
        </span>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        <h3 id={`offer-${offer.id}`} className="font-display text-2xl font-semibold tracking-tight">
          {offer.name}
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
      <p className="mt-2 type-meta text-muted-foreground">{offer.forWho}</p>
      <p className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-[3rem] leading-none font-semibold tracking-tight">
          {offer.price}
        </span>
        <span className="type-meta text-muted-foreground">{offer.period}</span>
      </p>
      <ul className="mt-6 grid gap-2.5">
        {offer.includes.map((line) => (
          <li key={line} className="flex gap-2.5 text-[0.9375rem]">
            <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-link" />
            {line}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <OfferButton offer={offer} />
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{offer.action.note}</p>
      </div>
    </article>
  );
}

export function OneTimePricing() {
  return (
    <>
      <section
        id="plans"
        aria-labelledby="plans-title"
        className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-screen-xl">
          <h2 id="plans-title" className="sr-only">
            Free and Lifetime
          </h2>
          <div className="flex max-w-3xl gap-3 rounded-2xl border border-border bg-band p-4 type-copy sm:p-5">
            <Info aria-hidden="true" className="mt-1 size-5 shrink-0 text-link" />
            <div>
              <p>
                <span className="font-semibold">Nothing is on sale yet. </span>
                {ONE_TIME_NOTICE} Prices are in pounds sterling.
              </p>
              <Link
                href={BILLING_PATH}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 font-semibold text-link underline-offset-4 hover:underline"
              >
                {BILLING_TITLE} <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-5xl">
            {ONE_TIME_OFFERS.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="packs"
        aria-labelledby="packs-title"
        className="border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <Eyebrow>AI credit packs</Eyebrow>
          <h2 id="packs-title" className="mt-4 max-w-3xl font-display type-heading text-balance">
            No computer or keys of your own? Buy hosted AI once.
          </h2>
          <p className="mt-5 max-w-2xl type-lead text-pretty text-muted-foreground">
            {CREDIT_PACK_NOTE} Not on sale yet.
          </p>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
              <li key={pack.id} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {pack.id}
                </p>
                <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
                  {pack.price}
                </p>
                <p className="mt-2 type-copy text-muted-foreground">
                  {numberFormat.format(pack.credits)} AI credits, one payment
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="plan-faq" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 id="plan-faq" className="mt-4 font-display type-heading">
              One payment, explained.
            </h2>
            <p className="mt-5 max-w-md type-copy text-muted-foreground">
              The full rules for paying and refunds are on{' '}
              <Link
                href={BILLING_PATH}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {BILLING_TITLE}
              </Link>
              . A person reads every message.
            </p>
          </div>
          <FaqList items={ONE_TIME_FAQ} />
        </div>
      </section>
    </>
  );
}
