// @polsia:user-owned — Renor the AI operator: the homepage, /vision, /cocreate and pricing flag
// say only true things, and every route a visitor is sent to exists.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CAPABILITIES } from '../../src/lib/business/capabilities';
import {
  COCREATE_URL,
  DEMO_VIDEO,
  EVENT,
  NOT_YET,
  QR_CODE,
  STORY_INTRO,
  WALKTHROUGH,
} from '../../src/lib/business/cocreate';
import { AUDIENCE_ROUTES, HERO, LOOP, PROOF } from '../../src/lib/business/operator';
import {
  CREDIT_PACKS,
  isOneTime,
  ONE_TIME_OFFERS,
  PRICING_MODEL,
  pricingSummary,
} from '../../src/lib/business/pricing';
import { CLAIM_STATUS, LEDGER, ledgerBy } from '../../src/lib/business/vision';
import { navItems } from '../../src/lib/nav';

const root = path.resolve(__dirname, '../..');
const read = (file: string) => readFileSync(path.join(root, file), 'utf-8');
const appDir = path.join(root, 'src/app');

function routes(dir = appDir, prefix = ''): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) {
      if (entry === 'page.tsx') found.push(prefix || '/');
      continue;
    }
    if (entry === 'api' || entry.startsWith('_')) continue;
    const segment = /^\(.*\)$/.test(entry) ? '' : `/${entry}`;
    found.push(...routes(full, prefix + segment));
  }
  return found;
}
const ROUTES = new Set(routes());

/** The canvas size from a WebP file's first chunk (VP8, VP8L or VP8X). */
function webpSize(bytes: Buffer): { width: number; height: number } {
  const chunk = bytes.subarray(12, 16).toString('latin1');
  if (chunk === 'VP8X')
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
}
const HOME_SOURCE = read('src/components/custom/operator-home.tsx');

/** Every string in the operator story, flattened, for copy rules. */
const COPY = JSON.stringify({ HERO, LOOP, PROOF, AUDIENCE_ROUTES, LEDGER, ONE_TIME_OFFERS });

describe('the operator story', () => {
  it('leads with the outcome and the two actions the brief asks for', () => {
    expect(HERO.title).toBe('Tell Renor the outcome.');
    expect(HERO.primary).toEqual({ label: 'Open Renor', href: 'https://app.renor.app' });
    expect(HERO.secondary.href).toBe('#how');
    expect(HOME_SOURCE).toContain('id="how"');
  });

  it('walks outcome → plan → work → verify → proof', () => {
    expect(LOOP.map((step) => step.step)).toEqual(['Outcome', 'Plan', 'Work', 'Verify', 'Proof']);
  });

  it('never uses invented businesses, the word bot, or placeholder text', () => {
    expect(COPY).not.toMatch(/Larkspur|lorem|ipsum|\bbots?\b|testimonial/i);
  });
});

