// @polsia:user-owned — the Guide's "Report a problem" view: a short form that becomes tracked
// work for the team, and a confirmation with the visitor's reference number.
'use client';

import {
  Bug,
  Check,
  CircleHelp,
  Copy,
  Lightbulb,
  Loader2,
  type LucideIcon,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { type FormEvent, type RefObject, useId, useState } from 'react';
import {
  REPORT_MAX_CHARS,
  ReportRequest,
  type ReportResponse,
  type ReportType,
} from '@/lib/contracts/receptionist';
import { cn } from '@/lib/utils';

export interface ReportDraft {
  type: ReportType;
  description: string;
  page: string;
  contactMe: boolean;
  shareDescription: boolean;
  email: string;
}

const TYPES: readonly { id: ReportType; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'bug', label: 'Something’s broken', hint: 'Bug', icon: Bug },
  { id: 'request', label: 'An idea or request', hint: 'Request', icon: Lightbulb },
  { id: 'question', label: 'A question', hint: 'Question', icon: CircleHelp },
];

const PROMPTS: Record<ReportType, { label: string; placeholder: string }> = {
  bug: {
    label: 'What happened?',
    placeholder:
      'What did you do, what did you expect, and what happened instead? Steps on separate lines help.',
  },
  request: {
    label: 'What would you like?',
    placeholder: 'Describe the idea, and the problem it would solve for you.',
  },
  question: {
    label: 'What’s your question?',
    placeholder: 'Ask anything this website doesn’t answer yet.',
  },
};

const fieldClass =
  'w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-400 focus:ring-2 focus:ring-ring/30 aria-[invalid=true]:border-destructive sm:text-[0.9375rem]';

