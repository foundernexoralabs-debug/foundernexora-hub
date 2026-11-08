// @polsia:user-owned — renor.app: Renor, the AI operator.
// Order (founder's brief, 8 Nov 2026): hero → proof → how it works → own your AI → vision
// teaser → the company, then the site footer. Copy lives in src/lib/business/operator.ts.
import type { Metadata } from 'next';
import {
  ClosingCta,
  CompanyBand,
  LoopSection,
  OperatorHero,
  OwnAiSection,
  ProofSection,
  VisionTeaser,
} from '@/components/custom/operator-home';
import { RenorIdentityJsonLd } from '@/components/custom/structured-data';
import { SEARCH_DESCRIPTIONS } from '@/lib/business/search-identity';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Renor — the AI operator. Tell it the outcome; it does the work and shows the proof',
  description: SEARCH_DESCRIPTIONS.home,
  path: '/',
  socialTitle: 'Renor: tell it the outcome. It does the work, and shows the proof.',
  absolute: true,
});

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <RenorIdentityJsonLd />
      <OperatorHero />
      <ProofSection />
      <LoopSection />
      <OwnAiSection />
      <VisionTeaser />
      <CompanyBand />
      <ClosingCta />
    </main>
  );
}
