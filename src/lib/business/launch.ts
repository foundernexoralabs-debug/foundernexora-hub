// @polsia:user-owned — the Renor launch: introduction, product tour, feature status,
// press descriptions, the 60-second film storyboard and the private beta invitation.
//
// Rules, enforced by tests/unit/launch.test.ts:
//   - every feature carries one of FEATURE_STATUS, checked against the Renor app at
//     origin/main de3d3bc (23 October 2026); nothing planned is described as available;
//   - every tour screenshot exists in public/ in a light and a dark version;
//   - the 25/50/100-word descriptions are exactly that long;
//   - the storyboard adds up to 60 seconds and every shot names a real screen;
//   - the beta invitation is a mailto to the one public address: there is no form backend.
import { CONTACT_EMAIL, RENOR_LABS_STORE_URL } from '@/lib/business/ecosystem';

/* ── Feature status ────────────────────────────────────────────────────── */

export const FEATURE_STATUS = {
  available: {
    label: 'Available',
    description: 'In the Renor app today, tested in a real browser.',
  },
  beta: {
    label: 'Beta',
    description: 'In the app and usable, still being proven in daily use.',
  },
  planned: {
    label: 'Planned',
    description: 'Designed or intended, not in the app yet.',
  },
} as const;

export type FeatureStatus = keyof typeof FEATURE_STATUS;

export type FeatureIcon =
  | 'chat'
  | 'code'
  | 'globe'
  | 'folder'
  | 'notes'
  | 'cpu'
  | 'mic'
  | 'search'
  | 'git'
  | 'video'
  | 'gauge'
  | 'card'
  | 'rocket'
  | 'monitor'
  | 'puzzle';

export interface Feature {
  id: string;
  title: string;
  text: string;
  status: FeatureStatus;
  icon: FeatureIcon;
}

export const FEATURES: readonly Feature[] = [
  {
    id: 'chat',
    title: 'Chat that keeps context',
    text: 'Ask, plan and decide. Add images, PDFs and long files, and ask Renor to remember facts or forget them.',
    status: 'available',
    icon: 'chat',
  },
  {
    id: 'code',
    title: 'Code AI',
    text: 'Builds multi-file apps and games, runs them in a live preview and checks the build against your brief. Fix Bug, Truth Audit, Improve, Explain and Tests are one click away.',
    status: 'available',
    icon: 'code',
  },
  {
    id: 'builder',
    title: 'Website Builder',
    text: 'Writes a site from your own facts (prices, hours, services) and shows it filling in, live, as each file arrives. Export as a ZIP.',
    status: 'available',
    icon: 'globe',
  },
  {
    id: 'projects',
    title: 'Projects room',
    text: 'Every site and app you make, in one place. Search, rename, reopen in the right room, or delete with a confirmation.',
    status: 'available',
    icon: 'folder',
  },
  {
    id: 'notes-tasks',
    title: 'Notes and Tasks',
    text: '“Remind me to call Sam tomorrow at 5” becomes a task due at 17:00. Notes stay next to the work they belong to.',
    status: 'available',
    icon: 'notes',
  },
  {
    id: 'models',
    title: 'Your choice of model',
    text: 'Gemini, Groq, OpenRouter, OmniRoute, a local Ollama or remote engine, your own OpenAI or xAI Grok key, or any OpenAI-compatible endpoint.',
    status: 'available',
    icon: 'cpu',
  },
  {
    id: 'voice',
    title: 'Voice',
    text: 'Hear answers read aloud in natural female or male voices at no cost, dictate instead of typing, or talk it through on a live call.',
    status: 'beta',
    icon: 'mic',
  },
  {
    id: 'research',
    title: 'Web research with sources',
    text: 'Ask about something current and Renor answers with the sources it read, so you can check them.',
    status: 'beta',
    icon: 'search',
  },
  {
    id: 'github',
    title: 'GitHub from Chat',
    text: 'Inspect a repository and open a pull request from a conversation, with your approval before anything changes.',
    status: 'beta',
    icon: 'git',
  },
  {
    id: 'youtube',
    title: 'YouTube Studio',
    text: 'Finds strong moments in a video and turns them into short clips with captions, titles and hashtags.',
    status: 'beta',
    icon: 'video',
  },
  {
    id: 'usage',
    title: 'Plan and usage',
    text: 'Settings shows your weekly AI credits, when they reset and where they went.',
    status: 'beta',
    icon: 'gauge',
  },
  {
    id: 'billing',
    title: 'Paid plans',
    text: 'Pro, Plus and Max at proposed prices of £12, £29 and £79 a month. Billing is not live: nothing can be bought yet.',
    status: 'planned',
    icon: 'card',
  },
  {
    id: 'publishing',
    title: 'One-click publishing',
    text: 'Put a Builder site on a public address. Today you export it as a ZIP and host it yourself.',
    status: 'planned',
    icon: 'rocket',
  },
  {
    id: 'desktop',
    title: 'Renor for desktop',
    text: 'A desktop build exists in development. A download appears only after verified release files and a security review.',
    status: 'planned',
    icon: 'monitor',
  },
  {
    id: 'extensions',
    title: 'Plugin Store extensions',
    text: 'Add-ons for Renor, sold through the Renor Plugin Store once it opens.',
    status: 'planned',
    icon: 'puzzle',
  },
];

