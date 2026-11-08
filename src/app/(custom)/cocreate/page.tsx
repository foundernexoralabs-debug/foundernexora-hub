// @polsia:user-owned — /cocreate: the page behind the QR code at Co-Create London.
// Someone scans it on a phone, mid-event: say what Renor is in one breath, let them try it now,
// show what is real, and make it easy to get in touch. Phone-first layout.
import { ArrowRight, Download, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SocialLinks } from '@/components/custom/channel-links';
import { FounderOrb } from '@/components/custom/founder-orb';
import { OpenRenorButton } from '@/components/custom/operator-home';
import { RenorIdentityJsonLd } from '@/components/custom/structured-data';
import { Button } from '@/components/ui/button';
import { COCREATE_PATH, COCREATE_URL, DEMO_VIDEO, EVENT, QR_CODE } from '@/lib/business/cocreate';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { FOUNDER } from '@/lib/business/founder';
import { LOOP, SHARE_CARDS } from '@/lib/business/operator';
import { pricingSummary } from '@/lib/business/pricing';
import { pageMetadata } from '@/lib/business/seo';
import { CLAIM_STATUS, ledgerBy } from '@/lib/business/vision';

const DESCRIPTION = `Met Renor at ${EVENT.name}? Renor is an AI operator: tell it the outcome, it does the work and shows the proof. Try it free now.`;

export const metadata: Metadata = pageMetadata({
  title: `Renor at ${EVENT.name}`,
  description: DESCRIPTION,
  path: COCREATE_PATH,
  socialTitle: `Renor at ${EVENT.name}, ${EVENT.date}`,
  image: SHARE_CARDS.cocreate,
});

export default function CoCreatePage() {
  const live = ledgerBy('live');
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
      <section aria-labelledby="cc-title" className="dark op-stage op-hero">
        <div aria-hidden="true" className="op-stars" />
        <div className="op-hero-inner">
          <div className="op-hero-orb op-rise">
            <FounderOrb state="active" detail="hero" className="size-full" />
          </div>
          <p className="op-pill op-rise" style={{ animationDelay: '60ms' }}>
            <span aria-hidden="true" className="op-pill-dot" />
            {EVENT.name} · {EVENT.date}
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
            it, checks it and shows you the proof. Free to start, on your own models or ours.
          </p>
          <div
            className="mt-9 flex flex-wrap justify-center gap-3 op-rise"
            style={{ animationDelay: '240ms' }}
          >
            <OpenRenorButton label="Try it now, free" />
            <Button asChild variant="outline" size="xl" className="op-ghost">
              <a href={CONTACT_MAILTO}>
                <Mail aria-hidden="true" className="size-4" /> Talk to {FOUNDER.name}
              </a>
            </Button>
          </div>
          <p className="mt-5 type-meta text-muted-foreground">
            Opens app.renor.app. No card, 12 languages.
          </p>
        </div>
      </section>

      {DEMO_VIDEO ? (
        <section aria-labelledby="cc-demo" className="op-section">
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

      <section aria-labelledby="cc-how" className="op-section">
        <div className="op-container grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="op-eyebrow">In one minute</p>
            <h2 id="cc-how" className="mt-4 font-display type-heading text-balance">
              Outcome in. Work and proof out.
            </h2>
            <ol className="mt-8 grid gap-5">
              {LOOP.map((step, index) => (
                <li key={step.id} className="flex gap-4">
                  <span className="op-loop-node op-loop-node--inline shrink-0" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight">
                      {step.step}: <span className="font-normal">{step.title}</span>
                    </h3>
                    <p className="mt-1 text-[0.9375rem] text-muted-foreground">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="op-eyebrow">{CLAIM_STATUS.live.label}</p>
            <h2 className="mt-4 font-display type-heading text-balance">What you can try now.</h2>
            <ul className="mt-8 grid gap-3">
              {live.map((entry) => (
                <li key={entry.id} className="op-tile">
                  <p className="font-semibold tracking-tight">{entry.claim}</p>
                  <p className="mt-1 text-[0.9375rem] text-muted-foreground">{entry.detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 type-meta text-muted-foreground">{pricingSummary()}</p>
            <Link href="/vision#ledger" className="op-textlink mt-2">
              What is in progress, and what is vision{' '}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="cc-share" className="op-section bg-band">
        <div className="op-container grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
          <div className="op-qr mx-auto w-56 sm:w-64">
            <Image
              src={QR_CODE.src}
              alt={QR_CODE.alt}
              width={264}
              height={264}
              unoptimized
              className="size-full"
            />
          </div>
          <div>
            <h2 id="cc-share" className="font-display type-heading text-balance">
              Pass it on, and stay in touch.
            </h2>
            <p className="mt-4 max-w-xl type-copy text-muted-foreground">
              This code opens {COCREATE_URL.replace('https://', '')}. Write to {FOUNDER.name}, the
              founder, at{' '}
              <a
                href={CONTACT_MAILTO}
                className="font-semibold text-link underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              : a person answers.
            </p>
            <SocialLinks variant="labelled" className="mt-6" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline" size="lg">
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
