// @polsia:user-owned — billing, cancellation and refunds for Renor's paid plans, in plain English.
// Written from the founder's billing policy of 31 October 2026 (rules 1–12 and the seller line).
// Paid plans are not on sale yet, and the page says so before any rule. It makes no VAT or tax
// claim, names no card statement descriptor and carries no personal details: those stay out until
// confirmed (tests/unit/billing-page.test.ts). Uses the same LegalDocument layout as Privacy and Terms.
import {
  BellRing,
  CalendarClock,
  CircleSlash,
  type LucideIcon,
  PoundSterling,
  Undo2,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { LegalDocument, type LegalSection } from '@/components/custom/legal-document';
import { BILLING_PATH, BILLING_TITLE, SELLER_IDENTITY } from '@/lib/business/billing';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { PAID_PLANS_NOTICE, PLANS, priceList } from '@/lib/business/plans';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: BILLING_TITLE,
  description:
    'How paying for Renor Pro, Plus and Max works: billed monthly in advance, cancel any time, a 14-day refund on your first subscription, no overage charges and 30 days’ notice of any price change.',
  path: BILLING_PATH,
});

const UPDATED = '31 October 2026';

const SECTIONS: readonly LegalSection[] = [
  { id: 'prices', title: 'Prices' },
  { id: 'how-billing-works', title: 'How billing works' },
  { id: 'cancel-any-time', title: 'Cancel any time' },
  { id: 'refunds', title: 'Refunds' },
  { id: 'upgrades-and-downgrades', title: 'Upgrades and downgrades' },
  { id: 'no-surprise-charges', title: 'No surprise charges' },
  { id: 'price-changes', title: 'Price changes' },
  { id: 'failed-payments', title: 'Failed payments' },
  { id: 'your-statutory-rights', title: 'Your statutory rights' },
  { id: 'who-you-are-buying-from', title: 'Who you are buying from' },
];

const LINK = 'text-foreground underline underline-offset-4';

/** "£0, £12, £29 or £79", read from the plans so the two pages can never disagree. */
const PRICE_RANGE = (() => {
  const labels = PLANS.map((plan) => plan.price.label);
  return `${labels.slice(0, -1).join(', ')} or ${labels.at(-1)}`;
})();

/** The six answers people look for first. Each one is stated in full in its section below. */
const AT_A_GLANCE: readonly { icon: LucideIcon; term: string; detail: string; href: string }[] = [
  {
    icon: PoundSterling,
    term: 'Prices',
    detail: `${PRICE_RANGE} a month`,
    href: '#prices',
  },
  {
    icon: CalendarClock,
    term: 'Billing',
    detail: 'Monthly, in advance',
    href: '#how-billing-works',
  },
  {
    icon: XCircle,
    term: 'Cancelling',
    detail: 'Any time; paid features run to the month’s end',
    href: '#cancel-any-time',
  },
  {
    icon: Undo2,
    term: 'Refunds',
    detail: 'Unused days refunded in your first 14 days',
    href: '#refunds',
  },
  {
    icon: CircleSlash,
    term: 'Extra charges',
    detail: 'None: no overage charges',
    href: '#no-surprise-charges',
  },
  {
    icon: BellRing,
    term: 'Price changes',
    detail: 'At least 30 days’ notice by email',
    href: '#price-changes',
  },
];

