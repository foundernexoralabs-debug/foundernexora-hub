'use client';
// @polsia:user-owned — "I'm a…" chooser: sends each reader to the right place.
// Static routing from operator.ts AUDIENCE_ROUTES: no AI, no tracking, nothing stored.
// Keyboard: arrow keys move between readers (Radix Tabs); every destination is a real link.
// A link to /#for-investor (or -business, -developer, -press) opens with that reader chosen.
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AUDIENCE_ROUTES, type AudienceRoute } from '@/lib/business/operator';

const HASH_PREFIX = '#for-';

function isExternal(href: string) {
  return /^(https?:|mailto:)/.test(href);
}

function RouteLink({ link }: { link: AudienceRoute['links'][number] }) {
  const external = isExternal(link.href);
  const body = (
    <>
      <span className="min-w-0">
        <span className="block font-semibold text-foreground">{link.label}</span>
        <span className="block text-sm text-muted-foreground">{link.note}</span>
      </span>
      {external ? (
        <ArrowUpRight aria-hidden="true" className="op-route-arrow size-4 shrink-0" />
      ) : (
        <ArrowRight aria-hidden="true" className="op-route-arrow size-4 shrink-0" />
      )}
    </>
  );
  if (external) {
    const newTab = link.href.startsWith('http');
    return (
      <a
        href={link.href}
        className="op-route-link"
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {body}
        {newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
      </a>
    );
  }
  return (
    <Link href={link.href} className="op-route-link">
      {body}
    </Link>
  );
}

export function AudienceRouter() {
  const [value, setValue] = useState<AudienceRoute['id']>('business');

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.startsWith(HASH_PREFIX)
        ? window.location.hash.slice(HASH_PREFIX.length)
        : '';
      const match = AUDIENCE_ROUTES.find((route) => route.id === id);
      if (match) setValue(match.id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  return (
    <div className="op-router" id="for-you">
      <Tabs value={value} onValueChange={(next) => setValue(next as AudienceRoute['id'])}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p id="audience-label" className="shrink-0 text-sm font-semibold text-foreground">
            I’m a…
          </p>
          <TabsList aria-labelledby="audience-label" className="op-router-list">
            {AUDIENCE_ROUTES.map((route) => (
              <TabsTrigger key={route.id} value={route.id} className="op-router-tab">
                {route.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {AUDIENCE_ROUTES.map((route) => (
          <TabsContent key={route.id} value={route.id} className="op-router-panel">
            <p className="type-copy text-pretty text-muted-foreground">{route.pitch}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              {route.links.map((link) => (
                <li key={link.href}>
                  <RouteLink link={link} />
                </li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
