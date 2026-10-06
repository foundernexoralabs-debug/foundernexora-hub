// @polsia:user-owned — terms for using this website. Product and store terms are published separately before they apply.
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/custom/ecosystem';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms for using the FounderLab website, and where Renor and store terms will live.',
  alternates: { canonical: '/terms' },
};

const UPDATED = '5 October 2026';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero eyebrow="Terms" title="Using this website." lede={`Last updated ${UPDATED}.`} />
      <article className="mx-auto max-w-3xl px-5 py-16 text-base leading-relaxed text-muted-foreground sm:px-8 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        <h2>What this website is</h2>
        <p>
          This website describes FounderLab and its projects. We work to keep it accurate, and every
          product and feature shows its status (live, preview, experimental or planned). Features
          described as planned are intentions, not promises, and may change.
        </p>

        <h2>Previews</h2>
        <p>
          Renor is offered as a preview. It may change, be unavailable at times, or produce
          mistakes; AI output should be checked before you rely on it. Do not use the preview for
          anything where an error could cause serious harm.
        </p>

        <h2>Content and code</h2>
        <p>
          The source code of this website is public on GitHub under its stated licence. Product
          names, the Renor and FounderLab brands and the screenshots on this site belong to
          FounderLab.
        </p>

        <h2>Product and store terms</h2>
        <p>
          Terms for Renor accounts and for anything sold in the{' '}
          <Link href="/store" className="text-foreground underline underline-offset-4">
            Renor Labs Store
          </Link>{' '}
          will be published before they apply: before any paid plan is offered and before the first
          product is sold.
        </p>

        <h2>Changes and contact</h2>
        <p>
          We may update these terms and will change the date at the top when we do. Questions:{' '}
          <a href={CONTACT_MAILTO} className="text-foreground underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>{' '}
          or{' '}
          <Link href="/contact" className="text-foreground underline underline-offset-4">
            Contact
          </Link>
          .
        </p>
      </article>
    </main>
  );
}
