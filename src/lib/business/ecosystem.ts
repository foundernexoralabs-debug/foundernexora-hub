// @polsia:user-owned — the single source of truth for what the public site says exists.
//
// Every page reads its projects, statuses, milestones and channels from here, so
// a claim is made (or corrected) in one place. Rules, enforced by
// tests/unit/ecosystem-content.test.ts:
//   - a status is one of STATUS — nothing is "live" unless people can use it today;
//   - an external link is https and verified by a person before it is added;
//   - a social channel without a verified URL renders as "not linked yet", never a guess.

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
    slug: 'renor-labs-store',
    name: 'Renor Labs Store',
    status: 'planned',
    kind: 'Digital products',
    summary:
      'A store for digital AI tools, developer resources and creator products. Nothing is on sale yet; products appear only when they are finished.',
    href: '/store',
    action: 'See the store plan',
  },
  {
    slug: 'zero-to-prove',
    name: 'Zero to Prove',
    status: 'preview',
    kind: 'Build in public',
    summary:
      'The founder’s building journey: what was built, what broke, and what was proven along the way.',
    href: '/zero-to-prove',
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
 * Renor's areas, as they exist in the app today. `where` is what the release
 * candidate under review contains; `public` is what the public web preview runs.
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
      'Ask, research and plan with the AI provider you connect. Answers can cite live sources when you ask for current facts.',
    does: [
      'Works with the AI providers configured for your account, or your own key',
      'Reads attached text and PDF files, and images with providers that accept them',
      'Voice: talk to Renor and hear it answer',
      'Hands work to Code AI or the Website Builder when you ask it to build',
    ],
    limits:
      'Answers depend on the provider you connect and its own limits. Live sources and voice improvements are in the release candidate, not yet in the public preview.',
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
      'Keeps a receipt of what was checked and what passed',
    ],
    limits:
      'Large projects can exceed provider limits. Python runs the standard library only. Running Python is in the release candidate, not yet in the public preview.',
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
    summary: 'Turn a clear brief into a responsive website you can edit, version and preview.',
    does: [
      'Starts from your brief and a direction you choose',
      'Editable files and an isolated live preview',
      'Section-by-section edits without rebuilding everything',
    ],
    limits:
      'Publishing to a public address is still being set up. Quality depends on the brief and the AI provider.',
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
      'Notes and tasks, including tasks with due dates from a plain sentence',
      'Projects that keep their builds and verification together',
      'Renor remembers facts you ask it to keep, and forgets them when you ask',
    ],
    limits:
      'Task deadlines and memory are in the release candidate, not yet in the public preview.',
  },
];

/** Dated, checkable progress. Newest first. */
export interface Milestone {
  date: string;
  title: string;
  detail: string;
  where: 'release-candidate' | 'public-preview' | 'website';
}

export const MILESTONES: readonly Milestone[] = [
  {
    date: '2026-10-05',
    title: 'Python runs inside Code AI',
    detail:
      'Real Python in the browser, sandboxed with no network, a time limit and a Stop button. Two independent reviews found 22 issues; all but one stated limit are fixed.',
    where: 'release-candidate',
  },
  {
    date: '2026-10-05',
    title: 'Renor listens, remembers and builds',
    detail:
      'Voice that waits for you to finish a thought, memory you control, tasks with real deadlines, and research that can end in a real build.',
    where: 'release-candidate',
  },
  {
    date: '2026-10-05',
    title: 'Live facts with sources',
    detail:
      'Ask for something current and Renor answers with the sources it read, in chat and in voice.',
    where: 'release-candidate',
  },
  {
    date: '2026-10-04',
    title: 'Release candidate QA fixes',
    detail: 'Fixes from a full founder QA pass across Chat, Code AI and the Website Builder.',
    where: 'release-candidate',
  },
  {
    date: '2026-09-29',
    title: 'Truthful company front door',
    detail:
      'The website was rewritten to separate what exists from what is planned, and unsupported claims were removed.',
    where: 'website',
  },
  {
    date: '2026-09-19',
    title: 'Current public web preview',
    detail:
      'The version of Renor anyone can open today. Newer work above arrives when the release candidate is approved.',
    where: 'public-preview',
  },
];

export const MILESTONE_WHERE = {
  'release-candidate': 'In the release candidate under review',
  'public-preview': 'In the public web preview',
  website: 'On this website',
} as const;

/**
 * Social and video channels. `url` stays null until the founder confirms the
 * exact account; the page then says "not linked yet" instead of guessing a
 * handle that might belong to someone else.
 */
export interface Channel {
  id: 'youtube' | 'tiktok' | 'github';
  name: string;
  purpose: string;
  url: string | null;
}

export const CHANNELS: readonly Channel[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    purpose: 'Longer build sessions, demonstrations and lessons.',
    url: null,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    purpose: 'Short clips from the build: wins, failures and fixes.',
    url: null,
  },
  {
    id: 'github',
    name: 'GitHub',
    purpose: 'The public code for this website and its reviewed changes.',
    url: 'https://github.com/foundernexoralabs-debug/foundernexora-hub',
  },
];

export const RENOR_APP_URL = RENOR_WEB_PREVIEW_URL;
export const PUBLIC_REPO_URL = 'https://github.com/foundernexoralabs-debug/foundernexora-hub';
export const FEEDBACK_URL =
  'https://github.com/foundernexoralabs-debug/foundernexora-hub/issues/new';
