// @vitest-environment node
// @polsia:user-owned — /renor/capabilities stays honest, complete and reachable.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CAPABILITIES,
  CAPABILITIES_CHECKED,
  CAPABILITIES_PATH,
  CAPABILITY_AREAS,
  CAPABILITY_STATUS,
  CAPABILITY_STATUS_ORDER,
  capabilitiesIn,
  RENOR_APP_ADDRESS,
  RENOR_APP_HOST,
  roomUrl,
  statusCounts,
  usableCapabilityNames,
} from '../../src/lib/business/capabilities';
import { RENOR_APP_URL } from '../../src/lib/business/ecosystem';
import { FEATURES } from '../../src/lib/business/launch';
import { PLANS } from '../../src/lib/business/plans';
import { navItems } from '../../src/lib/nav';

const root = path.resolve(__dirname, '../..');

/** Words that present something as usable now. A planned item must not use them about itself. */
const AVAILABLE_NOW = /\b(?:available now|is live|out now|ready to use|use it today|try it now)\b/i;

describe('statuses', () => {
  it('uses only live, preview and planned, each shown on the page', () => {
    expect([...CAPABILITY_STATUS_ORDER]).toEqual(['live', 'preview', 'planned']);
    for (const capability of CAPABILITIES)
      expect(CAPABILITY_STATUS_ORDER, capability.id).toContain(capability.status);
    const counts = statusCounts();
    for (const status of CAPABILITY_STATUS_ORDER) expect(counts[status], status).toBeGreaterThan(0);
    expect(counts.live + counts.preview + counts.planned).toBe(CAPABILITIES.length);
  });

  it('says what each status means, and planned means you cannot use it today', () => {
    expect(CAPABILITY_STATUS.planned.description).toMatch(/not in the app yet/i);
    expect(CAPABILITY_STATUS.preview.description).toMatch(/still being proven/i);
    expect(CAPABILITY_STATUS.live.description).toMatch(/real run/i);
  });

  it('never describes a planned item as available', () => {
    for (const capability of CAPABILITIES.filter((c) => c.status === 'planned')) {
      expect(capability.text, capability.id).not.toMatch(AVAILABLE_NOW);
      expect(capability.text, capability.id).toMatch(
        /not (?:in the app|on sale|ready)|in development|once it opens|today you|appears only after/i,
      );
    }
  });

  it('keeps the things that are not built or not for sale planned', () => {
    const status = (id: string) => CAPABILITIES.find((c) => c.id === id)?.status;
    expect(status('access-paid-plans')).toBe('planned');
    expect(status('builder-publish')).toBe('planned');
    expect(status('access-desktop')).toBe('planned');
    expect(status('access-extensions')).toBe('planned');
    expect(status('models-paste-key')).toBe('planned');
    expect(status('code-computer-engine')).toBe('planned');
  });

  it('agrees with the /renor feature cards on what is planned', () => {
    const features = new Map(FEATURES.map((feature) => [feature.id, feature]));
    for (const capability of CAPABILITIES) {
      if (!capability.feature) continue;
      const feature = features.get(capability.feature);
      expect(feature, `${capability.id} → ${capability.feature}`).toBeDefined();
      expect(capability.status === 'planned', capability.id).toBe(feature?.status === 'planned');
    }
    for (const feature of FEATURES) {
      expect(
        CAPABILITIES.some((capability) => capability.feature === feature.id),
        `feature ${feature.id} has no capability`,
      ).toBe(true);
    }
  });

  it('feeds only usable capabilities to search engines', () => {
    const names = usableCapabilityNames();
    expect(names).toHaveLength(CAPABILITIES.filter((c) => c.status !== 'planned').length);
    for (const capability of CAPABILITIES.filter((c) => c.status === 'planned'))
      expect(names).not.toContain(capability.name);
  });
});

