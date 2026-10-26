// @polsia:user-owned — Renor's living orb, drawn as vectors: the header and footer mark, the Ask
// Renor launcher and the Guide's avatar.
//
// The same identity as the Renor app's orb, kept light for a marketing site: the sphere, its
// lightning web and the rim are inline SVG (sharp at 1x, 2x and 3x), and the life in it is CSS
// on separate layers that only ever animate `transform` and `opacity`, so the compositor runs it
// and the main thread stays idle. Two plasma layers turn against each other (the web shimmers
// where they cross), a glint sweeps the rim, sparkles come and go, and on the launcher a mote
// orbits on a tilted path and the corona breathes (living-orb.css).
//
// Motion stops while the orb is off-screen or the tab is hidden, and under reduced motion the
// orb rests in a composed still pose. Geometry and colours: src/lib/business/living-orb.ts.
'use client';

import { type CSSProperties, useEffect, useId, useRef } from 'react';
import {
  BACK_WEB_SCALE,
  ORB_DETAIL,
  ORB_SPARKLES,
  ORB_VIEWBOX,
  type OrbDetail,
  orbVeins,
  SPARKLE_PATH,
} from '@/lib/business/living-orb';
import { cn } from '@/lib/utils';
import './living-orb.css';

export interface LivingOrbProps {
  className?: string;
  /** `mark` for 16–36px (header, footer, avatars); `launcher` for 48px and up. */
  detail?: OrbDetail;
  /** `false` holds the still pose (a long list of avatars should not all move). */
  animate?: boolean;
  /** `thinking` sends the glint racing round the rim: the Guide is working on an answer. */
  state?: 'idle' | 'thinking';
}

// ── Pause when unseen ───────────────────────────────────────────────────────────────────────
// One observer for every orb on the page. It flips a data attribute straight on the element, so
// pausing never re-renders React.
let observer: IntersectionObserver | null = null;
function watch(node: HTMLElement): () => void {
  if (typeof IntersectionObserver !== 'function') return () => {};
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.toggleAttribute('data-orb-offscreen', !entry.isIntersecting);
      }
    },
    { rootMargin: '64px' },
  );
  observer.observe(node);
  return () => observer?.unobserve(node);
}

let hiddenTabWatched = false;
function watchHiddenTab() {
  if (hiddenTabWatched || typeof document === 'undefined') return;
  hiddenTabWatched = true;
  const root = document.documentElement;
  const update = () => root.toggleAttribute('data-tab-hidden', document.hidden);
  update();
  document.addEventListener('visibilitychange', update);
}

const VB = `0 0 ${ORB_VIEWBOX} ${ORB_VIEWBOX}`;
const MID = ORB_VIEWBOX / 2;
const stop = (offset: number, colour: string, opacity = 1) => (
  <stop offset={offset} style={{ stopColor: `var(${colour})`, stopOpacity: opacity }} />
);

