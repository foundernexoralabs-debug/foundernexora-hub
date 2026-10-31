// @polsia:user-owned — "What do you need?": one card per reason someone visits, each with
// a one-line benefit and a clear button. Server component; content lives in
// src/lib/business/guide.ts. Reusable: pass `exclude` to drop the page you are on.
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  type LucideIcon,
  Mail,
  PlayCircle,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { ChannelIcon } from '@/components/custom/channel-links';
import { Eyebrow } from '@/components/custom/ecosystem';
import { Button } from '@/components/ui/button';
import {
  NEEDS,
  type Need,
  type NeedAction,
  type NeedIcon,
  type NeedId,
} from '@/lib/business/guide';
import { cn } from '@/lib/utils';

const ICONS: Record<NeedIcon, LucideIcon> = {
  briefcase: Briefcase,
  play: PlayCircle,
  sparkles: Sparkles,
  bag: ShoppingBag,
  mail: Mail,
};

/**
 * Column spans for the 6-column desktop grid: a row of three, then a row of two,
 * so five cards fill two complete rows with no orphan.
 */
function spanFor(index: number, count: number): string {
  if (count === 5) return index < 3 ? 'lg:col-span-2' : 'lg:col-span-3';
  if (count === 4) return 'lg:col-span-3';
  return 'lg:col-span-2';
}

/**
 * One guide action as a button: filled when primary, outlined otherwise. `quiet` outlines
 * every action, for places where another button is already the page's main call.
 */
export function NeedActionButton({
  action,
  quiet = false,
}: {
  action: NeedAction;
  quiet?: boolean;
}) {
  const Arrow = action.external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      {action.channel && !action.primary ? (
        <ChannelIcon id={action.channel} className="size-4" />
      ) : null}
      {action.label}
      {action.primary || action.external ? <Arrow aria-hidden="true" className="size-4" /> : null}
      {action.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </>
  );
  return (
    <Button
      asChild
      variant={action.primary && !quiet ? 'brand' : 'outline'}
      className="h-11 rounded-full px-5 text-[0.9375rem] font-semibold"
    >
      {action.external ? (
        <a href={action.href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <Link href={action.href}>{content}</Link>
      )}
    </Button>
  );
}

function NeedCard({ need, className }: { need: Need; className?: string }) {
  const Icon = ICONS[need.icon];
  return (
    <li
      className={cn(
        'flex flex-col rounded-2xl border border-border bg-card p-6 shadow-xs transition-[border-color,box-shadow] duration-300 hover:border-brand-500/50 hover:shadow-md sm:p-7',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="mt-6 font-display type-subheading">{need.title}</h3>
      <p className="mt-2 flex-1 type-copy text-muted-foreground">{need.benefit}</p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        {need.actions.map((action) => (
          <NeedActionButton key={action.href} action={action} />
        ))}
      </div>
    </li>
  );
}

export function NeedGuide({
  id = 'guide',
  eyebrow = 'Start here',
  title = 'What do you need?',
  lede = 'Pick what you came for. Each card takes you straight there.',
  exclude = [],
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  exclude?: readonly NeedId[];
  className?: string;
}) {
  const needs = NEEDS.filter((need) => !exclude.includes(need.id));
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24', className)}
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={headingId} className="mt-4 font-display type-heading text-balance">
            {title}
          </h2>
          <p className="mt-5 type-lead text-pretty text-muted-foreground">{lede}</p>
        </div>
        <ul className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-6">
          {needs.map((need, index) => (
            <NeedCard
              key={need.id}
              need={need}
              className={cn(
                spanFor(index, needs.length),
                // An odd last card spans the full two-column tablet row.
                index === needs.length - 1 && needs.length % 2 === 1 && 'md:col-span-2',
              )}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
