// @polsia:user-owned — Renor Labs Store product card, availability badge and purchase panel.
// A buy button renders only for a purchasable product (available + verified checkout);
// everything else says plainly that it cannot be bought yet.
import { ArrowRight, ArrowUpRight, CalendarDays, Mail, Package, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL } from '@/lib/business/ecosystem';
import { isPurchasable, STORE_CATEGORIES, type StoreProduct } from '@/lib/business/store';
import { cn } from '@/lib/utils';

/** Keeps names like "90-Day" together: a non-breaking hyphen between digits and words. */
export function displayName(name: string): string {
  return name.replace(/(\d)-(\w)/g, '$1\u2011$2');
}

export function categoryName(id: StoreProduct['category']): string {
  return STORE_CATEGORIES.find((category) => category.id === id)?.name ?? id;
}

const PRODUCT_ICONS: Record<string, typeof Package> = {
  'tradelaunch-electrician-business-kit': Zap,
  'tradelaunch-90-day-local-growth-pack': CalendarDays,
};

/** A decorative tile that gives each product a recognisable face without inventing a product shot. */
export function ProductEmblem({
  product,
  className,
}: {
  product: StoreProduct;
  className?: string;
}) {
  const Icon = PRODUCT_ICONS[product.slug] ?? Package;
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-xl border border-brand-500/25 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200',
        className,
      )}
    >
      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px]" />
      <Icon className="relative size-1/3" strokeWidth={1.5} />
    </div>
  );
}

export function AvailabilityBadge({
  product,
  className,
}: {
  product: StoreProduct;
  className?: string;
}) {
  const buyable = isPurchasable(product);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
        buyable
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {buyable ? 'On sale' : 'Coming soon'}
    </span>
  );
}

/** Whole-card link: the title's link stretches over the card, so the card is one large target. */
export function ProductCard({
  product,
  headingLevel = 'h3',
}: {
  product: StoreProduct;
  headingLevel?: 'h3' | 'h4';
}) {
  const Heading = headingLevel;
  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-300 focus-within:ring-2 focus-within:ring-ring hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-md sm:p-6">
      <ProductEmblem product={product} className="aspect-[16/7] w-full" />
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {product.line ? (
          <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {product.line}
          </span>
        ) : null}
        <AvailabilityBadge product={product} className="ml-auto" />
      </div>
      <Heading className="mt-3 font-display text-xl leading-snug font-semibold tracking-tight text-balance">
        <Link
          href={`/store/${product.slug}`}
          className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        >
          {displayName(product.name)}
        </Link>
      </Heading>
      <p className="mt-1 type-meta text-muted-foreground">For {product.audience.toLowerCase()}</p>
      <p className="mt-4 flex-1 type-copy text-muted-foreground">{product.summary}</p>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">
          {isPurchasable(product) ? product.priceLabel : 'Not on sale yet'}
        </span>
        <span className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-link">
          View details
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </article>
  );
}

/** The purchase panel: a verified checkout link, or an honest "not yet" with a way to hear when. */
export function PurchasePanel({ product }: { product: StoreProduct }) {
  if (isPurchasable(product) && product.checkoutUrl) {
    return (
      <div className="grid gap-4">
        <p className="font-display text-3xl font-semibold tracking-tight">{product.priceLabel}</p>
        <Button asChild variant="brand" size="xl" className="w-full">
          <a href={product.checkoutUrl} rel="noopener noreferrer">
            Buy now <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </Button>
      </div>
    );
  }
  const subject = encodeURIComponent(`Tell me when ${product.name} goes on sale`);
  return (
    <div className="grid gap-4">
      <div>
        <AvailabilityBadge product={product} />
        <p className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Not available to buy yet
        </p>
        <p className="mt-2 type-copy text-muted-foreground">
          The price will be shown here when it goes on sale. Until then there is no checkout and
          nothing to pay.
        </p>
      </div>
      <Button asChild variant="outline" size="xl" className="w-full">
        <a href={`mailto:${CONTACT_EMAIL}?subject=${subject}`}>
          <Mail aria-hidden="true" className="size-4" /> Ask to hear when it launches
        </a>
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Opens your email app with a short note to {CONTACT_EMAIL}. A person reads every message.
      </p>
    </div>
  );
}

/** A wide, one-line product row for "more from this range": emblem, name, summary, link. */
export function ProductRow({ product }: { product: StoreProduct }) {
  return (
    <article className="group relative grid items-center gap-5 rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow] duration-300 focus-within:ring-2 focus-within:ring-ring hover:border-brand-500/50 hover:shadow-md sm:grid-cols-[9rem_1fr_auto] sm:p-6">
      <ProductEmblem product={product} className="aspect-[16/9] w-full sm:aspect-square" />
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {product.line ? (
            <span className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {product.line}
            </span>
          ) : null}
          <AvailabilityBadge product={product} />
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">
          <Link
            href={`/store/${product.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
          >
            {displayName(product.name)}
          </Link>
        </h3>
        <p className="mt-2 max-w-2xl type-copy text-muted-foreground">{product.summary}</p>
      </div>
      <span className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-link">
        View details
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </span>
    </article>
  );
}
