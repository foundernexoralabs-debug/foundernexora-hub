// @polsia:user-owned — terms for using this website. Product and Plugin Store terms are published separately before they apply.
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { LegalDocument, type LegalSection } from '@/components/custom/legal-document';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms',
  description:
    'Terms for using the FounderLab website, and where Renor and Plugin Store terms will live.',
  path: '/terms',
});

const UPDATED = '22 October 2026';

const SECTIONS: readonly LegalSection[] = [
  { id: 'what-this-website-is', title: 'What this website is' },
  { id: 'previews', title: 'Previews' },
  { id: 'content-and-code', title: 'Content and code' },
  { id: 'product-terms', title: 'Product and Plugin Store terms' },
  { id: 'changes-and-contact', title: 'Changes and contact' },
];

export default function TermsPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <PageHero eyebrow="Terms" title="Using this website." lede={`Last updated ${UPDATED}.`} />
      <LegalDocument sections={SECTIONS} dateLabel="Last updated" date={UPDATED}>
        <h2 id="what-this-website-is">What this website is</h2>
        <p>
          This website describes FounderLab and its projects. We work to keep it accurate, and every
          product and feature shows its status (live, preview, experimental or planned). Features
          described as planned are intentions, not promises, and may change.
        </p>

        <h2 id="previews">Previews</h2>
        <p>
          Renor is offered as a preview. It may change, be unavailable at times, or produce
          mistakes; AI output should be checked before you rely on it. Do not use the preview for
          anything where an error could cause serious harm.
        </p>

        <h2 id="content-and-code">Content and code</h2>
        <p>
          The source code of this website is public on GitHub under its stated licence. Product
          names, the Renor and FounderLab brands and the screenshots on this site belong to
          FounderLab.
        </p>

        <h2 id="product-terms">Product and Plugin Store terms</h2>
        <p>
          Terms for Renor accounts and for anything sold in the{' '}
          <Link href="/plugins" className="text-foreground underline underline-offset-4">
            Renor Plugin Store
          </Link>{' '}
          will be published before they apply: before any paid plan is offered and before the first
          product is sold. That includes the refund terms for digital downloads.
        </p>

        <h2 id="changes-and-contact">Changes and contact</h2>
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
      </LegalDocument>
      <ExploreBand page="terms" />
    </main>
  );
}
