// @polsia:user-owned — private triage for Renor Guide reports. Not linked from the site, never
// indexed, and a 404 until the server has a team access key, like its API: the data comes only
// from /api/reports/admin, which checks the key on every request.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReportsTriage } from '@/components/custom/receptionist/reports-triage';
import { readAdminToken } from '@/lib/business/receptionist/handlers';

export const metadata: Metadata = {
  title: 'Report triage',
  robots: { index: false, follow: false, nocache: true },
};

// Read the key per request, never at build time.
export const dynamic = 'force-dynamic';

export default function ReportsTriagePage() {
  if (!readAdminToken()) notFound();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReportsTriage />
    </main>
  );
}
