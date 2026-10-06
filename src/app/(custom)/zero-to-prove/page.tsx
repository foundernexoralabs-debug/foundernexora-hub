// @polsia:user-owned — Zero to Prove: the founder's build-in-public journey.
// For visitors arriving from YouTube or TikTok: what this is, what has been proven, where to go next.
import { ArrowUpRight, Github, Youtube } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { Button } from '@/components/ui/button';
import {
  CHANNELS,
  type Channel,
  MILESTONE_WHERE,
  MILESTONES,
  RENOR_APP_URL,
} from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Zero to Prove — building Renor in public',
  description:
    'Zero to Prove follows FounderLab’s founder building Renor in public: what was built, what broke, and what was actually proven.',
  alternates: { canonical: '/zero-to-prove' },
};

const rules = [
  {
    title: 'Show the real thing',
    text: 'Real screens, real runs and real failures. No staged demos presented as finished features.',
  },
  {
    title: 'Prove before claiming',
    text: 'A feature counts when it has been tested and works, not when it has been announced.',
  },
  {
    title: 'Teach what was learned',
    text: 'Each build step is a lesson: how a problem was found, fixed and checked.',
  },
] as const;

function ChannelIcon({ id }: { id: Channel['id'] }) {
  if (id === 'youtube') return <Youtube aria-hidden="true" className="size-5" />;
  if (id === 'github') return <Github aria-hidden="true" className="size-5" />;
  return (
    <span aria-hidden="true" className="flex size-5 items-center justify-center text-sm font-bold">
      ♪
    </span>
  );
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

export default function ZeroToProvePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Zero to Prove"
        title="Building a real AI product in public, from zero to proven."
        lede="Zero to Prove follows the founder of FounderLab building Renor: what was built, what broke, and what was actually proven. If you came from a video, this is where the work lives."
      >
        <Button
          asChild
          size="lg"
          className="min-h-12 rounded-full bg-brand-500 px-7 text-white hover:bg-brand-400"
        >
          <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
            Try what is being built <ArrowUpRight aria-hidden="true" className="ml-2 size-4" />
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="min-h-12 rounded-full px-7">
          <a href="#log">Read the build log</a>
        </Button>
      </PageHero>

      <section aria-labelledby="rules" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading id="rules" eyebrow="The rules" title="Proof over promises." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {rules.map((rule) => (
              <article
                key={rule.title}
                className="rounded-2xl border border-border/70 bg-card/60 p-7"
              >
                <h3 className="text-lg font-semibold">{rule.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{rule.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="log"
        aria-labelledby="log-title"
        className="scroll-mt-20 border-y border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="log-title"
            eyebrow="Build log"
            title="What has been built, and where it is."
            lede="Each entry says where the work lives: in the release candidate being reviewed, in the public preview anyone can open, or on this website."
          />
          <ol className="mt-12 grid gap-0 border-l border-border/80">
            {MILESTONES.map((milestone) => (
              <li
                key={`${milestone.date}-${milestone.title}`}
                className="relative pb-10 pl-8 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-brand-500 ring-4 ring-background"
                />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={milestone.date} className="font-semibold text-foreground">
                    {dateFormat.format(new Date(`${milestone.date}T00:00:00Z`))}
                  </time>
                  <span>{MILESTONE_WHERE[milestone.where]}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold">{milestone.title}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {milestone.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="follow" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="follow"
            eyebrow="Follow along"
            title="Where the journey is published."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {CHANNELS.map((channel) => (
              <li
                key={channel.id}
                className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-7"
              >
                <p className="flex items-center gap-3 text-lg font-semibold">
                  <ChannelIcon id={channel.id} />
                  {channel.name}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {channel.purpose}
                </p>
                {channel.url ? (
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
                  >
                    Open {channel.name} <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                ) : (
                  <p className="mt-6 text-sm text-muted-foreground">Channel link coming soon.</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ExploreBand page="zero-to-prove" />
    </main>
  );
}
