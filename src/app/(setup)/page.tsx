// @polsia:user-owned — FounderNexora public company hub.

import {
  ArrowDownRight,
  ArrowRight,
  Blocks,
  CircleDot,
  Code2,
  Compass,
  Layers3,
  MoveUpRight,
  Radio,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RENOR_APP_URL } from '@/lib/business/company-links';
import { siteDescription, siteName } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: siteName },
  description: siteDescription,
  alternates: { canonical: '/' },
};

const productAreas = [
  {
    number: '01',
    icon: Sparkles,
    name: 'AI workspace',
    description:
      'Chat, notes and tasks in one working context. Provider reliability and first-turn response are the active engineering priority.',
    state: 'Runtime being hardened',
  },
  {
    number: '02',
    icon: Code2,
    name: 'Code AI + Builder',
    description:
      'From an idea to a reviewable project. We are testing whether multi-step coding and building can finish with real receipts.',
    state: 'End-to-end proof in progress',
  },
  {
    number: '03',
    icon: Layers3,
    name: 'Community',
    description:
      'Explore examples, save private drafts and prepare resources for other modules. Public profiles and durable sharing are the next build.',
    state: 'Private foundation available',
  },
];

const stations = [
  {
    id: '01',
    name: 'Company Core',
    role: 'Aether',
    detail: 'Work orders, evidence, memory and controls.',
    icon: CircleDot,
    state: 'Foundation',
  },
  {
    id: '02',
    name: 'Product',
    role: 'Renor',
    detail: 'The AI workspace and public product experience.',
    icon: Blocks,
    state: 'Active build',
  },
  {
    id: '03',
    name: 'Revenue',
    role: 'Client work',
    detail: 'Practical service work and delivery learning.',
    icon: Workflow,
    state: 'Operating',
  },
  {
    id: '04',
    name: 'Media',
    role: 'Audience',
    detail: 'Original content and distribution.',
    icon: Radio,
    state: 'Operating',
  },
  {
    id: '05',
    name: 'Research',
    role: 'Trading Lab',
    detail: 'Paper experiments and measured results; no live trading claim.',
    icon: Compass,
    state: 'Experimental',
  },
];

