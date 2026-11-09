// @polsia:user-owned — /cocreate: the page behind the QR code at Co-Create London (19–20 Nov 2026).
// Someone scans it on a phone, mid-event, and has one to three minutes. The page is one story:
// who you are → a real problem → a real Renor run → execution and approval → verification and
// receipt → try it, scan it or talk to Ahmad. "What works today" is kept apart from the roadmap,
// and the step-by-step walkthrough doubles as the offline demo if the venue network fails.
import { ArrowDown, ArrowRight, CircleCheck, CircleDot, Download, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SocialLinks } from '@/components/custom/channel-links';
import { FounderOrb } from '@/components/custom/founder-orb';
import { OpenRenorButton, OpHeading } from '@/components/custom/operator-home';
import { RenorIdentityJsonLd } from '@/components/custom/structured-data';
import { Button } from '@/components/ui/button';
import {
  COCREATE_MAIL_SUBJECTS,
  COCREATE_PATH,
  COCREATE_URL,
  DEMO_VIDEO,
  EVENT,
  NOT_YET,
  QR_CODE,
  STORY_INTRO,
  WALKTHROUGH,
  WALKTHROUGH_RUN,
} from '@/lib/business/cocreate';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { FOUNDER } from '@/lib/business/founder';
import { SHARE_CARDS } from '@/lib/business/operator';
import { pricingSummary } from '@/lib/business/pricing';
import { pageMetadata } from '@/lib/business/seo';
import { CLAIM_STATUS, ledgerBy } from '@/lib/business/vision';

const DESCRIPTION = `Met Renor at ${EVENT.name}, ${EVENT.date}? Renor is an AI operator: tell it the outcome, it does the work and shows the proof. See one real run in two minutes, then try it free.`;

const mailto = (subject: string) => `${CONTACT_MAILTO}?subject=${encodeURIComponent(subject)}`;

export const metadata: Metadata = pageMetadata({
  title: `Renor at ${EVENT.name}`,
  description: DESCRIPTION,
  path: COCREATE_PATH,
  socialTitle: `Renor at ${EVENT.name}, ${EVENT.date}`,
  image: SHARE_CARDS.cocreate,
});

