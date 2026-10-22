'use client';
// @polsia:user-owned — the Plugin Store category filter: an accessible tab list (arrow keys,
// Home/End) whose choice is kept in ?category= so a filtered view can be linked and shared.
// The server renders every panel; this component only chooses which one is shown.
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

export interface CatalogueTab {
  id: string;
  label: string;
  /** Products on this shelf; 0 shows "Soon" instead of a count. */
  count: number;
}

const PARAM = 'category';

export function PluginCatalogue({
  tabs,
  panels,
}: {
  tabs: readonly CatalogueTab[];
  panels: Record<string, ReactNode>;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? 'all');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Honour a shared link such as /plugins?category=templates.
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get(PARAM);
    if (wanted && tabs.some((tab) => tab.id === wanted)) setActive(wanted);
  }, [tabs]);

  const choose = useCallback(
    (id: string, focus = false) => {
      setActive(id);
      if (focus) refs.current[id]?.focus();
      const url = new URL(window.location.href);
      if (id === tabs[0]?.id) url.searchParams.delete(PARAM);
      else url.searchParams.set(PARAM, id);
      window.history.replaceState(window.history.state, '', url);
    },
    [tabs],
  );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.id === active);
    const last = tabs.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    const tab = tabs[next];
    if (tab) choose(tab.id, true);
  }

  return (
    <div>
      <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Filter by category"
          onKeyDown={onKeyDown}
          className="inline-flex min-w-max gap-1 rounded-full border border-border bg-card p-1 shadow-xs"
        >
          {tabs.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  refs.current[tab.id] = node;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(tab.id)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-medium transition-colors duration-200',
                  selected
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
                    selected ? 'bg-background/15' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {tab.count > 0 ? tab.count : 'Soon'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== active}
          className="mt-8 animate-in fade-in-0 duration-300"
        >
          {tab.id === active ? panels[tab.id] : null}
        </div>
      ))}
    </div>
  );
}