/* ── Who it is for, how it works ───────────────────────────────────────── */

export const AUDIENCES = [
  {
    title: 'Founders and solo makers',
    text: 'Go from an idea to a working app or site, and keep the plan, the build and the notes together.',
  },
  {
    title: 'Small businesses',
    text: 'A site written from your real prices and hours, a tool for the job you do every day, and answers you can check.',
  },
  {
    title: 'Creators and learners',
    text: 'Research with sources, short clips from long videos, and code that is explained as it is written.',
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Say what you need',
    text: 'Type it, paste a file or just talk. Renor works out whether you are asking, researching or building.',
  },
  {
    step: '02',
    title: 'Watch it take shape',
    text: 'Answers stream in, apps run in a live preview, and websites fill in file by file as they are written.',
  },
  {
    step: '03',
    title: 'Check it and keep it',
    text: 'Builds are checked against your brief before they are called done, then saved in Projects to pick up any time.',
  },
] as const;

/* ── Product tour: real screenshots ────────────────────────────────────── */

/**
 * The example used in every screenshot. Larkspur Cycles is invented for the tour;
 * it is not a customer and does not describe a real shop.
 */
export const TOUR_EXAMPLE = {
  name: 'Larkspur Cycles',
  description: 'a two-person bike workshop we invented for this tour',
} as const;

export const TOUR_CAPTURED = '2026-10-24';

export const TOUR_CAPTION =
  'Real Renor screen from the production build of the app (24 October 2026), signed in to a demo account. The AI replies were scripted for the screenshot, so the example stays the same in every frame. Larkspur Cycles is an invented example, not a customer.';

export interface TourShot {
  id: 'chat' | 'code' | 'builder' | 'projects' | 'plan';
  tab: string;
  title: string;
  text: string;
  /** Basename under /assets/renor/tour/: `<file>-light.webp` and `<file>-dark.webp`. */
  file: string;
  alt: string;
  width: number;
  height: number;
}

const SHOT_SIZE = { width: 1600, height: 1000 } as const;

export const TOUR: readonly TourShot[] = [
  {
    id: 'chat',
    tab: 'Chat',
    title: 'Ask a real question, get a usable answer',
    text: 'Three ideas to fill quiet weekdays, each with a first step and a table to compare them. Chat names the model that answered.',
    file: 'chat',
    alt: 'Renor Chat. The question “I run Larkspur Cycles, a two-person bike workshop, and Tuesday to Thursday are quiet” is answered with three ideas, each with a first step, and a table comparing effort and how long to try each. The reply is labelled Google Gemini, Gemini 3.5 Flash.',
    ...SHOT_SIZE,
  },
  {
    id: 'code',
    tab: 'Code AI',
    title: 'An app, built and running',
    text: 'A repair queue for the workshop: four files, running in the live preview, marked Verified because it passed checks written from the brief.',
    file: 'code',
    alt: 'Renor Code AI with the brief for a Larkspur Cycles repair queue. The live preview shows the running app: totals of 3 open jobs, 1 ready to collect and £107 of open work, an Add to queue form, and Booked, In the stand and Ready lanes. The project is marked Verified.',
    ...SHOT_SIZE,
  },
  {
    id: 'builder',
    tab: 'Website Builder',
    title: 'A website from your own facts',
    text: 'The headline, prices and opening hours come straight from the brief. The preview runs in an isolated frame, at desktop, tablet or phone size.',
    file: 'builder',
    alt: 'Renor Website Builder showing a saved Larkspur Cycles site in its live preview: the headline “Bike repairs done properly, usually within two days”, a Plan your drop-off button and the start of a price list.',
    ...SHOT_SIZE,
  },
  {
    id: 'projects',
    tab: 'Projects',
    title: 'Everything you made, in one room',
    text: 'The website and the app sit side by side with their status. Open either one in the right room, exactly where you left it.',
    file: 'projects',
    alt: 'Renor Projects room listing two projects: the Larkspur Cycles website, Ready, and the Larkspur Cycles repair queue app, Verified, each with Open, rename, duplicate and delete controls.',
    ...SHOT_SIZE,
  },
  {
    id: 'plan',
    tab: 'Plan & usage',
    title: 'Know where you stand',
    text: 'Weekly credits, when they reset and where they went. Paid plans show proposed prices and say plainly that billing opens later.',
    file: 'plan',
    alt: 'Renor Settings, Plan and usage: Free plan with 49 of 50 weekly credits left and the reset time, a breakdown of where credits went, and Free, Pro, Plus and Max plans with paid prices marked Proposed and buttons reading Billing opens soon.',
    ...SHOT_SIZE,
  },
];

