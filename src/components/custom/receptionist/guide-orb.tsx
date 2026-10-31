// @polsia:user-owned — the Renor Guide's orb inside the panel: the same living orb as the header
// mark and the launcher (FounderOrb, the Renor app's orb). Avatars are one still frame, so a
// long thread never fills with motion; the large welcome orb lives, an avatar comes alive while
// the Guide is working on an answer, and every orb is still under reduced motion.
import { FounderOrb } from '@/components/custom/founder-orb';
import { cn } from '@/lib/utils';
import './receptionist.css';

export function GuideOrb({
  className,
  thinking = false,
  welcome = false,
}: {
  className?: string;
  /** The Guide is working on an answer: the orb crackles. */
  thinking?: boolean;
  /** The large welcome orb at the top of an empty conversation: alive at rest. */
  welcome?: boolean;
}) {
  return (
    <FounderOrb
      state={thinking ? 'thinking' : welcome ? 'active' : 'idle'}
      detail={welcome ? 'status' : 'compact'}
      animate={thinking || welcome}
      className={cn('size-8', className)}
    />
  );
}
