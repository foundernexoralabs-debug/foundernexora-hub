// @polsia:user-owned — Renor's orb: the one brand mark, used everywhere the orb appears.
//
// Extracted from the /renor hero so the hero, the Ask Renor launcher and the Guide panel all
// show the same orb (public/assets/renor/orb.webp), never a redrawn copy. The breathing light
// lives in custom-style.css (.renor-orb) and stops under prefers-reduced-motion.
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface RenorOrbProps {
  className?: string;
  /** `sizes` for next/image: the orb's rendered width. */
  sizes: string;
  /** Load eagerly with high priority (the hero orb only). */
  preload?: boolean;
  /** Decorative by default; give alt text only where the orb carries meaning. */
  alt?: string;
  /**
   * `halo`: the soft breathing glow, for the one focal orb in a view.
   * `plain`: the orb alone, for small inline uses (chat avatars) so glows never pile up.
   */
  variant?: 'halo' | 'plain';
  /** `thinking` breathes faster: the Guide is working on an answer. */
  state?: 'idle' | 'thinking';
}

export function RenorOrb({
  className,
  sizes,
  preload = false,
  alt = '',
  variant = 'halo',
  state = 'idle',
}: RenorOrbProps) {
  return (
    <span
      aria-hidden={alt ? undefined : true}
      data-state={state}
      className={cn(
        'renor-orb relative isolate block shrink-0',
        variant === 'plain' && 'renor-orb--plain',
        className,
      )}
    >
      <Image
        src="/assets/renor/orb.webp"
        alt={alt}
        width={380}
        height={380}
        preload={preload}
        sizes={sizes}
        draggable={false}
        className="h-auto w-full select-none"
      />
    </span>
  );
}
