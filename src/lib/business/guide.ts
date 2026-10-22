// @polsia:user-owned — the "What do you need?" guide: one card per reason someone visits.
//
// Every URL comes from its single source (CHANNELS, RENOR_APP_URL, the nav
// routes), so a link corrected there is corrected here. tests/unit/guide.test.ts
// checks each card's destination against those sources.
import { CHANNELS, type Channel, RENOR_APP_URL } from '@/lib/business/ecosystem';

export type NeedId = 'hire' | 'follow' | 'renor' | 'plugins' | 'contact';
export type NeedIcon = 'briefcase' | 'play' | 'sparkles' | 'bag' | 'mail';

export interface NeedAction {
  label: string;
  /** Internal route or a verified https URL from its single source. */
  href: string;
  /** External destinations open in a new tab and say so to screen readers. */
  external: boolean;
  /** The card's main action is filled; the rest are outlined. */
  primary?: boolean;
  /** Set when the action is one of the confirmed channels. */
  channel?: Channel['id'];
}

export interface Need {
  id: NeedId;
  /** The need, in the visitor's words. */
  title: string;
  /** One line: what they get by clicking. */
  benefit: string;
  icon: NeedIcon;
  actions: readonly NeedAction[];
}

/** The confirmed URL of a channel. Throws at build time if a channel loses its URL. */
export function channelUrl(id: Channel['id']): string {
  const url = CHANNELS.find((channel) => channel.id === id)?.url;
  if (!url) throw new Error(`Channel "${id}" has no confirmed URL`);
  return url;
}

function channelAction(id: Channel['id'], label: string, primary = false): NeedAction {
  return { label, href: channelUrl(id), external: true, primary, channel: id };
}

export const NEEDS: readonly Need[] = [
  {
    id: 'hire',
    title: 'Hire the founder',
    benefit: 'Get freelance work done by the person who builds Renor, booked through Fiverr.',
    icon: 'briefcase',
    actions: [channelAction('fiverr', 'Hire on Fiverr', true)],
  },
  {
    id: 'follow',
    title: 'Follow the build',
    benefit: 'Watch Renor being built in public: the wins, the failures and the fixes.',
    icon: 'play',
    actions: [
      channelAction('youtube', 'YouTube', true),
      channelAction('tiktok', 'TikTok'),
      channelAction('links', 'All links'),
    ],
  },
  {
    id: 'renor',
    title: 'Use or install Renor',
    benefit:
      'Chat, code and build websites in your browser, free to start. Install it from its toolbar.',
    icon: 'sparkles',
    actions: [{ label: 'Open Renor', href: RENOR_APP_URL, external: true, primary: true }],
  },
  {
    id: 'plugins',
    title: 'Browse the Plugin Store',
    benefit: 'Ready-to-use digital kits, starting with TradeLaunch for electricians. Opening soon.',
    icon: 'bag',
    actions: [
      { label: 'Visit the Plugin Store', href: '/plugins', external: false, primary: true },
      channelAction('renor-labs', 'Renor Labs shop'),
    ],
  },
  {
    id: 'contact',
    title: 'Talk to us',
    benefit: 'Questions, partnerships or feedback. A person reads every message.',
    icon: 'mail',
    actions: [{ label: 'Contact us', href: '/contact', external: false, primary: true }],
  },
];
