// @polsia:user-owned — building blocks for the Renor launch pages: the honest feature
// grid, the three-step "how it works", and a screenshot frame that follows the theme.
// Content lives in src/lib/business/launch.ts.
import {
  Code2,
  Cpu,
  CreditCard,
  FolderKanban,
  Gauge,
  GitPullRequest,
  Globe,
  type LucideIcon,
  MessageSquare,
  Mic,
  Monitor,
  NotebookPen,
  Puzzle,
  Rocket,
  Search,
  Youtube,
} from 'lucide-react';
import Image from 'next/image';
import {
  FEATURE_STATUS,
  FEATURES,
  type FeatureIcon,
  type FeatureStatus,
  HOW_IT_WORKS,
  type TourShot,
  tourImage,
} from '@/lib/business/launch';
import { cn } from '@/lib/utils';

const FEATURE_ICONS: Record<FeatureIcon, LucideIcon> = {
  chat: MessageSquare,
  code: Code2,
  globe: Globe,
  folder: FolderKanban,
  notes: NotebookPen,
  cpu: Cpu,
  mic: Mic,
  search: Search,
  git: GitPullRequest,
  video: Youtube,
  gauge: Gauge,
  card: CreditCard,
  rocket: Rocket,
  monitor: Monitor,
  puzzle: Puzzle,
};

/** Feature statuses share the site's badge tones: available reads as live, beta as preview. */
const STATUS_TONE: Record<FeatureStatus, 'live' | 'preview' | 'planned'> = {
  available: 'live',
  beta: 'preview',
  planned: 'planned',
};

export function FeatureStatusBadge({
  status,
  className,
}: {
  status: FeatureStatus;
  className?: string;
}) {
  return (
    <span
      className={cn('status-badge', className)}
      data-tone={STATUS_TONE[status]}
      title={FEATURE_STATUS[status].description}
    >
      <span aria-hidden="true" className="status-badge-dot" />
      {FEATURE_STATUS[status].label}
    </span>
  );
}

/** Every Renor feature, grouped Available → Beta → Planned, each with its status. */
export function FeatureGrid() {
  const order: FeatureStatus[] = ['available', 'beta', 'planned'];
  return (
    <div className="grid gap-12">
      {order.map((status) => {
        const features = FEATURES.filter((feature) => feature.status === status);
        return (
          <div key={status}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-border pb-4">
              <h3 className="text-xl font-semibold tracking-tight">
                {FEATURE_STATUS[status].label}
              </h3>
              <p className="type-copy text-muted-foreground">
                {FEATURE_STATUS[status].description}
              </p>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <li
                    key={feature.id}
                    className={cn(
                      'flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-500/45',
                      status === 'planned' && 'bg-transparent',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-link"
                      >
                        <Icon className="size-5" />
                      </span>
                      <FeatureStatusBadge status={feature.status} />
                    </div>
                    <h4 className="mt-5 text-lg font-semibold tracking-tight">{feature.title}</h4>
                    <p className="mt-2 type-copy text-muted-foreground">{feature.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function HowItWorks() {
  return (
    <ol className="relative grid gap-5 md:grid-cols-3">
      {HOW_IT_WORKS.map((item) => (
        <li key={item.step} className="relative rounded-2xl border border-border bg-card p-7">
          <span className="font-display text-[2.5rem] leading-none font-semibold tracking-tight text-link">
            {item.step}
          </span>
          <h3 className="mt-6 text-xl font-semibold tracking-tight">{item.title}</h3>
          <p className="mt-3 type-copy text-muted-foreground">{item.text}</p>
        </li>
      ))}
    </ol>
  );
}

/**
 * A real screenshot in a window frame, in the version that matches the site's theme:
 * the light capture on the light site, the dark capture on the dark site.
 */
export function ThemedShot({
  shot,
  caption,
  preload = false,
  sizes = '(min-width: 1280px) 72rem, 100vw',
  className,
}: {
  shot: TourShot;
  caption?: string;
  preload?: boolean;
  sizes?: string;
  className?: string;
}) {
  const common = { width: shot.width, height: shot.height, sizes, preload } as const;
  return (
    <figure
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-brand-900/10 dark:shadow-black/40',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5"
      >
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="ml-3 truncate text-sm font-medium text-muted-foreground">
          Renor · {shot.tab}
        </span>
      </div>
      <Image
        {...common}
        src={tourImage(shot, 'light')}
        alt={shot.alt}
        className="h-auto w-full dark:hidden"
      />
      <Image
        {...common}
        src={tourImage(shot, 'dark')}
        alt={shot.alt}
        className="hidden h-auto w-full dark:block"
      />
      {caption ? (
        <figcaption className="border-t border-border px-4 py-2.5 type-meta text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