function AtAGlance() {
  return (
    <section
      aria-labelledby="at-a-glance"
      className="rounded-tile border border-border bg-card p-5 sm:p-6"
    >
      {/* A div, not a <p>: the reading column spaces every paragraph, and this label sits tight. */}
      <div
        id="at-a-glance"
        className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase"
      >
        At a glance
      </div>
      <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
        {AT_A_GLANCE.map((item) => (
          <div
            key={item.term}
            className="relative border-t border-border py-3.5 pl-9 first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
          >
            <dt className="text-sm leading-snug text-muted-foreground">
              <item.icon
                aria-hidden="true"
                className="absolute top-[1.0625rem] left-0 size-5 text-link"
                strokeWidth={1.75}
              />
              {item.term}
            </dt>
            <dd className="mt-0.5 text-[0.9375rem] leading-snug font-semibold text-pretty text-foreground">
              <a href={item.href} className="underline-offset-4 hover:underline">
                {item.detail}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function BillingPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow={BILLING_TITLE}
        title="Pay monthly. Cancel any time."
        lede={
          <>
            How paying for Pro, Plus and Max works, how to cancel, and when you get money back. Last
            updated {UPDATED}.
          </>
        }
      />
      <LegalDocument sections={SECTIONS} dateLabel="Last updated" date={UPDATED}>
        <div className="grid gap-5">
          <div
            role="note"
            className="rounded-tile border border-amber-600/30 bg-amber-50 p-4 text-[0.9375rem] leading-relaxed text-amber-950 sm:p-5 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100"
          >
            <strong className="font-semibold">Paid plans are not on sale yet.</strong>{' '}
            {PAID_PLANS_NOTICE} These rules apply from the day checkout goes live. To hear when it
            does, join the early list on the{' '}
            <Link href="/renor/plans" className="font-semibold underline underline-offset-4">
              Plans page
            </Link>
            .
          </div>
          <AtAGlance />
        </div>

        <h2 id="prices">Prices</h2>
        <p>
          Renor has four plans, priced per month in pounds sterling: {priceList()}. Free costs
          nothing.
        </p>
        <p>
          Each plan’s weekly AI credits, projects and agent jobs are planned allowances: the credit
          rates behind them are published before billing opens. Compare them on the{' '}
          <Link href="/renor/plans" className={LINK}>
            Plans page
          </Link>
          .
        </p>

        <h2 id="how-billing-works">How billing works</h2>
        <p>
          Paid plans are billed monthly, in advance. Your plan renews automatically on the same date
          each month until you cancel.
        </p>
        <p>
          Payments are handled by Stripe, our payment provider. Renor never sees or stores your card
          number.
        </p>

        <h2 id="cancel-any-time">Cancel any time</h2>
        <p>
          You can cancel whenever you like: in Renor, go to Settings → Plan → Manage billing, or
          email{' '}
          <a href={CONTACT_MAILTO} className={LINK}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>
          Cancelling stops your next renewal. Your paid features stay until the end of the month you
          have already paid for, then your account moves to Free. Your projects and work are kept.
        </p>

        <h2 id="refunds">Refunds</h2>
        <ul>
          <li>
            <strong className="text-foreground">In your first 14 days.</strong> Cancel within 14
            days of first paying for a paid plan and you get a refund. Your plan starts straight
            away because you ask it to, so the refund is for the unused days of that month: we keep
            a proportional amount for the days you have already had. This applies to everyone,
            whether you buy as a consumer or for a business.
          </li>
          <li>
            <strong className="text-foreground">After 14 days.</strong> We do not refund
            part-months, except where the law requires a refund. If Renor fails to provide the
            service, we fix it or refund you.
          </li>
          <li>
            <strong className="text-foreground">If we end your plan.</strong> If Renor ends your
            paid plan or stops the service, we refund the unused part of the month.
          </li>
          <li>
            <strong className="text-foreground">How you are paid back.</strong> Refunds go back to
            the payment method you paid with. Banks usually show them within 5 to 10 working days.
          </li>
        </ul>

        <h2 id="upgrades-and-downgrades">Upgrades and downgrades</h2>
        <p>
          Upgrades take effect at once. For the rest of that month, you are charged the difference
          in price, pro rata.
        </p>
        <p>
          Downgrades take effect at your next renewal, so you keep your current plan until then.
        </p>

        <h2 id="no-surprise-charges">No surprise charges</h2>
        <p>
          Every plan comes with weekly AI credits. When they run out, AI work pauses until your
          weekly reset or until you upgrade. There are no overage charges: you are never billed for
          using more than your plan includes. Your projects stay open while AI work waits.
        </p>

        <h2 id="price-changes">Price changes</h2>
        <p>
          If we change a price, we email you at least 30 days before the new price applies. If you
          do not want to pay it, cancel before then and you will not be charged the new price.
        </p>

        <h2 id="failed-payments">Failed payments</h2>
        <p>
          If a payment fails, Stripe tries it again and emails you a reminder. If it still fails,
          your plan returns to Free. Your work is kept.
        </p>

        <h2 id="your-statutory-rights">Your statutory rights</h2>
        <p>Nothing on this page affects your statutory rights.</p>

        <h2 id="who-you-are-buying-from">Who you are buying from</h2>
        <p>{SELLER_IDENTITY}</p>
        <p>
          Questions about billing or a refund? Email{' '}
          <a href={CONTACT_MAILTO} className={LINK}>
            {CONTACT_EMAIL}
          </a>{' '}
          or see{' '}
          <Link href="/contact" className={LINK}>
            Contact
          </Link>
          . A person reads every message. For how we handle your data, see{' '}
          <Link href="/privacy" className={LINK}>
            Privacy
          </Link>
          ; for using this website, see{' '}
          <Link href="/terms" className={LINK}>
            Terms
          </Link>
          .
        </p>
      </LegalDocument>
      <ExploreBand page="billing" />
    </main>
  );
}
