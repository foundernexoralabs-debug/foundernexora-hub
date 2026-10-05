// @polsia:user-owned — Renor Labs Store. Prepared, not open: no product is listed until it is real.
import { ArrowRight, PackageOpen, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ProductCard } from '@/components/custom/store';
import { PRODUCTS, productsIn, STORE_CATEGORIES } from '@/lib/business/store';

export const metadata: Metadata = {
  title: 'Renor Labs Store — digital tools from FounderNexora',
  description:
    'Renor Labs Store will offer digital AI tools, developer resources and creator products. The store is being prepared; nothing is on sale yet.',
  alternates: { canonical: '/store' },
};

export default function StorePage() {
  const open = PRODUCTS.some((product) => product.status === 'available');
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow={open ? 'Renor Labs Store' : 'Renor Labs Store · Opening later'}
        title="Digital tools, built and tested with Renor."
        lede={
          open
            ? 'Digital AI tools, developer resources and creator products from the FounderNexora team.'
            : 'The store is being prepared. Products will appear here once they are finished, priced and ready to deliver. Nothing is on sale yet.'
        }
      />

      <section aria-labelledby="categories" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="categories"
            eyebrow="What the store will carry"
            title="Three shelves, kept deliberately small."
          />
          <div className="mt-12 grid gap-14">
            {STORE_CATEGORIES.map((category) => {
              const products = productsIn(category.id);
              return (
                <section
                  key={category.id}
                  id={category.id}
                  aria-labelledby={`category-${category.id}`}
                  className="scroll-mt-24"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
                    <div>
                      <h3
                        id={`category-${category.id}`}
                        className="font-display text-2xl font-semibold"
                      >
                        {category.name}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {products.length === 0
                        ? 'No products yet'
                        : `${products.length} product${products.length === 1 ? '' : 's'}`}
                    </span>
                  </div>
                  {products.length === 0 ? (
                    <div className="mt-6 flex items-start gap-4 rounded-2xl border border-dashed border-border/80 p-6 text-sm leading-relaxed text-muted-foreground">
                      <PackageOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                      <p>
                        Nothing here yet. We would rather show an empty shelf than a product that is
                        not ready. Follow{' '}
                        <Link
                          href="/zero-to-prove"
                          className="font-medium text-foreground underline underline-offset-4"
                        >
                          Zero to Prove
                        </Link>{' '}
                        to see what is being made.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => (
                        <ProductCard key={product.slug} product={product} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="policies"
        aria-labelledby="policies-title"
        className="scroll-mt-24 border-t border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading id="policies-title" eyebrow="Before you buy" title="Store policies." />
          <div className="grid gap-5 text-sm leading-relaxed text-muted-foreground">
            <p className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-brand-500 dark:text-brand-400"
              />
              <span>
                Before the first product goes on sale, this section will set out exactly what you
                receive and how, the price including any tax, your cancellation and refund rights,
                and how to reach us about an order.
              </span>
            </p>
            <p>
              Payments will be handled by our checkout provider; FounderNexora will not see or store
              your card details. No checkout is active today.
            </p>
            <p>
              Questions in the meantime?{' '}
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
              >
                Contact us <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
