// @polsia:user-owned — Zero to Prove: the founder's build-in-public journey.
// For visitors arriving from YouTube or TikTok: what this is, what has been proven, where to go next.
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import { BuildLog } from '@/components/custom/build-log';
import { ChannelIcon } from '@/components/custom/channel-links';
import { PageHero, SectionHeading } from '@/components/custom/ecosystem';
import {
  Chapter,
  chapterNumber,
  type Fact,
  FactsRail,
  PullQuote,
} from '@/components/custom/editorial';
import { ExploreBand } from '@/components/custom/explore';
import { FounderByline } from '@/components/custom/founder';
import { Button } from '@/components/ui/button';
import {
  JOURNEY_CHANNELS,
  MILESTONES,
  type MilestoneKind,
  RENOR_APP_URL,
} from '@/lib/business/ecosystem';
import { FOUNDER } from '@/lib/business/founder';
import { pageMetadata } from '@/lib/business/seo';
import { cn } from '@/lib/utils';

export const metadata: Metadata = pageMetadata({
  title: 'Zero to Prove — building Renor in public',
  description:
    'Zero to Prove follows FounderLab’s founder building Renor in public: what was built, what broke, and what was actually proven.',
  path: '/zero-to-prove',
});

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

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

const first = MILESTONES.at(-1);
const latest = MILESTONES.at(0);
const entryFact = (label: string, entry: (typeof MILESTONES)[number] | undefined): Fact[] =>
  entry ? [{ label, value: `${formatDate(entry.date)} · ${entry.title}` }] : [];
const countOf = (kind: MilestoneKind) => MILESTONES.filter((entry) => entry.kind === kind).length;
const publishedOn = JOURNEY_CHANNELS.filter((channel) => channel.url).map(
  (channel) => channel.name,
);

/** Facts derived from the build log and the channel list: nothing typed in by hand. */
const journeyFacts: readonly Fact[] = [
  ...entryFact('First entry', first),
  ...entryFact('Latest entry', latest),
  {
    label: 'Entries',
    value: (
      <span className="type-mono">
        {MILESTONES.length} · {countOf('shipped')} shipped, {countOf('fix')} fixes,{' '}
        {countOf('test')} {countOf('test') === 1 ? 'test' : 'tests'}
      </span>
    ),
  },
  { label: 'Published on', value: publishedOn.join(' · ') },
  { label: 'Written by', value: FOUNDER.byline },
];

export default function ZeroToProvePage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Zero to Prove"
        title="Building a real AI product in public, from zero to proven."
        lede="Zero to Prove follows the founder of FounderLab building Renor: what was built, what broke, and what was actually proven. If you came from a video, this is where the work lives."
        byline={<FounderByline />}
      >
        <Button asChild variant="brand" size="xl">
          <a href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
            Try what is being built <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </Button>
        <Button asChild variant="outline" size="xl">
          <a href="#log">Read the build log</a>
        </Button>
      </PageHero>

      <section aria-label="How Zero to Prove works" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-screen-xl gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="grid gap-14 sm:gap-16">
            <Chapter number={1} kicker="The rules" id="rules" title="Proof over promises.">
              <p className="max-w-[60ch] type-lead text-pretty text-muted-foreground">
                Three rules decide what is published here, and what is not.
              </p>
              <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
                {rules.map((rule, index) => (
                  <li key={rule.title} className="border-t border-border pt-5">
                    <p className="type-mono text-[0.9375rem] font-semibold text-link">
                      {chapterNumber(1)}.{index + 1}
                    </p>
                    <h3 className="mt-2 font-display type-subheading">{rule.title}</h3>
                    <p className="mt-2 type-copy text-pretty text-muted-foreground">{rule.text}</p>
                  </li>
                ))}
              </ol>
            </Chapter>
            <PullQuote cite="Rule two of Zero to Prove">{rules[1].text}</PullQuote>
            <Chapter
              number={2}
              kicker="The log"
              id="log-intro"
              title="Every entry is dated and says where the work lives."
            >
              <p className="max-w-[60ch] type-lead text-pretty text-muted-foreground">
                In the Renor app or on this website. Each one is tagged as something shipped, a fix,
                or work frozen and tested, so nothing unfinished reads as done.
              </p>
              <a
                href="#log"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
              >
                Jump to the build log <ArrowDown aria-hidden="true" className="size-4" />
              </a>
            </Chapter>
          </div>
          <FactsRail
            title="The journey so far"
            facts={journeyFacts}
            footnote="Counted from the build log below; it updates when an entry is added."
          />
        </div>
      </section>

      <section
        id="log"
        aria-labelledby="log-title"
        className="scroll-mt-20 border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="log-title"
            eyebrow="Build log"
            title="What has been built, and where it is."
            lede="Newest first. Filter by what kind of step it was."
          />
          <div className="mt-10 max-w-4xl">
            <BuildLog entries={MILESTONES} />
          </div>
        </div>
      </section>

      <section aria-labelledby="follow" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="follow"
            eyebrow="Follow along"
            title="Where the journey is published."
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {JOURNEY_CHANNELS.map((channel, index) => (
              <li
                key={channel.id}
                className={cn(
                  'flex flex-col rounded-2xl border border-border bg-card p-7',
                  // YouTube and TikTok lead; the remaining three share the second row.
                  index < 2 ? 'lg:col-span-3' : 'lg:col-span-2',
                  index === JOURNEY_CHANNELS.length - 1 &&
                    JOURNEY_CHANNELS.length % 2 === 1 &&
                    'sm:col-span-2',
                )}
              >
                <p className="flex items-center gap-3 text-lg font-semibold">
                  <ChannelIcon id={channel.id} className="text-link" />
                  {channel.name}
                </p>
                <p className="mt-3 flex-1 type-copy text-muted-foreground">{channel.purpose}</p>
                {channel.url ? (
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
                  >
                    Open {channel.name} <ArrowUpRight aria-hidden="true" className="size-4" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <p className="mt-6 type-meta text-muted-foreground">Not linked yet.</p>
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
