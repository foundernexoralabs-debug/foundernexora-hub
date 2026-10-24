// @polsia:user-owned — the Renor launch kit for press, events and anyone sharing Renor:
// graphics, real screenshots, short descriptions, the film storyboard, facts and contact.
import { ArrowRight, ArrowUpRight, Clapperboard, Download, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CopyButton } from '@/components/custom/copy-button';
import { Eyebrow, PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { Button } from '@/components/ui/button';
import {
  CONTACT_EMAIL,
  CONTACT_MAILTO,
  RENOR_APP_URL,
  RENOR_LABS_STORE_URL,
  SOCIAL_CHANNELS,
} from '@/lib/business/ecosystem';
import {
  DESCRIPTIONS,
  formatTimecode,
  LAUNCH_GRAPHICS,
  LAUNCH_SOCIAL_IMAGE,
  STORYBOARD,
  TOUR,
  TOUR_EXAMPLE,
  tourImage,
} from '@/lib/business/launch';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Renor launch kit — graphics, screenshots and press descriptions',
  description:
    'Everything to share or write about Renor by FounderLab: launch graphics, real screenshots, 25, 50 and 100-word descriptions, the 60-second film storyboard and press contact.',
  path: '/launch-kit',
  socialTitle: 'Renor launch kit',
  image: LAUNCH_SOCIAL_IMAGE,
});

const FACTS = [
  ['Product', 'Renor'],
  ['Made by', 'FounderLab'],
  ['What it is', 'An AI workspace for conversations, coding, websites and ongoing projects'],
  ['Status', 'In preview, free to start, with a private beta'],
  ['Where', 'In the browser'],
  ['Plans', 'Free today. Pro £12, Plus £29 and Max £79 a month are proposed, not on sale'],
] as const;

const SCREEN_FILES = [
  ...TOUR.map((shot) => ({ id: shot.file, name: shot.tab })),
  { id: 'builder-live', name: 'Website Builder, while it writes' },
];

const wordCount = (text: string) => text.trim().split(/\s+/).length;

