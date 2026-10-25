// @polsia:user-owned — shared building blocks for the FounderLab pages.
// One status vocabulary, one page header, one screenshot frame: every page
// composes these so the site reads as one connected system.
import Image from 'next/image';
import type { ReactNode } from 'react';
import { STATUS, type StatusKey } from '@/lib/business/ecosystem';
import { cn } from '@/lib/utils';

/**
 * The one status badge. Its look lives in `.status-badge` (custom-style.css): ink text in both
 * themes (AA), a tinted border and dot per tone. LIVE has a solid dot with a halo, PREVIEW is
 * amber, EXPERIMENTAL violet, PLANNED an outline with a hollow dot. The label always says the
 * status in words; colour is never the only signal.
 */
export function StatusBadge({ status, className }: { status: StatusKey; className?: string }) {
  const entry = STATUS[status];
  return (
    <span
      className={cn('status-badge', className)}
      data-tone={entry.tone}
      title={entry.description}
    >
      <span aria-hidden="true" className="status-badge-dot" />
      {entry.label}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold tracking-[0.12em] text-link uppercase">{children}</p>;
}

/**
 * A quiet dot grid behind page heroes: drawn in the border colour and faded out
 * towards the text, so it adds texture without dimming or tinting anything you read.
 */
export function HeroGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(var(--border)_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_90%_at_100%_0%,black,transparent_70%)]"
    />
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  aside,
  byline,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  children?: ReactNode;
  /** Optional content beside the text on large screens (below it on small ones). */
  aside?: ReactNode;
  /** Optional byline under the lede, e.g. the founder's. */
  byline?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24">
      <HeroGrid />
      <div
        className={cn(
          'mx-auto max-w-screen-xl',
          aside && 'grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14',
        )}
      >
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-display type-title text-balance">{title}</h1>
          <div className="mt-6 max-w-2xl type-lead text-pretty text-muted-foreground">{lede}</div>
          {byline ? <div className="mt-7">{byline}</div> : null}
          {children ? <div className="mt-10 flex flex-wrap gap-3">{children}</div> : null}
        </div>
        {aside}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
}) {
  return (
    <div className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-4 font-display type-heading text-balance">
        {title}
      </h2>
      {lede ? <p className="mt-5 type-lead text-pretty text-muted-foreground">{lede}</p> : null}
    </div>
  );
}

/** A real screenshot of the product, framed like a window and labelled with where it came from. */
export function ProductShot({
  src,
  alt,
  width,
  height,
  caption,
  preload = false,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  /** Preload only an above-the-fold image that is the page's largest paint. */
  preload?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-card shadow-xl',
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
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        preload={preload}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="h-auto w-full"
      />
      <figcaption className="border-t border-border px-4 py-2.5 type-meta text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

export const SCREENSHOT_CAPTION =
  'Screenshot of the current Renor development build, 5 October 2026.';
