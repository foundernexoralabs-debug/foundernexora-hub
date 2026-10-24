// @polsia:user-owned — FounderLab public company front door.
// Truthful copy: every project, feature and milestone comes from src/lib/business/ecosystem.ts.
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Layers3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '@/components/custom/brand-mark';
import { Eyebrow, HeroGrid, StatusBadge } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { ThemedShot } from '@/components/custom/launch';
import { NeedGuide } from '@/components/custom/need-guide';
import { OrganizationJsonLd } from '@/components/custom/structured-data';
import { Button } from '@/components/ui/button';
import {
  MILESTONE_WHERE,
  MILESTONES,
  PROJECTS,
  RENOR_APP_URL,
  RENOR_AREAS,
} from '@/lib/business/ecosystem';
import { TOUR, TOUR_CAPTION } from '@/lib/business/launch';
import { pageMetadata } from '@/lib/business/seo';
import { siteDescription } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'FounderLab — the company behind Renor',
  description: siteDescription,
  path: '/',
  absolute: true,
});

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

const tourChat = TOUR.find((shot) => shot.id === 'chat');
const homeProjects = PROJECTS.filter((project) =>
  ['renor', 'renor-plugin-store', 'zero-to-prove'].includes(project.slug),
);
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <OrganizationJsonLd />
      <section className="relative isolate overflow-hidden border-b border-border px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32">
        <HeroGrid />
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <div className="max-w-3xl">
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[0.8125rem] font-semibold tracking-[0.1em] text-foreground uppercase shadow-xs">
                <BrandMark className="size-4" />
                FounderLab
                <span className="hidden text-muted-foreground sm:inline">· Makers of Renor</span>
              </p>
              <Link
                href="/renor#beta"
                className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-500/35 bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-link transition-colors hover:border-brand-500/60 dark:bg-brand-500/10"
              >
                <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                Renor private beta is open
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
            <h1 className="font-display type-display text-balance">
              Technology for <span className="text-link">the work ahead.</span>
            </h1>
            <p className="mt-7 max-w-xl type-lead text-pretty text-muted-foreground">
              FounderLab builds Renor, an AI workspace for people who make things, and a small
              family of related projects. Explore what works today, see what is being built, and
              judge us by the evidence.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="xl">
                <Link href="/renor">
                  Meet Renor AI <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <a href="#guide">
                  What do you need? <ArrowDown aria-hidden="true" className="size-4" />
                </a>
              </Button>
            </div>
            <p className="mt-6 type-meta text-muted-foreground">
              Renor is in preview: usable today, with every feature’s status shown.
            </p>
          </div>
          <div className="relative mx-auto flex aspect-square w-full max-w-[16rem] items-center justify-center sm:max-w-md">
            <div
              aria-hidden="true"
              className="absolute size-[96%] rounded-full border border-border"
            />
            <div
              aria-hidden="true"
              className="absolute size-[78%] rounded-full border border-dashed border-border"
            />
            <Image
              src="/assets/renor/orb.webp"
              alt="Renor’s orb, the living centre of the Renor workspace"
              width={380}
              height={380}
              preload
              sizes="(min-width: 640px) 28rem, 16rem"
              className="relative h-auto w-[72%]"
            />
            <div className="absolute right-0 bottom-[6%] rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
              <p className="flex items-center gap-2 text-[0.9375rem] font-semibold">
                <Sparkles aria-hidden="true" className="size-4 text-link" /> Renor AI
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Chat · Code · Websites · Projects
              </p>
            </div>
          </div>
        </div>
      </section>

      <NeedGuide className="border-b border-border bg-band" />

      <section
        id="projects"
        aria-labelledby="projects-title"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Our work</Eyebrow>
              <h2 id="projects-title" className="mt-4 max-w-2xl font-display type-heading">
                One company. Focused projects.
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
            >
              Every project and its status <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {homeProjects.map((project) => (
              <article
                key={project.slug}
                className="flex min-h-72 flex-col justify-between rounded-3xl border border-border bg-card p-7 transition-colors hover:border-brand-500/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {project.kind}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>
                  <h3 className="mt-8 font-display text-[1.875rem] font-semibold tracking-tight">
                    {project.name}
                  </h3>
                  <p className="mt-4 type-copy text-muted-foreground">{project.summary}</p>
                </div>
                <Link
                  href={project.href}
                  className="mt-8 inline-flex min-h-11 items-center gap-2 self-start text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline focus-visible:underline"
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
        className="border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-xl">
            <StatusBadge status="preview" />
            <h2 id="renor-title" className="mt-6 font-display type-heading">
              Meet Renor AI.
            </h2>
            <p className="mt-6 type-lead text-muted-foreground">
              Chat, Code AI, a Website Builder and a Project Office in one workspace, built to show
              evidence of what it did rather than just an answer. Free to start in the web preview.
            </p>
            <ul className="mt-6 grid gap-1 text-base">
              {RENOR_AREAS.map((area) => (
                <li key={area.id}>
                  <Link
                    href={`/renor#${area.id}`}
                    className="inline-flex min-h-11 items-center gap-2 font-medium underline-offset-4 hover:underline sm:min-h-9"
                  >
                    <ArrowRight aria-hidden="true" className="size-3.5 text-link" />
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="xl">
                <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
                  Open Renor <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="/renor/plans">Compare plans</Link>
              </Button>
            </div>
          </div>
          {tourChat ? <ThemedShot shot={tourChat} caption={TOUR_CAPTION} /> : null}
        </div>
      </section>

      <section
        id="approach"
        aria-labelledby="approach-title"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <Eyebrow>How we build</Eyebrow>
          <h2 id="approach-title" className="mt-4 max-w-2xl font-display type-heading">
            Useful work comes first.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-border p-7">
                <Icon aria-hidden="true" className="size-7 text-link" />
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3 type-copy text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="updates"
        aria-labelledby="updates-title"
        className="scroll-mt-20 border-t border-border px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Follow the work</Eyebrow>
            <h2 id="updates-title" className="mt-4 font-display type-heading">
              Progress you can inspect.
            </h2>
            <p className="mt-5 type-lead text-muted-foreground">
              Each entry says where the work lives, so nothing unfinished is presented as shipped.
            </p>
            <Link
              href="/zero-to-prove#log"
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
            >
              Full build log on Zero to Prove <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ol className="grid gap-4">
            {MILESTONES.slice(0, 3).map((milestone) => (
              <li
                key={`${milestone.date}-${milestone.title}`}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 type-meta text-muted-foreground">
                  <time dateTime={milestone.date} className="font-semibold text-foreground">
                    {dateFormat.format(new Date(`${milestone.date}T00:00:00Z`))}
                  </time>
                  <span>{MILESTONE_WHERE[milestone.where]}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{milestone.title}</h3>
                <p className="mt-2 type-copy text-muted-foreground">{milestone.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <ExploreBand page="home" />
    </main>
  );
}
