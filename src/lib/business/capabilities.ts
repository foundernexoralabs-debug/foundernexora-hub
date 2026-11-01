// @polsia:user-owned — what Renor can do today, each with its honest status.
//
// The single source for /renor/capabilities and for the `featureList` in Renor's structured data
// (src/lib/business/search-identity.ts), so search engines read the same claims people do.
//
// Checked against the Renor app's main branch at 546cb65 (Launch v1, merged 31 October 2026):
//   live     in the app today, and its core workflow has passed a real run;
//   preview  in the app and usable, still being proven: new in this release, proven so far only
//            by scripted tests, or a real run that was partial;
//   planned  not in the app yet, whether designed or built and waiting for review.
// tests/unit/capabilities.test.ts fails the build if a status falls outside these three, a planned
// item reads as available, or a status here contradicts the /renor feature cards (launch.ts).
import { STATUS, type StatusKey } from '@/lib/business/ecosystem';
import { PAID_PLANS_NOTICE, PLANS } from '@/lib/business/plans';

export type CapabilityStatus = Extract<StatusKey, 'live' | 'preview' | 'planned'>;

/** Display order, most available first. */
export const CAPABILITY_STATUS_ORDER: readonly CapabilityStatus[] = ['live', 'preview', 'planned'];

/** What each status means on this page. Labels and badge tones come from the site's STATUS. */
export const CAPABILITY_STATUS: Record<CapabilityStatus, { label: string; description: string }> = {
  live: {
    label: STATUS.live.label,
    description: 'In the Renor app today, and its core workflow has passed a real run.',
  },
  preview: {
    label: STATUS.preview.label,
    description: 'In the app and usable, still being proven in daily use.',
  },
  planned: {
    label: STATUS.planned.label,
    description: 'Not in the app yet, so you cannot use it today.',
  },
};

/** When, and against what, every status below was last checked. */
export const CAPABILITIES_CHECKED = {
  iso: '2026-10-31',
  label: '31 October 2026',
  release: 'Launch v1',
} as const;

export type CapabilityAreaId =
  | 'chat'
  | 'code'
  | 'builder'
  | 'workspace'
  | 'voice'
  | 'youtube'
  | 'models'
  | 'access';

export type CapabilityIcon = 'chat' | 'code' | 'globe' | 'folder' | 'mic' | 'video' | 'cpu' | 'key';

export interface CapabilityArea {
  id: CapabilityAreaId;
  name: string;
  summary: string;
  icon: CapabilityIcon;
  /** The area's own address in the Renor app, opened at RENOR_APP_ADDRESS. */
  room: { path: string; label: string };
  /** The main known limit, said plainly. */
  limit: string;
}

export interface Capability {
  id: string;
  area: CapabilityAreaId;
  name: string;
  text: string;
  status: CapabilityStatus;
  /** The /renor feature card (launch.ts FEATURES) this belongs to; the tests keep them in step. */
  feature?: string;
}

const paidPlans = PLANS.filter((plan) => plan.state !== 'open');
const freePlan = PLANS.find((plan) => plan.state === 'open');
/** "proposed prices of " while any paid price still awaits approval; nothing once approved. */
const pricePrefix = paidPlans.some((plan) => (plan.price.status as string) === 'proposed')
  ? 'proposed prices of '
  : '';