export default function HomePage() {
  return (
    <main className="nexora-page min-h-screen overflow-hidden">
      <section className="nexora-hero relative border-b border-border/70" id="top">
        <div className="nexora-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-12 py-20 lg:min-h-[690px] lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:py-28">
          <div className="max-w-2xl">
            <p className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              <span className="inline-block size-2 rounded-full bg-brand-500" />
              FounderNexora / Building the system
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl xl:text-[5.5rem]">
              Useful work.
              <br />
              <span className="nexora-gradient-text">A stronger system</span>
              <br />
              behind it.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              We are building Renor, an AI workspace for people who turn ideas into projects, and
              the company infrastructure that helps us keep improving it.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="#renor">
                  Explore Renor <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#system">
                  See the company system <ArrowDownRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-brand-600" aria-hidden="true" />
              Built in public. Capabilities are labelled by what we can prove.
            </p>
          </div>
          <section
            className="nexora-console relative mx-auto w-full max-w-[550px] rounded-[1.8rem] p-5 shadow-2xl sm:p-7"
            aria-label="Renor product and company system diagram"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-5 text-xs font-medium tracking-[0.15em] text-slate-400">
              <span>FOUNDERNEXORA / SYSTEM VIEW</span>
              <span>01—05</span>
            </div>
            <div className="relative mx-auto my-9 flex size-44 items-center justify-center rounded-full sm:size-52">
              <div className="nexora-orbit absolute inset-0 rounded-full" aria-hidden="true" />
              <div
                className="nexora-orbit nexora-orbit-inner absolute inset-6 rounded-full"
                aria-hidden="true"
              />
              <div className="nexora-core relative flex size-28 flex-col items-center justify-center rounded-full text-white sm:size-32">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-blue-200">
                  Core
                </span>
                <span className="mt-1 font-display text-2xl font-semibold tracking-tight">
                  Renor
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {['AI workspace', 'Builder', 'Community', 'Memory', 'Company OS'].map(
                (item, index) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs text-slate-200"
                  >
                    <span className="mb-2 block text-[0.65rem] text-blue-300">0{index + 1}</span>
                    {item}
                  </div>
                ),
              )}
              <div className="flex items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-xs font-medium text-blue-200">
                In progress ↗
              </div>
            </div>
          </section>
        </div>
      </section>

      <section id="renor" className="container-page py-20 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-eyebrow mb-4">01 / The public product</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              One workspace.
              <br />
              More work finished.
            </h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Renor brings thinking, coding, building and useful shared resources into one place.
              FounderLab remains the engineering name behind parts of the current app.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/5 px-4 py-2 text-sm text-foreground">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Early product · AI runtime reliability in active repair
            </div>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {productAreas.map(({ number, icon: Icon, name, description, state }) => (
            <article
              key={name}
              className="nexora-feature flex min-h-72 flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-brand-600" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">{number} / 03</span>
              </div>
              <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight">{name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <p className="mt-7 border-t border-border pt-4 text-xs font-medium uppercase tracking-wider text-brand-600">
                {state}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild>
            <Link href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
              Open the current app <MoveUpRight className="ml-2 size-4" />
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            Preview access. Some AI flows are still being verified.
          </span>
        </div>
      </section>

      <section id="access" className="border-y border-border bg-muted/35 py-20 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-eyebrow mb-4">02 / Access model</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight">
              Freedom to start.
              <br />
              Clear choices to grow.
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
              Our intended access model starts with a useful free path and lets people choose a
              connected provider or their own local setup. Higher-capability routes need clear usage
              and cost boundaries.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Free starting path / planned
              </span>
              <h3 className="mt-2 text-xl font-semibold">Useful access with honest limits</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We will publish exact allowances after provider reliability and costs have been
                measured. Cloud inference cannot responsibly be promised as unlimited.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Choice / in development
              </span>
              <h3 className="mt-2 text-xl font-semibold">Bring a provider or use a local model</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Provider connection, health, capability and privacy should be clear in one place.
                Local access requires a trusted runtime connection on the user’s machine.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                Advanced / proposed
              </span>
              <h3 className="mt-2 text-xl font-semibold">More capacity for demanding work</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A paid option may cover higher usage and stronger routes once quality, limits and
                operating cost are proven. No price or entitlement is announced yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="system" className="container-page py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="text-eyebrow mb-4">03 / The company behind the product</p>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Five stations. One record of what works.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            The stations are how the company operates, not five products being sold. Aether connects
            work orders, evidence and handoffs; each station keeps its own useful tools and
            boundaries.
          </p>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {stations.map(({ id, name, role, detail, icon: Icon, state }) => (
            <article
              key={id}
              className="nexora-station flex min-h-64 flex-col rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <Icon className="size-5 text-brand-600" aria-hidden="true" />
                <span className="text-xs text-muted-foreground">{id}</span>
              </div>
              <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-brand-600">
                {role}
              </p>
              <h3 className="mt-1 text-xl font-semibold">{name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
              <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
                {state}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-9 rounded-2xl border border-brand-500/25 bg-brand-500/5 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h3 className="font-display text-xl font-semibold">How the system earns trust</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A task has an owner, a checkpoint, a tested outcome and a next action. A model can
              change without losing the company’s work.
            </p>
          </div>
          <ShieldCheck className="mt-5 size-9 shrink-0 text-brand-600 sm:mt-0" aria-hidden="true" />
        </div>
      </section>

      <section className="nexora-last border-t border-border py-20 sm:py-24">
        <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-eyebrow mb-4">Still building</p>
            <h2 className="font-display max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Follow the work. Judge the results.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              The next milestones are a dependable AI first turn, completed Builder jobs, and public
              Community sharing with real permissions.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href={RENOR_APP_URL} target="_blank" rel="noopener noreferrer">
              Explore Renor <MoveUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
