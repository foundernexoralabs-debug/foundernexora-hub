// @polsia:user-owned — the Guide's question view: conversation, cited sources and composer.
'use client';

import { ArrowUp, ArrowUpRight, FileText, RotateCcw, Send } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, type KeyboardEvent, type RefObject, useEffect, useRef } from 'react';
import { GuideOrb } from '@/components/custom/receptionist/guide-orb';
import { MAX_MESSAGE_CHARS } from '@/lib/business/receptionist/guard';
import type { AnswerKind, Source } from '@/lib/contracts/receptionist';
import { cn } from '@/lib/utils';

export type GuideMessage =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      text: string;
      kind: AnswerKind;
      sources: Source[];
      degraded: boolean;
      /** The question this answers: offered to the team when the answer is unknown. */
      question: string;
    }
  | { id: string; role: 'notice'; text: string; retry?: string };

export const SUGGESTIONS = [
  'What is Renor?',
  'How much are the plans?',
  'What’s in the Plugin Store?',
  'How do I get started?',
  'What happens to my data?',
  'How do I contact the team?',
] as const;

const isExternal = (href: string) => /^https?:\/\//.test(href);

function SourceChip({ source, onNavigate }: { source: Source; onNavigate: () => void }) {
  const className =
    'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground transition-colors hover:border-brand-400 hover:text-link';
  if (isExternal(source.href)) {
    return (
      <a href={source.href} target="_blank" rel="noopener noreferrer" className={className}>
        {source.label}
        <ArrowUpRight aria-hidden="true" className="size-3.5" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={source.href} className={className} onClick={onNavigate}>
      <FileText aria-hidden="true" className="size-3.5 text-muted-foreground" />
      {source.label}
    </Link>
  );
}

function AssistantBubble({
  message,
  onPassToTeam,
  onNavigate,
}: {
  message: Extract<GuideMessage, { role: 'assistant' }>;
  onPassToTeam: (question: string) => void;
  onNavigate: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <GuideOrb className="mt-0.5 size-7" />
      <div className="min-w-0 flex-1">
        <p className="sr-only">Renor Guide:</p>
        <div
          className={cn(
            'rounded-2xl rounded-tl-md border px-4 py-3 text-[0.9375rem] leading-relaxed whitespace-pre-line',
            message.kind === 'unknown'
              ? 'border-dashed border-border bg-background'
              : 'border-border bg-muted/50',
          )}
        >
          {message.text}
        </div>
        {message.degraded ? (
          <p className="mt-2 text-sm text-muted-foreground">
            AI answers are unavailable right now, so this is the instant answer from the site.
          </p>
        ) : null}
        {message.sources.length > 0 ? (
          <div className="mt-2.5">
            <p className="sr-only">Sources:</p>
            <ul className="flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <li key={source.href}>
                  <SourceChip source={source} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {message.kind === 'unknown' ? (
          <button
            type="button"
            onClick={() => onPassToTeam(message.question)}
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
          >
            <Send aria-hidden="true" className="size-4" />
            Pass it to the team
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AskPanel({
  messages,
  pending,
  draft,
  onDraftChange,
  onSend,
  onPassToTeam,
  onNavigate,
  onClear,
  composerRef,
  live,
}: {
  messages: readonly GuideMessage[];
  pending: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (text: string) => void;
  onPassToTeam: (question: string) => void;
  onNavigate: () => void;
  onClear: () => void;
  composerRef: RefObject<HTMLTextAreaElement | null>;
  /** AI answers are on: the privacy note says where questions go. */
  live: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const remaining = MAX_MESSAGE_CHARS - draft.length;

  // Keep the newest message in view.
  const count = messages.length;
  useEffect(() => {
    if (count > 0 || pending) endRef.current?.scrollIntoView({ block: 'end' });
  }, [count, pending]);

  // Grow the composer with its content, up to about five lines.
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  });

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;
    onSend(text);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="rg-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center px-2 pt-4 pb-2 text-center">
            <GuideOrb className="size-16" detail="launcher" />
            <p className="mt-5 text-lg font-semibold tracking-tight">Hi, I’m the Renor Guide.</p>
            <p className="mt-2 max-w-[19rem] text-[0.9375rem] leading-relaxed text-muted-foreground">
              Ask about Renor, plans, the Plugin Store, getting started or privacy. I answer from
              this website and show you where.
            </p>
            <ul
              className="mt-6 flex flex-wrap justify-center gap-2"
              aria-label="Suggested questions"
            >
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => onSend(suggestion)}
                    disabled={pending}
                    className="min-h-10 rounded-full border border-border bg-background px-3.5 text-sm font-medium text-foreground transition-colors hover:border-brand-400 hover:bg-accent disabled:opacity-60"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div role="log" aria-live="polite" aria-relevant="additions" className="grid gap-5">
            {messages.map((message) => {
              if (message.role === 'user') {
                return (
                  <div key={message.id} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-brand-600 px-4 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-line text-white dark:bg-brand-500">
                      <span className="sr-only">You: </span>
                      {message.text}
                    </p>
                  </div>
                );
              }
              if (message.role === 'notice') {
                return (
                  <div
                    key={message.id}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
                  >
                    <p>{message.text}</p>
                    {message.retry ? (
                      <button
                        type="button"
                        onClick={() => message.retry && onSend(message.retry)}
                        disabled={pending}
                        className="mt-2 inline-flex min-h-9 items-center gap-1.5 font-semibold text-link underline-offset-4 hover:underline"
                      >
                        <RotateCcw aria-hidden="true" className="size-3.5" /> Try again
                      </button>
                    ) : null}
                  </div>
                );
              }
              return (
                <AssistantBubble
                  key={message.id}
                  message={message}
                  onPassToTeam={onPassToTeam}
                  onNavigate={onNavigate}
                />
              );
            })}
            {pending ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <GuideOrb className="size-7" thinking />
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span className="rg-dot" />
                  <span className="rg-dot" />
                  <span className="rg-dot" />
                </span>
                <span className="sr-only">The Renor Guide is answering…</span>
              </div>
            ) : null}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-border bg-card px-3 pt-3 pb-3 sm:px-4">
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-background p-1.5 pl-3.5 transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-ring/30">
          <label htmlFor="renor-guide-input" className="sr-only">
            Ask the Renor Guide a question
          </label>
          <textarea
            id="renor-guide-input"
            ref={composerRef}
            rows={1}
            value={draft}
            maxLength={MAX_MESSAGE_CHARS}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about Renor…"
            aria-describedby="renor-guide-hint"
            className="max-h-[8.25rem] min-h-10 flex-1 resize-none bg-transparent py-2 text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground sm:text-[0.9375rem]"
          />
          <button
            type="submit"
            disabled={!draft.trim() || pending}
            aria-label="Send question"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none dark:bg-brand-500 dark:hover:bg-brand-600 dark:disabled:bg-muted"
          >
            <ArrowUp aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div
          id="renor-guide-hint"
          className="mt-2 flex items-center justify-between gap-3 px-1 text-sm text-muted-foreground"
        >
          <span>
            {live
              ? 'AI answers from this site. Questions go to our AI provider with personal details removed.'
              : 'Answers come from this site’s pages. Please don’t share personal details.'}{' '}
            <Link
              href="/privacy#guide"
              onClick={onNavigate}
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy
            </Link>
          </span>
          {remaining <= 100 ? (
            <span
              aria-live="polite"
              className={cn('shrink-0 tabular-nums', remaining <= 20 && 'text-destructive')}
            >
              {remaining} left
            </span>
          ) : messages.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 rounded font-medium underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear chat
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
