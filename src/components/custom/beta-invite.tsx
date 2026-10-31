'use client';
// @polsia:user-owned — "Join the private beta". This site has no form backend (no database
// model, no email service), so the form writes an email the visitor sends from their own
// mail app, addressed to the one public address. Nothing is stored or sent by this page.
import { Check, Copy, Mail } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BETA_EMAIL, BETA_ROLES, betaMailto } from '@/lib/business/launch';

const fieldClass =
  'mt-2 block w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground shadow-xs transition-colors placeholder:text-ink-3 hover:border-foreground/30 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

export function BetaInvite() {
  const id = useId();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [building, setBuilding] = useState('');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const href = betaMailto({ name, role, building });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(
      `Your email app should now open with the request filled in. Press send there. Nothing opened? Write to ${BETA_EMAIL}.`,
    );
    window.location.href = href;
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(BETA_EMAIL);
      setCopied(true);
      setStatus(`Copied ${BETA_EMAIL}.`);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setStatus(`Copy did not work here. The address is ${BETA_EMAIL}.`);
    }
  }

  return (
    <form
      onSubmit={submit}
      aria-describedby={`${id}-how`}
      className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-brand-900/5 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="text-sm font-semibold">
            Your name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            className={fieldClass}
            placeholder="First name is fine"
          />
        </div>
        <div>
          <label htmlFor={`${id}-role`} className="text-sm font-semibold">
            You are a…
          </label>
          <select
            id={`${id}-role`}
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10 [background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]`}
          >
            <option value="">Choose one (optional)</option>
            {BETA_ROLES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-5">
        <label htmlFor={`${id}-building`} className="text-sm font-semibold">
          What would you like to build or do with Renor?
        </label>
        <textarea
          id={`${id}-building`}
          name="building"
          rows={4}
          value={building}
          onChange={(event) => setBuilding(event.target.value)}
          maxLength={600}
          className={`${fieldClass} resize-y`}
          placeholder="For example: a booking page for my studio, or a tool to track client jobs."
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" size="xl">
          <Mail aria-hidden="true" className="size-4" />
          Write my request
        </Button>
        <Button type="button" variant="outline" size="xl" onClick={copyAddress}>
          {copied ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Copy aria-hidden="true" className="size-4" />
          )}
          {copied ? 'Copied' : 'Copy the address'}
        </Button>
      </div>
      <p id={`${id}-how`} className="mt-5 type-meta text-muted-foreground">
        This opens an email to{' '}
        <a href={href} className="font-semibold text-link underline-offset-4 hover:underline">
          {BETA_EMAIL}
        </a>{' '}
        in your own mail app, with your answers filled in. Nothing is sent or stored until you press
        send there.
      </p>
      <p aria-live="polite" className="mt-3 min-h-6 text-sm font-medium text-foreground">
        {status}
      </p>
    </form>
  );
}
