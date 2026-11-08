// @polsia:user-owned — /vision: the mission, the operator concept, the vision-to-proof ledger
// and the long-term vision (website issues #14 and #16). Every future idea is labelled future.
// DRAFT copy: written from the founder's directives until his Vision Archive text is supplied.
import { ArrowRight, CircleDot } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ClaimLedger } from '@/components/custom/claim-ledger';
import { OpenRenorButton, OpHeading } from '@/components/custom/operator-home';
import { RenorIdentityJsonLd } from '@/components/custom/structured-data';
import { Button } from '@/components/ui/button';
import { SHARE_CARDS } from '@/lib/business/operator';
import { pageMetadata } from '@/lib/business/seo';
import {
  CLAIM_STATUS,
  LEDGER_CHECKED,
  LONG_TERM_VISION,
  MISSION,
  OPERATOR_CONCEPT,
} from '@/lib/business/vision';

const DESCRIPTION =
  'Renor’s mission and vision: an AI operator that turns intention into verified work. What is live today, what is in progress and what is future vision, kept apart.';

export const metadata: Metadata = pageMetadata({
  title: 'The Renor vision: intention turned into verified work',
  description: DESCRIPTION,
  path: '/vision',
  socialTitle: 'The Renor vision, with live, in progress and future kept apart',
  image: SHARE_CARDS.vision,
});

export default function VisionPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <RenorIdentityJsonLd
        page={{ path: '/vision', name: 'The Renor vision', description: DESCRIPTION, trail: [] }}
      />
      <section aria-labelledby="vision-hero" className="dark op-stage op-hero">
        <div aria-hidden="true" className="op-stars" />
        <div className="op-hero-inner">
          <p className="op-pill op-rise">
            <span aria-hidden="true" className="op-pill-dot" />
            The Renor vision
          </p>
          <h1
            id="vision-hero"
            className="op-hero-title font-display text-balance op-rise"
            style={{ animationDelay: '80ms' }}
          >
            {MISSION.line}
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl type-lead text-pretty text-muted-foreground op-rise"
            style={{ animationDelay: '160ms' }}
          >
            {MISSION.text}
          </p>
          <div
            className="mt-9 flex flex-wrap justify-center gap-3 op-rise"
            style={{ animationDelay: '240ms' }}
          >
            <Button asChild variant="brand" size="xl" className="op-cta">
              <a href="#ledger">
                See what is real today <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="xl" className="op-ghost">
              <a href="#long-term">The long-term vision</a>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="concept-title" className="op-section">
        <div className="op-container">
          <OpHeading
            id="concept-title"
            eyebrow="The operator"
            title="An operator, not another chat window."
            lede="Chat, Code AI and the Website Builder are Renor’s hands. The operator is what decides which hands to use, checks what they made and shows you the proof."
          />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {OPERATOR_CONCEPT.map((idea, index) => (
              <li key={idea.title} className="op-tile">
                <span className="op-loop-label">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{idea.title}</h3>
                <p className="mt-2 type-copy text-muted-foreground">{idea.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="ledger" aria-labelledby="ledger-title" className="op-section bg-band">
        <div className="op-container">
          <OpHeading
            id="ledger-title"
            eyebrow="Vision to proof"
            title="The ledger: live, in progress, future."
            lede={`A claim sits in one column and moves left only with evidence. Nothing is marked done automatically. The live column was last checked against the app on ${LEDGER_CHECKED}.`}
          />
          <div className="mt-12">
            <ClaimLedger />
          </div>
          <p className="mt-8 type-meta text-muted-foreground">
            Every feature’s own status is on{' '}
            <Link
              href="/renor/capabilities"
              className="font-semibold text-link underline-offset-4 hover:underline"
            >
              the capability index
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="long-term" aria-labelledby="long-term-title" className="dark op-stage op-vision">
        <div aria-hidden="true" className="op-stars op-stars--soft" />
        <div className="op-container relative">
          <p className="op-pill">
            <CircleDot aria-hidden="true" className="size-3.5" />
            {CLAIM_STATUS.future.label}
          </p>
          <h2 id="long-term-title" className="mt-6 max-w-4xl font-display type-title text-balance">
            Where Renor is going.
          </h2>
          <p className="mt-6 max-w-2xl type-lead text-pretty text-muted-foreground">
            None of this is built. It is the direction every release is measured against, and it
            will only appear in the live column with evidence.
          </p>
          <ol className="op-horizons">
            {LONG_TERM_VISION.map((item) => (
              <li key={item.title} className="op-horizon">
                <p className="op-loop-label">{item.horizon}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 type-copy text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="vision-next" className="op-section">
        <div className="op-container text-center">
          <h2 id="vision-next" className="font-display type-heading text-balance">
            Judge Renor on what it does today.
          </h2>
          <p className="mx-auto mt-4 max-w-xl type-copy text-muted-foreground">
            Open the app and give it an outcome, or read who builds it and how.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <OpenRenorButton />
            <Button asChild variant="outline" size="xl">
              <Link href="/company">About the company</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
