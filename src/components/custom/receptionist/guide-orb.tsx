// @polsia:user-owned — the Renor Guide's orb: Renor's living orb, drawn in CSS so it is crisp at
// every size, themes cleanly, and stops moving when reduced motion is requested.
import { cn } from '@/lib/utils';
import './receptionist.css';

export function GuideOrb({
  className,
  thinking = false,
}: {
  className?: string;
  thinking?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      data-state={thinking ? 'thinking' : 'idle'}
      className={cn('rg-orb block size-8', className)}
    />
  );
}