export default function CoCreatePage() {
  const live = ledgerBy('live');
  const inProgress = ledgerBy('in-progress');
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <RenorIdentityJsonLd
        page={{
          path: COCREATE_PATH,
          name: `Renor at ${EVENT.name}`,
          description: DESCRIPTION,
          trail: [],
        }}
      />

      {/* 1. Hello: what Renor is, in one breath. */}
      <section aria-labelledby="cc-title" className="dark op-stage op-hero">
        <div aria-hidden="true" className="op-stars" />
        <div className="op-hero-inner">
          <div className="op-hero-orb op-rise">
            <FounderOrb state="active" detail="hero" className="size-full" />
          </div>
          <p className="op-pill op-pill--event op-rise" style={{ animationDelay: '60ms' }}>
            <span aria-hidden="true" className="op-pill-dot" />
            <span>{EVENT.name}</span>
            <span aria-hidden="true" className="op-pill-sep">
              ·
            </span>
            <time dateTime={EVENT.iso}>{EVENT.date}</time>
          </p>
          <h1
            id="cc-title"
            className="op-hero-title font-display text-balance op-rise"
            style={{ animationDelay: '120ms' }}
          >
            Good to meet you. <span className="op-hero-accent">This is Renor.</span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl type-lead text-pretty text-muted-foreground op-rise"
            style={{ animationDelay: '180ms' }}
          >
            An AI operator, not a chatbot. Tell Renor the outcome you want; it plans the work, does
            it, checks it and shows you the proof. Here is one real run, in about two minutes.
          </p>
          <div
            className="mt-9 flex flex-wrap justify-center gap-3 op-rise"
            style={{ animationDelay: '240ms' }}
          >
            <Button asChild variant="brand" size="xl" className="op-cta">
              <a href="#cc-story">
                See a real run <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <OpenRenorButton label="Try it now, free" variant="outline" className="op-ghost" />
          </div>
          <p className="mt-5 type-meta text-muted-foreground">
            Opens app.renor.app. No card, 12 languages.
          </p>
        </div>
      </section>

      {/* 2. Who you are, the problem, the mission. */}
      <section aria-labelledby="cc-story" className="op-section">
        <div className="op-container">
          <OpHeading
            id="cc-story"
            eyebrow="In about two minutes"
            title="From a real problem to a checked result."
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {STORY_INTRO.map((beat, index) => (
              <li key={beat.id} className="op-tile">
                <p className="op-loop-label">
                  <span className="font-mono">{String(index + 1).padStart(2, '0')}</span> ·{' '}
                  {beat.label}
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight text-balance">
                  {beat.title}
                </h3>
                <p className="mt-2 type-copy text-pretty text-muted-foreground">{beat.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {DEMO_VIDEO ? (
        <section aria-labelledby="cc-demo" className="op-section pt-0">
          <div className="op-container">
            <h2 id="cc-demo" className="font-display type-heading">
              {DEMO_VIDEO.title}
            </h2>
            <div className="mt-8 aspect-video overflow-hidden rounded-2xl border border-border">
              <iframe
                className="size-full"
                src={`https://www.youtube-nocookie.com/embed/${DEMO_VIDEO.youtubeId}`}
                title={DEMO_VIDEO.title}
                loading="lazy"
                allow="encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-3 type-meta text-muted-foreground">Recorded {DEMO_VIDEO.recorded}.</p>
          </div>
        </section>
      ) : null}

      {/* 3. The run, screen by screen: execution, approval, verification, receipt. Offline demo. */}
      <section aria-labelledby="cc-run" className="dark op-stage op-proof">
        <div aria-hidden="true" className="op-stars op-stars--soft" />
        <div className="op-container">
          <OpHeading
            id="cc-run"
            eyebrow="One real run, screen by screen"
            title="Execution, approval, verification, receipt."
            lede={`Real Renor screens from ${WALKTHROUGH_RUN.captured}. ${WALKTHROUGH_RUN.note}`}
          />
          <aside aria-labelledby="cc-offline" className="op-offline mt-8">
            <p id="cc-offline" className="font-semibold">
              Venue Wi-Fi down? This is the offline demo.
            </p>
            <p className="mt-1 text-[0.9375rem] text-muted-foreground">
              Every screen below is part of this page, so once it has loaded it needs no connection.
              We walk you through it, then you try the live app when you are back online.
            </p>
          </aside>
          <ol className="op-run">
            {WALKTHROUGH.map((step, index) => (
              <li key={step.id} className="op-run-step">
                <span className="op-loop-node op-loop-node--inline" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="op-run-body">
                  <div>
                    <p className="op-loop-label">{step.stage}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-balance">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-xl type-copy text-pretty text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                  <div className={`op-run-shot op-run-shot--${step.id}`}>
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      width={step.image.width}
                      height={step.image.height}
                      loading="eager"
                      sizes={`(min-width: 640px) ${step.image.width}px, 92vw`}
                      className="op-run-img"
                      style={{ maxWidth: step.image.width }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. What works today, kept apart from the roadmap. */}
      <section aria-labelledby="cc-today" className="op-section">
        <div className="op-container">
          <OpHeading
            id="cc-today"
            eyebrow="No surprises"
            title="What works today, and what is still on the roadmap."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="op-tile">
              <p className="op-tag" data-tone="live">
                {CLAIM_STATUS.live.label}
              </p>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                What works today
              </h3>
              <p className="mt-1 type-meta text-muted-foreground">
                {CLAIM_STATUS.live.description}
              </p>
              <ul className="mt-6 grid gap-4">
                {live.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <CircleCheck
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    <div>
                      <p className="font-semibold tracking-tight">{entry.claim}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-muted-foreground">
                        {entry.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="op-tile">
              <p className="op-tag" data-tone="in-progress">
                {CLAIM_STATUS['in-progress'].label}
              </p>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                On the roadmap
              </h3>
              <p className="mt-1 type-meta text-muted-foreground">
                {CLAIM_STATUS['in-progress'].description}
              </p>
              <ul className="mt-6 grid gap-4">
                {inProgress.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <CircleDot
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
                    />
                    <div>
                      <p className="font-semibold tracking-tight">{entry.claim}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-muted-foreground">
                        {entry.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <h4 className="mt-8 font-semibold tracking-tight">Not yet, said plainly</h4>
              <ul className="mt-3 grid gap-2 text-[0.9375rem] text-muted-foreground">
                {NOT_YET.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span aria-hidden="true">–</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-8 type-meta text-muted-foreground">{pricingSummary()}</p>
          <Link href="/vision#ledger" className="op-textlink mt-1">
            The full ledger, with the long-term vision{' '}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      {/* 5. Your turn: try it, scan it, or talk to the founder. */}
      <section aria-labelledby="cc-share" className="op-section bg-band">
        <div className="op-container grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
          <div className="op-qr mx-auto w-56 sm:w-64">
            <Image
              src={QR_CODE.src}
              alt={QR_CODE.alt}
              width={264}
              height={264}
              unoptimized
              loading="eager"
              className="size-full"
            />
          </div>
          <div>
            <p className="op-eyebrow">Your turn</p>
            <h2 id="cc-share" className="mt-4 font-display type-heading text-balance">
              Try it, pass it on, or talk to {FOUNDER.name}.
            </h2>
            <p className="mt-4 max-w-xl type-copy text-muted-foreground">
              The code opens {COCREATE_URL.replace('https://', '')}. Want a live demo at the event,
              or to talk afterwards? Write to {FOUNDER.name}, the founder, at{' '}
              <a
                href={mailto(COCREATE_MAIL_SUBJECTS.hello)}
                className="font-semibold text-link underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              . A person answers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <OpenRenorButton label="Try it now, free" />
              <Button asChild variant="outline" size="xl">
                <a href={mailto(COCREATE_MAIL_SUBJECTS.demo)}>
                  <Mail aria-hidden="true" className="size-4" /> Ask {FOUNDER.name} for a demo
                </a>
              </Button>
            </div>
            <SocialLinks variant="labelled" className="mt-8" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="ghost" size="lg">
                <a href={QR_CODE.src} download="renor-cocreate-qr.svg">
                  <Download aria-hidden="true" className="size-4" /> Download the QR code
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/company">About the company</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
