// @polsia:user-owned — "Explore FounderLab": the next-steps band at the end of every page.
// Server component; destinations and per-page choices live in src/lib/business/explore.ts.
import {
  Accessibility,
  ArrowRight,
  ArrowUpRight,
  Building2,
  ExternalLink,
  FileText,
  FolderKanban,
  Layers3,
  Lock,
  Mail,
  Receipt,
  Route,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Eyebrow } from '@/components/custom/ecosystem';
import {
  DESTINATIONS,
  type Destination,
  type DestinationIcon,
  EXPLORE,
  type ExplorePage,
} from '@/lib/business/explore';

const ICONS: Record<DestinationIcon, typeof Sparkles> = {
  sparkles: Sparkles,
  external: ExternalLink,
  layers: Layers3,
  bag: ShoppingBag,
  receipt: Receipt,
  folder: FolderKanban,
  route: Route,
  building: Building2,
  mail: Mail,
  accessibility: Accessibility,
  lock: Lock,
  file: FileText,
};

const CARD =
  'group relative flex h-full flex-col rounded-2xl border border-border/70 bg-background/70 p-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:p-6';

function DestinationCard({ destination }: { destination: Destination }) {
  const Icon = ICONS[destination.icon];
  const Arrow = destination.external ? ArrowUpRight : ArrowRight;
  const body = (
    <>
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-500 dark:text-brand-300"
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="mt-5 flex items-center gap-1.5 text-base font-semibold">
        {destination.title}
        <Arrow
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand-500 dark:group-hover:text-brand-400"
        />
      </span>
      <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{destination.text}</span>
      {destination.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </>
  );
  return destination.external ? (
    <a href={destination.href} target="_blank" rel="noopener noreferrer" className={CARD}>
      {body}
    </a>
  ) : (
    <Link href={destination.href} className={CARD}>
      {body}
    </Link>
  );
}

export function ExploreBand({ page }: { page: ExplorePage }) {
  const { title, destinations } = EXPLORE[page];
  return (
    <section
      aria-labelledby="explore-title"
      className="border-t border-border/60 bg-card/30 px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-screen-xl">
        <Eyebrow>Explore FounderLab</Eyebrow>
        <h2
          id="explore-title"
          className="mt-4 max-w-2xl font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
        >
          {title}
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((id) => (
            <li key={id}>
              <DestinationCard destination={DESTINATIONS[id]} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
