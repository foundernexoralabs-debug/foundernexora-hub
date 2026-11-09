// @polsia:user-owned — Renor as an AI operator: the homepage story in one place.
//
// Positioning (Atlas and the founder, Nov 2026): Renor is an AI operator, not a chat window.
// You give it the outcome; it plans, coordinates tools and agents, does the work, checks it and
// shows the proof. Chat, Code AI and the Website Builder are its hands, not the headline.
//
// Truth rules, enforced by tests/unit/operator.test.ts:
//   - every "today" claim points at a capability in capabilities.ts that is live or preview;
//   - every proof picture is a real Renor screen (no invented business, testimonial or metric);
//   - anything that is not shipped lives in vision.ts, labelled in progress or future vision.
import { CAPABILITIES_PATH } from '@/lib/business/capabilities';
import { EVENT } from '@/lib/business/cocreate';
import { CONTACT_MAILTO, PUBLIC_REPO_URL, RENOR_APP_URL } from '@/lib/business/ecosystem';

/** The one line a visitor must understand in ten seconds. */
export const HERO = {
  eyebrow: 'Renor · the AI operator',
  title: 'Tell Renor the outcome.',
  titleAccent: 'It does the work, and shows the proof.',
  lede: 'Renor is an AI operator, not a chatbot. It plans the job, coordinates the right tools and agents, does the work, checks it, and hands you the receipts. On your own models or ours.',
  primary: { label: 'Open Renor', href: RENOR_APP_URL },
  secondary: { label: 'See how it works', href: '#how' },
  reassurance: 'Free to start. No card. 12 languages.',
} as const;

/** Where the live app's real screens were captured, and when. */
export const PROOF_CAPTURED = {
  /** Fresh captures of the public sign-in and guides at app.renor.app. */
  fresh: '8 November 2026',
  /** Cropped from the 24 October tour captures, keeping only Renor's own interface. */
  tour: '24 October 2026',
} as const;

export interface ProofItem {
  id: string;
  /** What Renor does, in a few words. */
  title: string;
  text: string;
  /** The capability in capabilities.ts that this card describes (must be live or preview). */
  capabilityId: string;
  image: { src: string; width: number; height: number; alt: string };
  captured: string;
}

/** What Renor does today, each with a real crop of its own interface. */
export const PROOF: readonly ProofItem[] = [
  {
    id: 'steps',
    title: 'Every step is logged as it happens',
    text: 'A build is a run you can watch: the plan, each file as it is written, and what is left. Nothing happens off the record.',
    capabilityId: 'code-build',
    image: {
      src: '/assets/renor/proof/build-steps.webp',
      width: 810,
      height: 232,
      alt: 'Renor’s build log: Manifest, Layout, Generating index.html, Wrote index.html (1 of 3 files), Generating styles.css.',
    },
    captured: PROOF_CAPTURED.tour,
  },
  {
    id: 'checks',
    title: 'It checks its own work',
    text: 'Build, Fix Bug, Truth Audit, Tests and Verify are separate modes. Renor previews what it made and reports what actually runs.',
    capabilityId: 'code-verify',
    image: {
      src: '/assets/renor/proof/check-modes.webp',
      width: 372,
      height: 270,
      alt: 'Code AI modes: Build, Fix Bug, Truth Audit, Improve, Explain, Tests and Verify.',
    },
    captured: PROOF_CAPTURED.tour,
  },
  {
    id: 'computer',
    title: 'It uses what it built, like a person would',
    text: 'Renor Computer drives the preview: it clicks every button, fills in the form and reports anything broken.',
    capabilityId: 'code-computer',
    image: {
      src: '/assets/renor/proof/renor-computer.webp',
      width: 1008,
      height: 214,
      alt: 'Renor Computer bar with “Let Renor drive” and the suggestions “Try every button and report anything broken” and “Fill in the form and check it saves”, above the preview’s console.',
    },
    captured: PROOF_CAPTURED.tour,
  },
  {
    id: 'keys',
    title: 'Your model, your key, your choice',
    text: 'Run on Renor’s hosted AI or your own provider. Your key stays in your browser, and Renor says which model answered.',
    capabilityId: 'models-own-key',
    image: {
      src: '/assets/renor/proof/own-keys.webp',
      width: 1500,
      height: 960,
      alt: 'Renor’s guide “Choosing a model”: Renor-managed or your own key, and every provider Renor supports.',
    },
    captured: PROOF_CAPTURED.fresh,
  },
];

