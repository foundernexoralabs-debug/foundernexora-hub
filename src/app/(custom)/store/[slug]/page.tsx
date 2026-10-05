// @polsia:user-owned — Renor Labs Store product detail. Only real, catalogued products have a page.
import { ArrowLeft, Check } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow } from '@/components/custom/ecosystem';
import { CheckoutButton, categoryName } from '@/components/custom/store';
import { findProduct, PRODUCTS } from '@/lib/business/store';

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
  return {
    title: `${product.name} — Renor Labs Store`,
    description: product.summary,
    alternates: { canonical: `/store/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = findProduct((await params).slug);
  if (!product) notFound();
  return (
    <main className="min-h-screen bg-background px-5 py-16 text-foreground sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/store"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" /> Renor Labs Store
        </Link>
        <div className="mt-8">
          <Eyebrow>{categoryName(product.category)}</Eyebrow>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{product.summary}</p>
        </div>
        <dl className="mt-10 grid gap-6 rounded-2xl border border-border/70 bg-card/60 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              You receive
            </dt>
            <dd className="mt-2 text-sm leading-relaxed">{product.deliverable}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Price
            </dt>
            <dd className="mt-2 text-sm">
              {product.status === 'available' ? product.priceLabel : 'Not on sale yet'}
            </dd>
          </div>
        </dl>
        {product.details.length > 0 ? (
          <ul className="mt-8 grid gap-3">
            {product.details.map((detail) => (
              <li key={detail} className="flex gap-3 text-sm leading-relaxed">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-brand-500 dark:text-brand-400"
                />
                {detail}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-10">
          <CheckoutButton product={product} />
          <p className="mt-4 text-xs text-muted-foreground">
            Read the{' '}
            <Link href="/store#policies" className="underline underline-offset-4">
              store policies
            </Link>{' '}
            before you buy.
          </p>
        </div>
      </div>
    </main>
  );
}
