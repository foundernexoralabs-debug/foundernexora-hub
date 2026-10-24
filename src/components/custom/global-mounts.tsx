// @polsia:user-owned — the agent OWNS this file (edit freely).
// Writable home for root/global UI (Cmd+K palette, global keyboard listeners,
// app-wide overlays/dialogs), mounted once at the app root by layout.tsx.
// Put root mounts here, NOT in framework-owned layout.tsx.
// Mounted: the Renor Guide (receptionist + report bridge) on every page.

'use client';

import { Receptionist } from '@/components/custom/receptionist/receptionist';

export function GlobalMounts() {
  return <Receptionist />;
}
