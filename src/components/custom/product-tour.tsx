'use client';
// @polsia:user-owned — the Renor product tour: five real screens of one invented example
// (Larkspur Cycles), one tab each. Arrow keys move between tabs (Radix Tabs).
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TOUR, TOUR_CAPTION } from '@/lib/business/launch';
import { ThemedShot } from './launch';

export function ProductTour() {
  return (
    <Tabs defaultValue={TOUR[0]?.id} className="mt-12">
      <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none]">
        <TabsList
          aria-label="Renor screens"
          className="h-auto w-max gap-1 rounded-full border border-border bg-card p-1.5 shadow-xs"
        >
          {TOUR.map((shot, index) => (
            <TabsTrigger
              key={shot.id}
              value={shot.id}
              className="min-h-10 rounded-full px-4 text-[0.9375rem] font-semibold text-muted-foreground data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-brand-500"
            >
              <span aria-hidden="true" className="mr-2 text-xs tabular-nums opacity-70">
                {String(index + 1).padStart(2, '0')}
              </span>
              {shot.tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {TOUR.map((shot, index) => (
        <TabsContent
          key={shot.id}
          value={shot.id}
          className="mt-8 rounded-3xl focus-visible:ring-offset-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end md:gap-10">
            <div>
              <p className="text-sm font-semibold text-link">
                Screen {index + 1} of {TOUR.length}
              </p>
              <h3 className="mt-2 font-display text-[1.75rem] leading-tight font-semibold tracking-tight text-balance">
                {shot.title}
              </h3>
            </div>
            <p className="type-copy text-muted-foreground md:pb-1">{shot.text}</p>
          </div>
          <ThemedShot shot={shot} caption={TOUR_CAPTION} preload={index === 0} className="mt-8" />
        </TabsContent>
      ))}
    </Tabs>
  );
}
