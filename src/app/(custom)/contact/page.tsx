// @polsia:user-owned — Contact and feedback. Only routes that reach a person today.
import { ArrowUpRight, Bug, Mail, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHero } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  FEEDBACK_URL,
  RENOR_APP_URL,
} from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Contact FounderLab',
  description:
    'How to reach FounderLab: email, feedback on the website and Renor, bug reports and questions.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Contact"
        title="Tell us what works, and what does not."
        lede="Feedback shapes what we build next. These are the ways to reach us today."
      />
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-screen-xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-7">
            <Mail aria-hidden="true" className="size-6 text-brand-500 dark:text-brand-400" />
            <h2 className="mt-5 text-xl font-semibold">Email</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              For business, partnerships, privacy and data requests, or anything you would rather
              not post in public. A person reads every message.
            </p>
            <a
              href={CONTACT_MAILTO}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold break-all text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
            >
              {CONTACT_EMAIL}
            </a>
          </article>
          <article className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-7">
            <Bug aria-hidden="true" className="size-6 text-brand-500 dark:text-brand-400" />
            <h2 className="mt-5 text-xl font-semibold">Public feedback and bug reports</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              Found a broken link, a mistake or an idea for this website? Open an issue on our
              public GitHub. It needs a free GitHub account and is visible to everyone, so please do
              not include personal or account details.
            </p>
            <a
              href={FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
            >
              Open an issue on GitHub <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </article>
          <article className="flex flex-col rounded-2xl border border-border/70 bg-card/60 p-7">
            <MessageSquare
              aria-hidden="true"
              className="size-6 text-brand-500 dark:text-brand-400"
            />
            <h2 className="mt-5 text-xl font-semibold">Feedback inside Renor</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              Renor has a <strong className="font-semibold text-foreground">Feedback</strong> button
              in its sidebar that sends a report with the context of what you were doing. A fix for
              it is in the next Renor release; until that reaches the public preview, please use
              GitHub instead.
            </p>
            <a
              href={RENOR_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
            >
              Open Renor <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </article>
        </div>
      </section>
      <ExploreBand page="contact" />
    </main>
  );
}
