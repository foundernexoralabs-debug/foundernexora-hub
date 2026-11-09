// @polsia:user-owned — brand identity.
//
// The website's brand is Renor: the header, page titles, link previews and the manifest name
// it. The company that makes Renor is FounderLab, credited in the footer ("Renor · by
// FounderLab"), the copyright line and the schema.org publisher. Neither name is presented
// as a registered legal entity.
// The public email and repository URLs keep their original addresses on purpose.

import { INK, SURFACE, THEME_COLOR } from '@/lib/design-tokens';

/** The brand: header, `<title>` template, Open Graph site name and the web manifest. */
export const siteName = 'Renor';
/** The company behind Renor: footer attribution, copyright and the schema.org Organization. */
export const companyName = 'FounderLab';
export const siteDescription =
  'Renor is an AI operator: tell it the outcome and it plans, does the work, checks it and shows the proof. Made by FounderLab, with the Renor Plugin Store and Zero to Proof.';

export const brandVisual = {
  themeColor: THEME_COLOR,
  backgroundColor: SURFACE.bg0,
  og: {
    background: SURFACE.bg0,
    foreground: INK.text1,
    tagline: `by ${companyName}`,
  },
} as const;
