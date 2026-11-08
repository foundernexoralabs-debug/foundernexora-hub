// @polsia:user-owned — the founder, as the site shows him. Only what the founder has approved:
// his first name, his role, the display line and the three approved photos of the same
// front-facing portrait in public/founder/ (unedited). No invented biography, milestones or
// achievements: the story paragraphs are the founder's to write (see TODO(owner) below).

/** All three approved photos are in public/founder/. Set to false to show the "A" orb instead. */
export const FOUNDER_PHOTO_READY = true;

export const FOUNDER = {
  name: 'Ahmed',
  role: 'Founder',
  /** The /company headline and intro, in the founder's own words (24 October 2026). */
  line: 'Building the next generation of intelligent systems.',
  intro:
    'Renor began with a simple ambition: turn intelligence into useful action. We’re building an AI-native technology company designed to create, operate and continuously improve powerful digital systems.',
  /** Alt text for every founder photo (they are crops of the same picture). */
  alt: 'Ahmed, founder of FounderLab, in front of the Renor blue orb glow',
  /** The byline under bylined pages, e.g. Zero to Proof. */
  byline: 'Ahmed · Founder',
} as const;

// TODO(owner): DRAFT founder story, written by Claude on 8 November 2026 ONLY from facts already
// in the sources (the founder's 24 October line, the 2 November first-customer directive, the
// agent roles on the company bridge). No education, funding, location, family or personal
// details. Replace with your own words before this ships; FOUNDER_STORY_IS_DRAFT marks it.
export const FOUNDER_STORY_IS_DRAFT = true;

export const FOUNDER_STORY: readonly string[] = [
  'Most AI tools answer questions. I wanted one that finishes the work, and can show that it did. That is why I started building Renor in 2026.',
  'I build Renor in public, as Zero to Proof, with a team of AI agents: one coordinates and reviews evidence, one engineers, one tests. The rule is the same for all of us: nothing counts as done until it has been checked, and everything on this site carries its real status.',
  'Renor is for founders, freelancers and small service businesses first: people who lose hours between an enquiry, the work and the follow-up. The bigger vision is on the vision page, labelled as vision.',
];

/** The approved photo files, with their exact pixel sizes. */
export const FOUNDER_PHOTOS = {
  portrait: { src: '/founder/founder_portrait_1200.png', width: 960, height: 1200 },
  round: { src: '/founder/founder_round_400.png', width: 400, height: 400 },
  heroWide: { src: '/founder/founder_hero_wide_1600x900.png', width: 1600, height: 900 },
} as const;
