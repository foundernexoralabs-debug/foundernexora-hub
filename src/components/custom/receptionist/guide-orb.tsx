// @polsia:user-owned — the Renor Guide's orb inside the panel: the same living orb as the header
// mark and the launcher (LivingOrb). Avatars hold the still pose, so a long thread never fills
// with motion; the large welcome orb lives, every orb comes alive while the Guide is working on
// an answer, and all of them stay still under reduced motion.
import { LivingOrb } from '@/components/custom/living-orb';
import { cn } from '@/lib/utils';
import './receptionist.css';

export function GuideOrb({
  className,
  thinking = false,
  detail = 'mark',
}: {
  className?: string;
  thinking?: boolean;
  /** `launcher` for the large welcome orb; `mark` for avatars. */
  detail?: 'mark' | 'launcher';
}) {
  return (
    <LivingOrb
      detail={detail}
      animate={thinking || detail === 'launcher'}
      state={thinking ? 'thinking' : 'idle'}
      className={cn('size-8', className)}
    />
  );
}
