// @polsia:user-owned — FounderNexora public company front door.
// Truthful copy: every project, feature and milestone comes from src/lib/business/ecosystem.ts.
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Layers3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Eyebrow,
  ProductShot,
  SCREENSHOT_CAPTION,
  StatusBadge,
} from '@/components/custom/ecosystem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MILESTONE_WHERE,
  MILESTONES,
  PROJECTS,
  RENOR_APP_URL,
  RENOR_AREAS,
} from '@/lib/business/ecosystem';
import { siteDescription, siteName } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: siteName },
  description: siteDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'FounderNexora — technology for the work ahead',
    description:
      'Meet FounderNexora, explore Renor AI and follow the development of practical AI-native tools.',
  },
};

const principles = [
  {
    icon: CheckCircle2,
    title: 'Prove the work',
    text: 'Real tests and useful output matter more than a long list of promised features.',
  },
  {
    icon: ShieldCheck,
    title: 'Earn trust',
    text: 'Permissioned actions, clear limitations and responsible handling of information.',
  },
  {
    icon: Layers3,
    title: 'Keep improving',
    text: 'Ship coherent improvements, measure their impact and make what works easier to use.',
  },
] as const;

const chat = RENOR_AREAS.find((area) => area.id === 'chat')?.screenshot;
const homeProjects = PROJECTS.filter((project) =>
  ['renor', 'renor-labs-store', 'zero-to-prove'].includes(project.slug),
);
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border/60 px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_25%,rgba(75,80,205,0.22),transparent_48%),radial-gradient(ellipse_at_10%_80%,rgba(34,172,210,0.10),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.055] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:80px_80px]"
        />
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="mb-7 border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs font-medium tracking-[0.13em] text-brand-500 dark:text-brand-400"
            >
              <CircleDot aria-hidden="true" className="mr-2 size-3" />
              FOUNDERNEXORA<span className="hidden sm:inline">&nbsp;· BUILDING WITH PURPOSE</span>
            </Badge>
            <h1 className="font-display text-5xl leading-[1.03] font-semibold tracking-[-0.055em] sm:text-7xl">
              Technology for{' '}
              <span className="bg-gradient-to-r from-brand-500 via-sky-400 to-foreground bg-clip-text text-transparent dark:from-brand-400 dark:via-sky-300">
                the work ahead.
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We build Renor, an AI workspace for people who make things, and a small family of
              related projects. Explore what works today, see what is being built, and judge us by
              the evidence.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="min-h-12 rounded-full bg-brand-500 px-7 text-white hover:bg-brand-400"
              >
                <Link href="/renor">
                  Meet Renor AI <ArrowRight aria-hidden="true" className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12 rounded-full px-7">
                <Link href="/projects">All projects</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Renor is in preview: usable today, with every feature’s status shown.
            </p>
          </div>
          <div className="relative mx-auto flex aspect-square w-full max-w-[16rem] items-center justify-center sm:max-w-md">
            <div
              aria-hidden="true"
              className="absolute size-[96%] rounded-full border border-brand-400/15"
            />
            <div
              aria-hidden="true"
              className="absolute size-[80%] rounded-full border border-sky-400/15"
            />
            <Image
              src="/assets/renor/orb.webp"
              alt="Renor’s orb, the living centre of the Renor workspace"
              width={380}
              height={380}
              priority
              sizes="(min-width: 640px) 28rem, 16rem"
              className="relative h-auto w-[78%] drop-shadow-[0_0_60px_rgba(56,140,255,0.35)]"
            />
            <div className="absolute right-[1%] bottom-[8%] rounded-2xl border border-border/60 bg-background/90 px-4 py-3 shadow-xl backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-semibold">
                <Sparkles
                  aria-hidden="true"
                  className="size-4 text-brand-500 dark:text-brand-400"
                />{' '}
                Renor AI
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Chat · Code · Websites · Projects
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="projects"
        aria-labelledby="projects-title"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Our work</Eyebrow>
              <h2
                id="projects-title"
                className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl"
              >
                One company. Focused projects.
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
            >
              Every project and its status <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {homeProjects.map((project) => (
              <article
                key={project.slug}
                className="flex min-h-72 flex-col justify-between rounded-3xl border border-border/65 bg-card/65 p-7 transition-colors hover:border-brand-500/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {project.kind}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>
                  <h3 className="mt-8 font-display text-3xl font-semibold">{project.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {project.summary}
                  </p>
                </div>
                <Link
                  href={project.href}
                  className="mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand-500 underline-offset-4 hover:underline focus-visible:underline dark:text-brand-400"
                >
                  {project.action}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="renor"
        aria-labelledby="renor-title"
        className="border-y border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-xl">
            <StatusBadge status="preview" />
            <h2
              id="renor-title"
              className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Meet Renor AI.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Chat, Code AI, a Website Builder and a Project Office in one workspace, built to show
              evidence of what it did rather than just an answer. Free to start in the web preview.
            </p>
            <ul className="mt-6 grid gap-2 text-sm">
              {RENOR_AREAS.map((area) => (
                <li key={area.id}>
                  <Link
                    href={`/renor#${area.id}`}
                    className="inline-flex min-h-9 items-center gap-2 font-medium underline-offset-4 hover:underline"
                  >
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 text-brand-500 dark:text-brand-400"
                    />
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="min-h-12 rounded-full bg-brand-500 px-6 text-white hover:bg-brand-400"
              >
                <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
                  Open Renor <ArrowUpRight aria-hidden="true" className="ml-2 size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-12 rounded-full px-6">
                <Link href="/renor/plans">Free, Pro and Advanced</Link>
              </Button>
            </div>
          </div>
          {chat ? <ProductShot {...chat} caption={SCREENSHOT_CAPTION} /> : null}
        </div>
      </section>

      <section
        id="approach"
        aria-labelledby="approach-title"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <Eyebrow>How we build</Eyebrow>
          <h2
            id="approach-title"
            className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Useful work comes first.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-border/60 p-7">
                <Icon aria-hidden="true" className="size-7 text-brand-500 dark:text-brand-400" />
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="updates"
        aria-labelledby="updates-title"
        className="scroll-mt-20 border-t border-border/60 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Follow the work</Eyebrow>
            <h2
              id="updates-title"
              className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Progress you can inspect.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Each entry says where the work lives, so nothing unfinished is presented as shipped.
            </p>
            <Link
              href="/zero-to-prove#log"
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
            >
              Full build log on Zero to Prove <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ol className="grid gap-4">
            {MILESTONES.slice(0, 3).map((milestone) => (
              <li
                key={`${milestone.date}-${milestone.title}`}
                className="rounded-2xl border border-border/70 bg-card/60 p-6"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={milestone.date} className="font-semibold text-foreground">
                    {dateFormat.format(new Date(`${milestone.date}T00:00:00Z`))}
                  </time>
                  <span>{MILESTONE_WHERE[milestone.where]}</span>
                </div>
                <h3 className="mt-2 font-semibold">{milestone.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {milestone.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
