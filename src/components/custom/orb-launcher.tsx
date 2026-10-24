// @polsia:user-owned — the Ask Renor launcher: Renor's orb, scaled down, bottom-right on every page.
//
// The orb is the same component as the /renor hero (RenorOrb). It shows five states (idle,
// hover/focus, typing, answering, error; see src/lib/business/orb-launcher.ts) and the Guide
// panel grows out of it. The panel's code (the Renor Guide) is loaded only when the visitor
// first opens it, or starts to (hover/focus), so it never weighs on the first page load.
//
// Deep links: /any-page#ask-renor opens Ask; #report-a-problem opens the report form. Other
// components can dispatch `new CustomEvent('renor-guide:open', { detail: { tab: 'report' } })`.
'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { RenorOrb } from '@/components/custom/renor-orb';
import {
  guideTabFromHash,
  IDLE_SIGNALS,
  launcherTiming,
  type OrbSignals,
  orbVisual,
  panelExpanded,
  panelMounted,
  panelReducer,
} from '@/lib/business/orb-launcher';
import './orb-launcher.css';

type Tab = 'ask' | 'report';

const OPEN_EVENT = 'renor-guide:open';

const loadGuide = () => import('@/components/custom/receptionist/receptionist');
const GuidePanel = dynamic(() => loadGuide().then((mod) => mod.Receptionist), { ssr: false });

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

export function OrbLauncher() {
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [phase, dispatch] = useReducer(panelReducer, 'closed');
  // The Guide's code loads on first open and then stays, so a conversation survives closing.
  const [loaded, setLoaded] = useState(false);
  const [request, setRequest] = useState<{ tab: Tab; n: number }>({ tab: 'ask', n: 0 });
  const [hovered, setHovered] = useState(false);
  const [activity, setActivity] = useState<Pick<OrbSignals, 'typing' | 'answering'>>({
    typing: false,
    answering: false,
  });
  const [error, setError] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const timing = launcherTiming(reducedMotion);

  const open = useCallback((tab: Tab = 'ask') => {
    setLoaded(true);
    setRequest((current) => ({ tab, n: current.n + 1 }));
    dispatch({ type: 'open' });
  }, []);
  const close = useCallback(() => dispatch({ type: 'close' }), []);

  // Finish the open/close transition on a timer that matches the CSS animation.
  useEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') return;
    const ms = phase === 'opening' ? timing.open : timing.close;
    const timer = window.setTimeout(() => dispatch({ type: 'settled' }), ms);
    return () => window.clearTimeout(timer);
  }, [phase, timing.open, timing.close]);

  // Deep links and the open event.
  useEffect(() => {
    const fromHash = () => {
      const tab = guideTabFromHash(window.location.hash);
      if (tab) open(tab);
    };
    const fromEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ tab?: Tab }>).detail;
      open(detail?.tab === 'report' ? 'report' : 'ask');
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    window.addEventListener(OPEN_EVENT, fromEvent);
    return () => {
      window.removeEventListener('hashchange', fromHash);
      window.removeEventListener(OPEN_EVENT, fromEvent);
    };
  }, [open]);

  // Pause the orb's motion while the tab is in the background.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => root.toggleAttribute('data-tab-hidden', document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  // Error: tint toward --danger for 300ms (150ms under reduced motion), then back.
  const onError = useCallback(() => setError(true), []);
  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(false), timing.errorFlash);
    return () => window.clearTimeout(timer);
  }, [error, timing.errorFlash]);

  const expanded = panelExpanded(phase);
  const state = orbVisual({ ...IDLE_SIGNALS, ...activity, hovered, error });
  const warm = () => {
    setHovered(true);
    // Start fetching the Guide before the click lands.
    void loadGuide();
  };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        data-state={state}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-label="Ask Renor: questions and problem reports"
        onClick={() => (expanded ? close() : open('ask'))}
        onPointerEnter={warm}
        onPointerLeave={() => setHovered(false)}
        onFocus={warm}
        onBlur={() => setHovered(false)}
        className="ol-launcher"
      >
        <RenorOrb sizes="56px" />
        <span className="ol-ripple" aria-hidden="true" />
        <span className="ol-tint" aria-hidden="true" />
        <span className="ol-tip" aria-hidden="true">
          Ask Renor
        </span>
      </button>
      {loaded ? (
        <GuidePanel
          phase={phase}
          request={request}
          onClose={close}
          onActivity={setActivity}
          onError={onError}
          returnFocusRef={launcherRef}
          mounted={panelMounted(phase)}
        />
      ) : null}
    </>
  );
}
