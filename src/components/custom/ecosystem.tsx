// @polsia:user-owned — shared building blocks for the FounderLab pages.
// One status vocabulary, one page header, one screenshot frame: every page
// composes these so the site reads as one connected system.
import Image from 'next/image';
import type { ReactNode } from 'react';
import { STATUS, type StatusKey } from '@/lib/business/ecosystem';
import { cn } from '@/lib/utils';

const TONE: Record<(typeof STATUS)[StatusKey]['tone'], string> = {
  live: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  preview: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  experimental: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  planned: 'border-border bg-muted/60 text-muted-foreground',
};

export function StatusBadge({ status, className }: { status: StatusKey; className?: string }) {
  const entry = STATUS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
        TONE[entry.tone],
        className,
      )}
      title={entry.description}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {entry.label}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.19em] text-brand-500 uppercase dark:text-brand-400">
      {children}
    </p>
  );
}

export function PageHero({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_80%_10%,rgba(99,102,241,0.20),transparent_65%),radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(56,189,248,0.08),transparent_70%)]"
      />
      <div className="mx-auto max-w-screen-xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
          {title}
        </h1>
        <div className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">
          {lede}
        </div>
        {children ? <div className="mt-9 flex flex-wrap gap-3">{children}</div> : null}
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
      <h2
        id={id}
        className="mt-4 font-display text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">{lede}</p>
      ) : null}
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
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl shadow-brand-900/20',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-4 py-2.5"
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
        priority={priority}
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="h-auto w-full"
      />
      <figcaption className="border-t border-border/70 px-4 py-2.5 text-xs text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}

export const SCREENSHOT_CAPTION =
  'Screenshot of the current Renor development build, 5 October 2026.';
