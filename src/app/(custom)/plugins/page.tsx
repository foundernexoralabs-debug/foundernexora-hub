// @polsia:user-owned — the Renor Plugin Store catalogue. Products come from src/lib/business/plugins.ts
// and are listed exactly as they exist in the founder's Plug&Pay shop. Nothing can be bought until a
// product is 'on-sale' with an active, verified checkout; until then cards offer details and Notify me.
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  Layers3,
  Mail,
  PackageOpen,
  ReceiptText,
  ShoppingBag,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { type CatalogueTab, PluginCatalogue } from '@/components/custom/plugin-catalogue';
import { PluginCard, PluginCover } from '@/components/custom/plugin-store';
import { PluginStoreJsonLd } from '@/components/custom/structured-data';
import { Button } from '@/components/ui/button';
import { CONTACT_MAILTO, RENOR_LABS_STORE_URL } from '@/lib/business/ecosystem';
import {
  isPurchasable,
  listedPlugins,
  PLUGIN_CATEGORIES,
  type Plugin,
  type PluginCategory,
  PURCHASE_NOTE,
  pluginsIn,
  REFUND_NOTE,
  SEPARATE_FROM_PLANS,
} from '@/lib/business/plugins';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Renor Plugin Store — digital kits from FounderLab',
  description:
    'Ready-to-use digital kits from FounderLab, the team behind Renor. The first two, TradeLaunch kits for electricians, are opening soon.',
  path: '/plugins',
});

