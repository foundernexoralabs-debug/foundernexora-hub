// @polsia:user-owned — Renor Labs Store product card and checkout button.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { isVerifiedCheckout, STORE_CATEGORIES, type StoreProduct } from '@/lib/business/store';

export function categoryName(id: StoreProduct['category']): string {
  return STORE_CATEGORIES.find((category) => category.id === id)?.name ?? id;
}

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-6 transition-colors hover:border-brand-500/50">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {categoryName(product.category)}
      </p>
      <h4 className="mt-3 font-display text-xl font-semibold">{product.name}</h4>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{product.summary}</p>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="font-semibold">
          {product.status === 'available' ? product.priceLabel : 'Coming soon'}
        </span>
        <Link
          href={`/store/${product.slug}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
        >
          Details <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}

/** Renders a checkout link only for an available product with a verified checkout URL. */
export function CheckoutButton({ product }: { product: StoreProduct }) {
  if (product.status !== 'available' || !isVerifiedCheckout(product.checkoutUrl)) {
    return (
      <p className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Not available to buy yet.
      </p>
    );
  }
  return (
    <Button
      asChild
      size="lg"
      className="min-h-12 rounded-full bg-brand-500 px-7 text-white hover:bg-brand-400"
    >
      <a href={product.checkoutUrl} rel="noopener noreferrer">
        Buy for {product.priceLabel} <ArrowUpRight aria-hidden="true" className="ml-2 size-4" />
      </a>
    </Button>
  );
}
