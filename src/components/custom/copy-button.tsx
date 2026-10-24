'use client';
// @polsia:user-owned — copies a piece of text and says so, for the launch kit's descriptions.
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 2400);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copy}
        className="h-9 rounded-full px-4"
      >
        {state === 'copied' ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
        {state === 'copied' ? 'Copied' : 'Copy'}
        <span className="sr-only"> {label}</span>
      </Button>
      <span aria-live="polite" className="sr-only">
        {state === 'copied'
          ? `${label} copied`
          : state === 'failed'
            ? 'Copy did not work here; select the text instead.'
            : ''}
      </span>
    </>
  );
}
