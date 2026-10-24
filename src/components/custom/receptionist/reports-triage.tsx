// @polsia:user-owned — the team's private triage view for Renor Guide reports (/admin/reports).
// Reads /api/reports/admin with the REPORTS_ADMIN_TOKEN access key, which is kept only in this
// browser tab (sessionStorage) and sent as a bearer token. Reports about the same problem are
// shown as one group, most severe and most recent first.
'use client';

import { KeyRound, Lock, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { type AdminReport, AdminReportList, type ReportState } from '@/lib/contracts/receptionist';
import { cn } from '@/lib/utils';

const KEY_STORAGE = 'renor-triage-key';
const SEVERITY_RANK = { high: 0, medium: 1, low: 2 } as const;
const FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'new', label: 'New' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
] as const;
type Filter = (typeof FILTERS)[number]['id'];

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

interface Group {
  id: string;
  reports: AdminReport[];
  lead: AdminReport;
  severity: AdminReport['severity'];
  latest: string;
  state: ReportState;
}

function groupReports(items: readonly AdminReport[]): Group[] {
  const byGroup = new Map<string, AdminReport[]>();
  for (const item of items) byGroup.set(item.groupId, [...(byGroup.get(item.groupId) ?? []), item]);
  return [...byGroup.entries()]
    .map(([id, reports]) => {
      const sorted = [...reports].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
      const severity = sorted.reduce<AdminReport['severity']>(
        (worst, r) => (SEVERITY_RANK[r.severity] < SEVERITY_RANK[worst] ? r.severity : worst),
        'low',
      );
      const state: ReportState = sorted.some((r) => r.state === 'new')
        ? 'new'
        : sorted.some((r) => r.state === 'triaged')
          ? 'triaged'
          : 'closed';
      const lead = sorted.find((r) => r.reference === id) ?? sorted[sorted.length - 1] ?? sorted[0];
      return {
        id,
        reports: sorted,
        lead: lead as AdminReport,
        severity,
        latest: sorted[0]?.receivedAt ?? '',
        state,
      };
    })
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.latest.localeCompare(a.latest),
    );
}

const severityTone = {
  high: 'border-destructive/40 bg-destructive/10 text-destructive',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  low: 'border-border bg-muted text-muted-foreground',
} as const;

function errorMessage(error: unknown): string {
  const status = /\((\d{3})\)/.exec(error instanceof Error ? error.message : '')?.[1];
  if (status === '404')
    return 'Triage is switched off: no REPORTS_ADMIN_TOKEN is set on the server.';
  if (status === '401') return 'That access key is not right.';
  if (status === '503')
    return 'No private report store is configured yet (REPORTS_KV_REST_URL and REPORTS_KV_REST_TOKEN).';
  if (status === '429') return 'Too many attempts. Wait a minute and try again.';
  return 'The report store did not respond. Try again in a moment.';
}

