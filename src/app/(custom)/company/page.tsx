// @polsia:user-owned — About FounderLab. Only facts that can be checked; no invented history.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { PUBLIC_REPO_URL } from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'About FounderLab',
  description:
    'FounderLab is a technology company building Renor and practical AI-native tools, with honest status for everything it makes.',
  alternates: { canonical: '/company' },
};

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

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="About"
        title="A small technology company that would rather prove than promise."
        lede="FounderLab builds Renor, an AI workspace for people who make things, and a small family of related projects. Everything we publish says plainly what works today and what does not yet."
      />
      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="What we do" title="One company, a few focused projects." />
          <div className="grid gap-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Renor is the flagship: chat, coding, website building and project memory in one
              workspace, with results you can check. Around it sit a store for the digital tools we
              make, and Zero to Prove, where the building happens in public.
            </p>
            <p>
              We are early. Renor is in preview, the store’s first products are not on sale yet, and
              we say so. You can follow every public change to this website on GitHub.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-base">
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-foreground underline-offset-4 hover:underline"
              >
                See all projects <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                href={PUBLIC_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Public code on GitHub <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section
        id="how-we-work"
        aria-labelledby="how-we-work-title"
        className="scroll-mt-24 border-t border-border/60 bg-card/30 px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="how-we-work-title"
            eyebrow="How we work"
            title="The rules behind everything we ship."
            lede="Internally, an engineering system we call Company OS keeps tasks accountable, changes reviewable and knowledge durable. It is a tool for us, not a product for sale."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-2xl border border-border/70 bg-background/70 p-6"
              >
                <h3 className="text-lg font-semibold">{principle.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {principle.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
