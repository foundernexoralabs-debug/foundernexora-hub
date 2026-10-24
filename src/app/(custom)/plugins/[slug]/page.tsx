// @polsia:user-owned — Renor Plugin Store product page. Only approved, catalogued products have a page;
// every word about the product comes from its catalogue entry in src/lib/business/plugins.ts.
import { ArrowRight, Check, ChevronRight, Download, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Eyebrow, HeroGrid } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { type FaqItem, FaqList } from '@/components/custom/faq-list';
import {
  displayName,
  PluginCover,
  PluginRow,
  PurchasePanel,
} from '@/components/custom/plugin-store';
import { PluginJsonLd } from '@/components/custom/structured-data';
import {
  categoryOf,
  findPlugin,
  isPurchasable,
  listedPlugins,
  type Plugin,
  PURCHASE_NOTE,
  REFUND_NOTE,
  relatedPlugins,
  SEPARATE_FROM_PLANS,
} from '@/lib/business/plugins';
import { pageMetadata } from '@/lib/business/seo';

// Every product page is generated from the catalogue; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return listedPlugins().map((plugin) => ({ slug: plugin.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const plugin = findPlugin((await params).slug);
  if (!plugin) return {};
  return pageMetadata({
    title: `${plugin.title} — Renor Plugin Store`,
    description: isPurchasable(plugin) ? plugin.summary : `${plugin.summary} Opening soon.`,
    path: `/plugins/${plugin.slug}`,
    ownImage: true,
  });
}

const LINK = 'font-medium text-foreground underline underline-offset-4';

function faqFor(plugin: Plugin): FaqItem[] {
  const open = isPurchasable(plugin);
  return [
    {
      q: 'When can I buy it?',
      a: open
        ? 'It is on sale now. Use the Buy now button to go to the checkout.'
        : 'Sales have not opened yet, so there is no checkout and nothing can be paid today. Use Notify me and we email you once when it opens.',
    },
    {
      q: 'How do I receive it?',
      a: `It is a digital download. ${PURCHASE_NOTE}`,
    },
    {
      q: 'Can I get a refund?',
      a: (
        <>
          {REFUND_NOTE} Until then, the{' '}
          <Link href="/terms#product-terms" className={LINK}>
            site terms
          </Link>{' '}
          explain where product terms will live.
        </>
      ),
    },
    {
      q: 'Is it part of a Renor plan?',
      a: (
        <>
          No. {SEPARATE_FROM_PLANS} See{' '}
          <Link href="/renor/plans" className={LINK}>
            Renor plans
          </Link>{' '}
          for the workspace itself.
        </>
      ),
    },
    {
      q: 'I have a question before I buy.',
      a: (
        <>
          Ask us on the{' '}
          <Link href="/contact" className={LINK}>
            contact page
          </Link>
          . A person reads every message.
        </>
      ),
    },
  ];
}

export default async function PluginPage({ params }: { params: Promise<{ slug: string }> }) {
  const plugin = findPlugin((await params).slug);
  if (!plugin) notFound();
  const category = categoryOf(plugin.category);
  const related = relatedPlugins(plugin);
  const faq = faqFor(plugin);
  const facts = [
    { term: 'Made for', value: plugin.audience },
    { term: 'Format', value: plugin.format },
    { term: 'Price', value: `${plugin.price.label} one-off` },
    { term: 'Made by', value: plugin.publisher.name },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PluginJsonLd plugin={plugin} />
      <section className="relative isolate overflow-hidden border-b border-border px-5 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-20">
        <HeroGrid />
        <div className="mx-auto max-w-screen-xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 type-meta text-muted-foreground">
              <li>
                <Link
                  href="/plugins"
                  className="inline-flex min-h-11 items-center rounded-md underline-offset-4 hover:text-foreground hover:underline"
                >
                  Plugin Store
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href={`/plugins?category=${category.id}`}
                  className="inline-flex min-h-11 items-center rounded-md underline-offset-4 hover:text-foreground hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
            <div className="min-w-0">
              <Eyebrow>{plugin.line ?? category.name}</Eyebrow>
              <h1 className="mt-4 max-w-3xl font-display type-title text-balance">
                {displayName(plugin.title)}
              </h1>
              <p className="mt-6 max-w-2xl type-lead text-pretty text-muted-foreground">
                {plugin.summary}
              </p>
              <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
                {facts.map((fact) => (
                  <div key={fact.term} className="bg-card p-4 sm:p-5">
                    <dt className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                      {fact.term}
                    </dt>
                    <dd className="mt-1.5 text-[0.9375rem] font-semibold leading-snug">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside
              aria-label="Price and availability"
              className="h-fit rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-7 lg:sticky lg:top-24"
            >
              <PluginCover plugin={plugin} className="mb-6 hidden sm:flex" />
              <PurchasePanel plugin={plugin} />
            </aside>
          </div>
        </div>
      </section>

      <section aria-labelledby="inside" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>What is inside</Eyebrow>
            <h2 id="inside" className="mt-4 font-display type-heading text-balance">
              The {plugin.inside.length} parts inside.
            </h2>
            <figure className="mt-8 border-l-2 border-brand-500/50 pl-5">
              <blockquote className="type-copy text-muted-foreground">
                {plugin.description}
              </blockquote>
              <figcaption className="mt-3 type-meta text-muted-foreground">
                The product description, as published in our shop.
              </figcaption>
            </figure>
          </div>
          <ol className="grid content-start gap-3 sm:grid-cols-2">
            {plugin.inside.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 type-copy font-medium"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 font-display text-sm font-semibold text-link tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="fit"
        className="border-t border-border bg-band px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <h2 id="fit" className="sr-only">
            Who it is for and how it is delivered
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-7">
              <UserRound aria-hidden="true" className="size-5 text-link" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Who it is for</h3>
              <p className="mt-3 type-copy text-muted-foreground">{plugin.forWho}</p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-7">
              <Download aria-hidden="true" className="size-5 text-link" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">Format</h3>
              <p className="mt-3 type-copy text-muted-foreground">
                A digital download. {PURCHASE_NOTE}
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-card p-7">
              <Check aria-hidden="true" className="size-5 text-link" />
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                Separate from Renor plans
              </h3>
              <p className="mt-3 type-copy text-muted-foreground">{SEPARATE_FROM_PLANS}</p>
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 id="faq" className="mt-4 font-display type-heading">
              Before you buy.
            </h2>
          </div>
          <FaqList items={faq} />
        </div>
      </section>

      {related.length > 0 ? (
        <section
          aria-labelledby="related"
          className="border-t border-border px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-screen-xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Related</Eyebrow>
                <h2 id="related" className="mt-4 font-display type-heading">
                  {plugin.line
                    ? `More from ${plugin.line}.`
                    : `More ${category.name.toLowerCase()}.`}
                </h2>
              </div>
              <Link
                href="/plugins"
                className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
              >
                All plugins <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-4">
              {related.map((other) => (
                <PluginRow key={other.slug} plugin={other} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <ExploreBand page="product" />
    </main>
  );
}
