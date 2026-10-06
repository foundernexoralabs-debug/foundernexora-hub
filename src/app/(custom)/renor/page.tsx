// @polsia:user-owned — Renor AI product page. Every capability carries its real status and limits.
import { ArrowRight, ArrowUpRight, Check, Info } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Eyebrow,
  PageHero,
  ProductShot,
  SCREENSHOT_CAPTION,
  SectionHeading,
  StatusBadge,
} from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { Button } from '@/components/ui/button';
import { RENOR_APP_URL, RENOR_AREAS } from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Renor AI — chat, code, websites and projects in one workspace',
  description:
    'Renor is FounderLab’s AI workspace: Chat AI, Code AI, a Website Builder and a Project Office, with results you can check. In preview.',
  alternates: { canonical: '/renor' },
  openGraph: {
    title: 'Renor AI — from idea to verified work',
    description:
      'Chat, code, build websites and keep projects together. In preview, with honest status for every feature.',
  },
};

const stages = [
  {
    index: '01',
    title: 'Understand',
    detail: 'Renor works out whether you are researching, asking, deciding or building.',
  },
  {
    index: '02',
    title: 'Plan',
    detail: 'It proposes the work before changing anything that matters.',
  },
  {
    index: '03',
    title: 'Approve',
    detail: 'Consequential actions wait for you. Access is asked for, not assumed.',
  },
  {
    index: '04',
    title: 'Verify',
    detail: 'It shows what actually ran, what passed, and what is still open.',
  },
] as const;

export default function RenorPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Renor by FounderLab · Preview"
        title={
          <>
            One workspace to think, build{' '}
            <span className="text-brand-500 dark:text-brand-400">and prove it works.</span>
          </>
        }
        lede="Renor brings chat, coding, website building and your projects together, and shows you evidence of what it actually did. It is in preview: useful today, still being verified. The public preview still opens under its earlier name, FounderLab AI."
      >
        <Button
          asChild
          size="lg"
          className="min-h-12 rounded-full bg-brand-500 px-7 text-white hover:bg-brand-400"
        >
          <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
            Open Renor <ArrowUpRight aria-hidden="true" className="ml-2 size-4" />
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="min-h-12 rounded-full px-7">
          <Link href="/renor/plans">Free, Pro and Advanced</Link>
        </Button>
      </PageHero>

      <section aria-labelledby="areas" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="areas"
            eyebrow="What Renor does"
            title="Four areas, one connected workspace."
            lede="Each area lists what it does today and where its limits are. Some of the newest work is in the release candidate under review and reaches the public preview when it is approved."
          />
          <div className="mt-14 grid gap-20">
            {RENOR_AREAS.map((area, index) => (
              <article
                key={area.id}
                id={area.id}
                className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14"
              >
                <div className={index % 2 === 1 && area.screenshot ? 'lg:order-2' : undefined}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-3xl font-semibold tracking-tight">
                      {area.name}
                    </h3>
                    <StatusBadge status={area.status} />
                  </div>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                    {area.summary}
                  </p>
                  <ul className="mt-6 grid gap-3">
                    {area.does.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed">
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-brand-500 dark:text-brand-400"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 flex gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                    <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    <span>
                      <span className="font-semibold text-foreground">Limits: </span>
                      {area.limits}
                    </span>
                  </p>
                </div>
                {area.screenshot ? (
                  <ProductShot
                    {...area.screenshot}
                    caption={SCREENSHOT_CAPTION}
                    priority={index === 0}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/80 p-8 text-sm leading-relaxed text-muted-foreground">
                    <p className="font-semibold text-foreground">No screenshot yet</p>
                    <p className="mt-2">
                      We will add one when this area’s newest work reaches the public preview,
                      rather than show a mock-up.
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how"
        className="border-y border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="how"
            eyebrow="How Renor works"
            title="You stay in control of what matters."
          />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stages.map((stage) => (
              <li
                key={stage.index}
                className="rounded-2xl border border-border/70 bg-background/70 p-6"
              >
                <span className="text-sm font-semibold text-brand-500 dark:text-brand-400">
                  {stage.index}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{stage.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="access" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Getting access</Eyebrow>
            <h2
              id="access"
              className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-5xl"
            >
              Try the web preview.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Renor runs in your browser. Sign in, connect an AI provider or use one available to
              your account, and start with a chat, a small app or a website. There is no payment and
              no paid plan yet.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-background p-7">
              <p className="text-sm font-semibold">Web preview</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The public preview runs the 19 September build, which still carries the earlier name{' '}
                <span className="font-medium text-foreground">FounderLab AI</span>. Newer features
                shown above, and the Renor name, arrive when the release candidate is approved.
              </p>
              <a
                href={RENOR_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
              >
                Open Renor <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
            <div className="rounded-2xl border border-border/70 p-7">
              <p className="text-sm font-semibold">Plans</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Free, Pro and Advanced are proposed. Nothing is on sale, and no price has been set.
              </p>
              <Link
                href="/renor/plans"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
              >
                See the proposed plans <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ExploreBand page="renor" />
    </main>
  );
}