export default function LaunchKitPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Press and events"
        title={
          <>
            The Renor <span className="text-link">launch kit.</span>
          </>
        }
        lede="Everything you need to share, present or write about Renor: graphics sized for every feed, real screenshots, ready-made descriptions and the storyboard for our 60-second film."
      >
        <Button asChild variant="brand" size="xl">
          <a href="#graphics">
            Get the graphics <Download aria-hidden="true" className="size-4" />
          </a>
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link href="/renor">
            Meet Renor <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </PageHero>

      {/* ── Graphics ─────────────────────────────────────────────────── */}
      <section
        id="graphics"
        aria-labelledby="graphics-title"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="graphics-title"
            eyebrow="Graphics"
            title="Three formats, one look."
            lede="Each graphic carries a real screen from the app. Download the full-size PNG; please do not crop out the Renor name."
          />
          <div className="mt-12 grid items-start gap-6 md:grid-cols-[1fr_0.56fr] lg:grid-cols-[1fr_0.56fr_1.2fr]">
            {LAUNCH_GRAPHICS.map((graphic) => (
              <article
                key={graphic.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="bg-[#07080f] p-3">
                  <Image
                    src={graphic.preview}
                    alt={graphic.alt}
                    width={graphic.width}
                    height={graphic.height}
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                    className="h-auto w-full rounded-lg"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold tracking-tight">{graphic.title}</h3>
                    <span className="type-meta text-muted-foreground tabular-nums">
                      {graphic.width} × {graphic.height}
                    </span>
                  </div>
                  <p className="mt-1 type-copy text-muted-foreground">{graphic.use}</p>
                  <a
                    href={graphic.href}
                    download
                    className="mt-4 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-semibold text-link underline-offset-4 hover:underline"
                  >
                    <Download aria-hidden="true" className="size-4" /> Download PNG
                    <span className="sr-only">, {graphic.title.toLowerCase()}</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screenshots ──────────────────────────────────────────────── */}
      <section
        id="screens"
        aria-labelledby="screens-title"
        className="scroll-mt-20 border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading
            id="screens-title"
            eyebrow="Screenshots"
            title="Real screens, light and dark."
            lede={
              <>
                Taken from the production build of the app on 24 October 2026. The example business,{' '}
                {TOUR_EXAMPLE.name}, is invented; AI replies were scripted so the story stays
                consistent. 1920 × 1200, in WebP and AVIF.
              </>
            }
          />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SCREEN_FILES.map((screen) => (
              <li
                key={screen.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Image
                  src={tourImage({ file: screen.id }, 'dark')}
                  alt={`Renor ${screen.name} screen, dark theme`}
                  width={1600}
                  height={1000}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full border-b border-border"
                />
                <div className="p-5">
                  <h3 className="font-semibold">{screen.name}</h3>
                  <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {(['light', 'dark'] as const).map((scheme) =>
                      (['webp', 'avif'] as const).map((format) => (
                        <a
                          key={`${scheme}-${format}`}
                          href={`/launch-kit/screens/renor-${screen.id}-${scheme}.${format}`}
                          download
                          className="inline-flex min-h-9 items-center font-semibold text-link underline-offset-4 hover:underline"
                        >
                          {scheme === 'light' ? 'Light' : 'Dark'} · {format.toUpperCase()}
                          <span className="sr-only">, {screen.name}</span>
                        </a>
                      )),
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Descriptions ─────────────────────────────────────────────── */}
      <section
        id="descriptions"
        aria-labelledby="descriptions-title"
        className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              id="descriptions-title"
              eyebrow="Descriptions"
              title="Say it in 25, 50 or 100 words."
              lede="Accurate as of the current release. Please keep the status words: Renor is in preview, and paid plans are proposals."
            />
            <dl className="mt-10 grid gap-0 divide-y divide-border rounded-2xl border border-border">
              {FACTS.map(([term, detail]) => (
                <div key={term} className="grid gap-1 p-4 sm:grid-cols-[8rem_1fr] sm:gap-4">
                  <dt className="text-sm font-semibold">{term}</dt>
                  <dd className="type-copy text-muted-foreground">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid gap-5">
            {([25, 50, 100] as const).map((length) => (
              <article key={length} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">
                    {length} words{' '}
                    <span className="font-normal text-muted-foreground">
                      ({wordCount(DESCRIPTIONS[length])} counted)
                    </span>
                  </h3>
                  <CopyButton text={DESCRIPTIONS[length]} label={`${length}-word description`} />
                </div>
                <p className="mt-4 type-copy">{DESCRIPTIONS[length]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Storyboard ───────────────────────────────────────────────── */}
      <section
        id="film"
        aria-labelledby="film-title"
        className="scroll-mt-20 border-y border-border bg-band px-5 py-20 sm:px-8 sm:py-28"
      >
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              id="film-title"
              eyebrow="The 60-second film"
              title="Seven shots, all from the real app."
            />
            <Button asChild variant="brand" size="xl">
              <Link href="/launch-kit/storyboard">
                <Clapperboard aria-hidden="true" className="size-4" /> Full storyboard
              </Link>
            </Button>
          </div>
          <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {STORYBOARD.map((shot) => (
              <li key={shot.start} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-link tabular-nums">
                  {formatTimecode(shot.start)}–{formatTimecode(shot.end)}
                </p>
                <h3 className="mt-2 font-semibold">{shot.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">“{shot.onScreen}”</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Contact and links ────────────────────────────────────────── */}
      <section aria-labelledby="press-contact" className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Press contact</Eyebrow>
            <h2 id="press-contact" className="mt-4 font-display type-heading">
              Talk to the founder.
            </h2>
            <p className="mt-5 max-w-xl type-lead text-muted-foreground">
              For interviews, demos at your event, or anything not covered here, email us. A person
              reads every message.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="brand" size="xl">
                <a
                  href={`${CONTACT_MAILTO}?subject=${encodeURIComponent('Renor press or event enquiry')}`}
                >
                  <Mail aria-hidden="true" className="size-4" /> {CONTACT_EMAIL}
                </a>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {SOCIAL_CHANNELS.filter((channel) => channel.id !== 'renor-labs').map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-link underline-offset-4 hover:underline"
                  >
                    {channel.name} <ArrowUpRight aria-hidden="true" className="size-4" />
                    <span className="sr-only"> ({channel.label}, opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 self-start">
            {[
              { href: '/renor', label: 'Renor: features, tour and private beta', external: false },
              { href: RENOR_APP_URL, label: 'Open the Renor web preview', external: true },
              { href: '/renor/plans', label: 'Plans and proposed prices', external: false },
              { href: '/plugins', label: 'Renor Plugin Store', external: false },
              { href: RENOR_LABS_STORE_URL, label: 'Renor Labs shop on Plug&Pay', external: true },
            ].map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 font-semibold transition-colors hover:border-brand-500/50"
                >
                  {link.label}
                  <ArrowUpRight aria-hidden="true" className="size-4 text-link" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 font-semibold transition-colors hover:border-brand-500/50"
                >
                  {link.label}
                  <ArrowRight aria-hidden="true" className="size-4 text-link" />
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
      <ExploreBand page="launch-kit" />
    </main>
  );
}