/** The operator loop: outcome → plan → work → verify → proof. */
export const LOOP = [
  {
    id: 'outcome',
    step: 'Outcome',
    title: 'You say what done looks like',
    text: 'A site for your business, a fixed bug, a working tool. Plain words, any of 12 languages.',
  },
  {
    id: 'plan',
    step: 'Plan',
    title: 'Renor plans before it touches anything',
    text: 'It breaks the outcome into steps and picks the right hands: Chat, Code AI or the Website Builder.',
  },
  {
    id: 'work',
    step: 'Work',
    title: 'It does the work, in the open',
    text: 'Files are written, previews run and every step is logged. Consequential actions wait for your yes.',
  },
  {
    id: 'verify',
    step: 'Verify',
    title: 'It checks the result against your brief',
    text: 'Tests, a truth audit and Renor Computer using the result like a person would. Failures are shown, not hidden.',
  },
  {
    id: 'proof',
    step: 'Proof',
    title: 'You get the work and the receipts',
    text: 'What ran, what passed, what is still open and which model did it. Kept in your project, ready to pick up again.',
  },
] as const;

/** Own your AI: the reasons people pick Renor over a single-provider chat app. */
export const OWN_AI = [
  {
    id: 'local',
    title: 'Local models, free and private',
    text: 'Run Ollama on your own computer and your prompts never leave it. No credits used; it works while that computer is on.',
  },
  {
    id: 'keys',
    title: 'Your own keys',
    text: 'Gemini, Groq, OpenRouter, Anthropic, OpenAI, xAI or any OpenAI-compatible endpoint. Your bill, your limits.',
  },
  {
    id: 'hosted',
    title: 'Or Renor’s hosted AI',
    text: 'Nothing to set up. A free weekly allowance, with fallback when a provider is busy.',
  },
  {
    id: 'no-lock-in',
    title: 'No lock-in to one provider',
    text: 'Switch models any time. Your projects, notes and tasks stay in Renor, whichever model did the work.',
  },
] as const;

/** Who is reading, and where they should go next. Static routing: no AI, no tracking. */
export interface AudienceRoute {
  id: 'business' | 'developer' | 'investor' | 'press';
  label: string;
  /** One sentence, written to that reader. */
  pitch: string;
  links: readonly { label: string; href: string; note: string }[];
}

export const AUDIENCE_ROUTES: readonly AudienceRoute[] = [
  {
    id: 'business',
    label: 'Business owner',
    pitch:
      'Freelancers and small service businesses: tell Renor the outcome, check the proof, keep your time.',
    links: [
      { label: 'See how it works', href: '#how', note: 'Five steps, two minutes' },
      { label: 'Pricing', href: '/renor/plans', note: 'Free to start' },
      { label: 'Open Renor', href: RENOR_APP_URL, note: 'Free account, no card' },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    pitch:
      'Code AI builds multi-file apps, previews them, tests them and drives them with Renor Computer. On your models.',
    links: [
      {
        label: 'Every capability and its status',
        href: CAPABILITIES_PATH,
        note: 'Live, preview or planned',
      },
      { label: 'Own your AI', href: '#own-ai', note: 'Ollama, your keys or ours' },
      { label: 'This website’s code', href: PUBLIC_REPO_URL, note: 'Public on GitHub' },
    ],
  },
  {
    id: 'investor',
    label: 'Investor',
    pitch:
      'What is live, what is in progress and what is vision, kept apart in one ledger. Judge us on the evidence.',
    links: [
      { label: 'The vision and the ledger', href: '/vision', note: 'Live, in progress, future' },
      { label: 'The company', href: '/company', note: 'Who builds Renor' },
      { label: EVENT.name, href: '/cocreate', note: EVENT.date },
    ],
  },
  {
    id: 'press',
    label: 'Press',
    pitch: 'Approved descriptions, real screenshots and brand assets, with a person to answer.',
    links: [
      { label: 'Press and launch kit', href: '/launch-kit', note: 'Blurbs, images, logo' },
      { label: 'The company', href: '/company', note: 'Facts and contact' },
      { label: 'Email the founder', href: CONTACT_MAILTO, note: 'A person answers' },
    ],
  },
];

/** Static 1200 × 630 share cards (dark stage, the orb, the page's line). */
export const SHARE_CARDS = {
  home: {
    url: '/assets/og/home.png',
    width: 1200,
    height: 630,
    alt: 'Renor, the AI operator: Tell Renor the outcome. It does the work, and shows the proof.',
    type: 'image/png',
  },
  vision: {
    url: '/assets/og/vision.png',
    width: 1200,
    height: 630,
    alt: 'The Renor vision: turn human intention into verified work. Live today, in progress and future vision, kept apart.',
    type: 'image/png',
  },
  cocreate: {
    url: '/assets/og/cocreate.png',
    width: 1200,
    height: 630,
    alt: `Renor at ${EVENT.name}, ${EVENT.date}: Good to meet you. This is Renor.`,
    type: 'image/png',
  },
} as const;
