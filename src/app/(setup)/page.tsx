// @polsia:user-owned — FounderNexora brand hub homepage

import type { Metadata } from 'next';
import { siteDescription, siteName } from '@/lib/site';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: { absolute: siteName },
  description: siteDescription,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden py-24">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
          <div className="absolute top-0 right-0 h-[600px] w-[700px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/25 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[500px] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-brand-950/30 via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="flex flex-col items-center text-center gap-8 max-w-4xl mx-auto">
            <Badge variant="outline" className="border-brand-500/40 bg-brand-500/10 text-brand-400">
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-brand-400 animate-pulse" />
              Building in public · New apps shipping regularly
            </Badge>

            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-foreground">Tools built for</span>
              <br />
              <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                founders who move fast
              </span>
            </h1>

            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
              AI-powered apps that think the way you do — no bloat, no complexity, no lock-in.
              Built by a founder, for founders. Use them in the cloud or run them 100% locally.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20" asChild>
                <a href="#founderlab">Explore FounderLab AI →</a>
              </Button>
              <Button size="lg" variant="outline" className="border-foreground/20 hover:bg-foreground/10" asChild>
                <a href="#apps">All apps</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── APPS HUB ─────────────────────────────────────────── */}
      <section id="apps" className="py-24 border-t border-border/50">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase text-brand-400 mb-4">The ecosystem</p>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Apps shipping now</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every app is self-contained, free to try, and designed to replace 5 tools at once.
            </p>
          </div>

          {/* Featured: FounderLab AI */}
          <div id="founderlab" className="mb-10">
            <Card className="relative overflow-hidden border-brand-500/30 bg-gradient-to-br from-card via-card to-brand-950/20 shadow-xl shadow-brand-500/5">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

              <CardHeader className="pb-0 pt-8 px-8">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-500/20 text-2xl">✦</div>
                      <Badge className="bg-brand-500/15 text-brand-400 border-brand-500/30">Featured App</Badge>
                      <Badge variant="outline" className="text-green-400 border-green-500/30 bg-green-500/10">Live</Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold mb-2">FounderLab AI</CardTitle>
                    <CardDescription className="text-base max-w-2xl">
                      Your all-in-one AI workspace. Chat, Notes, Tasks, YouTube AI, Code AI, and a Website Builder —
                      all in one app. Powered by Claude or your own local Ollama models.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8 pt-6">
                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {['AI Chat', 'Smart Notes', 'Kanban Tasks', 'YouTube AI', 'Code AI', 'Website Builder', 'Cloud Sync', 'Local-first'].map(f => (
                    <span key={f} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">{f}</span>
                  ))}
                </div>

                {/* Two access modes */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Cloud */}
                  <div className="group relative rounded-xl border border-border/60 bg-card/80 p-5 hover:border-brand-500/40 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-lg">☁️</div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">Use Online</p>
                        <p className="text-xs text-muted-foreground">No install · Always updated</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Open in your browser and start immediately. Paste your Anthropic API key → works in 10 seconds.
                    </p>
                    <Button className="w-full bg-brand-600 hover:bg-brand-500 text-white" asChild>
                      <a href="https://founderlab-ai0-1.vercel.app" target="_blank" rel="noopener noreferrer">
                        Open App →
                      </a>
                    </Button>
                  </div>

                  {/* Local macOS */}
                  <div className="group relative rounded-xl border border-border/60 bg-card/80 p-5 hover:border-brand-500/40 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-lg">💻</div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">Download for macOS</p>
                        <p className="text-xs text-muted-foreground">Mac Mini · MacBook · iMac</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Native .app — talks directly to Ollama. <strong className="text-foreground">Zero CORS, zero terminal commands.</strong> 100% private, works offline.
                    </p>
                    <Button className="w-full" variant="outline" disabled>
                      Coming soon
                    </Button>
                  </div>
                </div>

                {/* Mode comparison */}
                <div className="mt-5 grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-blue-400 mt-0.5">☁️</span>
                    <span><strong className="text-foreground">Online:</strong> uses your Anthropic API key · cloud AI · needs internet</span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-purple-400 mt-0.5">💻</span>
                    <span><strong className="text-foreground">Local:</strong> 100% private · works with Ollama on your machine · no commands needed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Future apps placeholder grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📊', name: 'Analytics AI', desc: 'Connect your data sources. Ask questions in plain English. Get insights instantly.', status: 'Planned' },
              { icon: '✉️', name: 'Inbox AI', desc: 'Triage emails, draft replies, and auto-summarise threads — all with AI.', status: 'Planned' },
              { icon: '🗂️', name: 'Projects AI', desc: 'Multi-agent project management. Assign tasks to AI specialists, track progress automatically.', status: 'Planned' },
            ].map(app => (
              <Card key={app.name} className="border-border/40 bg-card/40 opacity-70 hover:opacity-90 transition-opacity">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{app.icon}</span>
                    <Badge variant="outline" className="text-xs text-muted-foreground">{app.status}</Badge>
                  </div>
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{app.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ──────────────────────────────────────── */}
      <section className="py-24 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <p className="text-sm font-semibold tracking-widest uppercase text-brand-400">Why FounderNexora</p>
              <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Built by a founder.<br/>Not a corporation.
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Every app here solves a real problem I had. No VCs, no committees, no "features by roadmap".
                If something breaks, I fix it. If something's missing, I build it.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                All apps are designed to work locally-first when possible — your data stays on your machine,
                no subscriptions required, and the AI runs on hardware you control.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                { icon: '🔒', title: 'Local-first by default', desc: 'Your data stays on your machine. No tracking, no telemetry, no cloud lock-in.' },
                { icon: '⚡', title: 'No bloat', desc: 'One app does one thing extremely well. No feature sprawl, no onboarding tunnels.' },
                { icon: '🆓', title: 'Free to try, always', desc: 'Every app has a free tier. Pay only if you want cloud features or priority support.' },
                { icon: '🔧', title: 'Open to feedback', desc: 'Every app is shipped in public. Found a bug? Needs a feature? You have a direct line.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/60 p-4 hover:border-brand-500/30 transition-colors">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-28 border-t border-border/50">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-950/40 to-background" />
        <div className="container mx-auto max-w-screen-xl px-4 text-center">
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Start building smarter today.
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            FounderLab AI is live now. Open it, paste your API key, and go.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/25" asChild>
              <a href="https://founderlab-ai0-1.vercel.app" target="_blank" rel="noopener noreferrer">
                Launch FounderLab AI →
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#apps">See all apps</a>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}