function Grid({ plugins }: { plugins: readonly Plugin[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:gap-6">
      {plugins.map((plugin) => (
        <PluginCard key={plugin.slug} plugin={plugin} />
      ))}
    </div>
  );
}

/** An honest empty shelf: what will live here, and a way to say what you would want. */
function EmptyShelf({ category }: { category: PluginCategory }) {
  const subject = encodeURIComponent(`Plugin Store idea: ${category.name}`);
  return (
    <div className="flex flex-col items-start gap-6 rounded-2xl border border-dashed border-border bg-card/60 p-7 sm:flex-row sm:items-center sm:p-10">
      <span
        aria-hidden="true"
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground"
      >
        <PackageOpen className="size-6" strokeWidth={1.6} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
          Coming next
        </p>
        <h3 className="mt-2 font-display type-subheading">{category.emptyTitle}</h3>
        <p className="mt-2 max-w-2xl type-copy text-muted-foreground">
          {category.description} {category.emptyText}
        </p>
      </div>
      <Button asChild variant="outline" size="xl">
        <a href={`${CONTACT_MAILTO}?subject=${subject}`}>
          <Mail aria-hidden="true" className="size-4" /> Suggest one
          <span className="sr-only"> for {category.name}, by email</span>
        </a>
      </Button>
    </div>
  );
}

/** The lead product beside the hero: what it is, its price and one way in. */
function FeaturedPlugin({ plugin }: { plugin: Plugin }) {
  return (
    <aside
      aria-label="Featured product"
      className="relative hidden rounded-3xl border border-border bg-card p-4 shadow-xl sm:p-5 lg:block"
    >
      <PluginCover plugin={plugin} size="hero" />
      <div className="flex flex-wrap items-end justify-between gap-4 px-1 pt-5 pb-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Featured · {plugin.audience}
          </p>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold tracking-tight">
              {plugin.price.label}
            </span>
            <span className="type-meta text-muted-foreground">one-off</span>
          </p>
        </div>
        <Button asChild variant="outline" size="xl">
          <Link href={`/plugins/${plugin.slug}`}>
            View the kit <ArrowRight aria-hidden="true" className="size-4" />
            <span className="sr-only">: {plugin.title}</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}

const BUYING_STEPS = [
  {
    icon: CalendarClock,
    title: 'Prices first, sales later',
    text: 'Every product shows its price now. Sales open product by product; until one opens there is no checkout and nothing to pay.',
  },
  {
    icon: CreditCard,
    title: 'Checkout through Plug&Pay',
    text: PURCHASE_NOTE,
  },
  {
    icon: ReceiptText,
    title: 'Refunds, in writing',
    text: REFUND_NOTE,
    link: { href: '/terms#product-terms', label: 'Read the site terms' },
  },
] as const;

export default function PluginStorePage() {
  const plugins = listedPlugins();
  const onSale = plugins.filter(isPurchasable).length;
  const featured = plugins[0];
  const lowest = [...plugins].sort((a, b) => a.price.amountMinor - b.price.amountMinor)[0];

  const tabs: CatalogueTab[] = [
    { id: 'all', label: 'All', count: plugins.length },
    ...PLUGIN_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.name,
      count: pluginsIn(category.id).length,
    })),
  ];
  const panels = Object.fromEntries([
    ['all', <Grid key="all" plugins={plugins} />],
    ...PLUGIN_CATEGORIES.map((category) => {
      const shelf = pluginsIn(category.id);
      return [
        category.id,
        shelf.length > 0 ? (
          <Grid key={category.id} plugins={shelf} />
        ) : (
          <EmptyShelf key={category.id} category={category} />
        ),
      ];
    }),
  ]);

  const facts = [
    { term: 'Products', value: String(plugins.length) },
    { term: 'Status', value: onSale > 0 ? `${onSale} on sale` : 'Opening soon' },
    { term: 'Prices from', value: lowest ? `${lowest.price.label} one-off` : '—' },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PluginStoreJsonLd plugins={plugins} />
      <PageHero
        eyebrow="Renor Plugin Store"
        title="Ready-made kits that do real work."
        lede="Digital products from FounderLab, the team behind Renor. The first two are TradeLaunch kits that help electricians win and keep local work. Both are opening soon."
        aside={featured ? <FeaturedPlugin plugin={featured} /> : null}
      >
        <Button asChild variant="brand" size="xl">
          <Link href="#catalogue">
            Browse the catalogue <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="xl">
          <a href={RENOR_LABS_STORE_URL} target="_blank" rel="noopener noreferrer">
            Shop on Renor Labs <ArrowUpRight aria-hidden="true" className="size-4" />
            <span className="sr-only"> (opens our Plug&amp;Pay shop in a new tab)</span>
          </a>
        </Button>
        <Button asChild variant="ghost" size="xl">
          <Link href="#buying">How buying works</Link>
        </Button>
      </PageHero>

      <section
        id="catalogue"
        aria-labelledby="catalogue-title"
        className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow>Catalogue</Eyebrow>
              <h2 id="catalogue-title" className="mt-4 font-display type-heading">
                Everything in the store.
              </h2>
            </div>
            <dl className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card sm:min-w-[28rem]">
              {facts.map((fact, index) => (
                <div
                  key={fact.term}
                  className={index > 0 ? 'border-l border-border px-4 py-3' : 'px-4 py-3'}
                >
                  <dt className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    {fact.term}
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] font-semibold leading-snug">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-10">
            <PluginCatalogue tabs={tabs} panels={panels} />
          </div>
        </div>
      </section>

      <section
        id="buying"
        aria-labelledby="buying-title"
        className="scroll-mt-20 border-t border-border bg-band px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="buying-title"
            eyebrow="How buying works"
            title="Clear before you pay."
            lede="Nothing in the Plugin Store can be bought today. Here is how it will work when sales open, and what is still being confirmed."
          />
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {BUYING_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-7"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="flex size-11 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-link"
                  >
                    <step.icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-display text-sm font-semibold text-muted-foreground tabular-nums">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 flex-1 type-copy text-muted-foreground">{step.text}</p>
                {'link' in step ? (
                  <Link
                    href={step.link.href}
                    className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
                  >
                    {step.link.label} <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="separate-title" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="separate-title"
            eyebrow="Plugins and plans"
            title="A one-off purchase, not a subscription."
            lede={SEPARATE_FROM_PLANS}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-7 sm:p-8">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white dark:bg-brand-400 dark:text-brand-900"
                >
                  <ShoppingBag className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-xl font-semibold tracking-tight">Plugin Store</h3>
              </div>
              <ul className="mt-6 grid gap-3 type-copy text-muted-foreground">
                <li>One price per product, paid once.</li>
                <li>Digital downloads for your business.</li>
                <li>Bought through Plug&amp;Pay once sales open.</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-border bg-card p-7 sm:p-8">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted text-foreground"
                >
                  <Layers3 className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-xl font-semibold tracking-tight">Renor plans</h3>
              </div>
              <ul className="mt-6 grid gap-3 type-copy text-muted-foreground">
                <li>Monthly access to the Renor AI workspace.</li>
                <li>Weekly AI credits, from Free to Max.</li>
                <li>Paid prices are proposed and not on sale yet.</li>
              </ul>
              <Link
                href="/renor/plans"
                className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
              >
                Compare Renor plans <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>
      <ExploreBand page="plugins" />
    </main>
  );
}
