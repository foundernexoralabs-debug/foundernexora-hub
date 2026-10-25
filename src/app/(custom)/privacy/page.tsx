// @polsia:user-owned — privacy notice for this website, describing only what the site actually does.
// Renor (the app) has its own data handling; it is summarised here and linked, not restated.
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { LegalDocument, type LegalSection } from '@/components/custom/legal-document';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy',
  description:
    'What the FounderLab website collects, what it does not, and how Renor handles your work.',
  path: '/privacy',
});

const UPDATED = '24 October 2026';

const SECTIONS: readonly LegalSection[] = [
  { id: 'this-website', title: 'This website' },
  { id: 'guide', title: 'The Renor Guide on this website' },
  { id: 'links-to-other-sites', title: 'Links to other sites' },
  { id: 'renor', title: 'Renor' },
  { id: 'the-plugin-store', title: 'The Plugin Store' },
  { id: 'questions-and-requests', title: 'Questions and requests' },
];

export default function PrivacyPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Privacy"
        title="Privacy, in plain words."
        lede={`Last updated ${UPDATED}.`}
      />
      <LegalDocument sections={SECTIONS} dateLabel="Last updated" date={UPDATED}>
        <h2 id="this-website">This website</h2>
        <p>
          The FounderLab website is for reading. It has no accounts, no sign-up forms and no
          advertising. The only things you can send us from it are questions and reports through the
          Renor Guide, described below.
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

        <h2 id="guide">The Renor Guide on this website</h2>
        <p>
          The Renor Guide (the “Ask Renor” button) answers questions from this website’s pages and
          lets you report a problem.
        </p>
        <ul>
          <li>
            <strong className="text-foreground">Questions.</strong> Your question is used to answer
            you and is not saved as a conversation on our servers. Server logs keep only a shortened
            copy of questions the Guide could not answer, with emails, phone numbers and similar
            details removed. If AI answers are switched on, your question is also sent, with those
            details removed, to the AI provider that powers them. Your conversation is kept in your
            own browser until you close the tab.
          </li>
          <li>
            <strong className="text-foreground">Reports.</strong> A report is stored privately for
            the FounderLab team and is never posted publicly. By default we keep only the type of
            problem, the page it happened on, an automatic guess at its area and severity, and the
            time. Your description is kept only if you tick “The Renor team may read my
            description”, and even then emails, phone numbers, card numbers, postcodes, passwords
            and keys are removed from it first, and we also keep your screen size, theme and browser
            name. Your email is kept only if you tick “Email me about this”, to reply to you.
            Reports are deleted automatically after 90 days. If our private report inbox is not
            switched on, the report is sent from your own email app instead.
          </li>
          <li>
            Requests are rate-limited using a one-way hash of your IP address; the address itself is
            not stored.
          </li>
        </ul>

        <h2 id="links-to-other-sites">Links to other sites</h2>
        <p>
          Links to Renor, GitHub, YouTube, TikTok, Fiverr, our links page or a checkout provider
          take you to services with their own privacy policies. GitHub issues are public, so please
          do not include personal details in them.
        </p>

        <h2 id="renor">Renor</h2>
        <p>
          Renor is a separate app that you sign in to. It stores your account, projects, notes and
          settings so you can come back to them, and it sends your requests to the AI provider you
          use. In the next Renor release, code you run with Python in Code AI runs in your own
          browser. Renor’s full privacy terms will be published before any paid plan exists.
        </p>

        <h2 id="the-plugin-store">The Plugin Store</h2>
        <p>
          The Renor Plugin Store lists its first products but does not sell anything yet. Before it
          does, its privacy and payment terms will be published, and payments will be handled by our
          checkout partner, Plug&amp;Pay, not stored by us. See{' '}
          <Link href="/plugins#buying" className="text-foreground underline underline-offset-4">
            how buying works
          </Link>
          .
        </p>

        <h2 id="questions-and-requests">Questions and requests</h2>
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
      </LegalDocument>
      <ExploreBand page="privacy" />
    </main>
  );
}
