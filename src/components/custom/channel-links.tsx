// @polsia:user-owned — icons and link rows for the channels in src/lib/business/ecosystem.ts.
// One component renders the social links in the footer and on Contact, so a channel
// is added or corrected in CHANNELS and appears everywhere at once.
import {
  ArrowUpRight,
  Briefcase,
  Github,
  Link2,
  type LucideIcon,
  Music2,
  Store,
  Youtube,
} from 'lucide-react';
import { type Channel, type LinkedChannel, SOCIAL_CHANNELS } from '@/lib/business/ecosystem';
import { cn } from '@/lib/utils';

const ICONS: Record<Channel['id'], LucideIcon> = {
  youtube: Youtube,
  tiktok: Music2,
  links: Link2,
  fiverr: Briefcase,
  'renor-labs': Store,
  github: Github,
};

export function ChannelIcon({ id, className }: { id: Channel['id']; className?: string }) {
  const Icon = ICONS[id];
  return <Icon aria-hidden="true" className={cn('size-5 shrink-0', className)} />;
}

/**
 * The social links as a row. `icons` renders compact icon buttons with an
 * accessible name; `labelled` shows each channel's name beside its icon.
 */
export function SocialLinks({
  variant = 'icons',
  channels = SOCIAL_CHANNELS,
  className,
}: {
  variant?: 'icons' | 'labelled';
  channels?: readonly LinkedChannel[];
  className?: string;
}) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-2', className)}>
      {channels.map((channel) => (
        <li key={channel.id}>
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${channel.label} (opens in a new tab)`}
            title={channel.label}
            className={cn(
              'inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background/60 text-foreground/80 transition-colors hover:border-brand-500/60 hover:bg-brand-500/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
              variant === 'icons' ? 'size-11' : 'gap-2 px-4 text-sm font-medium',
            )}
          >
            <ChannelIcon
              id={channel.id}
              className={variant === 'icons' ? 'size-[18px]' : 'size-4'}
            />
            {variant === 'labelled' ? (
              <>
                <span aria-hidden="true">{channel.name}</span>
                <ArrowUpRight aria-hidden="true" className="size-3.5 opacity-70" />
              </>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
}
