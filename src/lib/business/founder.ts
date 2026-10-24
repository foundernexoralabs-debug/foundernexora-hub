// @polsia:user-owned — the founder, as the site shows him. Only what the founder has approved:
// his first name, his role, the display line and the three approved photos of the same
// front-facing portrait in public/founder/ (unedited). No invented biography, milestones or
// achievements: the story paragraphs are the founder's to write (see TODO(owner) below).

/** All three approved photos are in public/founder/. Set to false to show the "A" orb instead. */
export const FOUNDER_PHOTO_READY = true;

export const FOUNDER = {
  name: 'Ahmed',
  role: 'Founder',
  /** The display line on /company, as approved by the founder on 24 October 2026. */
  line: 'I’m Ahmed, and I’m building Renor — an AI technology company for the long term.',
  /** Alt text for every founder photo (they are crops of the same picture). */
  alt: 'Ahmed, founder of FounderLab, in front of the Renor blue orb glow',
  /** The byline under bylined pages, e.g. Zero to Prove. */
  byline: 'Ahmed · Founder',
} as const;

// TODO(owner): two or three short story paragraphs for /company, in your own words: why you
// started FounderLab, what Renor is for, and how you work. They are not shown until you write
// them; add them here as `FOUNDER_STORY: readonly string[]` and render them in FounderHero.

/** The approved photo files, with their exact pixel sizes. */
export const FOUNDER_PHOTOS = {
  portrait: { src: '/founder/founder_portrait_1200.png', width: 960, height: 1200 },
  round: { src: '/founder/founder_round_400.png', width: 400, height: 400 },
  heroWide: { src: '/founder/founder_hero_wide_1600x900.png', width: 1600, height: 900 },
} as const;
