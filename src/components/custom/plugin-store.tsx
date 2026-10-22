// @polsia:user-owned — Renor Plugin Store building blocks: product cover, availability badge,
// product card, purchase panel and the related-product row. Server-safe (no client state).
// A buy button renders ONLY through PurchasePanel, and only when isPurchasable() is true:
// opening-soon products get "Notify me" (and a public sales page when one exists) instead.
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Mail,
  Package,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  availabilityLabel,
  buyHref,
  isPurchasable,
  notifyHref,
  type Plugin,
  PURCHASE_NOTE,
} from '@/lib/business/plugins';
import { cn } from '@/lib/utils';

/** Keeps names like "90-Day" together: a non-breaking hyphen between digits and words. */
export function displayName(name: string): string {
  return name.replace(/(\d)-(\w)/g, '$1‑$2');
}

/** "TradeLaunch: Electrician Business Kit" → "Electrician Business Kit" when the line is shown separately. */
export function shortName(plugin: Plugin): string {
  const prefix = plugin.line ? `${plugin.line}: ` : '';
  return displayName(
    prefix && plugin.title.startsWith(prefix) ? plugin.title.slice(prefix.length) : plugin.title,
  );
}

export function pluginHref(plugin: Plugin): string {
  return `/plugins/${plugin.slug}`;
}

const ICONS: Record<string, typeof Package> = {
  'tradelaunch-electrician-business-kit': Zap,
  'tradelaunch-90-day-local-growth-pack': CalendarDays,
};

/**
 * A designed cover for a digital product: the line, the product name and what it holds.
 * Every word on it comes from the catalogue, so it never shows a made-up product shot.
 */
export function PluginCover({
  plugin,
  size = 'card',
  className,
}: {
  plugin: Plugin;
  size?: 'card' | 'hero';
  className?: string;
}) {
  const Icon = ICONS[plugin.slug] ?? Package;
  const hero = size === 'hero';
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative isolate flex flex-col justify-between overflow-hidden rounded-xl border border-brand-500/20 bg-brand-50 p-5 text-brand-900 dark:border-brand-400/20 dark:bg-brand-500/[0.09] dark:text-brand-100',
        hero ? 'aspect-[16/10] sm:p-7' : 'aspect-[16/9]',
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 opacity-[0.14] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom_left,black,transparent_75%)]" />
      <div className="absolute -right-10 -bottom-12 -z-10 size-48 rounded-full border border-current opacity-[0.08]" />
      <div className="absolute -right-2 -bottom-4 -z-10 size-32 rounded-full border border-current opacity-[0.1]" />
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm dark:bg-brand-400 dark:text-brand-900',
            hero ? 'size-14' : 'size-11',
          )}
        >
          <Icon className={hero ? 'size-7' : 'size-5'} strokeWidth={1.75} />
        </span>
        <span className="rounded-full border border-current/20 bg-white/60 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.1em] uppercase dark:bg-white/5">
          {plugin.format}
        </span>
      </div>
      <div>
        {plugin.line ? (
          <p className="text-[0.75rem] font-semibold tracking-[0.16em] uppercase opacity-80">
            {plugin.line}
          </p>
        ) : null}
        <p
          className={cn(
            'mt-1 font-display font-semibold tracking-tight text-balance',
            hero ? 'text-[1.625rem] leading-tight sm:text-3xl' : 'text-lg leading-snug',
          )}
        >
          {shortName(plugin)}
        </p>
        <p className="mt-1.5 text-[0.8125rem] font-medium opacity-80">
          {plugin.inside.length} parts inside
        </p>
      </div>
    </div>
  );
}

/** A compact square tile with the product's icon, for rows and lists. */
export function PluginTile({ plugin, className }: { plugin: Plugin; className?: string }) {
  const Icon = ICONS[plugin.slug] ?? Package;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-brand-500/20 bg-brand-50 text-brand-700 dark:border-brand-400/20 dark:bg-brand-500/[0.12] dark:text-brand-200',
        className,
      )}
    >
      <span className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px]" />
      <Icon className="relative size-8" strokeWidth={1.6} />
    </span>
  );
}

export function AvailabilityBadge({ plugin, className }: { plugin: Plugin; className?: string }) {
  const onSale = isPurchasable(plugin);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.06em] uppercase',
        onSale
          ? 'border-emerald-600/35 bg-emerald-50 text-emerald-800 dark:border-emerald-400/35 dark:bg-emerald-400/10 dark:text-emerald-200'
          : 'border-amber-600/35 bg-amber-50 text-amber-900 dark:border-amber-400/35 dark:bg-amber-400/10 dark:text-amber-200',
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {availabilityLabel(plugin)}
    </span>
  );
}

/** "£29 · one-off". The price is the total shown in the shop; no tax wording is added. */
export function PriceTag({
  plugin,
  size = 'md',
  className,
}: {
  plugin: Plugin;
  size?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <p className={cn('flex items-baseline gap-2', className)}>
      <span
        className={cn(
          'font-display font-semibold tracking-tight',
          size === 'lg' ? 'text-[2.5rem] leading-none' : 'text-2xl leading-none',
        )}
      >
        {plugin.price.label}
      </span>
      <span className="type-meta text-muted-foreground">one-off</span>
    </p>
  );
}

