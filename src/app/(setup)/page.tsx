// @polsia:user-owned — FounderNexora public company front door.
// Truthful development-preview copy: no unsupported product, privacy, pricing or download promises.
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CheckCircle2, CircleDot, Command, Globe2, Layers3, LockKeyhole, Monitor, ShieldCheck, Sparkles } from 'lucide-react';
import { siteDescription, siteName } from '@/lib/site';
import { RENOR_WEB_PREVIEW_URL } from '@/lib/business/renor-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: { absolute: siteName },
  description: siteDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'FounderNexora — technology for the work ahead',
    description: 'Meet FounderNexora, explore Renor and follow the development of practical AI-native tools.',
  },
};

const projects = [
  {
    number: '01',
    name: 'Renor',
    eyebrow: 'FLAGSHIP PRODUCT · IN DEVELOPMENT',
    description: 'An AI-native workspace focused on making plans, building useful things and showing evidence of completed work.',
    link: '/renor',
    action: 'Explore Renor',
  },
  {
    number: '02',
    name: 'Company OS',
    eyebrow: 'INTERNAL OPERATIONS · IN DEVELOPMENT',
    description: 'Our internal coordination work: accountable tasks, reviewable changes and durable engineering knowledge. Not a public customer product.',
    link: '#approach',
    action: 'Our approach',
  },
  {
    number: '03',
    name: 'Commerce Lab',
    eyebrow: 'RESEARCH · NOT LAUNCHED',
    description: 'A design-first experiment in useful workspace accessories and technology products. Supplier and demand validation come before sales.',
    link: '#updates',
    action: 'See our progress',
  },
] as const;

