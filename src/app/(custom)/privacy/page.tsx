// @polsia:user-owned — privacy notice for this website, describing only what the site actually does.
// Renor (the app) has its own data handling; it is summarised here and linked, not restated.
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/custom/ecosystem';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What the FounderNexora website collects, what it does not, and how Renor handles your work.',
  alternates: { canonical: '/privacy' },
};

const UPDATED = '5 October 2026';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Privacy"
        title="Privacy, in plain words."
        lede={`Last updated ${UPDATED}.`}
      />
      <article className="prose-legal mx-auto max-w-3xl px-5 py-16 text-base leading-relaxed text-muted-foreground sm:px-8 [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        <h2>This website</h2>
        <p>
          The FounderNexora website is for reading. It has no accounts, no sign-up forms and no
          advertising.
        </p>
        <ul>
          <li>
            <strong className="text-foreground">Your theme choice.</strong> If you switch between
            light and dark mode, the choice is saved in your own browser so the site remembers it.
            It is not sent to us.
          </li>
          <li>
            <strong className="text-foreground">Hosting logs.</strong> Like every website, our
            hosting provider receives standard request information (such as your IP address and
            browser type) to deliver pages and protect the service.
          </li>
          <li>
            <strong className="text-foreground">Visitor counting.</strong> If anonymous visitor
            counting is switched on for this site, your browser keeps a random visitor ID and
            requests a counting pixel on each page. It contains no name or account. When it is
            switched off, nothing is sent.
          </li>
        </ul>
        <p>
          We do not sell personal information, and this website does not use advertising or
          cross-site tracking cookies.
        </p>

        <h2>Links to other sites</h2>
        <p>
          Links to Renor, GitHub, YouTube, TikTok or a checkout provider take you to services with
          their own privacy policies. GitHub issues are public, so please do not include personal
          details in them.
        </p>

        <h2>Renor</h2>
        <p>
          Renor is a separate app that you sign in to. It stores your account, projects, notes and
          settings so you can come back to them, and it sends your requests to the AI provider you
          use. In the next Renor release, code you run with Python in Code AI runs in your own browser. Renor’s full privacy
          terms will be published before any paid plan exists.
        </p>

        <h2>The store</h2>
        <p>
          The Renor Labs Store is not open. Before it sells anything, its privacy and payment terms
          will be published, and payments will be handled by the checkout provider, not stored by
          us. See the{' '}
          <Link href="/store#policies" className="text-foreground underline underline-offset-4">
            store policies
          </Link>
          .
        </p>

        <h2>Questions and requests</h2>
        <p>
          To ask about your data, or to have it corrected or deleted, email{' '}
          <a href={CONTACT_MAILTO} className="text-foreground underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>{' '}
          or see{' '}
          <Link href="/contact" className="text-foreground underline underline-offset-4">
            Contact
          </Link>
          . We will update this notice when what we collect changes, and change the date at the top.
        </p>
      </article>
    </main>
  );
}
