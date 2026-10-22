// @polsia:user-owned — the "What do you need?" guide: every card leads somewhere real,
// and every URL comes from its single source rather than a copy.
import { describe, expect, it } from 'vitest';
import { CHANNELS, RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import { channelUrl, NEEDS } from '../../src/lib/business/guide';
import { RENOR_WEB_PREVIEW_URL } from '../../src/lib/business/renor-links';

const urlOf = (id: string) => CHANNELS.find((channel) => channel.id === id)?.url;
const need = (id: string) => NEEDS.find((entry) => entry.id === id);
const hrefs = (id: string) => need(id)?.actions.map((action) => action.href) ?? [];

describe('What do you need? guide', () => {
  it('has one card per need, in the founder’s order', () => {
    expect(NEEDS.map((entry) => entry.id)).toEqual(['hire', 'follow', 'renor', 'store', 'contact']);
  });

  it('sends "Hire the founder" to the founder’s Fiverr', () => {
    expect(hrefs('hire')).toEqual(['https://www.fiverr.com/abi_bim']);
    expect(hrefs('hire')).toEqual([urlOf('fiverr')]);
  });

  it('sends "Follow" to YouTube, TikTok and the links page', () => {
    expect(hrefs('follow')).toEqual([
      'https://www.youtube.com/@zero2proof',
      'https://www.tiktok.com/@sajadi90',
      'https://zero-to-proof-links.vercel.app',
    ]);
  });

  it('opens the Renor app from the single app-link constant', () => {
    expect(hrefs('renor')).toEqual([RENOR_APP_URL]);
    expect(RENOR_APP_URL).toBe(RENOR_WEB_PREVIEW_URL);
    expect(need('renor')?.benefit).toMatch(/install/i);
  });

  it('sends Store and Contact to their pages', () => {
    expect(hrefs('store')).toEqual(['/store']);
    expect(hrefs('contact')).toEqual(['/contact']);
  });

  it('gives every card a one-line benefit and exactly one primary button', () => {
    for (const entry of NEEDS) {
      expect(entry.benefit.length, entry.id).toBeGreaterThan(20);
      expect(entry.benefit.length, entry.id).toBeLessThanOrEqual(100);
      expect(entry.benefit, entry.id).not.toMatch(/\n/);
      expect(
        entry.actions.filter((action) => action.primary),
        entry.id,
      ).toHaveLength(1);
    }
  });

  it('marks external links as external, and only https ones', () => {
    for (const action of NEEDS.flatMap((entry) => entry.actions)) {
      const isExternal = /^https?:\/\//.test(action.href);
      expect(action.external, action.href).toBe(isExternal);
      if (isExternal) expect(action.href.startsWith('https://'), action.href).toBe(true);
    }
  });

  it('refuses a channel without a confirmed URL', () => {
    expect(channelUrl('fiverr')).toBe(urlOf('fiverr'));
    expect(() => channelUrl('nope' as never)).toThrow(/no confirmed URL/);
  });

  it('never uses the word the founder banned from copy', () => {
    const copy = JSON.stringify(NEEDS);
    expect(copy).not.toMatch(new RegExp(`\\b${'b'}${'ot'}s?\\b`, 'i'));
  });
});
