// @polsia:user-owned — the /renor product tour: deep links, keyboard, autoplay rules, honest
// content, and the rendered ARIA tabs (keyboard + deep link) in jsdom.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RENOR_AREAS } from '../../src/lib/business/ecosystem';
import { tourImage } from '../../src/lib/business/launch';
import {
  AUTOPLAY_MS,
  autoplayEnabled,
  autoplayRunning,
  nextTabIndex,
  RENOR_TABS,
  tabIndexFromHash,
} from '../../src/lib/business/renor-tabs';

vi.mock('../../src/components/custom/product-tour.css', () => ({}));

vi.mock('next/image', () => ({
  default: ({ preload: _preload, ...props }: Record<string, unknown>) =>
    createElement('img', props),
}));

describe('tour content', () => {
  it('has the four areas in order', () => {
    expect(RENOR_TABS.map((tab) => tab.label)).toEqual([
      'Chat AI',
      'Code AI',
      'Website Builder',
      'Project Office',
    ]);
    expect(RENOR_TABS.map((tab) => tab.id)).toEqual([
      'chat-ai',
      'code-ai',
      'website-builder',
      'project-office',
    ]);
  });

  it('takes every status and bullet from the area itself, never upgrading it', () => {
    for (const tab of RENOR_TABS) {
      const area = RENOR_AREAS.find((item) => item.id === tab.area.id);
      expect(area).toBeDefined();
      expect(tab.area.status).toBe(area?.status);
      expect(tab.bullets).toHaveLength(3);
      for (const bullet of tab.bullets) expect(area?.does).toContain(bullet);
    }
  });

  it('shows only real captures that exist in public/', () => {
    for (const tab of RENOR_TABS) {
      for (const scheme of ['light', 'dark'] as const) {
        const file = path.resolve(__dirname, '../../public', tourImage(tab.shot, scheme).slice(1));
        expect(existsSync(file), file).toBe(true);
      }
    }
  });

  it('never says the forbidden word', () => {
    const text = JSON.stringify(RENOR_TABS.map(({ area: _area, ...tab }) => tab));
    expect(/\bbots?\b/i.test(text)).toBe(false);
  });
});

describe('deep links', () => {
  it('opens a tab from its id', () => {
    expect(tabIndexFromHash('#chat-ai')).toBe(0);
    expect(tabIndexFromHash('#code-ai')).toBe(1);
    expect(tabIndexFromHash('#website-builder')).toBe(2);
    expect(tabIndexFromHash('#project-office')).toBe(3);
  });

  it('keeps the older anchors working (home page, Guide sources)', () => {
    for (const area of RENOR_AREAS) {
      expect(tabIndexFromHash(`#${area.id}`), area.id).not.toBeNull();
    }
    expect(tabIndexFromHash('#code')).toBe(1);
    expect(tabIndexFromHash('#CODE-AI')).toBe(1);
  });

  it('ignores other anchors', () => {
    expect(tabIndexFromHash('#beta')).toBeNull();
    expect(tabIndexFromHash('')).toBeNull();
    expect(tabIndexFromHash('#')).toBeNull();
  });
});

describe('keyboard', () => {
  it('wraps with the arrows and jumps with Home and End', () => {
    expect(nextTabIndex(0, 'ArrowRight', 4)).toBe(1);
    expect(nextTabIndex(3, 'ArrowRight', 4)).toBe(0);
    expect(nextTabIndex(0, 'ArrowLeft', 4)).toBe(3);
    expect(nextTabIndex(2, 'Home', 4)).toBe(0);
    expect(nextTabIndex(1, 'End', 4)).toBe(3);
  });

  it('leaves every other key alone', () => {
    expect(nextTabIndex(1, 'Enter', 4)).toBeNull();
    expect(nextTabIndex(1, 'ArrowDown', 4)).toBeNull();
    expect(nextTabIndex(0, 'ArrowRight', 0)).toBeNull();
  });
});

