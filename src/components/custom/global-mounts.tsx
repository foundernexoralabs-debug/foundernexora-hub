// @polsia:user-owned — the agent OWNS this file (edit freely).
// Writable home for root/global UI (Cmd+K palette, global keyboard listeners,
// app-wide overlays/dialogs), mounted once at the app root by layout.tsx.
// Put root mounts here, NOT in framework-owned layout.tsx.
// Mounted: the Ask Renor orb launcher, which loads the Renor Guide (receptionist + report
// bridge) on first use.

'use client';

import { OrbLauncher } from '@/components/custom/orb-launcher';

export function GlobalMounts() {
  return <OrbLauncher />;
}
