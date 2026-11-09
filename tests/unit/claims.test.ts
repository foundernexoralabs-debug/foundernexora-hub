// @polsia:user-owned — the claims audit of 9 November 2026: nothing on the site may imply that
// Renor works automatically for ever, keeps running while the device is off, runs in the
// background today, or offers unlimited hosted AI. The app's Release 3 facts, said plainly.
import { describe, expect, it } from 'vitest';
import { NOT_YET } from '../../src/lib/business/cocreate';
import { llmsText } from '../../src/lib/business/llms';
import { OWN_AI } from '../../src/lib/business/operator';
import { PLANS } from '../../src/lib/business/plans';
import {
  CREDIT_PACK_NOTE,
  ONE_TIME_FAQ,
  ONE_TIME_NOTICE,
  ONE_TIME_OFFERS,
} from '../../src/lib/business/pricing';
import { LEDGER } from '../../src/lib/business/vision';

const PRICING_COPY = JSON.stringify({ ONE_TIME_OFFERS, ONE_TIME_FAQ, ONE_TIME_NOTICE, PLANS });

describe('claims (Release 3 facts)', () => {
  it('never promises for-ever automation, machine-off work or unlimited hosted AI', () => {
    const all = PRICING_COPY + JSON.stringify({ OWN_AI, LEDGER, NOT_YET });
    expect(all).not.toMatch(/\bfor ?ever\b|works automatically|24\/7|while you sleep/i);
    expect(all).not.toMatch(/unlimited (hosted|AI|credits)/i);
    expect(all).not.toMatch(/background autonomous/i);
  });

  it('says Lifetime is one payment and not live, and packs are one-time', () => {
    const lifetime = ONE_TIME_OFFERS.find((offer) => offer.id === 'lifetime');
    expect(lifetime?.price).toBe('£99');
    expect(lifetime?.period).toBe('one payment');
    expect(lifetime?.state).toBe('not-on-sale');
    expect(ONE_TIME_NOTICE).toMatch(/test mode/);
    expect(CREDIT_PACK_NOTE).toMatch(/^One payment each/);
  });

  it('ties local models to the user’s own computer being on', () => {
    expect(OWN_AI.find((item) => item.id === 'local')?.text).toMatch(/computer is on/);
    for (const offer of ONE_TIME_OFFERS)
      for (const line of offer.includes.filter((l) => /local model/i.test(l)))
        expect(line, offer.id).toMatch(/your own computer/);
  });

  it('answers the machine-off question, and labels background work as not live', () => {
    const faq = ONE_TIME_FAQ.find((entry) => /computer is off/.test(entry.q));
    expect(faq?.a).toMatch(/^No\./);
    expect(faq?.a).toMatch(/free weekly allowance, with fallback/);
    const background = LEDGER.find((entry) => entry.id === 'background');
    expect(background?.status).toBe('in-progress');
    expect(background?.detail).toMatch(/Not live/);
  });

  it('tells AI assistants the same limits', () => {
    const text = llmsText();
    expect(text).toContain('## Limits');
    expect(text).toMatch(/Nothing runs in the background while the user's device is off/);
    expect(text).toMatch(/payments are in test mode/);
    expect(text).toContain('19–20 November 2026');
  });
});
