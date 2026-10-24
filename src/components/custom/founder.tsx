// @polsia:user-owned — the founder's presence on the site: the /company founder hero and the
// small round byline (Zero to Prove). Uses only the three approved, unedited photos of the same
// front-facing portrait (public/founder/), through next/image with explicit sizes and a blur
// placeholder. If FOUNDER_PHOTO_READY is false, an "A" in Renor's orb stands in; never a stock face.
import { ArrowRight, Mail } from 'lucide-react';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { RenorOrb } from '@/components/custom/renor-orb';
import { FOUNDER, FOUNDER_PHOTO_READY, FOUNDER_PHOTOS } from '@/lib/business/founder';
import { cn } from '@/lib/utils';
import heroWide from '../../../public/founder/founder_hero_wide_1600x900.png';
import portrait from '../../../public/founder/founder_portrait_1200.png';
import round from '../../../public/founder/founder_round_400.png';

/** The placeholder: an "A" inside Renor's orb. */
function FounderInitial({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label={`${FOUNDER.name}, ${FOUNDER.role.toLowerCase()}`}
      className={cn('relative grid place-items-center', className)}
    >
      <RenorOrb variant="plain" sizes="96px" className="absolute inset-0 size-full" />
      <span
        aria-hidden="true"
        className="relative font-display text-[1.25em] font-semibold text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.6)]"
      >
        {FOUNDER.name.charAt(0)}
      </span>
    </span>
  );
}

/** 48px round photo with a 1px orb-blue ring and a small glow, plus "Ahmed · Founder". */
export function FounderByline({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-center gap-3', className)}>
      {FOUNDER_PHOTO_READY ? (
        <Image
          src={round}
          alt={FOUNDER.alt}
          width={FOUNDER_PHOTOS.round.width}
          height={FOUNDER_PHOTOS.round.height}
          sizes="48px"
          placeholder="blur"
          className="size-12 shrink-0 rounded-full shadow-glow-sm ring-1 ring-orb-2"
        />
      ) : (
        <FounderInitial className="size-12 shrink-0 rounded-full text-base shadow-glow-sm ring-1 ring-orb-2" />
      )}
      <span className="type-meta font-semibold text-foreground">{FOUNDER.byline}</span>
    </p>
  );
}

/**
 * The /company founder hero. Above 768px: the wide photo (the founder sits on the right) with
 * the words on the dark left. At 768px and below: the portrait stacked above the words.
 * The section stays dark in both themes, like the photo.
 */
export function FounderHero() {
  const shared = {
    alt: FOUNDER.alt,
    placeholder: 'blur',
    loading: 'eager',
    fetchPriority: 'high',
  } as const;
  const {
    props: { srcSet: wideSrcSet },
  } = getImageProps({
    ...shared,
    src: heroWide,
    width: FOUNDER_PHOTOS.heroWide.width,
    height: FOUNDER_PHOTOS.heroWide.height,
    sizes: '100vw',
  });
  const { props: portraitProps } = getImageProps({
    ...shared,
    src: portrait,
    width: FOUNDER_PHOTOS.portrait.width,
    height: FOUNDER_PHOTOS.portrait.height,
    sizes: '(max-width: 768px) 100vw, 1600px',
  });

  return (
    <section
      aria-labelledby="founder-title"
      className="relative isolate overflow-hidden border-b border-border bg-frame text-orb-core"
    >
      <div
        className="relative min-[769px]:h-[min(56.25vw,46rem)] min-[769px]:min-h-[32rem]"
        style={{ '--founder-blur-wide': `url(${heroWide.blurDataURL})` } as CSSProperties}
      >
        {FOUNDER_PHOTO_READY ? (
          <picture>
            <source
              media="(min-width: 769px)"
              srcSet={wideSrcSet}
              sizes="100vw"
              width={FOUNDER_PHOTOS.heroWide.width}
              height={FOUNDER_PHOTOS.heroWide.height}
            />
            {/* Art direction: next/image's getImageProps feeds a <picture>.
                The wide photo's cut-out stops at 82% of its height; on desktop the
                image is pinned to its top and, up to 1599px where that edge is still in
                view, faded out before it (CSS only,
                the file itself is unedited). */}
            <img
              {...portraitProps}
              alt={FOUNDER.alt}
              className="block aspect-[4/5] h-auto w-full object-cover min-[769px]:absolute min-[769px]:inset-0 min-[769px]:aspect-auto min-[769px]:h-full min-[769px]:object-[72%_top] min-[769px]:max-[1599px]:[mask-image:linear-gradient(to_bottom,black_66%,transparent_82%)] min-[769px]:[background-image:var(--founder-blur-wide)]!"
            />
          </picture>
        ) : (
          <div className="grid aspect-[4/5] place-items-center min-[769px]:absolute min-[769px]:inset-0 min-[769px]:aspect-auto min-[769px]:justify-end min-[769px]:pr-[14%]">
            <FounderInitial className="size-56 text-[3.5rem]" />
          </div>
        )}
        {/* Keeps the words readable: the photo's dark left edge, deepened. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,var(--frame),transparent)] min-[769px]:inset-y-0 min-[769px]:right-auto min-[769px]:h-auto min-[769px]:w-[62%] min-[769px]:bg-[linear-gradient(90deg,var(--frame)_0%,color-mix(in_srgb,var(--frame)_82%,transparent)_55%,transparent)]"
        />
        <div className="relative -mt-16 px-5 pb-14 sm:px-8 min-[769px]:absolute min-[769px]:inset-0 min-[769px]:mt-0 min-[769px]:flex min-[769px]:items-center min-[769px]:pb-0">
          <div className="mx-auto w-full max-w-screen-xl">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-[0.12em] text-orb-1 uppercase">
                {FOUNDER.byline}
              </p>
              <h1
                id="founder-title"
                className="mt-5 font-display text-[clamp(2.25rem,2.6vw+1.2rem,3.75rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance"
              >
                {FOUNDER.line}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[color-mix(in_oklch,var(--orb-core)_84%,var(--frame))]">
                {FOUNDER.intro}
              </p>
              {/* TODO(owner): the story paragraphs (src/lib/business/founder.ts) go here once written. */}
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orb-3 px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-[color-mix(in_oklch,var(--orb-3)_85%,white)]"
                >
                  <Mail aria-hidden="true" className="size-4" /> Contact {FOUNDER.name}
                </Link>
                <Link
                  href="/zero-to-prove"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--orb-core)_35%,transparent)] px-6 text-[0.9375rem] font-semibold text-orb-core transition-colors hover:bg-[color-mix(in_oklch,var(--orb-core)_10%,transparent)]"
                >
                  Follow the build <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
