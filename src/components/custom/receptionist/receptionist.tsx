// @polsia:user-owned — the Renor Guide: a 24/7 receptionist on every page of the website.
//
// The orb launcher (src/components/custom/orb-launcher.tsx) opens this panel, loading it on
// first use. The panel has two views: "Ask", grounded answers from the site
// with the page each comes from, and "Report a problem", which files a bug, request or question
// for the team and returns a reference number. Mounted once in global-mounts.tsx.
//
// Accessibility: a labelled modal dialog; focus is kept inside it; Escape closes and returns
// focus to the orb; tabs follow the ARIA tabs pattern (arrow keys); answers are announced
// through a polite live region. At 480px and below the panel is a bottom sheet and the page
// does not scroll behind it. Every animation stops under prefers-reduced-motion.
//
// The panel reports what the visitor is doing (typing, waiting for an answer, a failure) so
// the orb can show it. Deep links and the open event live in the launcher.
'use client';

import { Flag, MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { AskPanel, type GuideMessage } from '@/components/custom/receptionist/ask-panel';
import { GuideOrb } from '@/components/custom/receptionist/guide-orb';
import {
  type ReportDraft,
  ReportPanel,
  validateDraft,
} from '@/components/custom/receptionist/report-panel';
import { apiFetch } from '@/lib/api-client';
import { type OrbSignals, type PanelPhase, panelExpanded } from '@/lib/business/orb-launcher';
import {
  AskResponse,
  GuideStatus,
  ReportResponse,
  type ReportType,
} from '@/lib/contracts/receptionist';
import { cn } from '@/lib/utils';

type Tab = 'ask' | 'report';

const STORAGE_KEY = 'renor-guide:v1';

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/** The error body a failed apiFetch carries in `cause`. */
function errorBody(error: unknown): { error?: string; errors?: Record<string, string> } | null {
  const cause = error instanceof Error ? error.cause : null;
  return cause && typeof cause === 'object'
    ? (cause as { error?: string; errors?: Record<string, string> })
    : null;
}

/** "Chrome on Android": enough to reproduce a bug, not enough to identify anyone. */
function browserSummary(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Other browser';
  const os = /Android/.test(ua)
    ? 'Android'
    : /iPhone|iPad|iPod/.test(ua)
      ? 'iOS'
      : /Mac OS X/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'other OS';
  return `${browser} on ${os}`;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ReceptionistProps {
  /** The panel's lifecycle, owned by the launcher. */
  phase: PanelPhase;
  /** False once the close transition has finished: the panel leaves the page. */
  mounted: boolean;
  /** The tab to show; `n` changes on every open request, so the same tab can be asked again. */
  request: { tab: Tab; n: number };
  onClose: () => void;
  /** What the orb should show while the panel is in use. */
  onActivity: (activity: Pick<OrbSignals, 'typing' | 'answering'>) => void;
  /** A question or report just failed: the orb flashes. */
  onError: () => void;
  /** Where focus returns on close: the orb. */
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export function Receptionist({
  phase,
  mounted,
  request,
  onClose,
  onActivity,
  onError,
  returnFocusRef,
}: ReceptionistProps) {
  const pathname = usePathname() || '/';
  const titleId = useId();
  const open = panelExpanded(phase);
  const [tab, setTab] = useState<Tab>(request.tab);
  const [status, setStatus] = useState<GuideStatus | null>(null);

  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);

  const emptyReport = useCallback(
    (type: ReportType = 'bug', description = ''): ReportDraft => ({
      type,
      description,
      page: pathname,
      email: '',
      contactMe: false,
      shareDescription: false,
    }),
    [pathname],
  );
  const [report, setReport] = useState<ReportDraft>(() => emptyReport());
  const [reportErrors, setReportErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReportResponse | null>(null);
  const clientId = useRef(newId());

  const panelRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const firstReportFieldRef = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(false);

  // Restore this tab's conversation (sessionStorage: it never leaves the browser).
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved) as GuideMessage[]);
    } catch {
      // Storage blocked or corrupt: start fresh.
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // Private mode or storage full: the conversation simply is not kept.
    }
  }, [messages]);

  // Keep the report's page in step with navigation until the visitor edits it.
  const lastPath = useRef(pathname);
  useEffect(() => {
    setReport((current) =>
      current.page === lastPath.current ? { ...current, page: pathname } : current,
    );
    lastPath.current = pathname;
  }, [pathname]);

  const close = onClose;

  // Each open request (the orb, a deep link or the open event) chooses the tab.
  useEffect(() => {
    if (request.n > 0) setTab(request.tab);
  }, [request]);

  // Tell the orb what is happening: typing (text in the focused composer) and answering.
  const [composerFocused, setComposerFocused] = useState(false);
  const typing = open && composerFocused && draft.trim().length > 0;
  const answering = open && (pending || submitting);
  useEffect(() => {
    onActivity({ typing, answering });
  }, [typing, answering, onActivity]);

  // Which modes are live: fetched once, the first time the panel opens.
  useEffect(() => {
    if (!open || status) return;
    let cancelled = false;
    apiFetch('/api/receptionist', { schema: GuideStatus })
      .then((next) => {
        if (!cancelled) setStatus(next);
      })
      .catch(() => {
        // Status is informational; the panel works without it.
      });
    return () => {
      cancelled = true;
    };
  }, [open, status]);

  // Focus: into the panel when it opens, back to the launcher when it closes. Switching tabs
  // leaves focus on the tab (ARIA tabs pattern), except "Pass it to the team", which moves
  // straight to the prefilled description.
  const focusAfterTabChange = useRef<string | null>(null);
  useEffect(() => {
    if (open && !wasOpen.current) {
      const target =
        tab === 'ask'
          ? composerRef.current
          : (panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ??
            firstReportFieldRef.current);
      target?.focus({ preventScroll: true });
      wasOpen.current = true;
    } else if (!open && wasOpen.current) {
      returnFocusRef.current?.focus();
      wasOpen.current = false;
    }
  }, [open, tab, returnFocusRef]);
  useEffect(() => {
    if (tab !== 'report' || !focusAfterTabChange.current) return;
    panelRef.current?.querySelector<HTMLElement>(focusAfterTabChange.current)?.focus();
    focusAfterTabChange.current = null;
  }, [tab]);

  // 480px and below: the panel is a bottom sheet.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 480px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  // Bottom sheet on phones: the page behind it must not scroll.
  useEffect(() => {
    if (!open || !compact) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [open, compact]);

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      return;
    }
    // A modal dialog: keep Tab inside the panel.
    if (event.key !== 'Tab') return;
    const nodes = [...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
      (node) => node.offsetParent !== null,
    );
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const send = async (text: string) => {
    if (pending) return;
    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-12)
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.text,
      }));
    // A retried question replaces its failure notice instead of stacking a duplicate.
    setMessages((current) => [
      ...current.filter((message) => !(message.role === 'notice' && message.retry === text)),
      { id: newId(), role: 'user', text },
    ]);
    setDraft('');
    setPending(true);
    try {
      const answer = await apiFetch('/api/receptionist', {
        method: 'POST',
        body: JSON.stringify({ message: text, history, page: pathname }),
        schema: AskResponse,
      });
      setMessages((current) => [
        ...current,
        {
          id: newId(),
          role: 'assistant',
          text: answer.reply,
          kind: answer.kind,
          sources: answer.sources,
          degraded: answer.degraded === true,
          question: text,
        },
      ]);
    } catch (error) {
      const body = errorBody(error);
      onError();
      setMessages((current) => [
        ...current,
        {
          id: newId(),
          role: 'notice',
          text: body?.error ?? 'I couldn’t reach the server. Check your connection and try again.',
          retry: text,
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const passToTeam = (question: string) => {
    setResult(null);
    setReportErrors({});
    setReport(emptyReport('question', question));
    focusAfterTabChange.current = 'textarea';
    setTab('report');
  };

  const submitReport = async (honeypot: string) => {
    if (submitting) return;
    const page = report.page.trim().startsWith('/') ? report.page.trim() : `/${report.page.trim()}`;
    const checked = { ...report, page };
    const errors = validateDraft(checked);
    setReportErrors(errors);
    if (Object.keys(errors).length > 0) {
      const field = Object.keys(errors)[0];
      panelRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const response = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          clientId: clientId.current,
          type: checked.type,
          description: checked.description,
          page: checked.page,
          contactMe: checked.contactMe,
          email: checked.contactMe ? checked.email : '',
          shareDescription: checked.shareDescription,
          website: honeypot || undefined,
          context: {
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            browser: browserSummary(),
          },
        }),
        schema: ReportResponse,
      });
      setResult(response);
      clientId.current = newId();
    } catch (error) {
      const body = errorBody(error);
      onError();
      setReportErrors(
        body?.errors && Object.keys(body.errors).length > 0
          ? body.errors
          : { form: body?.error ?? 'We couldn’t send that. Check your connection and try again.' },
      );
    } finally {
      setSubmitting(false);
    }
  };

  // After a report is sent, move focus to its confirmation heading.
  useEffect(() => {
    if (result) panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
  }, [result]);

  const resetReport = () => {
    setResult(null);
    setReportErrors({});
    setReport(emptyReport());
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next: Tab =
      event.key === 'Home'
        ? 'ask'
        : event.key === 'End'
          ? 'report'
          : tab === 'ask'
            ? 'report'
            : 'ask';
    setTab(next);
    panelRef.current?.querySelector<HTMLElement>(`[data-tab="${next}"]`)?.focus();
  };

  // On phones, following a source link closes the full-screen panel so the page is visible.
  const onNavigate = () => {
    if (compact) close();
  };

  const statusLine =
    status?.mode === 'live'
      ? 'AI answers, from this site’s pages'
      : status?.mode === 'offline'
        ? 'Instant answers from this site'
        : 'Answers from this site';

  if (!mounted) return null;

  return (
    <>
      {compact ? (
        <div
          aria-hidden="true"
          data-phase={phase}
          onClick={close}
          className="ol-scrim fixed inset-0 z-[55] bg-surface-0/70 backdrop-blur-[2px]"
        />
      ) : null}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-phase={phase}
        onKeyDown={onPanelKeyDown}
        onFocusCapture={(event) =>
          setComposerFocused((event.target as Node) === composerRef.current)
        }
        onBlurCapture={(event) => {
          if ((event.target as Node) === composerRef.current) setComposerFocused(false);
        }}
        className="ol-panel fixed inset-x-0 bottom-0 z-[60] flex h-[min(88dvh,44rem)] flex-col overflow-hidden rounded-t-panel border border-b-0 border-border bg-card text-card-foreground shadow-2xl min-[481px]:inset-x-auto min-[481px]:right-4 min-[481px]:bottom-[5.5rem] min-[481px]:h-[min(40rem,calc(100dvh-7.5rem))] min-[481px]:w-[min(26rem,calc(100vw-2rem))] min-[481px]:rounded-panel min-[481px]:border-b sm:right-6 sm:bottom-24"
      >
        <div className="relative border-b border-border bg-card px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4">
          {/* Grab handle: shows the sheet can be dismissed (tap outside, Escape or Close). */}
          <span
            aria-hidden="true"
            className="mx-auto -mt-1 mb-3 block h-1 w-10 rounded-full bg-line-strong min-[481px]:hidden"
          />
          <div className="relative flex items-center gap-3">
            <GuideOrb className="size-9" thinking={pending || submitting} />
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-base leading-tight font-semibold tracking-tight">
                Renor Guide
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-live" />
                {statusLine} · 24/7
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close the Renor Guide"
              className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div
            role="tablist"
            aria-label="Renor Guide"
            className="relative mt-3.5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
          >
            {(
              [
                { id: 'ask', label: 'Ask', icon: MessageCircle },
                { id: 'report', label: 'Report a problem', icon: Flag },
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  data-tab={item.id}
                  id={`${titleId}-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`${titleId}-panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(item.id)}
                  onKeyDown={onTabKeyDown}
                  className={cn(
                    'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors',
                    selected
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${titleId}-panel-${tab}`}
          aria-labelledby={`${titleId}-tab-${tab}`}
          className="relative flex min-h-0 flex-1 flex-col"
        >
          {tab === 'ask' ? (
            <AskPanel
              messages={messages}
              pending={pending}
              draft={draft}
              onDraftChange={setDraft}
              onSend={send}
              onPassToTeam={passToTeam}
              onNavigate={onNavigate}
              onClear={() => setMessages([])}
              composerRef={composerRef}
              live={status?.mode === 'live'}
            />
          ) : (
            <ReportPanel
              draft={report}
              onDraftChange={setReport}
              inboxConnected={status ? status.reports === 'stored' : null}
              submitting={submitting}
              errors={reportErrors}
              result={result}
              onSubmit={submitReport}
              onReset={resetReport}
              onBackToAsk={() => setTab('ask')}
              firstFieldRef={firstReportFieldRef}
            />
          )}
        </div>
      </div>
    </>
  );
}
