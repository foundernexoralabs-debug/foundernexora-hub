// @polsia:user-owned — brand identity.
//
// The company is FounderLab; its product is Renor ("Renor by FounderLab").
// The public email and repository URLs keep their original addresses on purpose.

import { INK, SURFACE, THEME_COLOR } from '@/lib/design-tokens';

export const siteName = 'FounderLab';
export const siteDescription =
  'FounderLab builds Renor, an AI workspace for chatting, coding, building websites and keeping projects together, alongside the Renor Plugin Store and Zero to Prove, its build-in-public journey.';

export const brandVisual = {
  themeColor: THEME_COLOR,
  backgroundColor: SURFACE.bg0,
  og: {
    background: SURFACE.bg0,
    foreground: INK.text1,
    tagline: 'The company behind Renor.',
  },
} as const;