export function ReportsTriage() {
  const [key, setKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [data, setData] = useState<AdminReportList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>('open');
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    try {
      setKey(sessionStorage.getItem(KEY_STORAGE));
    } catch {
      setKey(null);
    }
  }, []);

  const load = useCallback(async (accessKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await apiFetch('/api/reports/admin', {
        headers: { authorization: `Bearer ${accessKey}` },
        cache: 'no-store',
        schema: AdminReportList,
      });
      setData(list);
    } catch (err) {
      setData(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (key) void load(key);
  }, [key, load]);

  const unlock = (event: FormEvent) => {
    event.preventDefault();
    const value = keyInput.trim();
    if (!value) return;
    try {
      sessionStorage.setItem(KEY_STORAGE, value);
    } catch {
      // Kept in memory for this page only.
    }
    setKeyInput('');
    setKey(value);
  };

  const lock = () => {
    try {
      sessionStorage.removeItem(KEY_STORAGE);
    } catch {
      // Nothing stored.
    }
    setKey(null);
    setData(null);
    setError(null);
  };

  const setGroupState = async (group: Group, state: ReportState) => {
    if (!key) return;
    setBusy(group.id);
    try {
      await Promise.all(
        group.reports.map((report) =>
          apiFetch('/api/reports/admin', {
            method: 'PATCH',
            headers: { authorization: `Bearer ${key}` },
            body: JSON.stringify({ reference: report.reference, state }),
          }),
        ),
      );
      await load(key);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const groups = useMemo(() => groupReports(data?.items ?? []), [data]);
  const visible = groups.filter((group) =>
    filter === 'all' ? true : filter === 'open' ? group.state !== 'closed' : group.state === filter,
  );
  const openCount = groups.filter((g) => g.state !== 'closed').length;
  const highCount = groups.filter((g) => g.state !== 'closed' && g.severity === 'high').length;

  if (!key || (!data && error)) {
    return (
      <section className="mx-auto max-w-md px-5 py-20">
        <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-6 text-link" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Report triage</h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Private to the FounderLab team. Enter the access key set as REPORTS_ADMIN_TOKEN on the
            server. It is kept only in this browser tab.
          </p>
          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
            >
              {error}
            </p>
          ) : null}
          <form onSubmit={unlock} className="mt-5 grid gap-3">
            <label htmlFor="triage-key" className="text-sm font-semibold">
              Access key
            </label>
            <input
              id="triage-key"
              type="password"
              autoComplete="current-password"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              className="min-h-11 rounded-xl border border-input bg-background px-3.5 text-base outline-none focus:border-brand-400 focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-[0.9375rem] font-semibold text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              <KeyRound aria-hidden="true" className="size-4" /> Open triage
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-screen-lg px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">Renor Guide</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Report triage</h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            {openCount} open {openCount === 1 ? 'problem' : 'problems'}
            {highCount ? `, ${highCount} high severity` : ''}. Reports expire after{' '}
            {data?.retentionDays ?? '…'} days
            {data?.store === 'memory' ? ' (development store: lost on restart)' : ''}.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => key && load(key)}
            disabled={loading}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold hover:bg-accent disabled:opacity-60"
          >
            <RefreshCw aria-hidden="true" className={cn('size-4', loading && 'animate-spin')} />{' '}
            Refresh
          </button>
          <button
            type="button"
            onClick={lock}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold hover:bg-accent"
          >
            <Lock aria-hidden="true" className="size-4" /> Lock
          </button>
        </div>
      </div>

      <fieldset className="mt-8 inline-flex gap-1 rounded-xl bg-muted p-1">
        <legend className="sr-only">Filter by state</legend>
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              'min-h-9 rounded-lg px-3.5 text-sm font-semibold transition-colors',
              filter === item.id
                ? 'bg-card shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </fieldset>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
        >
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-semibold">{data ? 'Nothing here.' : 'Loading reports…'}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {!data
              ? ''
              : data.items.length
                ? 'No reports match this filter.'
                : 'No reports yet. New ones appear here as visitors send them.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">
          {visible.map((group) => {
            const lead = group.lead;
            const contacts = group.reports.filter((r) => r.contactEmail);
            return (
              <li key={group.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 capitalize',
                      severityTone[group.severity],
                    )}
                  >
                    {group.severity}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-0.5 capitalize">
                    {lead.type}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-0.5 capitalize">
                    {group.state}
                  </span>
                  {group.reports.length > 1 ? (
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-link dark:bg-brand-500/15">
                      {group.reports.length} reports
                    </span>
                  ) : null}
                  <span className="ml-auto font-normal text-muted-foreground">
                    {dateFormat.format(new Date(group.latest))}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-semibold tracking-tight">{lead.summary}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lead.area} · <code className="font-mono">{lead.page}</code> ·{' '}
                  {lead.severityReason}
                </p>
                {lead.steps.length ? (
                  <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm">
                    {lead.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                ) : null}
                {lead.expected || lead.actual ? (
                  <dl className="mt-3 grid gap-1 text-sm">
                    {lead.expected ? (
                      <div>
                        <dt className="inline font-semibold">Expected: </dt>
                        <dd className="inline">{lead.expected}</dd>
                      </div>
                    ) : null}
                    {lead.actual ? (
                      <div>
                        <dt className="inline font-semibold">Actual: </dt>
                        <dd className="inline">{lead.actual}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                <details className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm">
                  <summary className="cursor-pointer font-semibold">
                    Reports in this group ({group.reports.length})
                  </summary>
                  <ul className="mt-3 grid gap-3">
                    {group.reports.map((report) => (
                      <li
                        key={report.reference}
                        className="border-t border-border pt-3 first:border-0 first:pt-0"
                      >
                        <p className="font-mono text-xs text-muted-foreground">
                          {report.reference} · {dateFormat.format(new Date(report.receivedAt))} ·{' '}
                          {[report.context.viewport, report.context.theme, report.context.browser]
                            .filter(Boolean)
                            .join(' · ') || 'no environment'}
                          {report.shareWithEngineers ? ' · shareable with engineers' : ''}
                        </p>
                        <p className="mt-1.5 whitespace-pre-line">{report.description}</p>
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {contacts.map((report) => (
                    <a
                      key={report.reference}
                      href={`mailto:${report.contactEmail}?subject=${encodeURIComponent(`Your Renor report ${report.reference}`)}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium hover:bg-accent"
                    >
                      <Mail aria-hidden="true" className="size-4" /> Reply to {report.reference}
                    </a>
                  ))}
                  <span className="ml-auto flex gap-2">
                    {(['triaged', 'closed', 'new'] as const)
                      .filter((state) => state !== group.state)
                      .map((state) => (
                        <button
                          key={state}
                          type="button"
                          disabled={busy === group.id}
                          onClick={() => setGroupState(group, state)}
                          className="min-h-9 rounded-full border border-border px-3.5 text-sm font-semibold hover:bg-accent disabled:opacity-60"
                        >
                          {state === 'triaged'
                            ? 'Mark triaged'
                            : state === 'closed'
                              ? 'Close'
                              : 'Reopen'}
                        </button>
                      ))}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