export function tourImage(shot: Pick<TourShot, 'file'>, scheme: 'light' | 'dark'): string {
  return `/assets/renor/tour/${shot.file}-${scheme}.webp`;
}

/* ── Press: short descriptions ─────────────────────────────────────────── */

export const DESCRIPTIONS = {
  25: 'Renor by FounderLab is an AI workspace for conversations, coding, websites and ongoing projects. It builds apps and sites, checking them before calling them done.',
  50: 'Renor by FounderLab is an AI workspace where conversations, code, websites and projects live together. Ask a question and get an answer with sources, describe an app and watch it run, or turn your own facts into a website. Every build is checked against your brief, then kept in Projects.',
  100: 'Renor by FounderLab is an AI workspace for people who make things. Chat handles files and research with sources, and can read answers aloud or hold a live call. Code AI builds multi-file apps, runs them in a live preview and checks each build against the brief before it is called done. The Website Builder writes a site from your real prices, hours and services. Projects keeps every site and app in one place, alongside Notes and Tasks. You choose the model, from Gemini and Groq to a local engine or your own key. Renor is free while in preview.',
} as const;

/* ── The 60-second film ────────────────────────────────────────────────── */

export interface StoryboardShot {
  /** Start, in seconds from the beginning of the film. */
  start: number;
  end: number;
  title: string;
  /** Which real Renor screen the shot is recorded from. */
  screen: string;
  /** The still on this site that shows that screen, if there is one. */
  still?: TourShot['id'] | 'builder-live' | 'orb';
  action: string;
  onScreen: string;
  voiceOver: string;
}

export const STORYBOARD: readonly StoryboardShot[] = [
  {
    start: 0,
    end: 5,
    title: 'Cold open',
    screen: 'Renor Chat, empty state with the orb',
    still: 'orb',
    action:
      'Black frame. The orb fades in and breathes once. Slow push in towards the message box.',
    onScreen: 'One workspace.',
    voiceOver: 'What if one workspace could think, build and keep it all?',
  },
  {
    start: 5,
    end: 14,
    title: 'Ask',
    screen: 'Chat: the Larkspur Cycles question and answer',
    still: 'chat',
    action:
      'The question is typed in real time. The answer streams in; hold on the comparison table.',
    onScreen: 'Ask anything. Get a plan you can use.',
    voiceOver:
      'Meet Renor. Ask a real question about your work and get an answer you can act on today.',
  },
  {
    start: 14,
    end: 26,
    title: 'Build an app',
    screen: 'Code AI: the repair queue build, then its live preview',
    still: 'code',
    action:
      'Brief pasted, Run Build pressed. Files appear one by one; cut to the preview. Click “Put in the stand” and the totals update. Zoom on the Verified badge.',
    onScreen: 'Describe it. Watch it run.',
    voiceOver:
      'Describe an app and Code AI writes it, runs it in a live preview, and checks it against what you asked for.',
  },
  {
    start: 26,
    end: 38,
    title: 'Build a website',
    screen: 'Website Builder: live preview filling in, then the saved site',
    still: 'builder-live',
    action:
      'The brief with real prices and hours. Approve the plan. The page fills in file by file; the styles land and the site comes alive. Switch between desktop and phone size.',
    onScreen: 'Your facts. Your website.',
    voiceOver:
      'Give it your real prices and hours, and the Website Builder writes the site in front of you.',
  },
  {
    start: 38,
    end: 46,
    title: 'Keep it',
    screen: 'Projects room with both projects',
    still: 'projects',
    action: 'Pull back to Projects. Both cards slide in. Open the app straight from its card.',
    onScreen: 'Everything you make, in one place.',
    voiceOver: 'Everything you make lands in Projects, ready to pick up where you left off.',
  },
  {
    start: 46,
    end: 53,
    title: 'Talk to it',
    screen: 'Chat live call, then Plan & usage',
    still: 'plan',
    action:
      'Tap Live call; the orb reacts as the voice answers. Quick cut to Plan & usage showing the weekly credits.',
    onScreen: 'Talk, listen, and see your usage.',
    voiceOver: 'Talk to it out loud, choose your model, and always see where you stand.',
  },
  {
    start: 53,
    end: 60,
    title: 'End card',
    screen: 'Brand end card (graphic, not an app screen)',
    still: 'orb',
    action:
      'The orb settles above the wordmark. The website address and “Join the private beta” fade up.',
    onScreen: 'Renor by FounderLab. Join the private beta.',
    voiceOver: 'Renor, by FounderLab. Join the private beta.',
  },
];

