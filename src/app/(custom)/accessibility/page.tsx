// @polsia:user-owned — accessibility statement for this website. States only what has been checked.
import type { Metadata } from 'next';
import { PageHero } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { LegalDocument, type LegalSection } from '@/components/custom/legal-document';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Accessibility',
  description:
    'How the FounderLab website is built to be usable by everyone, what we have checked, its known limits and how to report a barrier.',
  path: '/accessibility',
});

const UPDATED = '6 October 2026';

const SECTIONS: readonly LegalSection[] = [
  { id: 'what-we-aim-for', title: 'What we aim for' },
  { id: 'what-we-have-checked', title: 'What we have checked' },
  { id: 'known-limits', title: 'Known limits' },
  { id: 'report-a-barrier', title: 'Report a barrier' },
];

export default function AccessibilityPage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Accessibility"
        title="A website everyone can use."
        lede={`Last reviewed ${UPDATED}.`}
      />
      <LegalDocument sections={SECTIONS} dateLabel="Last reviewed" date={UPDATED}>
        <h2 id="what-we-aim-for">What we aim for</h2>
        <p>
          We aim for the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. This website
          has not yet had a formal, independent audit against them, so we do not claim full
          conformance.
        </p>

        <h2 id="what-we-have-checked">What we have checked</h2>
        <ul>
          <li>Every page has one main heading, and sections follow it in order.</li>
          <li>
            The menus, links and buttons work with a keyboard, and links and buttons show a visible
            focus ring.
          </li>
          <li>
            Links that open another website say so to screen readers, and the menu button has a text
            label.
          </li>
          <li>Product screenshots have text descriptions.</li>
          <li>
            Pages fit a phone screen without sideways scrolling. On a phone, the menu, buttons and
            navigation links are at least 44 pixels tall; links inside a sentence are the size of
            the text around them.
          </li>
          <li>
            Light and dark themes are both available, and the site follows your device setting.
          </li>
          <li>
            If your device asks for reduced motion, hover effects and smooth scrolling are turned
            off.
          </li>
        </ul>
        <p>
          These checks were made on phone, tablet and desktop widths in a current Chromium browser.
          Other browsers and assistive technologies have not yet been tested one by one.
        </p>

        <h2 id="known-limits">Known limits</h2>
        <ul>
          <li>Contrast has not been measured on every combination of colours in both themes.</li>
          <li>
            Renor, the app, is a separate product. Its accessibility is being improved release by
            release and is not covered by this statement.
          </li>
        </ul>

        <h2 id="report-a-barrier">Report a barrier</h2>
        <p>
          If something on this website is hard or impossible for you to use, email{' '}
          <a href={CONTACT_MAILTO} className="text-foreground underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
          . Tell us the page and what happened, and we will reply and fix what we can.
        </p>
      </LegalDocument>
      <ExploreBand page="accessibility" />
    </main>
  );
}
