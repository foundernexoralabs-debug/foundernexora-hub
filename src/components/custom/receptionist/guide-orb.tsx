// @polsia:user-owned — the Renor Guide's orb inside the panel: the same orb as the /renor hero
// and the launcher (RenorOrb), without a halo so small avatars never stack glows. It breathes
// faster while the Guide is working on an answer, and stays still under reduced motion.
import { RenorOrb } from '@/components/custom/renor-orb';
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
    <RenorOrb
      variant="plain"
      sizes="64px"
      state={thinking ? 'thinking' : 'idle'}
      className={cn('size-8', className)}
    />
  );
}
