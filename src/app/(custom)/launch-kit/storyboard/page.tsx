// @polsia:user-owned — the 60-second Renor film: a shot list with timings, on-screen text,
// voice-over and the real screen each shot is recorded from. Mirrored in
// docs/launch-kit/renor-60s-storyboard.md; both read src/lib/business/launch.ts's STORYBOARD.
import { ArrowLeft, Clock, Mic, MonitorPlay, Type } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero, SectionHeading } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { Button } from '@/components/ui/button';
import {
  formatTimecode,
  LAUNCH_SOCIAL_IMAGE,
  STORYBOARD,
  type StoryboardShot,
  TOUR_EXAMPLE,
  tourImage,
} from '@/lib/business/launch';
import { pageMetadata } from '@/lib/business/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Renor 60-second film storyboard',
  description:
    'The shot list for Renor’s 60-second launch film: timings, on-screen text, voice-over and the real Renor screen behind every shot.',
  path: '/launch-kit/storyboard',
  socialTitle: 'Renor in 60 seconds: the storyboard',
  image: LAUNCH_SOCIAL_IMAGE,
});

function Still({ still, title }: { still: StoryboardShot['still']; title: string }) {
  if (!still) return null;
  if (still === 'orb') {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-frame">
        <Image
          src="/assets/renor/orb.webp"
          alt={`Reference for “${title}”: Renor’s orb on black`}
          width={380}
          height={380}
          sizes="10rem"
          className="h-auto w-[34%]"
        />
      </div>
    );
  }
  return (
    <Image
      src={tourImage({ file: still }, 'dark')}
      alt={`Reference still for “${title}”, taken from the real Renor screen`}
      width={1600}
      height={1000}
      sizes="(min-width: 1024px) 28rem, 100vw"
      className="h-auto w-full rounded-xl border border-border"
    />
  );
}

const total = STORYBOARD[STORYBOARD.length - 1]?.end ?? 0;

export default function StoryboardPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Launch kit · Film"
        title={
          <>
            Renor in <span className="text-link">60 seconds.</span>
          </>
        }
        lede={
          <>
            Seven shots, {total} seconds, recorded from the real app. The story follows one invented
            example, {TOUR_EXAMPLE.name}, from a question to a working app, a website and a project
            kept for later. Record at 1920 × 1080; every on-screen line also works as a caption.
          </>
        }
      >
        <Button asChild variant="outline" size="xl">
          <Link href="/launch-kit">
            <ArrowLeft aria-hidden="true" className="size-4" /> Back to the launch kit
          </Link>
        </Button>
      </PageHero>

      <section aria-labelledby="timeline" className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-screen-xl">
          <h2 id="timeline" className="sr-only">
            Timeline
          </h2>
          <div
            role="img"
            aria-label={`Timeline of ${STORYBOARD.length} shots over ${total} seconds`}
            className="flex h-12 overflow-hidden rounded-xl border border-border"
          >
            {STORYBOARD.map((shot, index) => (
              <div
                key={shot.start}
                style={{ flexGrow: shot.end - shot.start }}
                className={`flex min-w-0 basis-0 items-center justify-center border-r border-border px-1 text-sm font-semibold last:border-r-0 ${index % 2 ? 'bg-muted/60' : 'bg-brand-500/12 text-link'}`}
              >
                <span className="truncate tabular-nums">{formatTimecode(shot.start)}</span>
                <span className="ml-1.5 hidden truncate font-medium lg:inline">{shot.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="shots" className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeading id="shots" eyebrow="Shot list" title="Shot by shot." />
          <ol className="mt-12 grid gap-6">
            {STORYBOARD.map((shot, index) => (
              <li
                key={shot.start}
                className="grid gap-6 rounded-3xl border border-border bg-card p-5 sm:p-7 lg:grid-cols-[28rem_1fr] lg:gap-10"
              >
                <Still still={shot.still} title={shot.title} />
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-brand-500/12 px-3 py-1 text-sm font-semibold text-link tabular-nums">
                      {formatTimecode(shot.start)}–{formatTimecode(shot.end)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 type-meta text-muted-foreground">
                      <Clock aria-hidden="true" className="size-3.5" />
                      {shot.end - shot.start} s
                    </span>
                    <span className="type-meta text-muted-foreground">
                      Shot {index + 1} of {STORYBOARD.length}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[1.625rem] font-semibold tracking-tight">
                    {shot.title}
                  </h3>
                  <dl className="mt-5 grid gap-4">
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-semibold">
                        <MonitorPlay aria-hidden="true" className="size-4 text-link" /> Screen and
                        action
                      </dt>
                      <dd className="mt-1 type-copy text-muted-foreground">
                        <span className="font-medium text-foreground">{shot.screen}.</span>{' '}
                        {shot.action}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-semibold">
                        <Type aria-hidden="true" className="size-4 text-link" /> On screen
                      </dt>
                      <dd className="mt-1 text-lg font-semibold tracking-tight">
                        “{shot.onScreen}”
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-semibold">
                        <Mic aria-hidden="true" className="size-4 text-link" /> Voice-over
                      </dt>
                      <dd className="mt-1 type-copy italic">“{shot.voiceOver}”</dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12 rounded-2xl border border-border bg-band p-6 type-copy text-muted-foreground">
            <p className="font-semibold text-foreground">Recording notes</p>
            <ul className="mt-3 grid list-disc gap-2 pl-5">
              <li>
                Record every app shot from the real Renor app. Do not mock screens, and keep the
                model label visible where the app shows it.
              </li>
              <li>
                Say on screen, at least once, that {TOUR_EXAMPLE.name} is an invented example.
              </li>
              <li>
                Voice-over runs at about 2.4 words a second; leave a beat of silence at each cut.
              </li>
              <li>No prices in the film: paid plans are proposals until billing is approved.</li>
            </ul>
          </div>
        </div>
      </section>
      <ExploreBand page="storyboard" />
    </main>
  );
}