function NotifyButton({
  plugin,
  variant = 'outline',
  className,
}: {
  plugin: Plugin;
  variant?: 'outline' | 'brand';
  className?: string;
}) {
  return (
    <Button asChild variant={variant} size="xl" className={className}>
      <a href={notifyHref(plugin)}>
        <Mail aria-hidden="true" className="size-4" /> Notify me
        <span className="sr-only"> when {plugin.title} opens, by email</span>
      </a>
    </Button>
  );
}

/** A catalogue card: cover, status, what it is, a taste of what is inside, price and two clear actions. */
export function PluginCard({
  plugin,
  headingLevel = 'h3',
}: {
  plugin: Plugin;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  const preview = plugin.inside.slice(0, 3);
  const more = plugin.inside.length - preview.length;
  return (
    <article
      aria-labelledby={`plugin-${plugin.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-4 shadow-xs transition-[border-color,box-shadow] duration-300 hover:border-brand-500/45 hover:shadow-md sm:p-5"
    >
      <Link href={pluginHref(plugin)} tabIndex={-1} aria-hidden="true" className="block">
        <PluginCover plugin={plugin} />
      </Link>
      <div className="flex flex-1 flex-col px-1 pt-5 sm:px-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="type-meta font-medium text-muted-foreground">For {plugin.audience}</p>
          <AvailabilityBadge plugin={plugin} />
        </div>
        <Heading
          id={`plugin-${plugin.slug}`}
          className="mt-3 font-display text-[1.375rem] leading-snug font-semibold tracking-tight text-balance"
        >
          <Link
            href={pluginHref(plugin)}
            className="rounded-sm underline-offset-4 decoration-2 hover:underline"
          >
            {displayName(plugin.title)}
          </Link>
        </Heading>
        <p className="mt-3 type-copy text-muted-foreground">{plugin.summary}</p>
        <ul className="mt-5 grid gap-2" aria-label="What is inside">
          {preview.map((item) => (
            <li key={item} className="flex items-start gap-2.5 type-meta">
              <Check aria-hidden="true" className="mt-[0.2rem] size-4 shrink-0 text-link" />
              {item}
            </li>
          ))}
          {more > 0 ? (
            <li className="pl-[1.625rem] type-meta text-muted-foreground">
              and {more} more inside
            </li>
          ) : null}
        </ul>
        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-3 border-t border-border pt-5">
            <PriceTag plugin={plugin} />
            <span className="type-meta text-muted-foreground">{plugin.format}</span>
          </div>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <Button asChild variant="brand" size="xl">
              <Link href={pluginHref(plugin)}>
                View details <ArrowRight aria-hidden="true" className="size-4" />
                <span className="sr-only"> of {plugin.title}</span>
              </Link>
            </Button>
            {isPurchasable(plugin) ? null : <NotifyButton plugin={plugin} />}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * The purchase panel. A purchasable product gets its verified checkout; anything else
 * gets "Opening soon", Notify me and (when published) the full sales page. Never a dead buy button.
 */
export function PurchasePanel({ plugin }: { plugin: Plugin }) {
  const checkout = buyHref(plugin);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PriceTag plugin={plugin} size="lg" />
        <AvailabilityBadge plugin={plugin} />
      </div>
      {checkout ? (
        <Button asChild variant="brand" size="xl" className="w-full">
          <a href={checkout} rel="noopener noreferrer">
            <ShoppingBag aria-hidden="true" className="size-4" /> Buy now
          </a>
        </Button>
      ) : (
        <>
          <p className="type-copy text-muted-foreground">
            Sales have not opened yet. There is no checkout, so nothing can be paid today. Ask to
            hear when it opens and we email you once.
          </p>
          <div className="grid gap-2.5">
            <NotifyButton plugin={plugin} variant="brand" className="w-full" />
            {plugin.salesPageUrl ? (
              <Button asChild variant="outline" size="xl" className="w-full">
                <a href={plugin.salesPageUrl} target="_blank" rel="noopener noreferrer">
                  See full details <ArrowUpRight aria-hidden="true" className="size-4" />
                  <span className="sr-only"> on the sales page (opens in a new tab)</span>
                </a>
              </Button>
            ) : null}
          </div>
        </>
      )}
      <p className="border-t border-border pt-4 type-meta text-muted-foreground">{PURCHASE_NOTE}</p>
    </div>
  );
}

/** A wide row for "you might also want": cover, name, summary, price, link. */
export function PluginRow({ plugin }: { plugin: Plugin }) {
  return (
    <article className="group relative grid items-center gap-5 rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-300 focus-within:ring-2 focus-within:ring-ring hover:border-brand-500/45 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:p-5">
      <PluginTile plugin={plugin} />
      <div className="px-1">
        <div className="flex flex-wrap items-center gap-2">
          <AvailabilityBadge plugin={plugin} />
          <span className="type-meta text-muted-foreground">For {plugin.audience}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-balance">
          <Link
            href={pluginHref(plugin)}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
          >
            {displayName(plugin.title)}
          </Link>
        </h3>
        <p className="mt-2 max-w-2xl type-copy text-muted-foreground">{plugin.summary}</p>
      </div>
      <div className="flex items-center justify-between gap-6 px-1 sm:flex-col sm:items-end">
        <PriceTag plugin={plugin} />
        <span className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-link">
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
