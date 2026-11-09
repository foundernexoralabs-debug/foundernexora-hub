// @polsia:user-owned — the Renor vision and the vision-to-proof ledger (website issues #14, #16).
//
// One rule: a claim is in exactly one column, and it only moves left with evidence.
//   - "Live today": in the app now. It must name a capability in capabilities.ts that is live
//     or preview, so this page can never say more than the capability index does.
//   - "In progress": being built on a branch or designed in an issue; not usable yet.
//   - "Future vision": where Renor is going. No product, partner, customer or date is implied.
// A milestone is never marked achieved automatically: `achieved` is set by a person, with the
// evidence link. tests/unit/vision.test.ts enforces all of this.
//
// DRAFT: the mission and long-term vision below are written from the founder's directives
// (17 Oct, 2 Nov, 3 Nov, 7 Nov 2026) and Atlas's notes on issues #14 and #16, because the
// founder's "Vision Archive — Edition 001" text is not in the repository. Replace with his words.
import { CAPABILITIES, CAPABILITIES_CHECKED } from '@/lib/business/capabilities';

/** When the live column was last checked against the app (the capability index's date). */
export const LEDGER_CHECKED = CAPABILITIES_CHECKED.label;

export type ClaimStatus = 'live' | 'in-progress' | 'future';

export const CLAIM_STATUS: Record<ClaimStatus, { label: string; description: string }> = {
  live: {
    label: 'Live today',
    description: 'In the app now. Open Renor and try it.',
  },
  'in-progress': {
    label: 'In progress',
    description: 'Being built or tested. Not something you can use yet.',
  },
  future: {
    label: 'Future vision',
    description: 'Where Renor is going. Not built, not promised by a date.',
  },
};

export interface LedgerEntry {
  id: string;
  claim: string;
  detail: string;
  status: ClaimStatus;
  /** For live claims: the capability in capabilities.ts that backs it. */
  capabilityId?: string;
  /** In progress and future: when the idea was first written down, as the site writes dates. */
  since?: string;
  /** Public evidence: a page on this site or a public link. */
  evidence?: { label: string; href: string };
  /** Set by a person only, with evidence, the day a claim moved to live. */
  achieved?: string;
}

/** The capability's own status ("live" or "preview"), for a live ledger row. */
export function capabilityStatus(id: string | undefined) {
  return CAPABILITIES.find((capability) => capability.id === id)?.status;
}

export const MISSION = {
  line: 'Turn human intention into verified work.',
  text: 'Most AI answers questions. Renor is built to finish things: you state the outcome, and it plans, coordinates the right tools and agents, does the work, checks it and shows you the proof. We judge Renor by one question: did the work get done, and can you see that it did?',
} as const;

/** The operator concept, as three ideas. */
export const OPERATOR_CONCEPT = [
  {
    title: 'Outcomes, not answers',
    text: 'You describe what done looks like. Renor turns it into steps, routes each step to the right hands and keeps going until it can show a result.',
  },
  {
    title: 'Proof, not promises',
    text: 'Every run leaves receipts: what ran, what passed, what failed, what is still open and which model did it. Unverified work is labelled as unverified.',
  },
  {
    title: 'Any model, your rules',
    text: 'Local models, your own keys or Renor’s hosted AI, with no lock-in to one provider. Consequential actions wait for a person to say yes.',
  },
] as const;

