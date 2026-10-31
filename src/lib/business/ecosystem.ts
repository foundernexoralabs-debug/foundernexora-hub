// @polsia:user-owned — the single source of truth for what the public site says exists.
//
// Every page reads its projects, statuses, milestones and channels from here, so
// a claim is made (or corrected) in one place. Rules, enforced by
// tests/unit/ecosystem-content.test.ts:
//   - a status is one of STATUS — nothing is "live" unless people can use it today;
//   - an external link is https and verified by a person before it is added;
//   - a social channel without a confirmed URL stays null and is never guessed.

import { RENOR_WEB_PREVIEW_URL } from '@/lib/business/renor-links';

export const STATUS = {
  live: { label: 'Live', tone: 'live', description: 'Available to use today.' },
  preview: {
    label: 'Preview',
    tone: 'preview',
    description: 'Usable, but still changing and being verified.',
  },
  experimental: {
    label: 'Experimental',
    tone: 'experimental',
    description: 'Being built and tested; not ready to rely on.',
  },
  planned: {
    label: 'Planned',
    tone: 'planned',
    description: 'Designed or intended, not built yet.',
  },
  research: {
    label: 'Research',
    tone: 'planned',
    description: 'Being investigated; no product yet.',
  },
} as const;

export type StatusKey = keyof typeof STATUS;

export interface Project {
  slug: string;
  name: string;
  status: StatusKey;
  kind: string;
  summary: string;
  /** Internal route or verified https URL. */
  href: string;
  action: string;
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'renor',
    name: 'Renor AI',
    status: 'preview',
    kind: 'Flagship product',
    summary:
      'An AI workspace for chatting, coding, building websites and keeping projects in one place, with results you can check.',
    href: '/renor',
    action: 'Explore Renor',
  },
  {
    slug: 'renor-plugin-store',
    name: 'Renor Plugin Store',
    status: 'planned',
    kind: 'Digital products',
    summary:
      'Ready-to-use digital kits and, later, Renor extensions. The first two, TradeLaunch kits for electricians, are opening soon; nothing can be bought yet.',
    href: '/plugins',
    action: 'Browse the Plugin Store',
  },
  {
    slug: 'zero-to-proof',
    name: 'Zero to Proof',
    status: 'preview',
    kind: 'Build in public',
    summary:
      'The founder’s building journey: what was built, what broke, and what was proven along the way.',
    href: '/zero-to-proof',
    action: 'Follow the journey',
  },
  {
    slug: 'company-os',
    name: 'Company OS',
    status: 'experimental',
    kind: 'Internal tooling',
    summary:
      'How we coordinate work: accountable tasks, reviewable changes and durable engineering knowledge. Internal, not a customer product.',
    href: '/company#how-we-work',
    action: 'How we work',
  },
  {
    slug: 'renor-desktop',
    name: 'Renor for desktop',
    status: 'planned',
    kind: 'Desktop app',
    summary:
      'A desktop build exists in development. A public download will appear only after verified release files and a security review.',
    href: '/projects#renor-desktop',
    action: 'Status',
  },
  {
    slug: 'commerce-lab',
    name: 'Commerce Lab',
    status: 'research',
    kind: 'Research',
    summary:
      'A design-first experiment in useful workspace products. Supplier and demand checks come before anything is sold.',
    href: '/projects#commerce-lab',
    action: 'Status',
  },
];

/**
 * Renor's areas, as they exist in the main Renor app. Every `does` line is
 * something the app does; every `limits` line is a known gap, stated plainly.
 */
export interface RenorArea {
  id: string;
  name: string;
  status: StatusKey;
  summary: string;
  does: readonly string[];
  limits: string;
  screenshot?: { src: string; alt: string; width: number; height: number };
}