const principles = [
  { icon: CheckCircle2, title: 'Prove the work', text: 'Real tests and useful output matter more than a long list of promised features.' },
  { icon: ShieldCheck, title: 'Earn trust', text: 'Permissioned actions, clear limitations and responsible handling of information.' },
  { icon: Layers3, title: 'Keep improving', text: 'Ship coherent improvements, measure their impact and make what works easier to use.' },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border/60 px-5 py-24 sm:px-8 sm:py-32 lg:py-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_25%,rgba(75,80,205,0.22),transparent_48%),radial-gradient(ellipse_at_10%_80%,rgba(34,172,210,0.10),transparent_55%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.055] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:80px_80px]" />
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-7 border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs font-medium tracking-[0.13em] text-brand-400">
              <CircleDot aria-hidden="true" className="mr-2 size-3" />
              FOUNDERNEXORA · BUILDING WITH PURPOSE
            </Badge>
            <h1 className="font-display text-5xl font-semibold leading-[1.03] tracking-[-0.055em] sm:text-7xl">
              Technology for <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-foreground bg-clip-text text-transparent">the work ahead.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              We are building Renor and a family of practical technology projects. Explore the company, see what is being developed and follow evidence-backed progress.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-12 rounded-full bg-brand-500 px-7 text-white hover:bg-brand-400">
                <Link href="/renor">Meet Renor <ArrowRight aria-hidden="true" className="ml-2 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12 rounded-full px-7">
                <a href="#projects">Explore our projects</a>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Renor is in development. A web preview exists, but some capabilities are still being verified.
            </p>
          </div>
          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center" aria-label="Decorative conceptual visualization of Renor">
            <div aria-hidden="true" className="absolute size-[85%] rounded-full border border-brand-400/15" />
            <div aria-hidden="true" className="absolute size-[66%] rounded-full border border-sky-400/15" />
            <div aria-hidden="true" className="absolute size-[48%] rounded-full bg-brand-500/20 blur-[55px]" />
            <div aria-hidden="true" className="relative flex size-[43%] items-center justify-center rounded-full border border-sky-300/45 bg-[radial-gradient(circle_at_38%_28%,rgba(174,226,255,0.9),rgba(72,93,217,0.78)_38%,rgba(29,32,90,0.95)_70%)] shadow-[0_0_75px_rgba(71,115,232,0.35),inset_0_-24px_42px_rgba(11,14,38,0.5)]">
              <span className="font-display text-5xl font-semibold tracking-tighter text-white/90 sm:text-6xl">R</span>
            </div>
            <div className="absolute right-[1%] bottom-[15%] rounded-2xl border border-border/60 bg-background/90 px-4 py-3 shadow-xl backdrop-blur">
              <p className="flex items-center gap-2 text-xs font-semibold"><Sparkles aria-hidden="true" className="size-4 text-brand-400" /> Renor</p>
              <p className="mt-1 text-xs text-muted-foreground">An illustrative product concept</p>
            </div>
          </div>
        </div>
      </section>

      <section id="company" className="scroll-mt-20 border-b border-border/60 px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-screen-xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold tracking-[0.19em] text-brand-400">THE COMPANY</p>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Build deliberately. Improve continuously.</h2>
          </div>
          <div className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            <p>FounderNexora is the home of our technology projects. Renor is our flagship AI workspace, while our internal engineering and smaller experiments help us develop, test and learn.</p>
            <p className="mt-6">Our public pages distinguish what you can explore today from work that is still planned or being tested. We want you to judge us by what the product genuinely does.</p>
          </div>
        </div>
      </section>

      <section id="projects" className="scroll-mt-20 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-screen-xl">
          <p className="text-xs font-semibold tracking-[0.19em] text-brand-400">OUR WORK</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">One company. Focused projects.</h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {projects.map((project) => (
              <article key={project.number} className="flex min-h-80 flex-col justify-between rounded-3xl border border-border/65 bg-card/65 p-7 transition-colors hover:border-brand-500/50">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-brand-400">{project.number}</span>
                    <Globe2 aria-hidden="true" className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-10 text-[11px] font-semibold tracking-wide text-muted-foreground">{project.eyebrow}</p>
                  <h3 className="mt-3 font-display text-3xl font-semibold">{project.name}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                </div>
                <Link href={project.link} className="mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand-400 underline-offset-4 hover:underline focus-visible:underline">
                  {project.action}<ArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="renor" className="border-y border-border/60 bg-card/30 px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <Badge variant="outline" className="border-brand-500/30 text-brand-400">Flagship · Development preview</Badge>
            <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Meet Renor.</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              An AI-native workspace being developed around coherent projects, useful tools and results you can verify. The preview is available to explore; core model-provider and execution workflows are still undergoing testing.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-12 rounded-full bg-brand-500 px-6 text-white hover:bg-brand-400">
                <a href={RENOR_WEB_PREVIEW_URL} target="_blank" rel="noopener noreferrer">Open web preview <ArrowUpRight aria-hidden="true" className="ml-2 size-4" /></a>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-12 rounded-full px-6">
                <Link href="/renor">Explore the product</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-brand-500/25 bg-gradient-to-br from-brand-500/10 to-background p-7">
              <p className="flex items-center gap-3 text-sm font-semibold"><Monitor aria-hidden="true" className="size-5 text-brand-400" /> Web access</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Visit the current Renor browser preview. Features and provider availability may vary while development continues.</p>
              <a className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-400 underline-offset-4 hover:underline" href={RENOR_WEB_PREVIEW_URL} target="_blank" rel="noopener noreferrer">Open preview <ArrowUpRight aria-hidden="true" className="size-4" /></a>
            </div>
            <div className="rounded-2xl border border-border/65 bg-background/80 p-7">
              <p className="flex items-center gap-3 text-sm font-semibold"><LockKeyhole aria-hidden="true" className="size-5 text-muted-foreground" /> Desktop download · Under review</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">The desktop build requires verified release assets and a security review. We will enable a real download link when those checks are complete.</p>
              <span className="mt-5 inline-flex min-h-11 items-center text-sm text-muted-foreground">Not available for public download yet</span>
            </div>
          </div>
        </div>
      </section>

      <section id="approach" className="scroll-mt-20 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-screen-xl">
          <p className="text-xs font-semibold tracking-[0.19em] text-brand-400">HOW WE BUILD</p>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">Useful work comes first.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map(({icon: Icon,title,text})=>(
              <article key={title} className="rounded-2xl border border-border/60 p-7">
                <Icon aria-hidden="true" className="size-7 text-brand-400" />
                <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="updates" className="scroll-mt-20 border-t border-border/60 px-5 py-24 sm:px-8">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.19em] text-brand-400">FOLLOW THE WORK</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Progress you can inspect.</h2>
            <p className="mt-5 text-lg text-muted-foreground">We share public company changes as they are reviewed. Internal work and unfinished experiments are not presented as shipped features.</p>
          </div>
          <Button asChild variant="outline" size="lg" className="min-h-12 rounded-full">
            <a href="https://github.com/foundernexoralabs-debug/foundernexora-hub" target="_blank" rel="noopener noreferrer">
              View public GitHub <ArrowUpRight aria-hidden="true" className="ml-2 size-4"/>
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
