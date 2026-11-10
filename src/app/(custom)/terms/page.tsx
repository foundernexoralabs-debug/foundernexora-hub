// @polsia:user-owned — terms for using this website, who sells Renor's paid plans, and where product
// terms live: billing for paid plans on /renor/billing; Plugin Store terms before the first sale.
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { LegalDocument, type LegalSection } from '@/components/custom/legal-document';
import { BILLING_PATH, BILLING_TITLE, SELLER_IDENTITY } from '@/lib/business/billing';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms',
  description:
    'Terms for using the FounderLab website, who sells Renor’s paid plans, and where billing, refund and Plugin Store terms live.',
  path: '/terms',
});

const UPDATED = '10 November 2026';

const SECTIONS: readonly LegalSection[] = [
  { id: 'what-this-website-is', title: 'What this website is' },
  { id: 'previews', title: 'Previews' },
  { id: 'content-and-code', title: 'Content and code' },
  { id: 'no-copying', title: 'No copying of Renor' },
  { id: 'product-terms', title: 'Product and Plugin Store terms' },
  { id: 'who-we-are', title: 'Who we are' },
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

        <h2 id="no-copying">No copying of Renor</h2>
        <p>
          You may not copy, clone, imitate or reverse-engineer Renor, including its name, logo,
          brand, interface design or the way the product works, and you may not present a copy as
          your own or as connected with us. You may not use Renor, its AI or this website to build a
          copy of Renor, or to extract its prompts, internal instructions or private company
          information. You are welcome to use Renor to build your own, original products.
        </p>
        <p>
          The licence on this website’s public source code covers that code only. It gives no right
          to use the Renor or FounderLab names, logos, product design or screenshots.
        </p>

        <h2 id="product-terms">Product and Plugin Store terms</h2>
        <p>
          How Renor’s paid plans (Pro, Plus and Max) are billed, how to cancel, the 14-day refund on
          your first subscription and how price changes are announced are set out in{' '}
          <Link href={BILLING_PATH} className="text-foreground underline underline-offset-4">
            {BILLING_TITLE}
          </Link>
          . Paid plans are not on sale yet; those rules apply from the day checkout goes live. Full
          terms for Renor accounts will be published before then.
        </p>
        <p>
          Terms for anything sold in the{' '}
          <Link href="/plugins" className="text-foreground underline underline-offset-4">
            Renor Plugin Store
          </Link>{' '}
          are separate, and will be published before the first product is sold. That includes the
          refund terms for digital downloads.
        </p>

        <h2 id="who-we-are">Who we are</h2>
        <p>{SELLER_IDENTITY}</p>

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
