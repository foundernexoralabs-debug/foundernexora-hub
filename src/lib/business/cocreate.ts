// @polsia:user-owned — Co-Create London: the facts behind /cocreate and its QR code.
// The QR code (public/assets/cocreate/renor-cocreate-qr.svg) encodes COCREATE_URL. It was generated with
// the QR encoder npm itself ships (qrcode-terminal) and checked by decoding it back.
// The offline demo (WALKTHROUGH below) is built only from real crops of Renor's interface.
// Demo video: none yet. DEMO_VIDEO stays null until a real recording exists; the page shows no
// video slot while it is null. Never point it at a mock-up or a recording of an older build.
import { siteUrl } from '@/lib/site';

export const COCREATE_PATH = '/cocreate';
/** What the printed QR code opens. Always the production address, whatever the deploy. */
export const COCREATE_URL = 'https://renor.app/cocreate';

/** Two days, 19–20 November 2026; the first day is 19 November (founderlab-ai0.1 issue 216; Atlas, 9 Nov). */
export const EVENT = {
  name: 'Co-Create London',
  date: '19–20 November 2026',
  /** The first day. */
  iso: '2026-11-19',
  endIso: '2026-11-20',
  city: 'London',
} as const;

export const QR_CODE = {
  src: '/assets/cocreate/renor-cocreate-qr.svg',
  /** 25 modules plus a 4-module quiet zone each side. */
  size: 33,
  alt: `QR code that opens ${COCREATE_URL}`,
} as const;

/** A real, published recording of Renor, or null. See the note above. */
export const DEMO_VIDEO: { title: string; youtubeId: string; recorded: string } | null = null;

/** This page on whatever host serves it, for metadata. */
export const COCREATE_CANONICAL = `${siteUrl}${COCREATE_PATH}`;

/**
 * The page's story, in the order Atlas asked for (9 November 2026): who you are, a real
 * problem, a real Renor run, execution and approval, verification and receipt, then the QR,
 * contact or a demo. Read aloud it is about two minutes. Nothing here is invented: the run is
 * the Code AI demo brief from the 24 October 2026 tour captures, labelled as a demo.
 */
export const STORY_INTRO = [
  {
    id: 'you',
    label: 'You',
    title: 'You run a small business, freelance, or build software.',
    text: 'Your week is full of jobs that need doing properly: a page to update, a tool to build, a fix to check.',
  },
  {
    id: 'problem',
    label: 'The problem',
    title: 'Most AI tools hand you an answer, then leave.',
    text: 'You still do the work, and you still have to check it yourself. That checking is where the evenings go.',
  },
  {
    id: 'mission',
    label: 'The mission',
    title: 'Give Renor the outcome instead.',
    text: 'In the run below, the brief was a small working web app: a repair queue for a bike workshop, where each job moves from Booked to In the stand to Ready, with what is open and what it is worth.',
  },
] as const;

/** When the run below was captured, and what it was. */
export const WALKTHROUGH_RUN = {
  captured: '24 October 2026',
  note: 'A demo brief we ran ourselves, not a customer project. The screens are cropped to Renor’s own interface.',
} as const;

export type WalkthroughStage = 'Execution' | 'Approval' | 'Verification' | 'Receipt';

export interface WalkthroughStep {
  id: string;
  stage: WalkthroughStage;
  title: string;
  text: string;
  image: { src: string; width: number; height: number; alt: string };
}

/**
 * The offline demo: one real run, screen by screen. Every image is a crop of the 24 October
 * Code AI capture (public/assets/renor/tour/code-dark.webp) showing only Renor's interface.
 * If the venue network fails, this is what the visitor is shown: it needs no live app.
 */
export const WALKTHROUGH: readonly WalkthroughStep[] = [
  {
    id: 'brief',
    stage: 'Execution',
    title: 'Pick the job, say the outcome',
    text: 'You describe what done looks like in plain words and pick a mode. This run used Build.',
    image: {
      src: '/assets/renor/proof/check-modes.webp',
      width: 372,
      height: 270,
      alt: 'Code AI modes: Build (selected), Fix Bug, Truth Audit, Improve, Explain, Tests and Verify.',
    },
  },
  {
    id: 'build',
    stage: 'Execution',
    title: 'Renor plans, then builds in the open',
    text: 'The plan comes first, then each file as it is written. Nothing happens off the record.',
    image: {
      src: '/assets/renor/proof/build-steps.webp',
      width: 810,
      height: 232,
      alt: 'Renor’s build log: Manifest, Layout, Generating index.html, Wrote index.html (1 of 3 files), Generating styles.css.',
    },
  },
  {
    id: 'approval',
    stage: 'Approval',
    title: 'You stay in charge',
    text: 'Renor stops at a running preview. The last build can be undone, and publishing is a button you press.',
    image: {
      src: '/assets/renor/proof/approval.webp',
      width: 446,
      height: 48,
      alt: 'Renor’s project bar: Undo Build main.js (4 of 4), Copy all and Publish.',
    },
  },
  {
    id: 'verify',
    stage: 'Verification',
    title: 'It uses what it built, like a person would',
    text: 'Renor Computer drives the preview: try every button, fill in the form and check it saves, with the console in view.',
    image: {
      src: '/assets/renor/proof/renor-computer.webp',
      width: 1008,
      height: 214,
      alt: 'Renor Computer bar with “Let Renor drive” and the suggestions “Try every button and report anything broken” and “Fill in the form and check it saves”, above the preview’s console.',
    },
  },
  {
    id: 'receipt',
    stage: 'Receipt',
    title: 'The receipt stays with the project',
    text: 'Which model did the work, and whether it passed: here Google Gemini 3.5 Flash, marked Verified.',
    image: {
      src: '/assets/renor/proof/receipt.webp',
      width: 336,
      height: 48,
      alt: 'Renor’s project header: Google Gemini · Gemini 3.5 Flash, and a Verified badge.',
    },
  },
];

/** Limits said plainly next to "what works today" (the app's Release 3 facts). */
export const NOT_YET = [
  'Renor does not keep working while your device is off. Background work is in progress, not live.',
  'Local models (Ollama) run on your own computer, so that computer has to be on.',
  'Lifetime and AI credit packs are not on sale yet: payments are still in test mode.',
] as const;

/** Mail links for the page, with the event in the subject so a reply finds its context. */
export const COCREATE_MAIL_SUBJECTS = {
  hello: `We met at ${EVENT.name}`,
  demo: `${EVENT.name}: please show me a Renor demo`,
} as const;
