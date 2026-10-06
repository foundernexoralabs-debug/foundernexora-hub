// @polsia:user-owned — Renor Labs Store. Real products are listed as they exist in the founder's
// Plug&Pay shop; nothing can be bought until a product's checkout is live and verified.
import { ArrowRight, PackageOpen, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { ProductCard } from '@/components/custom/store';
import { Button } from '@/components/ui/button';
import { pageMetadata } from '@/lib/business/seo';
import { isPurchasable, PRODUCTS, productsIn, STORE_CATEGORIES } from '@/lib/business/store';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: 'Renor Labs Store — digital products from FounderLab',
  description:
    'Practical digital products from FounderLab, starting with TradeLaunch kits for electricians. Listed as coming soon: nothing can be bought yet.',
  path: '/store',
});

export default function StorePage() {
  const onSale = PRODUCTS.filter(isPurchasable).length;
  const stocked = STORE_CATEGORIES.filter((category) => productsIn(category.id).length > 0);
  const laterShelves = STORE_CATEGORIES.filter((category) => productsIn(category.id).length === 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow={onSale > 0 ? 'Renor Labs Store' : 'Renor Labs Store · Opening soon'}
        title="Practical digital products, made to be used."
        lede={
          onSale > 0
            ? 'Digital products from FounderLab, starting with TradeLaunch kits for electricians.'
            : 'The first products are here: two TradeLaunch kits for electricians. They are not on sale yet. Each one shows its price and a checkout only when it opens.'
        }
      >
        {stocked[0] ? (
          <Button
            asChild
            size="lg"
            className="min-h-12 rounded-full bg-brand-500 px-7 text-white hover:bg-brand-400"
          >
            <Link href={`#${stocked[0].id}`}>
              See the first products <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </Link>
          </Button>
        ) : null}
        <Button asChild size="lg" variant="outline" className="min-h-12 rounded-full px-7">
          <Link href="#policies">Store policies</Link>
        </Button>
      </PageHero>

      {stocked.map((category, index) => {
        const products = productsIn(category.id);
        return (
          <section
            key={category.id}
            id={category.id}
            aria-labelledby={`category-${category.id}`}
            className={cn(
              'scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24',
              index > 0 && 'border-t border-border/60',
            )}
          >
            <div className="mx-auto max-w-screen-xl">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading
                  id={`category-${category.id}`}
                  eyebrow={category.name}
                  title={category.headline}
                  lede={category.description}
                />
                <p className="text-sm text-muted-foreground">
                  {products.length} product{products.length === 1 ? '' : 's'} ·{' '}
                  {products.some(isPurchasable) ? 'on sale' : 'not on sale yet'}
                </p>
              </div>
              <div
                className={cn(
                  'mt-12 grid gap-5 md:grid-cols-2',
                  products.length > 2 && 'lg:grid-cols-3',
                )}
              >
                {products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {laterShelves.length > 0 ? (
        <section
          aria-labelledby="shelves"
          className="border-t border-border/60 px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-screen-xl">
            <SectionHeading
              id="shelves"
              eyebrow="Coming later"
              title="Shelves kept empty until something is ready."
              lede="We would rather show an empty shelf than a product that is not finished."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {laterShelves.map((category) => (
                <section
                  key={category.id}
                  id={category.id}
                  aria-labelledby={`category-${category.id}`}
                  className="flex scroll-mt-24 flex-col rounded-2xl border border-dashed border-border/80 p-6"
                >
                  <PackageOpen aria-hidden="true" className="size-5 text-muted-foreground" />
                  <h3 id={`category-${category.id}`} className="mt-5 text-lg font-semibold">
                    {category.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                  <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    No products yet
                  </p>
                </section>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="policies"
        aria-labelledby="policies-title"
        className="scroll-mt-24 border-t border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Before you buy</Eyebrow>
            <h2
              id="policies-title"
              className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-5xl"
            >
              Store policies.
            </h2>
          </div>
          <div className="grid gap-5 text-base leading-relaxed text-muted-foreground">
            <p className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-1 size-5 shrink-0 text-brand-500 dark:text-brand-400"
              />
              <span>
                Before the first product goes on sale, this section will set out exactly what you
                receive and how, the price including any tax, your cancellation and refund rights,
                and how to reach us about an order.
              </span>
            </p>
            <p>
              Payments will be handled by our checkout provider, Plug&amp;Pay. FounderLab will not
              see or store your card details. No checkout is active today, so nothing can be bought
              yet.
            </p>
            <p>
              Questions in the meantime?{' '}
              <Link
                href="/contact"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
      <ExploreBand page="store" />
    </main>
  );
}
