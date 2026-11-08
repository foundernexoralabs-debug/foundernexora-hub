// @polsia:user-owned — the homepage sections for Renor, the AI operator.
// Content lives in src/lib/business/operator.ts (story), vision.ts (ledger) and pricing.ts (the
// pricing flag). The hero, proof and vision bands are always dark: Renor's identity is the blue
// orb in the dark. The sections in between follow the visitor's light or dark theme.
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Cpu,
  KeyRound,
  Layers,
  Server,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AudienceRouter } from '@/components/custom/audience-router';
import { FounderOrb } from '@/components/custom/founder-orb';
import { Button } from '@/components/ui/button';
import { CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { FOUNDER } from '@/lib/business/founder';
import { HERO, LOOP, OWN_AI, PROOF } from '@/lib/business/operator';
import { PLANS } from '@/lib/business/plans';
import { CREDIT_PACKS, isOneTime, ONE_TIME_OFFERS, pricingSummary } from '@/lib/business/pricing';
import { CLAIM_STATUS, LONG_TERM_VISION, MISSION } from '@/lib/business/vision';
import { cn } from '@/lib/utils';
import round from '../../../public/founder/founder_round_400.png';
import './operator.css';

const OWN_AI_ICONS = { local: Cpu, keys: KeyRound, hosted: Server, 'no-lock-in': Layers } as const;

/** A section's small label, heading and lede, in one rhythm across the page. */
export function OpHeading({
  id,
  eyebrow,
  title,
  lede,
  center = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  center?: boolean;
}) {
  return (
    <div className={cn('max-w-3xl', center && 'mx-auto text-center')}>
      <p className="op-eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-4 font-display type-heading text-balance">
        {title}
      </h2>
      {lede ? <p className="mt-5 type-lead text-pretty text-muted-foreground">{lede}</p> : null}
    </div>
  );
}

/** Opens app.renor.app in a new tab, said for screen readers too. */
export function OpenRenorButton({
  className,
  label = HERO.primary.label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Button asChild variant="brand" size="xl" className={cn('op-cta', className)}>
      <a href={HERO.primary.href} target="_blank" rel="noopener noreferrer">
        {label} <ArrowUpRight aria-hidden="true" className="size-4" />
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </Button>
  );
}

export function OperatorHero() {
  return (
    <section aria-labelledby="hero-title" className="dark op-stage op-hero">
      <div aria-hidden="true" className="op-stars" />
      <div className="op-hero-inner">
        <div className="op-hero-orb op-rise">
          <FounderOrb state="active" detail="hero" className="size-full" />
        </div>
        <p className="op-pill op-rise" style={{ animationDelay: '60ms' }}>
          <span aria-hidden="true" className="op-pill-dot" />
          {HERO.eyebrow}
        </p>
        <h1
          id="hero-title"
          className="op-hero-title font-display text-balance text-foreground op-rise"
          style={{ animationDelay: '120ms' }}
        >
          {HERO.title} <span className="op-hero-accent">{HERO.titleAccent}</span>
        </h1>
        <p
          className="mx-auto mt-6 max-w-2xl type-lead text-pretty text-muted-foreground op-rise"
          style={{ animationDelay: '180ms' }}
        >
          {HERO.lede}
        </p>
        <div
          className="mt-9 flex flex-wrap justify-center gap-3 op-rise"
          style={{ animationDelay: '240ms' }}
        >
          <OpenRenorButton />
          <Button asChild variant="outline" size="xl" className="op-ghost">
            <a href={HERO.secondary.href}>
              {HERO.secondary.label} <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </div>
        <p
          className="mt-5 type-meta text-muted-foreground op-rise"
          style={{ animationDelay: '300ms' }}
        >
          {HERO.reassurance}
        </p>
      </div>
      <div className="op-hero-router op-rise" style={{ animationDelay: '360ms' }}>
        <AudienceRouter />
      </div>
    </section>
  );
}

export function ProofSection() {
  return (
    <section id="proof" aria-labelledby="proof-title" className="dark op-stage op-proof">
      <div className="op-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <OpHeading
            id="proof-title"
            eyebrow="Proof, not promises"
            title="What Renor does today."
            lede="Real Renor screens, not mock-ups. Each card is a capability you can use in the app now."
          />
          <Link href="/vision#ledger" className="op-textlink shrink-0">
            See the full ledger: live, in progress, future
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="op-proof-grid">
          {PROOF.map((item) => (
            <li key={item.id} className={cn('op-proof-card', `op-proof-card--${item.id}`)}>
              <div className="op-proof-shot">
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="(min-width: 1024px) 40rem, 100vw"
                  className="op-proof-img"
                />
              </div>
              <div className="op-proof-copy">
                <p className="op-status">
                  <span aria-hidden="true" className="op-status-dot" />
                  {CLAIM_STATUS.live.label}
                </p>
                <h3 className="mt-3 type-subheading text-foreground">{item.title}</h3>
                <p className="mt-2 type-copy text-muted-foreground">{item.text}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Real Renor screen · captured {item.captured}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LoopSection() {
  return (
    <section id="how" aria-labelledby="how-title" className="op-section">
      <div className="op-container">
        <OpHeading
          id="how-title"
          eyebrow="How it works"
          title="From outcome to proof, in five steps."
          lede="Chat, Code AI and the Website Builder are Renor’s hands. The operator decides which to use, and checks what they made."
          center
        />
        <ol className="op-loop">
          {LOOP.map((step, index) => (
            <li key={step.id} className="op-loop-step">
              <span className="op-loop-node" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="op-loop-label">{step.step}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 type-copy text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PricingSnapshot() {
  if (isOneTime()) {
    const lifetime = ONE_TIME_OFFERS.find((offer) => offer.id === 'lifetime');
    return (
      <div className="op-price-card">
        <p className="op-eyebrow">Pay once</p>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-5xl font-semibold tracking-tight text-foreground">
            {lifetime?.price}
          </span>
          <span className="text-muted-foreground">Lifetime · {lifetime?.period}</span>
        </p>
        <p className="mt-3 type-copy text-muted-foreground">
          Renor on your own models for as long as it is offered. Free stays free, and hosted AI
          comes in one-time packs from {CREDIT_PACKS[0]?.price}.
        </p>
        <ul className="mt-5 grid gap-2">
          {lifetime?.includes.slice(0, 3).map((line) => (
            <li key={line} className="flex gap-2.5 text-[0.9375rem] text-foreground">
              <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-link" />
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-muted-foreground">Not on sale yet. No subscription.</p>
        <Link href="/renor/plans" className="op-textlink mt-4">
          See pricing <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    );
  }
  const free = PLANS.find((plan) => plan.state === 'open');
  return (
    <div className="op-price-card">
      <p className="op-eyebrow">Pricing</p>
      <p className="mt-3 font-display text-5xl font-semibold tracking-tight text-foreground">
        {free?.price.label}
      </p>
      <p className="mt-3 type-copy text-muted-foreground">{pricingSummary()}</p>
      <Link href="/renor/plans" className="op-textlink mt-5">
        See pricing <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}

export function OwnAiSection() {
  return (
    <section id="own-ai" aria-labelledby="own-ai-title" className="op-section bg-band">
      <div className="op-container grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start lg:gap-16">
        <div>
          <OpHeading
            id="own-ai-title"
            eyebrow="Own your AI"
            title="Your models. Your keys. Pay once."
            lede="Renor is not tied to one AI company. Run it on a model on your own computer, on your own API keys, or on Renor’s hosted AI."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {OWN_AI.map((item) => {
              const Icon = OWN_AI_ICONS[item.id];
              return (
                <li key={item.id} className="op-tile">
                  <span className="op-tile-icon" aria-hidden="true">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 type-copy text-muted-foreground">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <PricingSnapshot />
      </div>
    </section>
  );
}

export function VisionTeaser() {
  return (
    <section aria-labelledby="vision-title" className="dark op-stage op-vision">
      <div aria-hidden="true" className="op-stars op-stars--soft" />
      <div className="op-container relative">
        <p className="op-pill">
          <CircleDot aria-hidden="true" className="size-3.5" />
          {CLAIM_STATUS.future.label}
        </p>
        <h2 id="vision-title" className="mt-6 max-w-4xl font-display type-title text-balance">
          {MISSION.line}
        </h2>
        <p className="mt-6 max-w-2xl type-lead text-pretty text-muted-foreground">
          Today Renor finishes work for one person. The aim is an operator that connects to other
          machines, systems and AIs, and coordinates real work as it happens. That is a direction,
          not a feature: it is labelled that way everywhere on this site.
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
        <Button asChild variant="outline" size="xl" className="op-ghost mt-10">
          <Link href="/vision">
            Read the vision <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function CompanyBand() {
  return (
    <section aria-labelledby="company-title" className="op-section">
      <div className="op-container grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-14">
        <Image
          src={round}
          alt={FOUNDER.alt}
          sizes="7rem"
          className="size-24 rounded-full border border-border object-cover sm:size-28"
        />
        <div className="max-w-2xl">
          <p className="op-eyebrow">The company</p>
          <h2 id="company-title" className="mt-3 font-display type-subheading text-balance">
            Renor by FounderLab, built by {FOUNDER.name} with a team of AI agents, in public.
          </h2>
          <p className="mt-3 type-copy text-muted-foreground">
            Every release is checked against evidence before it ships, and every claim on this site
            carries its real status. Ask us anything: a person answers.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="lg">
            <Link href="/company">About the company</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href={CONTACT_MAILTO}>Email us</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-title" className="op-section pt-0">
      <div className="op-container">
        <div className="dark op-stage op-closing">
          <div className="op-closing-orb" aria-hidden="true">
            <FounderOrb state="idle" detail="status" className="size-full" />
          </div>
          <h2 id="closing-title" className="font-display type-heading text-balance text-foreground">
            What outcome do you want first?
          </h2>
          <p className="mx-auto mt-4 max-w-xl type-copy text-muted-foreground">
            Open Renor, say it in plain words, and check the proof. Free, no card.
          </p>
          <div className="mt-8 flex justify-center">
            <OpenRenorButton />
          </div>
        </div>
      </div>
    </section>
  );
}
