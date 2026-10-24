// @polsia:user-owned — the /renor product tour: one tab per Renor area, as data plus the small
// pure rules the tabs follow (deep links, keyboard, autoplay). Rendered by
// src/components/custom/product-tour.tsx; tested in tests/unit/renor-tabs.test.ts.
//
// Every claim here comes from RENOR_AREAS (ecosystem.ts) and every picture from TOUR
// (launch.ts): real captures of the Renor app. Statuses are read from RENOR_AREAS, never set here.
import { RENOR_AREAS, type RenorArea } from '@/lib/business/ecosystem';
import { TOUR, type TourShot } from '@/lib/business/launch';

export type RenorTabIcon = 'chat' | 'code' | 'builder' | 'office';

export interface RenorTab {
  /** The deep-link id: /renor#code-ai. */
  id: 'chat-ai' | 'code-ai' | 'website-builder' | 'project-office';
  /** Older anchors that should land on this tab (/renor#code from the home page and the Guide). */
  aliases: readonly string[];
  label: string;
  icon: RenorTabIcon;
  /** One line: what the area is for. */
  value: string;
  /** Three things it does today, taken from the area's `does` list. */
  bullets: readonly [string, string, string];
  area: RenorArea;
  shot: TourShot;
}

/** Autoplay: one tab every 8 seconds, until the visitor takes over. */
export const AUTOPLAY_MS = 8000;

function area(id: string): RenorArea {
  const found = RENOR_AREAS.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown Renor area: ${id}`);
  return found;
}

function shot(id: TourShot['id']): TourShot {
  const found = TOUR.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown tour shot: ${id}`);
  return found;
}

function three(items: readonly string[], picks: readonly [number, number, number]) {
  return picks.map((index) => {
    const item = items[index];
    if (!item) throw new Error(`Missing bullet ${index}`);
    return item;
  }) as unknown as readonly [string, string, string];
}

const chat = area('chat');
const code = area('code');
const builder = area('builder');
const office = area('project-office');

export const RENOR_TABS: readonly RenorTab[] = [
  {
    id: 'chat-ai',
    aliases: ['chat'],
    label: 'Chat AI',
    icon: 'chat',
    value: 'Ask, research and plan, with the sources Renor read.',
    bullets: three(chat.does, [0, 1, 3]),
    area: chat,
    shot: shot('chat'),
  },
  {
    id: 'code-ai',
    aliases: ['code'],
    label: 'Code AI',
    icon: 'code',
    value: 'Describe an app. Code AI writes it, previews it and checks what runs.',
    bullets: three(code.does, [0, 3, 2]),
    area: code,
    shot: shot('code'),
  },
  {
    id: 'website-builder',
    aliases: ['builder'],
    label: 'Website Builder',
    icon: 'builder',
    value: 'A responsive website, written from your own facts.',
    bullets: three(builder.does, [0, 1, 2]),
    area: builder,
    shot: shot('builder'),
  },
  {
    id: 'project-office',
    aliases: ['projects'],
    label: 'Project Office',
    icon: 'office',
    value: 'Notes, tasks and projects that stay with your chats and builds.',
    bullets: three(office.does, [0, 1, 2]),
    area: office,
    shot: shot('projects'),
  },
];

/** The tab a URL hash points at (its id or an older alias), or null. */
export function tabIndexFromHash(
  hash: string,
  tabs: readonly RenorTab[] = RENOR_TABS,
): number | null {
  const key = decodeURIComponent(hash.replace(/^#/, '')).toLowerCase();
  if (!key) return null;
  const index = tabs.findIndex((tab) => tab.id === key || tab.aliases.includes(key));
  return index >= 0 ? index : null;
}

/** ARIA tabs keyboard pattern: arrows wrap, Home/End jump. Other keys: null (not handled). */
export function nextTabIndex(current: number, key: string, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

export interface AutoplayConditions {
  /** prefers-reduced-motion: reduce. */
  reducedMotion: boolean;
  /** The visitor has chosen a tab (click, key or deep link): autoplay stops for good. */
  interacted: boolean;
  /** Pointer over the tour or focus inside it: autoplay pauses. */
  engaged: boolean;
  /** The tour is on screen. */
  inView: boolean;
  /** The browser tab is visible. */
  pageVisible: boolean;
}

/** Whether the progress bar runs and the tour advances. */
export function autoplayRunning(conditions: AutoplayConditions): boolean {
  return (
    !conditions.reducedMotion &&
    !conditions.interacted &&
    !conditions.engaged &&
    conditions.inView &&
    conditions.pageVisible
  );
}

/** Autoplay is offered at all (the progress bar is shown) unless motion is reduced or the visitor took over. */
export function autoplayEnabled(
  conditions: Pick<AutoplayConditions, 'reducedMotion' | 'interacted'>,
) {
  return !conditions.reducedMotion && !conditions.interacted;
}