/** "Pro, Plus and Max", from the plans list. */
function listOf(items: readonly string[]): string {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/**
 * The Renor app's own address: what this page links to and what search engines are told.
 * Checked on 31 October 2026: it serves the app (every room's address answers) and Google sign-in
 * returns there. The rest of the site's "Open Renor" links follow RENOR_APP_URL, which PR #17
 * moves to this same address; until then they open the older founderlab-ai01.vercel.app, which
 * serves the same app. tests/unit/capabilities.test.ts keeps the two in step.
 */
export const RENOR_APP_ADDRESS = 'https://app.renor.app';

/** The Renor app's host as people type it: "app.renor.app". */
export const RENOR_APP_HOST = new URL(RENOR_APP_ADDRESS).host;

export const CAPABILITY_AREAS: readonly CapabilityArea[] = [
  {
    id: 'chat',
    name: 'Chat',
    summary:
      'Ask, research and plan in one conversation with the model you choose. When you ask it to build, Chat hands the work to the right room.',
    icon: 'chat',
    room: { path: '/chat', label: 'Open Chat' },
    limit:
      'Answers are only as strong as the model behind them. The free models available by default handle files and tools well, but are not yet at the level of the strongest assistants on hard reasoning.',
  },
  {
    id: 'code',
    name: 'Code AI',
    summary:
      'Describe an app or a game, or paste code. Code AI writes the files, runs them in a live preview and checks the result against your brief.',
    icon: 'code',
    room: { path: '/code', label: 'Open Code AI' },
    limit:
      'Proven on small and medium apps, not yet on large multi-feature projects. Python runs the standard library only, and publishing goes to GitHub Pages only.',
  },
  {
    id: 'builder',
    name: 'Website Builder',
    summary:
      'Turn a clear brief into a responsive website, written from your own facts, that you can preview, edit and export.',
    icon: 'globe',
    room: { path: '/builder', label: 'Open the Website Builder' },
    limit:
      'Sites use artwork drawn for them, not photography. Publishing to a public address is not set up yet, and every detail is worth checking before you publish.',
  },
  {
    id: 'workspace',
    name: 'Projects, notes and tasks',
    summary:
      'What you make stays together, so work never starts from zero: every site and app, your notes and your tasks, one click from the Dashboard.',
    icon: 'folder',
    room: { path: '/projects', label: 'Open Projects' },
    limit: 'Reminders and remembered facts are new, and still being proven in daily use.',
  },
  {
    id: 'voice',
    name: 'Voice',
    summary:
      'Talk to Renor and hear it answer. One voice setting covers read-aloud, live calls and the wake word.',
    icon: 'mic',
    room: { path: '/chat', label: 'Try it in Chat' },
    limit:
      'The free voices download once (about 90 MB) and run on your device. On a slow device, its own system voice reads instead, and the free male voices are less natural than the female ones.',
  },
  {
    id: 'youtube',
    name: 'YouTube Studio',
    summary: 'Turn a long video into short clips that are ready to post.',
    icon: 'video',
    room: { path: '/youtube', label: 'Open YouTube Studio' },
    limit:
      'Still being proven on real channels: check every clip, caption and title before you post.',
  },
  {
    id: 'models',
    name: 'Models and keys',
    summary:
      'Use the models available in Renor, or connect your own provider and key. You choose per conversation.',
    icon: 'cpu',
    room: { path: '/settings/ai', label: 'Open AI settings' },
    limit: 'Your own keys are new: not every provider has been tested with a real key yet.',
  },
  {
    id: 'access',
    name: 'Access and plans',
    summary:
      'Renor runs in your browser. Start free with an email or a Google account, and always see where your AI credits stand.',
    icon: 'key',
    room: { path: '/plans', label: 'See your plan' },
    limit: PAID_PLANS_NOTICE,
  },
];

export const CAPABILITIES: readonly Capability[] = [
  /* ── Chat ─────────────────────────────────────────────────────────── */
  {
    id: 'chat-conversations',
    area: 'chat',
    name: 'Conversations with the model you choose',
    text: 'Ask, plan and decide in one thread. Every reply is labelled with the model that answered it.',
    status: 'live',
    feature: 'chat',
  },
  {
    id: 'chat-files',
    area: 'chat',
    name: 'Files, images and PDFs',
    text: 'Attach images, PDFs, Word documents and long text, then keep asking about them later in the conversation.',
    status: 'live',
    feature: 'chat',
  },
  {
    id: 'chat-research',
    area: 'chat',
    name: 'Web research with sources',
    text: 'Ask about something current and Renor reads the web, then answers with the sources it used, so you can check them.',
    status: 'preview',
    feature: 'research',
  },
  {
    id: 'chat-build',
    area: 'chat',
    name: 'From conversation to build',
    text: '“Build me a website for my bakery” starts the Website Builder with your brief. “Test my app” opens it in Code AI’s preview.',
    status: 'preview',
  },
  {
    id: 'chat-memory',
    area: 'chat',
    name: 'Memory you control',
    text: 'Ask Renor to remember a fact about you or your work, and to forget it again.',
    status: 'preview',
    feature: 'chat',
  },
  {
    id: 'chat-github',
    area: 'chat',
    name: 'GitHub pull requests from Chat',
    text: 'Inspect a repository and open a pull request from a conversation. Nothing changes until you approve it.',
    status: 'preview',
    feature: 'github',
  },

  /* ── Code AI ──────────────────────────────────────────────────────── */
  {
    id: 'code-build',
    area: 'code',
    name: 'Multi-file apps and games',
    text: 'Builds web apps and games across several files from a plain-language brief, and picks a build back up when a provider limit pauses it.',
    status: 'live',
    feature: 'code',
  },
  {
    id: 'code-preview',
    area: 'code',
    name: 'Live preview',
    text: 'The app runs as it is written, in an isolated preview with its console beside it.',
    status: 'live',
    feature: 'code',
  },
  {
    id: 'code-verify',
    area: 'code',
    name: 'Checked against your brief',
    text: 'A build is checked against what you asked for before it is called done. A failed check says which one, with Fix it one click away.',
    status: 'live',
    feature: 'code',
  },
  {
    id: 'code-python',
    area: 'code',
    name: 'Python in your browser',
    text: 'Runs Python inside Code AI: sandboxed, with no network access, a time limit and a Stop button.',
    status: 'live',
    feature: 'code',
  },
  {
    id: 'code-modes',
    area: 'code',
    name: 'Fix Bug, Truth Audit, Improve, Explain and Tests',
    text: 'One click to repair a bug, audit what the code really does, improve its design, features or speed, explain it, or write its tests.',
    status: 'preview',
    feature: 'code',
  },
  {
    id: 'code-computer',
    area: 'code',
    name: 'Renor Computer in the preview',
    text: 'Say what to check (“play a round and tell me if scoring works”) and Renor clicks, types and tests the running app, step by step. Take control or stop at any moment; it never types passwords or payment details.',
    status: 'preview',
  },
  {
    id: 'code-projects',
    area: 'code',
    name: 'Projects with their own link',
    text: 'Every Code AI project has its own address, versions you can go back to, and a backup to your account.',
    status: 'preview',
  },
  {
    id: 'code-publish',
    area: 'code',
    name: 'Publish to GitHub Pages',
    text: 'Put a finished app on GitHub Pages from Code AI with your GitHub account, after you confirm.',
    status: 'preview',
  },
  {
    id: 'code-computer-engine',
    area: 'code',
    name: 'Renor Computer on your own machine',
    text: 'A real Chrome you can watch and take over, with a terminal and files, running on a computer you own. In development, and not ready to install yet.',
    status: 'planned',
  },

  /* ── Website Builder ──────────────────────────────────────────────── */
  {
    id: 'builder-facts',
    area: 'builder',
    name: 'Websites from your own facts',
    text: 'Puts your real prices, opening hours, address and services on the page. Anything you leave out stays general rather than invented.',
    status: 'live',
    feature: 'builder',
  },
  {
    id: 'builder-preview',
    area: 'builder',
    name: 'Live preview and section edits',
    text: 'Watch the site fill in as each file arrives, preview it at desktop, tablet and phone sizes, and change one section at a time.',
    status: 'live',
    feature: 'builder',
  },
  {
    id: 'builder-export',
    area: 'builder',
    name: 'Export as a ZIP',
    text: 'Download the finished site as plain files you can host anywhere.',
    status: 'live',
    feature: 'builder',
  },
  {
    id: 'builder-forms',
    area: 'builder',
    name: 'Forms that work',
    text: 'Booking, sign-up and order forms that open your visitor’s email app, addressed to you, with every field filled in. Order forms add up a live total from your own prices.',
    status: 'preview',
  },
  {
    id: 'builder-design',
    area: 'builder',
    name: 'A look that fits the brief',
    text: 'Takes its design direction from the tone of your brief, in your colours, with artwork drawn for your business instead of stock photos.',
    status: 'preview',
    feature: 'builder',
  },
  {
    id: 'builder-publish',
    area: 'builder',
    name: 'One-click publishing',
    text: 'Put a site on a public address straight from the Builder. Today you export a ZIP and host it yourself.',
    status: 'planned',
    feature: 'publishing',
  },

  /* ── Projects, notes and tasks ────────────────────────────────────── */
  {
    id: 'workspace-projects',
    area: 'workspace',
    name: 'Projects room',
    text: 'Every site and app you make, in one place. Search, filter, rename, reopen in the right room, or delete with a confirmation.',
    status: 'live',
    feature: 'projects',
  },
  {
    id: 'workspace-dashboard',
    area: 'workspace',
    name: 'Dashboard',
    text: 'Your active project one click away, with today’s focus, what is next and recent activity.',
    status: 'live',
  },
  {
    id: 'workspace-notes',
    area: 'workspace',
    name: 'Notes',
    text: 'Notes with titles, tags and search, kept beside the work they belong to.',
    status: 'live',
    feature: 'notes-tasks',
  },
  {
    id: 'workspace-tasks',
    area: 'workspace',
    name: 'Tasks with real deadlines',
    text: 'Tasks with a due date and time, added by you or created from a reminder in Chat.',
    status: 'live',
    feature: 'notes-tasks',
  },
  {
    id: 'workspace-reminders',
    area: 'workspace',
    name: 'Reminders from Chat',
    text: '“Remind me to call Sam tomorrow at 5” becomes a task due at 17:00.',
    status: 'preview',
    feature: 'notes-tasks',
  },

  /* ── Voice ────────────────────────────────────────────────────────── */
  {
    id: 'voice-read-aloud',
    area: 'voice',
    name: 'Six free voices',
    text: 'Answers read aloud in three female and three male natural voices, American and British. They run on your device, with no usage limit, and each has its own preview.',
    status: 'live',
    feature: 'voice',
  },
  {
    id: 'voice-dictation',
    area: 'voice',
    name: 'Dictation',
    text: 'Speak instead of typing. Renor waits for you to finish a thought.',
    status: 'preview',
    feature: 'voice',
  },
  {
    id: 'voice-call',
    area: 'voice',
    name: 'Live call',
    text: 'Talk it through out loud. Renor starts speaking from the first sentence of its answer, in the voice you chose.',
    status: 'preview',
    feature: 'voice',
  },
  {
    id: 'voice-wake',
    area: 'voice',
    name: '“Hey Renor”',
    text: 'Say “Hey Renor” to start talking without touching the screen.',
    status: 'preview',
    feature: 'voice',
  },

  /* ── YouTube Studio ───────────────────────────────────────────────── */
  {
    id: 'youtube-clips',
    area: 'youtube',
    name: 'Short clips from long videos',
    text: 'Finds strong moments in a video and turns them into short clips with captions, titles and hashtags.',
    status: 'preview',
    feature: 'youtube',
  },

  /* ── Models and keys ──────────────────────────────────────────────── */
  {
    id: 'models-choice',
    area: 'models',
    name: 'Your choice of model',
    text: 'Gemini, Groq, OpenRouter, Claude, OpenAI, xAI Grok, a local Ollama, OmniRoute or any OpenAI-compatible endpoint.',
    status: 'live',
    feature: 'models',
  },
  {
    id: 'models-own-key',
    area: 'models',
    name: 'Bring your own key',
    text: 'Add your own key for OpenAI, Anthropic, Gemini, Groq, OpenRouter or xAI, and Renor uses it for your requests.',
    status: 'preview',
    feature: 'models',
  },
  {
    id: 'models-paste-key',
    area: 'models',
    name: 'Paste any key',
    text: 'Paste a key from a supported provider and Renor recognises which one it is, checks it without spending anything, and keeps it only if it works. Built and in review, not in the app yet.',
    status: 'planned',
  },

  /* ── Access and plans ─────────────────────────────────────────────── */
  {
    id: 'access-browser',
    area: 'access',
    name: 'Runs in your browser',
    text: `Open Renor at ${RENOR_APP_HOST} on a computer or a phone. There is nothing to install.`,
    status: 'live',
  },
  {
    id: 'access-account',
    area: 'access',
    name: 'Free account',
    text: `Sign up with your email, or continue with Google. ${freePlan?.name ?? 'Free'} is ${freePlan?.price.label ?? '£0'} a month, with no card.`,
    status: 'live',
  },
  {
    id: 'access-guides',
    area: 'access',
    name: 'Step-by-step guides',
    text: 'Short guides from a new account to your first build, choosing a model and keeping API keys safe. Readable without an account.',
    status: 'live',
  },
  {
    id: 'access-usage',
    area: 'access',
    name: 'Plan and usage',
    text: 'Settings shows your weekly AI credits, when they reset and where they went.',
    status: 'preview',
    feature: 'usage',
  },
  {
    id: 'access-paid-plans',
    area: 'access',
    name: 'Paid plans',
    text: `${listOf(paidPlans.map((plan) => plan.name))}, at ${pricePrefix}${listOf(paidPlans.map((plan) => plan.price.label))} a month. Not on sale yet: there is no checkout, and nothing can be bought or charged.`,
    status: 'planned',
    feature: 'billing',
  },
  {
    id: 'access-desktop',
    area: 'access',
    name: 'Renor for desktop',
    text: 'A desktop build exists in development. A download appears only after verified release files and a security review.',
    status: 'planned',
    feature: 'desktop',
  },
  {
    id: 'access-extensions',
    area: 'access',
    name: 'Plugin Store extensions',
    text: 'Add-ons for Renor, sold through the Renor Plugin Store once it opens.',
    status: 'planned',
    feature: 'extensions',
  },
];

/** The capabilities in one area, most available first. */
export function capabilitiesIn(area: CapabilityAreaId): Capability[] {
  return CAPABILITIES.filter((capability) => capability.area === area).sort(
    (a, b) => CAPABILITY_STATUS_ORDER.indexOf(a.status) - CAPABILITY_STATUS_ORDER.indexOf(b.status),
  );
}

/** How many capabilities carry each status. */
export function statusCounts(
  items: readonly Capability[] = CAPABILITIES,
): Record<CapabilityStatus, number> {
  const counts: Record<CapabilityStatus, number> = { live: 0, preview: 0, planned: 0 };
  for (const item of items) counts[item.status] += 1;
  return counts;
}

/** What people can use today (live and preview), by name: never anything planned. */
export function usableCapabilityNames(): string[] {
  return CAPABILITIES.filter((capability) => capability.status !== 'planned').map(
    (capability) => capability.name,
  );
}

/** An area's room in the Renor app, as a full URL. */
export function roomUrl(area: Pick<CapabilityArea, 'room'>): string {
  return `${RENOR_APP_ADDRESS}${area.room.path}`;
}

/** The public page that lists every capability. */
export const CAPABILITIES_PATH = '/renor/capabilities';