describe('autoplay', () => {
  const base = {
    reducedMotion: false,
    interacted: false,
    engaged: false,
    inView: true,
    pageVisible: true,
  };

  it('advances every 8 seconds when nothing stops it', () => {
    expect(AUTOPLAY_MS).toBe(8000);
    expect(autoplayRunning(base)).toBe(true);
  });

  it('pauses on hover/focus, off screen, and in a hidden tab', () => {
    expect(autoplayRunning({ ...base, engaged: true })).toBe(false);
    expect(autoplayRunning({ ...base, inView: false })).toBe(false);
    expect(autoplayRunning({ ...base, pageVisible: false })).toBe(false);
  });

  it('stops for good once the visitor chooses, and never runs under reduced motion', () => {
    expect(autoplayRunning({ ...base, interacted: true })).toBe(false);
    expect(autoplayEnabled({ reducedMotion: false, interacted: true })).toBe(false);
    expect(autoplayRunning({ ...base, reducedMotion: true })).toBe(false);
    expect(autoplayEnabled({ reducedMotion: true, interacted: false })).toBe(false);
  });
});

describe('rendered tabs', () => {
  let container: HTMLDivElement;
  let root: Root;
  let reduced = false;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    reduced = false;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce') ? reduced : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
    Element.prototype.scrollIntoView = vi.fn();
    window.history.replaceState(null, '', '/renor');
    container = document.createElement('div');
    document.body.append(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  async function render() {
    const { ProductTour } = await import('../../src/components/custom/product-tour');
    root = createRoot(container);
    await act(async () => root.render(createElement(ProductTour)));
  }
  const tabs = () => [...container.querySelectorAll<HTMLButtonElement>('[role=tab]')];
  const selected = () => tabs().find((tab) => tab.getAttribute('aria-selected') === 'true');
  const press = async (key: string) =>
    act(async () => {
      document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    });

  it('follows the ARIA tabs pattern', async () => {
    await render();
    const list = container.querySelector('[role=tablist]');
    expect(list?.getAttribute('aria-label')).toBe('Renor areas');
    expect(tabs()).toHaveLength(4);
    expect(selected()?.id).toBe('chat-ai');
    // Roving tabindex: only the selected tab is in the Tab order.
    expect(tabs().map((tab) => tab.tabIndex)).toEqual([0, -1, -1, -1]);
    const panel = container.querySelector(`#${selected()?.getAttribute('aria-controls')}`);
    expect(panel?.getAttribute('role')).toBe('tabpanel');
    expect(panel?.getAttribute('aria-labelledby')).toBe('chat-ai');
    expect(container.querySelectorAll('[role=tabpanel]:not([hidden])')).toHaveLength(1);
    expect(container.textContent).toContain('Preview');
    expect(container.querySelector('.rt-progress')).not.toBeNull();
  });

  it('moves with the arrow keys, Home and End, focusing the new tab and updating the URL', async () => {
    await render();
    act(() => tabs()[0]?.focus());
    await press('ArrowRight');
    expect(selected()?.id).toBe('code-ai');
    expect(document.activeElement).toBe(selected());
    expect(window.location.hash).toBe('#code-ai');
    await press('End');
    expect(selected()?.id).toBe('project-office');
    await press('ArrowRight');
    expect(selected()?.id).toBe('chat-ai');
    await press('ArrowLeft');
    expect(selected()?.id).toBe('project-office');
    await press('Home');
    expect(selected()?.id).toBe('chat-ai');
    // Choosing stops autoplay: the progress bar is gone.
    expect(container.querySelector('.rt-progress')).toBeNull();
  });

  it('opens the tab named in the URL', async () => {
    window.history.replaceState(null, '', '/renor#website-builder');
    await render();
    expect(selected()?.id).toBe('website-builder');
    expect(container.querySelector('.rt-progress')).toBeNull();
  });

  it('accepts an older anchor too', async () => {
    window.history.replaceState(null, '', '/renor#code');
    await render();
    expect(selected()?.id).toBe('code-ai');
  });

  it('offers no autoplay under reduced motion', async () => {
    reduced = true;
    await render();
    expect(selected()?.id).toBe('chat-ai');
    expect(container.querySelector('.rt-progress')).toBeNull();
  });
});
