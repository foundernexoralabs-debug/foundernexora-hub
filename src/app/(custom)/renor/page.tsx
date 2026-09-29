// @polsia:user-owned — public Renor product preview. No live capability claims.
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Renor | AI workspace in development",
  description:
    "Explore Renor, an AI-native workspace in development at FounderNexora. An intentional approach to building, connecting tools and verifying real work.",
  alternates: { canonical: "/renor" },
  openGraph: {
    title: "Renor — from idea to verified action",
    description:
      "An AI-native workspace in development. Explore the vision and follow transparent build progress at FounderNexora.",
  },
};

const principles = [
  {
    number: "01",
    title: "Think in projects",
    status: "In development",
    description:
      "A workspace that connects conversations with durable project context, practical plans and the work that follows.",
  },
  {
    number: "02",
    title: "Build with purpose",
    status: "In development",
    description:
      "Code and website-building workflows designed for reviewable output, iteration and real evidence instead of impressive-looking demos.",
  },
  {
    number: "03",
    title: "Connect and act",
    status: "Planned expansion",
    description:
      "Permissioned integrations that discover the right tool, request only necessary access and show exactly what an action achieved.",
  },
];

const stages = [
  { index: "1", title: "Understand", detail: "Capture the outcome and the project context." },
  { index: "2", title: "Plan", detail: "Propose a practical workflow before making changes." },
  { index: "3", title: "Approve", detail: "Keep you in control of access and consequential actions." },
  { index: "4", title: "Verify", detail: "Show actual results, limitations and the next step." },
];

export default function RenorPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-white/10 px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_60%_at_75%_16%,rgba(99,102,241,0.28),transparent_65%),radial-gradient(ellipse_55%_45%_at_14%_80%,rgba(56,189,248,0.11),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.10] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:72px_72px]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-indigo-300 uppercase">
              <span aria-hidden="true" className="size-2 rounded-full bg-indigo-300" />
              FounderNexora presents · In development
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.03] tracking-[-0.065em] sm:text-7xl lg:text-[5.9rem]">
              From idea to <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-white bg-clip-text text-transparent">verified action.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Renor is an AI-native workspace taking shape for people who build.
              Less tool-switching. More coherent work. Real execution you can inspect.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#vision"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-indigo-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
              >
                Explore the vision <span aria-hidden="true" className="ml-2">↗</span>
              </a>
              <a
                href="https://github.com/foundernexoralabs-debug/foundernexora-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-medium transition hover:border-white/60 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
              >
                Follow public progress
              </a>
            </div>
            <p className="mt-6 text-xs tracking-wide text-muted-foreground">
              Product under development. Availability and features will be confirmed at launch.
            </p>
          </div>
          <div role="group" className="relative mx-auto w-full max-w-lg" aria-label="Illustrative concept of Renor's workflow">
            <div aria-hidden="true" className="absolute -inset-5 -z-10 rounded-[3rem] bg-indigo-400/10 blur-3xl" />
            <div className="overflow-hidden rounded-[1.8rem] border border-white/15 bg-gradient-to-br from-[#171728] via-[#10101c] to-[#0a0a12] p-5 shadow-[0_32px_110px_rgba(0,0,0,0.4)] sm:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div aria-hidden="true" className="flex size-9 items-center justify-center rounded-xl bg-indigo-400/15 text-xl text-indigo-200">✧</div>
                  <div>
                    <p className="text-base font-semibold tracking-tight text-white">Renor</p>
                    <p className="text-[11px] text-slate-400">Illustrative interface concept</p>
                  </div>
                </div>
                <span className="rounded-full border border-indigo-300/20 px-3 py-1 text-[11px] text-indigo-200">VISION</span>
              </div>
              <p className="mb-3 text-xs font-semibold tracking-[0.13em] text-indigo-300 uppercase">Project intent</p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                <p className="text-lg font-medium leading-snug text-white">Turn a project idea into a reviewable, working result.</p>
              </div>
              <div className="my-5 ml-4 border-l border-indigo-300/35 pl-6">
                <p className="mb-2 text-xs text-slate-400">Proposed flow</p>
                {["Understand the task", "Choose the right tool", "Confirm permissions", "Return execution evidence"].map((step, index) => (
                  <div key={step} className="relative py-3">
                    <span aria-hidden="true" className="absolute -left-[29px] top-4 size-2 rounded-full bg-indigo-300 ring-4 ring-[#151525]" />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-100">{step}</p>
                      <span className="text-xs tabular-nums text-indigo-300/80">0{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/[0.055] p-4 text-sm text-slate-300">
                <p className="font-semibold text-emerald-200">Proof over promises</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">An actual execution receipt will distinguish completed work from a plan, preview or blocked action.</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">Concept illustration — not a screenshot of a shipped feature.</p>
          </div>
        </div>
      </section>

      <section id="vision" aria-labelledby="vision-title" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.19em] text-indigo-400 uppercase">The vision</p>
          <h2 id="vision-title" className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">More than an answer box.</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            The goal is an intelligent workspace that helps you move from thinking to building to evidence-backed results. These are product directions, not claims that every capability is available today.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {principles.map((item) => (
            <article key={item.number} className="group rounded-3xl border border-border/70 bg-card/60 p-7 transition-colors hover:border-indigo-400/50 sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-semibold text-indigo-400">{item.number}</span>
                <span className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground">{item.status}</span>
              </div>
              <h3 className="mt-12 text-2xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="approach-title" className="border-y border-border/70 bg-card/35 px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold tracking-[0.19em] text-indigo-400 uppercase">Designed for trust</p>
          <h2 id="approach-title" className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Every action should have a receipt.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {stages.map((stage) => (
              <div key={stage.index} className="rounded-2xl border border-border/70 bg-background/70 p-6">
                <p className="text-sm font-semibold text-indigo-400">{stage.index.padStart(2, "0")}</p>
                <h3 className="mt-8 text-xl font-semibold">{stage.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/15 via-card to-card p-9 sm:p-14">
          <p className="text-xs font-semibold tracking-[0.19em] text-indigo-300 uppercase">Building in public</p>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Follow the work, not a countdown.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Renor is being developed within FounderNexora. Follow documented progress and public announcements; product availability will be communicated when it has been verified.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="https://github.com/foundernexoralabs-debug/foundernexora-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-[#0c0d19] transition hover:bg-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
            >
              Explore FounderNexora on GitHub ↗
            </a>
            <Link href="/" className="inline-flex min-h-12 items-center rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400">
              Back to the company
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