export const RENOR_AREAS: readonly RenorArea[] = [
  {
    id: 'chat',
    name: 'Chat AI',
    status: 'preview',
    summary:
      'Ask, research and plan with the AI provider you connect. Ask for something current and Renor answers with the sources it read.',
    does: [
      'Works with the AI providers configured for your account, or your own key',
      'Reads images, PDFs and long files, and remembers them for follow-up questions',
      'Voice: dictate with pause and resume, hear answers read aloud, or say “Hey Renor”',
      'Hands work to Code AI or the Website Builder when you ask it to build',
    ],
    limits:
      'Answers depend on the provider you connect. The free models available by default handle files and tools well, but are not yet at the level of the strongest assistants on hard reasoning.',
    screenshot: {
      src: '/assets/renor/chat-desktop.webp',
      alt: 'Renor Chat in the current development build: a glowing orb above the question “How can I help you today?”, a message box and quick actions for creating a website, writing code, planning a YouTube channel, analysing a business and researching.',
      width: 1440,
      height: 900,
    },
  },
  {
    id: 'code',
    name: 'Code AI',
    status: 'preview',
    summary:
      'Describe an app or paste code. Code AI writes the files, previews them, and checks what actually runs.',
    does: [
      'Builds multi-file web apps and games with a live preview',
      'Fix Bug, Improve, Explain, Tests and Verify modes',
      'Runs Python in your browser: sandboxed, no network, 10-second limit',
      'Checks multi-file builds against your brief before marking them ready',
      'Pauses a build when a provider limit runs out, and resumes it later',
    ],
    limits:
      'Proven on small and medium apps, not yet on large multi-feature projects. Python runs the standard library only. Publishing goes to GitHub Pages only.',
    screenshot: {
      src: '/assets/renor/code-python-desktop.webp',
      alt: 'Renor Code AI running a Python FizzBuzz program in the browser. The output panel shows “1 2 Fizz 4 Buzz … FizzBuzz” and “Finished 9 ms”.',
      width: 1440,
      height: 900,
    },
  },
  {
    id: 'builder',
    name: 'Website Builder',
    status: 'preview',
    summary:
      'Turn a clear brief into a responsive website, written from your own facts, that you can edit, version and preview.',
    does: [
      'Puts your real prices, hours, address and email on the page, without inventing reviews or phone numbers',
      'Takes its look from the tone of your brief, in your colours',
      'Editable files, an isolated live preview and section-by-section edits',
    ],
    limits:
      'Sites have no photography or imagery yet. Export is a ZIP download; publishing to a public address is not set up. Check every detail before you publish: small invented phrases can still slip in.',
    screenshot: {
      src: '/assets/renor/builder-desktop.webp',
      alt: 'Renor Website Builder: the heading “Describe what you want to build”, page-type choices such as Landing page and Pricing page, and three starting directions.',
      width: 1440,
      height: 900,
    },
  },
  {
    id: 'project-office',
    name: 'Project Office',
    status: 'preview',
    summary:
      'Notes, tasks and projects that stay connected to your chats and builds, so work does not start from zero each time. In the app: Dashboard, Notes and Tasks.',
    does: [
      '“Remind me to call Sam tomorrow at 5” becomes a task with a real deadline',
      'Projects that keep their builds and verification together',
      'Renor remembers facts you ask it to keep, and forgets them when you ask',
    ],
    limits: 'Deadlines and memory are new in this release and still being proven in daily use.',
  },
];

/**
 * What kind of step a build-log entry records, read from its own detail line:
 * `shipped` put something new in people's hands, `fix` corrected what was there,
 * `test` froze or proved work rather than adding to it.
 */
export const MILESTONE_KIND = {
  shipped: { label: 'Shipped', description: 'Something new people can use.' },
  fix: { label: 'Fix', description: 'A correction to what was already there.' },
  test: { label: 'Test', description: 'Work frozen and proven, not added to.' },
} as const;

export type MilestoneKind = keyof typeof MILESTONE_KIND;

/** Dated, checkable progress. Newest first. */
export interface Milestone {
  date: string;
  title: string;
  detail: string;
  where: 'app' | 'website';
  kind: MilestoneKind;
}