describe('content', () => {
  it('has unique ids and names, and every capability belongs to a listed area', () => {
    expect(new Set(CAPABILITIES.map((c) => c.id)).size).toBe(CAPABILITIES.length);
    expect(new Set(CAPABILITIES.map((c) => c.name)).size).toBe(CAPABILITIES.length);
    const areas = new Set(CAPABILITY_AREAS.map((area) => area.id));
    for (const capability of CAPABILITIES) expect(areas, capability.id).toContain(capability.area);
    for (const area of CAPABILITY_AREAS)
      expect(capabilitiesIn(area.id).length, area.id).toBeGreaterThan(0);
  });

  it('covers the rooms the app has: Chat, Code AI, Website Builder, notes, tasks, voice and plans', () => {
    const text = JSON.stringify(CAPABILITIES).toLowerCase();
    for (const word of [
      'chat',
      'code ai',
      'website builder',
      'notes',
      'tasks',
      'voice',
      'renor computer',
    ])
      expect(text, word).toContain(word);
    expect(CAPABILITIES.find((c) => c.id === 'voice-read-aloud')?.name).toBe('Six free voices');
  });

  it('lists each room most available first', () => {
    for (const area of CAPABILITY_AREAS) {
      const order = capabilitiesIn(area.id).map((c) => CAPABILITY_STATUS_ORDER.indexOf(c.status));
      expect(order, area.id).toEqual([...order].sort((a, b) => a - b));
    }
  });

  it('reads paid prices from the plans and never offers them for sale', () => {
    const paid = CAPABILITIES.find((c) => c.id === 'access-paid-plans')?.text ?? '';
    for (const plan of PLANS.filter((p) => p.state !== 'open')) {
      expect(paid).toContain(plan.name);
      expect(paid).toContain(plan.price.label);
    }
    expect(paid).toMatch(/not on sale yet/i);
  });

  it('opens each room at the Renor app address, and names that address', () => {
    for (const area of CAPABILITY_AREAS) {
      expect(area.room.path, area.id).toMatch(/^\/[a-z/]+$/);
      expect(roomUrl(area), area.id).toBe(`${RENOR_APP_ADDRESS}${area.room.path}`);
      expect(area.limit.length, area.id).toBeGreaterThan(20);
    }
    expect(RENOR_APP_ADDRESS).toBe('https://app.renor.app');
    expect(RENOR_APP_HOST).toBe('app.renor.app');
    // The site's other links open the same app: at this address once PR #17 is merged, or at
    // the older address that serves the same deployment until then. Anything else is drift.
    expect([RENOR_APP_ADDRESS, 'https://founderlab-ai01.vercel.app']).toContain(RENOR_APP_URL);
  });

  it('never calls Renor a bot, and dates the check', () => {
    expect(JSON.stringify({ CAPABILITIES, CAPABILITY_AREAS })).not.toMatch(/\bbots?\b/i);
    expect(CAPABILITIES_CHECKED.iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(CAPABILITIES_CHECKED.iso).toString()).not.toBe('Invalid Date');
  });
});

describe('the page', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('exists at /renor/capabilities with a Renor title and its own description', () => {
    const source = readFileSync(
      path.join(root, 'src/app/(custom)/renor/capabilities/page.tsx'),
      'utf-8',
    );
    expect(CAPABILITIES_PATH).toBe('/renor/capabilities');
    expect(source).toContain("const TITLE = 'Renor AI capabilities — what Renor can do today';");
    expect(source).toContain('description: SEARCH_DESCRIPTIONS.capabilities');
    expect(source).toContain('<RenorIdentityJsonLd');
    expect(source).toContain('<ExploreBand page="capabilities" />');
  });

  it('is in the Renor menu, the footer and the sitemap', async () => {
    const entries = navItems.filter((item) => item.href === CAPABILITIES_PATH);
    expect(entries.map((item) => `${item.group}:${item.menu}`).sort()).toEqual([
      'footer:Renor',
      'primary:Renor',
    ]);
    vi.stubEnv('SKIP_ENV_VALIDATION', '1');
    const { default: sitemap } = await import('../../src/app/sitemap');
    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    for (const route of ['/', '/renor', '/renor/plans', CAPABILITIES_PATH])
      expect(paths).toContain(route);
  });
});
