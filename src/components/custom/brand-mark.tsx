// @polsia:user-owned — the FounderLab mark: Renor's living orb, beside the site name in the
// header and footer. It is the Renor app's own orb (founder-orb.tsx, the approved picture drawn
// by the app's canvas engine) at the app's compact mark size, framed the way the app frames its
// sidebar mark (RenorMark, "on"). The favicon and apple-touch icon are made from the same
// picture (src/app/icon.png, src/app/apple-icon.png).
// Decorative: the visible site name next to it carries the meaning.
import { FounderOrb } from '@/components/custom/founder-orb';
import { cn } from '@/lib/utils';

export function BrandMark({
  className,
  animate = true,
}: {
  className?: string;
  /** `false` draws one still frame, for small repeats of the mark inside content. */
  animate?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-live={animate ? 'true' : 'false'}
      className={cn('fl-orb-mark size-[30px]', className)}
    >
      <FounderOrb state="active" detail="compact" animate={animate} />
    </span>
  );
}
