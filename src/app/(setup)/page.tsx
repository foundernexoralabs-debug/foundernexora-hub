// @polsia:user-owned — FounderLab public company front door.
// Truthful copy: every project, feature and milestone comes from src/lib/business/ecosystem.ts.
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { BrandMark } from '@/components/custom/brand-mark';
import { HeroGrid } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { BuildLogTeaser, HomeCta, HowWeWork, ProductBento } from '@/components/custom/home';
import { OrganizationJsonLd } from '@/components/custom/structured-data';
import { Button } from '@/components/ui/button';
import { pageMetadata } from '@/lib/business/seo';
import { siteDescription } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Renor by FounderLab — an AI workspace for people who make things',
  description: siteDescription,
  path: '/',
  absolute: true,
});

const principles = [
  {
    title: 'Prove the work',
    text: 'Real tests and useful output matter more than a long list of promised features.',
  },
  {
    title: 'Earn trust',
    text: 'Permissioned actions, clear limitations and responsible handling of information.',
  },
  {
    title: 'Keep improving',
    text: 'Ship coherent improvements, measure their impact and make what works easier to use.',
  },
] as const;

export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="min-h-screen bg-background text-foreground">
      <OrganizationJsonLd />
      <section className="relative isolate overflow-hidden border-b border-border px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32">
        <HeroGrid />
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <div className="max-w-3xl">
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold tracking-[0.1em] text-foreground uppercase shadow-xs">
                <BrandMark className="size-4" animate={false} />
                FounderLab
                <span className="hidden text-muted-foreground sm:inline">· Makers of Renor</span>
              </p>
              <Link
                href="/renor#beta"
                className="group inline-flex min-h-9 items-center gap-2 rounded-full border border-brand-500/35 bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-link transition-colors hover:border-brand-500/60 dark:bg-brand-500/10"
              >
                <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
                Renor private beta is open
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
            <h1 className="font-display type-display text-balance">
              Technology for <span className="text-link">the work ahead.</span>
            </h1>
            <p className="mt-7 max-w-xl type-lead text-pretty text-muted-foreground">
              FounderLab builds Renor, an AI workspace for people who make things, and a small
              family of related projects. Explore what works today, see what is being built, and
              judge us by the evidence.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="xl">
                <Link href="/renor">
                  Meet Renor AI <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <a href="#guide">
                  What do you need? <ArrowDown aria-hidden="true" className="size-4" />
                </a>
              </Button>
            </div>
            <p className="mt-6 type-meta text-muted-foreground">
              Renor is in preview: usable today, with every feature’s status shown.
            </p>
          </div>
          <div className="relative mx-auto flex aspect-square w-full max-w-[16rem] items-center justify-center sm:max-w-md">
            <div
              aria-hidden="true"
              className="absolute size-[96%] rounded-full border border-border"
            />
            <div
              aria-hidden="true"
              className="absolute size-[78%] rounded-full border border-dashed border-border"
            />
            <Image
              src="/assets/renor/orb.webp"
              alt="Renor’s orb, the living centre of the Renor workspace"
              width={380}
              height={380}
              preload
              sizes="(min-width: 640px) 28rem, 16rem"
              className="relative h-auto w-[72%]"
            />
            <div className="absolute right-0 bottom-[6%] rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
              <p className="flex items-center gap-2 text-[0.9375rem] font-semibold">
                <Sparkles aria-hidden="true" className="size-4 text-link" /> Renor AI
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Chat · Code · Websites · Projects
              </p>
            </div>
          </div>
        </div>
      </section>

      <ProductBento />
      <HowWeWork principles={principles} />
      <BuildLogTeaser />
      <HomeCta />
      <ExploreBand page="home" />
    </main>
  );
}
