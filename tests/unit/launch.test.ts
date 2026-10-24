// @polsia:user-owned — the Renor launch content stays honest, complete and in step.
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, RENOR_LABS_STORE_URL } from '../../src/lib/business/ecosystem';
import {
  BETA_SUBJECT,
  betaMailto,
  betaRequestBody,
  DESCRIPTIONS,
  FEATURE_STATUS,
  FEATURES,
  formatTimecode,
  HOW_IT_WORKS,
  LAUNCH_GRAPHICS,
  LAUNCH_SOCIAL_IMAGE,
  STORYBOARD,
  TOUR,
  tourImage,
} from '../../src/lib/business/launch';
import { pageMetadata } from '../../src/lib/business/seo';
import { navItems } from '../../src/lib/nav';

const root = path.resolve(__dirname, '../..');
const publicFile = (url: string) => path.join(root, 'public', url.replace(/^\//, ''));
const read = (file: string) => readFileSync(path.join(root, file), 'utf-8');
const words = (text: string) => text.trim().split(/\s+/).length;

/** PNG width and height from the IHDR chunk. */
function pngSize(file: string) {
  const buffer = readFileSync(file);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe('feature status', () => {
  it('uses only Available, Beta and Planned, with every group present', () => {
    for (const feature of FEATURES) expect(Object.keys(FEATURE_STATUS)).toContain(feature.status);
    for (const status of Object.keys(FEATURE_STATUS)) {
      expect(
        FEATURES.some((feature) => feature.status === status),
        status,
      ).toBe(true);
    }
  });

  it('never presents billing or publishing as available', () => {
    const byId = Object.fromEntries(FEATURES.map((feature) => [feature.id, feature]));
    expect(byId.billing?.status).toBe('planned');
    expect(byId.publishing?.status).toBe('planned');
    expect(byId.desktop?.status).toBe('planned');
    expect(byId.billing?.text).toMatch(/proposed/i);
  });

  it('has unique ids and three how-it-works steps', () => {
    expect(new Set(FEATURES.map((feature) => feature.id)).size).toBe(FEATURES.length);
    expect(HOW_IT_WORKS).toHaveLength(3);
  });
});

describe('product tour', () => {
  it('covers Chat, Code AI, Website Builder, Projects and Plan & usage', () => {
    expect(TOUR.map((shot) => shot.id)).toEqual(['chat', 'code', 'builder', 'projects', 'plan']);
  });

  it('has a light and a dark screenshot for every screen, as WebP in public/', () => {
    for (const shot of TOUR) {
      for (const scheme of ['light', 'dark'] as const) {
        const file = publicFile(tourImage(shot, scheme));
        expect(existsSync(file), file).toBe(true);
        expect(readFileSync(file).subarray(8, 12).toString('ascii'), file).toBe('WEBP');
        expect(statSync(file).size, file).toBeLessThan(200_000);
      }
      expect(shot.alt.length).toBeGreaterThan(60);
    }
  });

  it('offers every screen for download in WebP and AVIF', () => {
    for (const id of [...TOUR.map((shot) => shot.file), 'builder-live']) {
      for (const scheme of ['light', 'dark']) {
        for (const format of ['webp', 'avif']) {
          const file = publicFile(`/launch-kit/screens/renor-${id}-${scheme}.${format}`);
          expect(existsSync(file), file).toBe(true);
        }
      }
    }
  });
});

describe('press descriptions', () => {
  it('are exactly 25, 50 and 100 words', () => {
    expect(words(DESCRIPTIONS[25])).toBe(25);
    expect(words(DESCRIPTIONS[50])).toBe(50);
    expect(words(DESCRIPTIONS[100])).toBe(100);
  });

  it('name Renor and FounderLab and never claim a launch that has not happened', () => {
    for (const text of Object.values(DESCRIPTIONS)) {
      expect(text).toMatch(/Renor by FounderLab/);
      expect(text).not.toMatch(/\b(?:millions?|thousands of|trusted by|award)/i);
    }
  });
});

describe('storyboard', () => {
  it('runs exactly 60 seconds with no gaps or overlaps', () => {
    expect(STORYBOARD[0]?.start).toBe(0);
    for (let index = 1; index < STORYBOARD.length; index += 1) {
      expect(STORYBOARD[index]?.start).toBe(STORYBOARD[index - 1]?.end);
    }
    expect(STORYBOARD.at(-1)?.end).toBe(60);
  });

  it('gives every shot a real screen, on-screen text and a voice-over that fits its length', () => {
    for (const shot of STORYBOARD) {
      expect(shot.screen.length).toBeGreaterThan(5);
      expect(shot.onScreen.length).toBeGreaterThan(5);
      expect(words(shot.voiceOver) / (shot.end - shot.start), shot.title).toBeLessThanOrEqual(2.6);
      if (shot.still && shot.still !== 'orb') {
        expect(existsSync(publicFile(tourImage({ file: shot.still }, 'dark'))), shot.title).toBe(
          true,
        );
      }
    }
  });

  it('formats timecodes as minutes and seconds', () => {
    expect(formatTimecode(5)).toBe('0:05');
    expect(formatTimecode(60)).toBe('1:00');
  });

  it('is mirrored, shot for shot, in docs/launch-kit/renor-60s-storyboard.md', () => {
    const markdown = read('docs/launch-kit/renor-60s-storyboard.md');
    for (const shot of STORYBOARD) {
      expect(markdown).toContain(shot.onScreen);
      expect(markdown).toContain(shot.voiceOver);
      expect(markdown).toContain(`${formatTimecode(shot.start)}–${formatTimecode(shot.end)}`);
    }
  });
});

describe('launch graphics', () => {
  it('exist at their stated sizes, with lighter previews', () => {
    const expected = { square: [1080, 1080], story: [1080, 1920], og: [1200, 630] } as const;
    for (const graphic of LAUNCH_GRAPHICS) {
      const file = publicFile(graphic.href);
      expect(existsSync(file), file).toBe(true);
      expect(pngSize(file)).toEqual({ width: graphic.width, height: graphic.height });
      expect([graphic.width, graphic.height]).toEqual([...expected[graphic.id]]);
      expect(existsSync(publicFile(graphic.preview)), graphic.preview).toBe(true);
    }
  });

  it('is the link preview for the launch pages, at 1200 × 630', () => {
    expect(pngSize(publicFile(LAUNCH_SOCIAL_IMAGE.url))).toEqual({ width: 1200, height: 630 });
    const meta = pageMetadata({
      title: 'Renor',
      description: 'Renor.',
      path: '/renor',
      image: LAUNCH_SOCIAL_IMAGE,
    });
    expect(JSON.stringify(meta.openGraph)).toContain(LAUNCH_SOCIAL_IMAGE.url);
    expect(JSON.stringify(meta.twitter)).toContain(LAUNCH_SOCIAL_IMAGE.url);
    for (const page of [
      'src/app/(custom)/renor/page.tsx',
      'src/app/(custom)/launch-kit/page.tsx',
      'src/app/(custom)/launch-kit/storyboard/page.tsx',
    ]) {
      expect(read(page), page).toContain('image: LAUNCH_SOCIAL_IMAGE');
    }
  });
});

describe('private beta invitation', () => {
  it('is a mailto to the one public address with the subject and answers filled in', () => {
    const href = betaMailto({ name: 'Ada', role: 'Developer', building: 'A shift planner' });
    const url = new URL(href);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe(CONTACT_EMAIL);
    expect(url.searchParams.get('subject')).toBe(BETA_SUBJECT);
    const body = url.searchParams.get('body') ?? '';
    expect(body).toContain('Name: Ada');
    expect(body).toContain('I am a: Developer');
    expect(body).toContain('A shift planner');
  });

  it('keeps answers on one line each and trims what is too long', () => {
    const body = betaRequestBody({ name: 'Ada\nLovelace', building: 'x'.repeat(2000) });
    expect(body).toContain('Name: Ada Lovelace');
    expect(body.length).toBeLessThan(900);
  });

  it('has no hidden form backend: the beta form posts nowhere', () => {
    const form = read('src/components/custom/beta-invite.tsx');
    expect(form).not.toMatch(/fetch\(|apiFetch|action=/);
    expect(form).toContain('window.location.href = href');
  });
});

describe('launch pages stay connected', () => {
  it('link the Plugin Store and the Renor Labs shop from the introduction and the launch kit', () => {
    for (const page of [
      'src/app/(custom)/renor/page.tsx',
      'src/app/(custom)/launch-kit/page.tsx',
    ]) {
      const source = read(page);
      expect(source, page).toContain('/plugins');
      expect(source, page).toContain('RENOR_LABS_STORE_URL');
    }
    expect(RENOR_LABS_STORE_URL).toBe('https://renorlabs.plugandpay.com/home');
  });

  it('are in the navigation, so they are reachable and in the sitemap', () => {
    const hrefs = navItems.map((item) => item.href);
    expect(hrefs).toContain('/launch-kit');
    expect(hrefs).toContain('/launch-kit/storyboard');
    expect(hrefs).toContain('/renor#beta');
  });
});