export const LEDGER: readonly LedgerEntry[] = [
  // ── Live today ────────────────────────────────────────────────────
  {
    id: 'build-and-verify',
    claim: 'Builds apps and checks them against your brief',
    detail: 'Code AI writes multi-file apps, runs them in a live preview and reports what passed.',
    status: 'live',
    capabilityId: 'code-verify',
    evidence: { label: 'Capability index', href: '/renor/capabilities#code' },
  },
  {
    id: 'websites',
    claim: 'Websites from your own facts',
    detail: 'The Website Builder turns your business facts into a site you can edit and export.',
    status: 'live',
    capabilityId: 'builder-facts',
    evidence: { label: 'Capability index', href: '/renor/capabilities#builder' },
  },
  {
    id: 'operates-preview',
    claim: 'Uses what it built, like a person would',
    detail: 'Renor Computer clicks through a preview and reports anything broken. In preview.',
    status: 'live',
    capabilityId: 'code-computer',
    evidence: { label: 'Capability index', href: '/renor/capabilities#code' },
  },
  {
    id: 'any-model',
    claim: 'Runs on the model you choose',
    detail: 'Renor’s hosted AI, your own API keys, or a local model with Ollama.',
    status: 'live',
    capabilityId: 'models-choice',
    evidence: { label: 'Choosing a model', href: 'https://app.renor.app/guides/choosing-a-model' },
  },
  {
    id: 'workspace',
    claim: 'Keeps the work together',
    detail: 'Projects, notes and tasks with real deadlines, so a job can be picked up again.',
    status: 'live',
    capabilityId: 'workspace-projects',
    evidence: { label: 'Capability index', href: '/renor/capabilities#workspace' },
  },
  // ── In progress ───────────────────────────────────────────────────
  {
    id: 'missions',
    claim: 'Missions: one outcome, carried to the end',
    detail:
      'A mission holds the goal, the plan, approvals and evidence, and resumes after a reload. First case: an enquiry turned into a resolved job for a small service business.',
    status: 'in-progress',
    since: '2 November 2026',
  },
  {
    id: 'background',
    claim: 'Keeps working in the background',
    detail:
      'Long jobs continue while you do something else, with a heartbeat, bounded spend and a stop button. Not live: today nothing runs while your device is off.',
    status: 'in-progress',
    since: '28 October 2026',
  },
  {
    id: 'actions',
    claim: 'Acts in your tools, with your permission',
    detail:
      'Connectors for GitHub, Vercel, Google Drive and Sheets, Gmail and Stripe, each with scoped access and a yes from you before anything consequential.',
    status: 'in-progress',
    since: '28 October 2026',
  },
  {
    id: 'one-payment',
    claim: 'Pay once: Lifetime and AI credit packs',
    detail: 'Built and tested in Stripe test mode. Not on sale until the founder switches it on.',
    status: 'in-progress',
    since: '7 November 2026',
    evidence: { label: 'Pricing', href: '/renor/plans' },
  },
  // ── Future vision ─────────────────────────────────────────────────
  {
    id: 'coordination',
    claim: 'Coordinates machines, systems and other AIs in real time',
    detail:
      'Renor as the layer that connects the tools, agents and systems a business already runs, and coordinates their work as it happens.',
    status: 'future',
    since: '31 October 2026',
  },
  {
    id: 'organisations',
    claim: 'Real-time work for organisations, and later governments',
    detail:
      'From one founder to larger organisations and, in time, public services: permissioned, auditable work with proof at every step.',
    status: 'future',
    since: '7 November 2026',
  },
  {
    id: 'devices',
    claim: 'Robotics and devices',
    detail:
      'The same permissions, events and verification, extended to physical devices and robots. Concept only.',
    status: 'future',
    since: '17 October 2026',
  },
  {
    id: 'science',
    claim: 'Science and space',
    detail:
      'Verified, coordinated work for scientific and physical infrastructure, and one day space. A direction, not a plan.',
    status: 'future',
    since: '31 October 2026',
  },
];

export function ledgerBy(status: ClaimStatus): LedgerEntry[] {
  return LEDGER.filter((entry) => entry.status === status);
}

/** The long-term vision, in order of distance. Every paragraph is future vision. DRAFT. */
export const LONG_TERM_VISION = [
  {
    horizon: 'Next',
    title: 'The operator for small businesses',
    text: 'Founders, freelancers and small service businesses hand Renor recurring work, from a new enquiry to a finished, checked result, and get their time back.',
  },
  {
    horizon: 'Later',
    title: 'The coordination layer for organisations',
    text: 'Renor connects to other machines, systems and AIs, and coordinates real-time work across them for businesses and organisations, and later for governments.',
  },
  {
    horizon: 'Long term',
    title: 'Beyond the screen',
    text: 'Robotics and devices, science and space: the same idea of intention turned into verified action, wherever work happens.',
  },
] as const;