export const MILESTONES: readonly Milestone[] = [
  {
    date: '2026-10-21',
    title: 'Renor’s first full release, frozen and tested',
    detail:
      'Five weeks of work in 1,013 commits, frozen as one release. It passed 4,876 unit tests and 88 of 88 browser acceptance checks, and replaces the September web preview.',
    where: 'app',
    kind: 'test',
  },
  {
    date: '2026-10-05',
    title: 'Python runs inside Code AI',
    detail:
      'Real Python in the browser, sandboxed with no network, a time limit and a Stop button. Two independent reviews found 22 issues; all but one stated limit are fixed.',
    where: 'app',
    kind: 'shipped',
  },
  {
    date: '2026-10-05',
    title: 'Renor listens, remembers and builds',
    detail:
      'Voice that waits for you to finish a thought, memory you control, tasks with real deadlines, and research that can end in a real build.',
    where: 'app',
    kind: 'shipped',
  },
  {
    date: '2026-10-05',
    title: 'Live facts with sources',
    detail:
      'Ask for something current and Renor answers with the sources it read, in chat and in voice.',
    where: 'app',
    kind: 'shipped',
  },
  {
    date: '2026-10-04',
    title: 'Founder QA pass',
    detail: 'Fixes from a full founder QA pass across Chat, Code AI and the Website Builder.',
    where: 'app',
    kind: 'fix',
  },
  {
    date: '2026-09-29',
    title: 'Truthful company front door',
    detail:
      'The website was rewritten to separate what exists from what is planned, and unsupported claims were removed.',
    where: 'website',
    kind: 'fix',
  },
  {
    date: '2026-09-19',
    title: 'First web preview',
    detail:
      'The first build people could open in the browser, still under the earlier name FounderLab AI.',
    where: 'app',
    kind: 'shipped',
  },
];

export const MILESTONE_WHERE = {
  app: 'In the Renor app',
  website: 'On this website',
} as const;

/**
 * Social, video and work channels. Every URL was supplied by the founder on
 * 21 October 2026; a channel without a confirmed URL keeps `url: null` and the
 * page says so instead of guessing a handle that might belong to someone else.
 */
export interface Channel {
  id: 'youtube' | 'tiktok' | 'links' | 'fiverr' | 'renor-labs' | 'github';
  name: string;
  /** Short label for icon-only links, e.g. "Zero to Proof on YouTube". */
  label: string;
  purpose: string;
  url: string | null;
  /** Listed with the social links in the footer and on Contact. */
  social: boolean;
}

/**
 * The Renor Labs shop home on Plug&Pay: the single source for every link to it.
 * Its /home page, because the bare domain returns 404 (checked 22 October 2026).
 */
export const RENOR_LABS_STORE_URL = 'https://renorlabs.plugandpay.com/home';

export const CHANNELS: readonly Channel[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    label: 'Zero to Proof on YouTube',
    purpose: 'Longer build sessions, demonstrations and lessons.',
    url: 'https://www.youtube.com/@zero2proof',
    social: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    label: 'Zero to Proof on TikTok',
    purpose: 'Short clips from the build: wins, failures and fixes.',
    url: 'https://www.tiktok.com/@sajadi90',
    social: true,
  },
  {
    id: 'links',
    name: 'Links page',
    label: 'Zero to Proof links page',
    purpose: 'Every Zero to Proof channel and link, on one page.',
    url: 'https://zero-to-proof-links.vercel.app',
    social: true,
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    label: 'The founder on Fiverr',
    purpose: 'Hire the founder for freelance work through Fiverr.',
    url: 'https://www.fiverr.com/abi_bim',
    social: true,
  },
  {
    id: 'renor-labs',
    name: 'Renor Labs shop',
    label: 'The Renor Labs shop on Plug&Pay',
    purpose: 'Our shop on Plug&Pay, where Plugin Store products are sold once sales open.',
    url: RENOR_LABS_STORE_URL,
    social: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    label: 'FounderLab website code on GitHub',
    purpose: 'The public code for this website and its reviewed changes.',
    url: 'https://github.com/foundernexoralabs-debug/foundernexora-hub',
    social: false,
  },
];

/** A channel whose URL is confirmed. */
export type LinkedChannel = Channel & { url: string };

/** The social links shown in the footer and on Contact, in display order. */
export const SOCIAL_CHANNELS: readonly LinkedChannel[] = CHANNELS.filter(
  (channel): channel is LinkedChannel => channel.social && channel.url !== null,
);

/** Where the build is published: every channel except the shop. */
export const JOURNEY_CHANNELS: readonly Channel[] = CHANNELS.filter(
  (channel) => channel.id !== 'renor-labs',
);

export const RENOR_APP_URL = RENOR_WEB_PREVIEW_URL;
export const PUBLIC_REPO_URL = 'https://github.com/foundernexoralabs-debug/foundernexora-hub';
/** The company's public email, confirmed by the founder on 5 October 2026. */
export const CONTACT_EMAIL = 'founder.nexoralabs@gmail.com';
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;
export const FEEDBACK_URL =
  'https://github.com/foundernexoralabs-debug/foundernexora-hub/issues/new';