describe('proof', () => {
  it('describes only capabilities that are live or in preview in the app', () => {
    for (const item of PROOF) {
      const capability = CAPABILITIES.find((c) => c.id === item.capabilityId);
      expect(capability, item.id).toBeDefined();
      expect(['live', 'preview'], item.id).toContain(capability?.status);
    }
  });

  it('shows real Renor screens that exist, with alt text', () => {
    for (const item of PROOF) {
      expect(existsSync(path.join(root, 'public', item.image.src)), item.image.src).toBe(true);
      expect(item.image.src).toMatch(/^\/assets\/renor\/proof\//);
      expect(item.image.alt.length).toBeGreaterThan(20);
    }
  });
});

describe('audience router', () => {
  it('offers business owner, developer, investor and press', () => {
    expect(AUDIENCE_ROUTES.map((route) => route.id)).toEqual([
      'business',
      'developer',
      'investor',
      'press',
    ]);
  });

  it('sends every reader to a real page, a real section or a checked link', () => {
    for (const route of AUDIENCE_ROUTES) {
      expect(route.links.length).toBe(3);
      for (const link of route.links) {
        if (link.href.startsWith('#')) {
          expect(HOME_SOURCE, link.href).toContain(`id="${link.href.slice(1)}"`);
        } else if (link.href.startsWith('/')) {
          expect(ROUTES.has(link.href.split('#')[0] ?? ''), link.href).toBe(true);
        } else {
          expect(link.href, link.href).toMatch(/^(https:\/\/|mailto:)/);
        }
      }
    }
  });
});

describe('vision-to-proof ledger', () => {
  it('has all three columns, each with entries', () => {
    for (const status of Object.keys(CLAIM_STATUS) as (keyof typeof CLAIM_STATUS)[]) {
      expect(ledgerBy(status).length, status).toBeGreaterThan(0);
    }
  });

  it('backs every live claim with a live or preview capability', () => {
    for (const entry of ledgerBy('live')) {
      const capability = CAPABILITIES.find((c) => c.id === entry.capabilityId);
      expect(['live', 'preview'], entry.id).toContain(capability?.status);
    }
  });

  it('never ties an unshipped claim to a capability, and never marks one achieved', () => {
    for (const entry of LEDGER.filter((e) => e.status !== 'live')) {
      expect(entry.capabilityId, entry.id).toBeUndefined();
      expect(entry.achieved, entry.id).toBeUndefined();
      expect(entry.since, entry.id).toMatch(/^\d{1,2} \w+ 2026$/);
    }
  });

  it('labels robotics, governments, science and space as future vision only', () => {
    for (const entry of LEDGER) {
      if (/robot|government|space|science/i.test(`${entry.claim} ${entry.detail}`)) {
        expect(entry.status, entry.id).toBe('future');
      }
    }
  });
});

describe('pricing flag', () => {
  it('is one switch with two known values', () => {
    expect(['one-time', 'monthly']).toContain(PRICING_MODEL);
    expect(pricingSummary('one-time')).toMatch(/£99 once/);
    expect(pricingSummary('monthly')).toMatch(/£12/);
  });

  it('sells nothing yet: Free opens the app, Lifetime only joins an early list', () => {
    const [free, lifetime] = ONE_TIME_OFFERS;
    expect(free?.action.href).toBe('https://app.renor.app');
    expect(lifetime?.state).toBe('not-on-sale');
    expect(lifetime?.action.href).toMatch(/^mailto:/);
    expect(COPY).not.toMatch(/checkout\.stripe|buy\.stripe|plugandpay\.com\/checkout/);
  });

  it('uses the app’s recommended one-time prices', () => {
    expect(lifetime()).toBe('£99');
    expect(CREDIT_PACKS.map((pack) => [pack.credits, pack.price])).toEqual([
      [2000, '£5'],
      [6000, '£13'],
      [16000, '£34'],
    ]);
    function lifetime() {
      return ONE_TIME_OFFERS.find((offer) => offer.id === 'lifetime')?.price;
    }
  });
  it('keeps the billing page and Terms in step with the flag', () => {
    const billing = read('src/app/(custom)/renor/billing/page.tsx');
    const terms = read('src/app/(custom)/terms/page.tsx');
    expect(billing).toContain('isOneTime');
    expect(terms).toContain('isOneTime');
    expect(isOneTime('monthly')).toBe(false);
  });
});

describe('Co-Create', () => {
  it('has a QR code for the production /cocreate address', () => {
    const svg = read(`public${QR_CODE.src}`);
    expect(COCREATE_URL).toBe('https://renor.app/cocreate');
    expect(svg).toContain(COCREATE_URL);
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 33 33"/);
  });

  it('shows no video until a real recording exists', () => {
    expect(DEMO_VIDEO).toBeNull();
  });

  it('says 19–20 November 2026 everywhere, starting on the 19th', () => {
    expect(EVENT.date).toBe('19–20 November 2026');
    expect(EVENT.iso).toBe('2026-11-19');
    expect(EVENT.endIso).toBe('2026-11-20');
    const page = read('src/app/(custom)/cocreate/page.tsx');
    expect(page).toContain('EVENT.date');
    for (const file of ['src/lib/business/operator.ts', 'src/app/(custom)/cocreate/page.tsx'])
      expect(read(file), file).not.toMatch(/'19 November 2026'|`19 November 2026`/);
  });

  it('tells the story in order: you, the problem, the mission, then the run', () => {
    expect(STORY_INTRO.map((beat) => beat.id)).toEqual(['you', 'problem', 'mission']);
    expect(WALKTHROUGH.map((step) => step.stage)).toEqual([
      'Execution',
      'Execution',
      'Approval',
      'Verification',
      'Receipt',
    ]);
  });

  it('builds the offline demo only from real crops of Renor, shown at their real size', () => {
    for (const step of WALKTHROUGH) {
      expect(step.image.src, step.id).toMatch(/^\/assets\/renor\/proof\/[a-z-]+\.webp$/);
      const bytes = readFileSync(path.join(root, 'public', step.image.src));
      expect(bytes.subarray(8, 12).toString('latin1'), step.id).toBe('WEBP');
      expect(webpSize(bytes), step.id).toEqual({
        width: step.image.width,
        height: step.image.height,
      });
      expect(step.image.alt.length, step.id).toBeGreaterThan(20);
    }
    const copy = JSON.stringify({ STORY_INTRO, WALKTHROUGH, NOT_YET });
    expect(copy).not.toMatch(/Larkspur|lorem|\bbots?\b|testimonial|\d+%|customers? (say|love)/i);
  });

  it('says what is not live yet, in plain words', () => {
    expect(NOT_YET.join(' ')).toMatch(/device is off/);
    expect(NOT_YET.join(' ')).toMatch(/Ollama.*computer has to be on/);
    expect(NOT_YET.join(' ')).toMatch(/not on sale yet/);
  });

  it('is reachable from the navigation, with /vision', () => {
    const hrefs = navItems.map((item) => item.href);
    expect(hrefs).toContain('/cocreate');
    expect(hrefs).toContain('/vision');
  });
});

describe('/llms.txt', () => {
  it('describes Renor accurately, with the three statuses kept apart', async () => {
    const { llmsText } = await import('../../src/lib/business/llms');
    const text = llmsText();
    expect(text).toMatch(/^# Renor\n\n> Renor/);
    expect(text).toContain('an AI operator, not a chatbot');
    expect(text).toContain('## Live today');
    expect(text).toContain('## Future vision (not built; a direction, not a claim)');
    expect(text).toContain('https://app.renor.app');
    expect(text).not.toMatch(/Larkspur|\bbots?\b|testimonial/i);
  });
});
