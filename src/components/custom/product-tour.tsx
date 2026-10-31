'use client';
// @polsia:user-owned — the Renor product tour: one tab per area (Chat AI, Code AI, Website
// Builder, Project Office), each a real capture of the app in a window frame, a one-line value,
// three things it does today, its honest status and a way to try it.
//
// ARIA tabs pattern (arrow keys, Home, End; automatic activation) with deep links:
// /renor#code-ai opens Code AI (older anchors like #code still work). The tour advances every
// 8 seconds with a progress bar until the visitor takes over; it pauses on hover or focus, when
// it is off screen or the browser tab is hidden, and never runs under reduced motion.
// Rules and content: src/lib/business/renor-tabs.ts.
import { ArrowUpRight, Check } from 'lucide-react';
import Image from 'next/image';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { StatusBadge } from '@/components/custom/ecosystem';
import { RENOR_APP_URL } from '@/lib/business/ecosystem';
import { TOUR_CAPTION, tourImage } from '@/lib/business/launch';
import {
  AUTOPLAY_MS,
  autoplayEnabled,
  autoplayRunning,
  nextTabIndex,
  RENOR_TABS,
  type RenorTab,
  type RenorTabIcon,
  tabIndexFromHash,
} from '@/lib/business/renor-tabs';
import './product-tour.css';

/** Small line icons, each with its own hover motion (see product-tour.css). */
function TabIconShapes({ icon }: { icon: RenorTabIcon }) {
  switch (icon) {
    case 'chat':
      return (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5z" />
          <circle className="rt-dot" cx="8.5" cy="9.5" r="0.9" fill="currentColor" />
          <circle className="rt-dot" cx="12" cy="9.5" r="0.9" fill="currentColor" />
          <circle className="rt-dot" cx="15.5" cy="9.5" r="0.9" fill="currentColor" />
        </>
      );
    case 'code':
      return (
        <>
          <path className="rt-bracket-l" d="M9 7 4 12l5 5" />
          <path className="rt-bracket-r" d="m15 7 5 5-5 5" />
        </>
      );
    case 'builder':
      return (
        <>
          <rect className="rt-block rt-block-1" x="4" y="15" width="16" height="5" rx="1.2" />
          <rect className="rt-block rt-block-2" x="4" y="9" width="10" height="5" rx="1.2" />
          <rect className="rt-block rt-block-3" x="4" y="3" width="6" height="5" rx="1.2" />
        </>
      );
    case 'office':
      return (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
          <path className="rt-tick" d="m8 12.5 2.8 2.8L16.5 9" pathLength={1} />
        </>
      );
  }
}

function TabIcon({ icon }: { icon: RenorTabIcon }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`rt-icon rt-icon--${icon}`}
    >
      <TabIconShapes icon={icon} />
    </svg>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** A real capture in a window frame, in the version that matches the site's theme. */
function AppWindow({ tab, active, first }: { tab: RenorTab; active: boolean; first: boolean }) {
  const common = {
    width: tab.shot.width,
    height: tab.shot.height,
    sizes: '(min-width: 1024px) 44rem, 100vw',
    alt: tab.shot.alt,
    preload: first,
  } as const;
  return (
    <figure className="overflow-hidden rounded-panel border border-border bg-card shadow-2xl shadow-black/20 dark:shadow-black/50">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-2.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-line-strong" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-line-strong" />
        <span aria-hidden="true" className="size-2.5 rounded-full bg-line-strong" />
        <span className="ml-3 min-w-0 flex-1 truncate text-sm font-medium text-muted-foreground">
          Renor · {tab.label}
        </span>
        <span className="hidden shrink-0 rounded-full border border-border px-2.5 py-0.5 text-sm text-muted-foreground sm:inline">
          Screenshot · clip coming soon
        </span>
      </div>
      <div className="rt-stage overflow-hidden" data-active={active || undefined}>
        <Image
          {...common}
          src={tourImage(tab.shot, 'light')}
          className="h-auto w-full dark:hidden"
        />
        <Image
          {...common}
          src={tourImage(tab.shot, 'dark')}
          className="hidden h-auto w-full dark:block"
        />
      </div>
      <figcaption className="border-t border-border px-4 py-3 type-meta text-muted-foreground">
        {TOUR_CAPTION}
      </figcaption>
    </figure>
  );
}

