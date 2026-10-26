// @polsia:user-owned — the FounderLab mark: Renor's living orb, beside the site name in the
// header and footer. The favicon and apple-touch icon are its still pose (src/app/icon.svg and
// src/app/apple-icon.tsx), drawn from the same geometry in src/lib/business/living-orb.ts.
// Decorative: the visible site name next to it carries the meaning.
import { LivingOrb } from '@/components/custom/living-orb';
import { cn } from '@/lib/utils';

export function BrandMark({
  className,
  animate = true,
}: {
  className?: string;
  /** `false` holds the still pose, for small repeats of the mark inside content. */
  animate?: boolean;
}) {
  return <LivingOrb detail="mark" animate={animate} className={cn('size-[30px]', className)} />;
}
