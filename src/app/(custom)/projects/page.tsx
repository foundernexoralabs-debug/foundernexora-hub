// @polsia:user-owned — every FounderLab project, grouped by how real it is today.
import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, StatusBadge } from '@/components/custom/ecosystem';
import { ExploreBand } from '@/components/custom/explore';
import { PROJECTS, type Project, STATUS, type StatusKey } from '@/lib/business/ecosystem';

export const metadata: Metadata = {
  title: 'Projects — what FounderLab is building',
  description:
    'FounderLab’s projects, separated into what you can use today, what is being tested and what is planned.',
  alternates: { canonical: '/projects' },
};

const GROUPS: readonly { title: string; lede: string; statuses: readonly StatusKey[] }[] = [
  {
    title: 'Use it today',
    lede: 'Available now, some still in preview.',
    statuses: ['live', 'preview'],
  },
  {
    title: 'Being built and tested',
    lede: 'Real work in progress. Not ready to rely on.',
    statuses: ['experimental'],
  },
  {
    title: 'Planned and researched',
    lede: 'Designed or being investigated. Nothing to use yet.',
    statuses: ['planned', 'research'],
  },
];

function ProjectRow({ project }: { project: Project }) {
  const external = project.href.startsWith('http');
  return (
    <article
      id={project.slug}
      className="grid scroll-mt-24 gap-4 rounded-2xl border border-border/70 bg-card/60 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-2xl font-semibold">{project.name}</h3>
          <StatusBadge status={project.status} />
          <span className="text-xs text-muted-foreground">{project.kind}</span>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
      </div>
      {project.href.startsWith('/projects') ? null : external ? (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
        >
          {project.action} <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      ) : (
        <Link
          href={project.href}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-500 underline-offset-4 hover:underline dark:text-brand-400"
        >
          {project.action} <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </article>
  );
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHero
        eyebrow="Projects"
        title="What we are building, and how far along it is."
        lede="Every project carries one honest status. The key at the end of this page says exactly what each one means."
      />
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-screen-xl gap-16">
          {GROUPS.map((group) => {
            const projects = PROJECTS.filter((project) => group.statuses.includes(project.status));
            if (projects.length === 0) return null;
            return (
              <section key={group.title} aria-label={group.title}>
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/70 pb-4">
                  <h2 className="font-display text-2xl font-semibold sm:text-3xl">{group.title}</h2>
                  <p className="text-sm text-muted-foreground">{group.lede}</p>
                </div>
                <div className="mt-6 grid gap-4">
                  {projects.map((project) => (
                    <ProjectRow key={project.slug} project={project} />
                  ))}
                </div>
              </section>
            );
          })}
          <dl className="grid gap-4 rounded-2xl border border-border/70 p-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(STATUS) as StatusKey[])
              .filter((key) => key !== 'research')
              .map((key) => (
                <div key={key}>
                  <dt>
                    <StatusBadge status={key} />
                  </dt>
                  <dd className="mt-2 leading-relaxed text-muted-foreground">
                    {STATUS[key].description}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </section>
      <ExploreBand page="projects" />
    </main>
  );
}