export function ProductTour() {
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  const running = autoplayRunning({ reducedMotion, interacted, engaged, inView, pageVisible });
  const showProgress = autoplayEnabled({ reducedMotion, interacted });

  /** The visitor chose a tab: show it, stop autoplay, and make the URL shareable. */
  const choose = useCallback((next: number, focus = false) => {
    setIndex(next);
    setInteracted(true);
    const tab = RENOR_TABS[next];
    if (tab) window.history.replaceState(null, '', `#${tab.id}`);
    if (focus) tabRefs.current[next]?.focus();
  }, []);

  // Deep links: on arrival and whenever the hash changes (/renor#code-ai, or #code).
  useEffect(() => {
    const fromHash = (scroll: boolean) => {
      const target = tabIndexFromHash(window.location.hash);
      if (target === null) return;
      setIndex(target);
      setInteracted(true);
      // An alias has no element of its own to scroll to: bring the tour into view.
      const tab = RENOR_TABS[target];
      if (scroll && tab && window.location.hash !== `#${tab.id}`) {
        rootRef.current?.scrollIntoView({ block: 'start' });
      }
    };
    fromHash(true);
    const onHash = () => fromHash(true);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Pause off screen and while the browser tab is hidden.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      {
        threshold: 0.35,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  // Keep the selected tab visible in the phone segmented control.
  useEffect(() => {
    const node = tabRefs.current[index];
    const list = node?.parentElement;
    if (!node || !list || list.scrollWidth <= list.clientWidth) return;
    // Line the tab up with the list's own 20px inset (px-5).
    const left =
      list.scrollLeft + node.getBoundingClientRect().left - list.getBoundingClientRect().left - 20;
    list.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [index, reducedMotion]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const next = nextTabIndex(index, event.key, RENOR_TABS.length);
    if (next === null) return;
    event.preventDefault();
    choose(next, true);
  };

  const advance = () => setIndex((current) => (current + 1) % RENOR_TABS.length);

  return (
    <div
      ref={rootRef}
      className="mt-12 scroll-mt-24"
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEngaged(false);
      }}
    >
      <div
        role="tablist"
        aria-label="Renor areas"
        className="rt-list -mx-5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >
        {RENOR_TABS.map((tab, tabIndex) => {
          const selected = tabIndex === index;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tabIndex] = node;
              }}
              type="button"
              role="tab"
              id={tab.id}
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(tabIndex)}
              onKeyDown={onKeyDown}
              data-selected={selected || undefined}
              className="rt-tab group relative flex min-h-14 shrink-0 snap-start items-center gap-3 overflow-hidden px-4 py-3 text-left"
            >
              <span className="rt-icon-wrap flex size-9 shrink-0 items-center justify-center rounded-chip">
                <TabIcon icon={tab.icon} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.9375rem] leading-tight font-semibold whitespace-nowrap">
                  {tab.label}
                </span>
                <span className="rt-sub mt-0.5 block text-sm whitespace-nowrap">
                  {String(tabIndex + 1).padStart(2, '0')} /{' '}
                  {String(RENOR_TABS.length).padStart(2, '0')}
                </span>
              </span>
              {selected && showProgress ? (
                <span
                  key={`${tab.id}-progress`}
                  aria-hidden="true"
                  className="rt-progress"
                  data-running={running || undefined}
                  style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                  onAnimationEnd={advance}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {RENOR_TABS.map((tab, tabIndex) => {
        const selected = tabIndex === index;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-${tab.id}`}
            aria-labelledby={tab.id}
            hidden={!selected}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: the ARIA tabs pattern makes the panel focusable
            tabIndex={0}
            className="rt-panel mt-8 rounded-panel focus-visible:outline-offset-4"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14">
              <div>
                <StatusBadge status={tab.area.status} />
                <h3 className="mt-5 font-display text-[1.75rem] leading-tight font-semibold tracking-tight text-balance sm:text-[2rem]">
                  {tab.value}
                </h3>
                <ul className="mt-6 grid gap-3">
                  {tab.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 type-copy text-muted-foreground">
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-link" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={RENOR_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-[0.9375rem] font-semibold text-foreground transition-colors hover:border-line-strong hover:bg-accent"
                >
                  Try {tab.label} in the web preview
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
              <AppWindow tab={tab} active={selected} first={tabIndex === 0} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