/** The lightning web of one plasma layer: a soft glow, a bright core, and the nodes. */
function Plasma({ detail, layer, ids }: { detail: OrbDetail; layer: 'front' | 'back'; ids: Ids }) {
  const recipe = ORB_DETAIL[detail];
  const { paths, nodes } = orbVeins(detail, layer);
  const scale = layer === 'front' ? 1 : BACK_WEB_SCALE;
  // The web is one path, defined once and drawn twice (glow, then core) with <use>.
  const web = `${ids.web}-${layer}`;
  return (
    <svg viewBox={VB} className="lorb-svg" focusable="false" aria-hidden="true">
      <defs>
        <path id={web} d={paths.join('')} />
      </defs>
      <g clipPath={`url(#${ids.clip})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <use href={`#${web}`} className="lorb-vein-glow" strokeWidth={recipe.glow * scale} />
        <use href={`#${web}`} className="lorb-vein-core" strokeWidth={recipe.core * scale} />
        {layer === 'front' ? (
          <g fill={`url(#${ids.node})`}>
            {nodes.map((n) => (
              <circle key={`${n.x},${n.y}`} cx={n.x} cy={n.y} r={recipe.node * n.weight} />
            ))}
          </g>
        ) : null}
      </g>
    </svg>
  );
}

interface Ids {
  body: string;
  heart: string;
  rim: string;
  violet: string;
  spec: string;
  node: string;
  clip: string;
  web: string;
}

export function LivingOrb({
  className,
  detail = 'mark',
  animate = true,
  state = 'idle',
}: LivingOrbProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ids: Ids = {
    body: `lorb-b${uid}`,
    heart: `lorb-h${uid}`,
    rim: `lorb-r${uid}`,
    violet: `lorb-v${uid}`,
    spec: `lorb-s${uid}`,
    node: `lorb-n${uid}`,
    clip: `lorb-c${uid}`,
    web: `lorb-w${uid}`,
  };
  const R = ORB_DETAIL[detail].radius;

  useEffect(() => {
    const node = ref.current;
    if (!node || !animate) return;
    watchHiddenTab();
    return watch(node);
  }, [animate]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      data-orb-state={state}
      data-orb-still={animate ? undefined : ''}
      className={cn('lorb', `lorb--${detail}`, className)}
      style={{ '--lorb-inset': `${MID - R}%` } as CSSProperties}
    >
      <span className="lorb-corona" />
      {/* The sphere: deep body lit from the upper left, plasma light pooled inside, a white-hot heart. */}
      <svg viewBox={VB} className="lorb-svg" focusable="false" aria-hidden="true">
        <defs>
          <radialGradient
            id={ids.body}
            cx={MID}
            cy={MID}
            r={R}
            fx={MID - R * 0.34}
            fy={MID - R * 0.44}
            gradientUnits="userSpaceOnUse"
          >
            {stop(0, '--lorb-body-hi')}
            {stop(0.56, '--lorb-body-mid')}
            {stop(1, '--lorb-body-lo')}
          </radialGradient>
          <radialGradient id={ids.heart} cx={MID} cy={MID + 2} r={R} gradientUnits="userSpaceOnUse">
            {stop(0, '--lorb-vein', 0.38)}
            {stop(0.4, '--lorb-vein', 0.12)}
            {stop(1, '--lorb-vein', 0)}
          </radialGradient>
          <radialGradient id={ids.node}>
            <stop offset={0} stopColor="white" />
            <stop offset={0.18} stopColor="white" />
            {stop(0.4, '--lorb-vein-hot', 0.85)}
            {stop(1, '--lorb-vein', 0)}
          </radialGradient>
          <clipPath id={ids.clip}>
            <circle cx={MID} cy={MID} r={R - 0.6} />
          </clipPath>
        </defs>
        <circle cx={MID} cy={MID} r={R} fill={`url(#${ids.body})`} />
        <circle cx={MID} cy={MID} r={R} fill={`url(#${ids.heart})`} />
      </svg>
      <span className="lorb-plasma lorb-plasma--back">
        <Plasma detail={detail} layer="back" ids={ids} />
      </span>
      <span className="lorb-plasma lorb-plasma--front">
        <Plasma detail={detail} layer="front" ids={ids} />
      </span>
      {/* The clean luminous rim, a violet rim light low on the right, and the specular light. */}
      <svg viewBox={VB} className="lorb-svg lorb-rim" focusable="false" aria-hidden="true">
        <defs>
          <radialGradient id={ids.rim} cx={MID} cy={MID} r={R} gradientUnits="userSpaceOnUse">
            {stop(0.8, '--lorb-rim', 0)}
            {stop(0.93, '--lorb-rim', 0.42)}
            {stop(0.975, '--lorb-rim-hot', 1)}
            {stop(1, '--lorb-rim', 0.8)}
          </radialGradient>
          <radialGradient
            id={ids.violet}
            cx={MID + R * 0.5}
            cy={MID + R * 0.55}
            r={R * 0.75}
            gradientUnits="userSpaceOnUse"
          >
            {stop(0, '--lorb-violet', 0.38)}
            {stop(1, '--lorb-violet', 0)}
          </radialGradient>
          <radialGradient
            id={ids.spec}
            cx={MID - R * 0.32}
            cy={MID - R * 0.46}
            r={R * 0.42}
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset={0}
              style={{ stopColor: 'var(--lorb-vein-hot)', stopOpacity: 'var(--lorb-spec)' }}
            />
            {stop(1, '--lorb-vein-hot', 0)}
          </radialGradient>
        </defs>
        <circle cx={MID} cy={MID} r={R} fill={`url(#${ids.violet})`} />
        <circle cx={MID} cy={MID} r={R} fill={`url(#${ids.rim})`} />
        <circle cx={MID} cy={MID} r={R} fill={`url(#${ids.spec})`} />
      </svg>
      <span className="lorb-sweep" />
      {detail === 'launcher' ? (
        <span className="lorb-tilt">
          <span className="lorb-path">
            <span className="lorb-mote" />
          </span>
        </span>
      ) : null}
      {ORB_SPARKLES.slice(0, detail === 'launcher' ? 2 : 1).map((sparkle, index) => (
        <span
          key={sparkle.x}
          className="lorb-sparkle"
          data-sparkle={index}
          style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%`, width: `${sparkle.size}%` }}
        >
          <svg viewBox="0 0 24 24" className="lorb-svg" focusable="false" aria-hidden="true">
            <path d={SPARKLE_PATH} />
          </svg>
        </span>
      ))}
    </span>
  );
}
