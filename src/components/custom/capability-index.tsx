'use client';
// @polsia:user-owned — the "Rooms" index beside /renor/capabilities. Server-rendered as plain
// anchor links (works without JavaScript); once hydrated it marks the room you are reading.
import { useEffect, useState } from 'react';
import { AREA_ICONS } from '@/components/custom/capability-icons';
import type { CapabilityAreaId, CapabilityIcon } from '@/lib/business/capabilities';
import { cn } from '@/lib/utils';

export interface IndexEntry {
  id: CapabilityAreaId;
  name: string;
  icon: CapabilityIcon;
  count: number;
}

/** The room whose section crosses the upper third of the screen. */
function useActiveRoom(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: '-20% 0px -65% 0px' },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function CapabilityIndex({ entries }: { entries: readonly IndexEntry[] }) {
  const [ids] = useState(() => entries.map((entry) => entry.id));
  const active = useActiveRoom(ids);
  return (
    <nav aria-labelledby="index-title" className="lg:sticky lg:top-24 lg:self-start">
      <h2
        id="index-title"
        className="text-sm font-semibold tracking-[0.12em] text-muted-foreground uppercase"
      >
        Rooms
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-0.5">
        {entries.map((entry) => {
          const Icon = AREA_ICONS[entry.icon];
          const current = active === entry.id;
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={current ? 'location' : undefined}
                className={cn(
                  'group flex min-h-11 items-center gap-2.5 rounded-full border border-border px-3.5 text-[0.9375rem] font-medium transition-colors hover:border-brand-500/50 lg:rounded-xl lg:border-transparent lg:px-3 lg:hover:border-border lg:hover:bg-card',
                  current && 'lg:border-border lg:bg-card',
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-link',
                    current && 'text-link',
                  )}
                />
                <span className="flex-1">{entry.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{entry.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
