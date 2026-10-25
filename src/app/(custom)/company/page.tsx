// @polsia:user-owned — About FounderLab. Only facts that can be checked; no invented history.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusBadge } from '@/components/custom/ecosystem';
import {
  Chapter,
  chapterNumber,
  type Fact,
  FactsRail,
  PullQuote,
} from '@/components/custom/editorial';
import { ExploreBand } from '@/components/custom/explore';
import { FounderHero } from '@/components/custom/founder';
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  PROJECTS,
  PUBLIC_REPO_URL,
  STATUS,
} from '@/lib/business/ecosystem';
import { FOUNDER } from '@/lib/business/founder';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About FounderLab',
  description:
    'FounderLab is a technology company building Renor and practical AI-native tools, with honest status for everything it makes.',
  path: '/company',
});

const principles = [
  {
    title: 'Evidence before “done”',
    text: 'Work counts when it has been tested and checked, not when it has been written.',
  },
  {
    title: 'Truthful status',
    text: 'Every product and feature says whether it is live, in preview, experimental or planned.',
  },
  {
    title: 'Small, reviewable changes',
    text: 'We improve in coherent steps that can be reviewed and reverted, not risky rewrites.',
  },
  {
    title: 'Your work stays yours',
    text: 'Limits protect the service. They never lock you out of what you made.',
  },
] as const;

const flagship = PROJECTS.find((project) => project.slug === 'renor');
const statusCounts = Object.entries(
  PROJECTS.reduce<Record<string, number>>((counts, project) => {
    const label = STATUS[project.status].label.toLowerCase();
    counts[label] = (counts[label] ?? 0) + 1;
    return counts;
  }, {}),
)
  .map(([label, count]) => `${count} ${label}`)
  .join(', ');

/** Facts read from the single sources (projects, founder, contact): nothing typed in by hand. */
const companyFacts: readonly Fact[] = [
  { label: 'Founder', value: FOUNDER.byline },
  ...(flagship
    ? [
        {
          label: 'Flagship',
          value: (
            <span className="flex flex-wrap items-center gap-2">
              {flagship.name} <StatusBadge status={flagship.status} />
            </span>
          ),
        },
      ]
    : []),
  {
    label: 'Projects',
    value: (
      <span>
        <span className="type-mono">{PROJECTS.length}</span> · {statusCounts}
      </span>
    ),
  },
  {
    label: 'Contact',
    value: (
      <a href={CONTACT_MAILTO} className="break-all text-link underline-offset-4 hover:underline">
        {CONTACT_EMAIL}
      </a>
    ),
  },
];

export default function CompanyPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <FounderHero />
      <div className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-screen-xl gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="grid gap-14 sm:gap-16">
            <Chapter
              number={1}
              kicker="About"
              id="about-title"
              title="A small technology company that would rather prove than promise."
            >
              <p className="max-w-[60ch] type-lead text-pretty text-muted-foreground">
                FounderLab builds Renor, an AI workspace for people who make things, and a small
                family of related projects. Everything we publish says plainly what works today and
                what does not yet.
              </p>
            </Chapter>
            <Chapter
              number={2}
              kicker="What we do"
              id="what-we-do-title"
              title="One company, a few focused projects."
            >
              <div className="grid max-w-[60ch] gap-6 type-lead text-pretty text-muted-foreground">
                <p>
                  Renor is the flagship: chat, coding, website building and project memory in one
                  workspace, with results you can check. Around it sit the Plugin Store for the
                  digital kits we make, and Zero to Prove, where the building happens in public.
                </p>
                <p>
                  We are early. Renor is in preview, the Plugin Store’s first products are not on
                  sale yet, and we say so. You can follow every public change to this website on
                  GitHub.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-base">
                <Link
                  href="/projects"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-link underline-offset-4 hover:underline"
                >
                  See all projects <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <a
                  href={PUBLIC_REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-link underline-offset-4 hover:underline"
                >
                  Public code on GitHub <ArrowUpRight aria-hidden="true" className="size-4" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </Chapter>
            <PullQuote cite="From About FounderLab">
              Everything we publish says plainly what works today and what does not yet.
            </PullQuote>
            <Chapter
              number={3}
              kicker="How we work"
              id="how-we-work"
              title="The rules behind everything we ship."
            >
              <p className="max-w-[60ch] type-lead text-pretty text-muted-foreground">
                Internally, an engineering system we call Company OS keeps tasks accountable,
                changes reviewable and knowledge durable. It is a tool for us, not a product for
                sale.
              </p>
              <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
                {principles.map((principle, index) => (
                  <li key={principle.title} className="border-t border-border pt-5">
                    <p className="type-mono text-[0.9375rem] font-semibold text-link">
                      {chapterNumber(3)}.{index + 1}
                    </p>
                    <h3 className="mt-2 font-display type-subheading">{principle.title}</h3>
                    <p className="mt-2 type-copy text-pretty text-muted-foreground">
                      {principle.text}
                    </p>
                  </li>
                ))}
              </ol>
            </Chapter>
          </div>
          <FactsRail
            title="FounderLab at a glance"
            facts={companyFacts}
            footnote="Statuses come from the projects page and change only when the work does."
          />
        </div>
      </div>
      <ExploreBand page="company" />
    </main>
  );
}
