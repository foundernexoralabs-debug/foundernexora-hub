// @polsia:user-owned — a quiet, accessible FAQ list built on native <details>: works without
// JavaScript, opens with Enter or Space, and each answer stays in the page for search and find-in-page.
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

export interface FaqItem {
  q: string;
  a: ReactNode;
}

export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {items.map((item) => (
        <details key={item.q} className="group px-5 sm:px-7">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
            />
          </summary>
          <p className="pb-6 type-copy text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
