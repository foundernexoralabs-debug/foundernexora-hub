// @polsia:user-owned — app 404 page: says what happened and offers the most useful ways on.
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, HeroGrid } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { Button } from '@/components/ui/button';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page does not exist. Find Renor, the store, projects or a way to reach us.',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20">
        <HeroGrid />
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="mt-5 font-display type-title text-balance">This page does not exist.</h1>
          <p className="mt-6 type-lead text-pretty text-muted-foreground">
            The link may be old or mistyped. Everything FounderLab makes is one step away below. If
            a link on this site brought you here, tell us at{' '}
            <a
              href={CONTACT_MAILTO}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>{' '}
            and we will fix it.
          </p>
          <div className="mt-9 flex justify-center">
            <Button asChild variant="brand" size="xl">
              <Link href="/">
                <ArrowLeft aria-hidden="true" className="size-4" /> Back to the home page
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <ExploreBand page="not-found" />
    </main>
  );
}
