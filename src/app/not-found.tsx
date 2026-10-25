// @polsia:user-owned — app 404 page: says what happened and offers the most useful ways on.
// Renor's orb has drifted off its orbit; the drift stops under reduced motion (custom-style.css).
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, HeroGrid } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { RenorOrb } from '@/components/custom/renor-orb';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Page not found',
  description:
    'This page does not exist. Find Renor, the Plugin Store, projects or a way to reach us.',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-20">
        <HeroGrid />
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="max-w-2xl">
            <Eyebrow>Error 404 · Lost in space</Eyebrow>
            <h1 className="mt-5 font-display type-title text-balance">This page does not exist.</h1>
            <p className="mt-6 type-lead text-pretty text-muted-foreground">
              The link may be old or mistyped. Everything FounderLab makes is one step away below.
              If a link on this site brought you here, tell us at{' '}
              <a
                href={CONTACT_MAILTO}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>{' '}
              and we will fix it.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="xl">
                <Link href="/">
                  <ArrowLeft aria-hidden="true" className="size-4" /> Back to the home page
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="/renor">Meet Renor AI</Link>
              </Button>
            </div>
          </div>
          <div aria-hidden="true" className="lost-orb-scene">
            <span className="lost-orb-orbit" />
            <span className="lost-orb-orbit lost-orb-orbit--inner" />
            <span className="lost-orb-code type-mono">404</span>
            <span className="lost-orb-drift">
              <RenorOrb sizes="(min-width: 1024px) 12rem, 8rem" className="w-full" />
            </span>
          </div>
        </div>
      </section>
      <ExploreBand page="not-found" />
    </main>
  );
}