export function ReportPanel({
  draft,
  onDraftChange,
  inboxConnected,
  submitting,
  errors,
  result,
  onSubmit,
  onReset,
  onBackToAsk,
  firstFieldRef,
}: {
  draft: ReportDraft;
  onDraftChange: (draft: ReportDraft) => void;
  /** null while the status is loading. */
  inboxConnected: boolean | null;
  submitting: boolean;
  errors: Record<string, string>;
  result: ReportResponse | null;
  /** Receives the honeypot's value (empty for people). */
  onSubmit: (honeypot: string) => void;
  onReset: () => void;
  onBackToAsk: () => void;
  firstFieldRef: RefObject<HTMLInputElement | null>;
}) {
  const id = useId();
  const [copied, setCopied] = useState(false);

  if (result) {
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(result.reference);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    };
    return (
      <div className="rg-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-link ring-1 ring-brand-200 dark:bg-brand-500/15 dark:ring-brand-500/30">
            {result.status === 'email' ? (
              <Mail aria-hidden="true" className="size-6" />
            ) : (
              <Check aria-hidden="true" className="size-6" />
            )}
          </span>
          <h3 className="mt-4 text-lg font-semibold tracking-tight" tabIndex={-1} data-autofocus>
            {result.status === 'email' ? 'One step left' : 'Thanks, it’s with the team'}
          </h3>
          <output className="mt-2 block text-[0.9375rem] leading-relaxed text-muted-foreground">
            {result.message}
          </output>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Your reference
          </p>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="font-mono text-xl font-semibold tracking-wide tabular-nums">
              {result.reference}
            </p>
            <button
              type="button"
              onClick={copy}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
              <span className="sr-only"> reference number</span>
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            {copied ? 'Reference number copied' : ''}
          </p>
        </div>

        <div className="mt-6 grid gap-2.5">
          {result.mailto ? (
            <a
              href={result.mailto}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-[0.9375rem] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              <Mail aria-hidden="true" className="size-4" /> Open email to send
            </a>
          ) : null}
          <button
            type="button"
            onClick={onBackToAsk}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-[0.9375rem] font-semibold transition-colors hover:bg-accent"
          >
            <MessageCircle aria-hidden="true" className="size-4" /> Back to questions
          </button>
          <button
            type="button"
            onClick={onReset}
            className="min-h-10 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Report something else
          </button>
        </div>
      </div>
    );
  }

  const prompt = PROMPTS[draft.type];
  const set = (patch: Partial<ReportDraft>) => onDraftChange({ ...draft, ...patch });
  const remaining = REPORT_MAX_CHARS - draft.description.length;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const honeypot = event.currentTarget.elements.namedItem('website');
    onSubmit(honeypot instanceof HTMLInputElement ? honeypot.value : '');
  };

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="rg-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Tell the team what went wrong or what you need. You get a reference number straight away.
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What is it?</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {TYPES.map((type, index) => {
              const Icon = type.icon;
              const checked = draft.type === type.id;
              return (
                <label
                  key={type.id}
                  className={cn(
                    'relative flex min-h-[4.75rem] cursor-pointer flex-col items-start justify-between gap-2 rounded-xl border p-3 text-left transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                    checked
                      ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/15'
                      : 'border-border bg-background hover:border-foreground/30',
                  )}
                >
                  <input
                    ref={index === 0 ? firstFieldRef : undefined}
                    type="radio"
                    name={`${id}-type`}
                    value={type.id}
                    checked={checked}
                    onChange={() => set({ type: type.id })}
                    className="sr-only"
                  />
                  <Icon
                    aria-hidden="true"
                    className={cn('size-4', checked ? 'text-link' : 'text-muted-foreground')}
                  />
                  <span className="text-[0.8125rem] leading-tight font-semibold">{type.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor={`${id}-description`} className="text-sm font-semibold">
            {prompt.label}
          </label>
          <textarea
            id={`${id}-description`}
            name="description"
            value={draft.description}
            onChange={(event) => set({ description: event.target.value })}
            placeholder={prompt.placeholder}
            rows={5}
            maxLength={REPORT_MAX_CHARS}
            aria-invalid={!!errors.description}
            aria-describedby={`${id}-description-note`}
            className={cn(fieldClass, 'mt-2 min-h-32 resize-y leading-6')}
          />
          <p
            id={`${id}-description-note`}
            className={cn(
              'mt-1.5 flex justify-between gap-3 text-xs',
              errors.description ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <span>
              {errors.description ??
                'Please leave out passwords, card details and anything private.'}
            </span>
            {remaining <= 200 ? <span className="tabular-nums">{remaining} left</span> : null}
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor={`${id}-page`} className="text-sm font-semibold">
            Page
          </label>
          <input
            id={`${id}-page`}
            name="page"
            value={draft.page}
            onChange={(event) => set({ page: event.target.value })}
            aria-invalid={!!errors.page}
            aria-describedby={`${id}-page-note`}
            autoComplete="off"
            spellCheck={false}
            className={cn(fieldClass, 'mt-2 font-mono text-sm sm:text-sm')}
          />
          <p
            id={`${id}-page-note`}
            className={cn(
              'mt-1.5 text-xs',
              errors.page ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {errors.page ?? 'Filled in for you.'}
          </p>
        </div>

        <div className="mt-4 grid gap-1 rounded-xl border border-border bg-background p-1.5">
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5 hover:bg-accent/60">
            <input
              type="checkbox"
              checked={draft.contactMe}
              onChange={(event) => set({ contactMe: event.target.checked })}
              className="mt-0.5 size-4 shrink-0 accent-[var(--brand-600)]"
            />
            <span className="text-sm leading-snug">
              <span className="font-semibold">Email me about this</span>
              <span className="block text-xs text-muted-foreground">
                We keep your email only if you tick this, and only to reply.
              </span>
            </span>
          </label>
          {draft.contactMe ? (
            <div className="px-2.5 pb-2.5">
              <label htmlFor={`${id}-email`} className="sr-only">
                Your email address
              </label>
              <input
                id={`${id}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) => set({ email: event.target.value })}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${id}-email-note` : undefined}
                placeholder="Your email address"
                className={fieldClass}
              />
              {errors.email ? (
                <p id={`${id}-email-note`} className="mt-1.5 text-xs text-destructive">
                  {errors.email}
                </p>
              ) : null}
            </div>
          ) : null}
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5 hover:bg-accent/60">
            <input
              type="checkbox"
              checked={draft.shareDescription}
              onChange={(event) => set({ shareDescription: event.target.checked })}
              className="mt-0.5 size-4 shrink-0 accent-[var(--brand-600)]"
            />
            <span className="text-sm leading-snug">
              <span className="font-semibold">The Renor team may read my description</span>
              <span className="block text-xs text-muted-foreground">
                Leave unticked and we only keep the type of problem and the page.
              </span>
            </span>
          </label>
        </div>

        {/* Honeypot: invisible to people and assistive technology; scripts fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${id}-website`}>Leave this empty</label>
          <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {errors.form ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
          >
            {errors.form}
          </p>
        ) : null}
      </div>

      <div className="border-t border-border bg-card px-5 py-3.5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-[0.9375rem] font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-70 dark:bg-brand-500 dark:hover:bg-brand-600"
        >
          {submitting ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
          {submitting ? 'Sending…' : 'Send report'}
        </button>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
          {inboxConnected === false
            ? 'Our private report inbox isn’t switched on yet: sending opens your email app with it filled in.'
            : 'Stored privately for the FounderLab team, never posted publicly. Emails, phone numbers and card numbers are removed from your text first.'}
        </p>
      </div>
    </form>
  );
}

/** Client-side check with the server's own schema, so errors read the same either way. */
export function validateDraft(draft: ReportDraft): Record<string, string> {
  const parsed = ReportRequest.safeParse({
    clientId: '00000000-0000-4000-8000-000000000000',
    type: draft.type,
    description: draft.description,
    page: draft.page || '/',
    email: draft.contactMe ? draft.email : '',
    contactMe: draft.contactMe,
    shareDescription: draft.shareDescription,
  });
  if (parsed.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    errors[key] ??= issue.message;
  }
  return errors;
}
