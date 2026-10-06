// @polsia:user-owned — Renor Labs Store product detail. Only real, catalogued products have a page.
import { Check, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow } from '@/components/custom/ecosystem';
import { categoryName, ProductCard, ProductEmblem, PurchasePanel } from '@/components/custom/store';
import { findProduct, isPurchasable, PRODUCTS, relatedProducts } from '@/lib/business/store';

// Every product page is generated from the catalogue; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const product = findProduct((await params).slug);
  if (!product) return {};
  const title = `${product.name} — Renor Labs Store`;
  const description = isPurchasable(product)
    ? product.summary
    : `${product.summary} Coming soon: not available to buy yet.`;
  return {
    title,
    description,
    alternates: { canonical: `/store/${product.slug}` },
    openGraph: { title, description, url: `/store/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = findProduct((await params).slug);
  if (!product) notFound();
  const related = relatedProducts(product);
  const facts = [
    { term: 'Made for', value: product.audience },
    { term: 'Format', value: product.format },
    {
      term: 'Price',
      value: isPurchasable(product) ? product.priceLabel : 'Shown when it goes on sale',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border/60 px-5 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_85%_0%,rgba(99,102,241,0.18),transparent_65%)]"
        />
        <div className="mx-auto max-w-screen-xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/store"
                  className="inline-flex min-h-11 items-center rounded-md underline-offset-4 hover:text-foreground hover:underline"
                >
                  Renor Labs Store
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href={`/store#${product.category}`}
                  className="inline-flex min-h-11 items-center rounded-md underline-offset-4 hover:text-foreground hover:underline"
                >
                  {categoryName(product.category)}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
            <div>
              <Eyebrow>{product.line ?? categoryName(product.category)}</Eyebrow>
              <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-6xl">
                {product.name}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
                {product.summary}
              </p>
              <dl className="mt-10 grid max-w-2xl gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.term} className="bg-background p-5">
                    <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      {fact.term}
                    </dt>
                    <dd className="mt-2 text-sm font-medium leading-snug">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside
              aria-label="Availability"
              className="h-fit rounded-3xl border border-border/70 bg-card/70 p-6 shadow-2xl shadow-brand-900/10 backdrop-blur sm:p-7 lg:sticky lg:top-24"
            >
              <ProductEmblem product={product} className="mb-6 aspect-[16/9] w-full" />
              <PurchasePanel product={product} />
              <p className="mt-5 border-t border-border/60 pt-4 text-xs leading-relaxed text-muted-foreground">
                Read the{' '}
                <Link
                  href="/store#policies"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  store policies
                </Link>{' '}
                before you buy.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section aria-labelledby="inside" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>What is inside</Eyebrow>
            <h2
              id="inside"
              className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              What you get.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {product.details.map((detail) => (
              <li
                key={detail}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/50 p-5 text-sm leading-relaxed font-medium"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-500 dark:text-brand-300">
                  <Check aria-hidden="true" className="size-3.5" />
                </span>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {related.length > 0 ? (
        <section
          aria-labelledby="related"
          className="border-t border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-screen-xl">
            <Eyebrow>Same range</Eyebrow>
            <h2
              id="related"
              className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              More from {product.line}
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {related.map((other) => (
                <ProductCard key={other.slug} product={other} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