/** 5 → "0:05", 60 → "1:00". */
export function formatTimecode(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/* ── Shareable graphics ────────────────────────────────────────────────── */

export interface LaunchGraphic {
  id: 'square' | 'story' | 'og';
  title: string;
  use: string;
  /** Full-size PNG for download. */
  href: string;
  /** Lighter preview shown on the page. */
  preview: string;
  width: number;
  height: number;
  alt: string;
}

const GRAPHIC_ALT =
  'Renor launch graphic: the glowing Renor orb, the line “Think it. Build it. Keep it.”, a real screenshot of Code AI running a repair queue app, and “Renor by FounderLab, private beta”.';

export const LAUNCH_GRAPHICS: readonly LaunchGraphic[] = [
  {
    id: 'square',
    title: 'Square post',
    use: 'Instagram, LinkedIn and X feed posts',
    href: '/launch-kit/renor-launch-square-1080.png',
    preview: '/assets/launch-kit/renor-launch-square.webp',
    width: 1080,
    height: 1080,
    alt: GRAPHIC_ALT,
  },
  {
    id: 'story',
    title: 'Story',
    use: 'Instagram, TikTok and WhatsApp stories, event screens',
    href: '/launch-kit/renor-launch-story-1080x1920.png',
    preview: '/assets/launch-kit/renor-launch-story.webp',
    width: 1080,
    height: 1920,
    alt: GRAPHIC_ALT,
  },
  {
    id: 'og',
    title: 'Link preview',
    use: 'Telegram, X, LinkedIn and Slack link cards',
    href: '/launch-kit/renor-launch-og-1200x630.png',
    preview: '/assets/launch-kit/renor-launch-og.webp',
    width: 1200,
    height: 630,
    alt: GRAPHIC_ALT,
  },
];

/** The social image every launch page shares, so links preview the same everywhere. */
export const LAUNCH_SOCIAL_IMAGE = {
  url: '/launch-kit/renor-launch-og-1200x630.png',
  width: 1200,
  height: 630,
  alt: 'Renor by FounderLab: one AI workspace for conversations, code, websites and projects. Private beta.',
  type: 'image/png',
} as const;

/* ── Private beta invitation ───────────────────────────────────────────── */

/**
 * There is no form backend on this site (no database model, no email service), so the
 * invitation is an email the visitor sends from their own mail app, prefilled from the form.
 */
export const BETA_EMAIL = CONTACT_EMAIL;
export const BETA_SUBJECT = 'Renor private beta: request to join';

export const BETA_ROLES = [
  'Founder or solo maker',
  'Small business owner',
  'Developer',
  'Creator',
  'Student or learner',
  'Something else',
] as const;

export interface BetaRequest {
  name?: string;
  role?: string;
  building?: string;
}

const clean = (value: string | undefined, max: number) =>
  (value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export function betaRequestBody({ name, role, building }: BetaRequest = {}): string {
  const lines = [
    'Hello,',
    '',
    'I would like to join the Renor private beta.',
    '',
    `Name: ${clean(name, 80) || '(your name)'}`,
    `I am a: ${clean(role, 60) || '(founder, business owner, developer, creator…)'}`,
    `What I want to build or do with Renor: ${clean(building, 600) || '(a sentence or two)'}`,
    '',
    'Thanks',
  ];
  return lines.join('\n');
}

export function betaMailto(request: BetaRequest = {}): string {
  return `mailto:${BETA_EMAIL}?subject=${encodeURIComponent(BETA_SUBJECT)}&body=${encodeURIComponent(betaRequestBody(request))}`;
}

export const LAUNCH_LINKS = {
  storeUrl: RENOR_LABS_STORE_URL,
  plugins: '/plugins',
  launchKit: '/launch-kit',
  storyboard: '/launch-kit/storyboard',
  beta: '/renor#beta',
} as const;
