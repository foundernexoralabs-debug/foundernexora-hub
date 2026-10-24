// @polsia:user-owned — private triage for Renor Guide reports. Not linked from the site, never
// indexed, and useless without the server's REPORTS_ADMIN_TOKEN: the data comes only from
// /api/reports/admin, which checks the token on every request.
import type { Metadata } from 'next';
import { ReportsTriage } from '@/components/custom/receptionist/reports-triage';

export const metadata: Metadata = {
  title: 'Report triage',
  robots: { index: false, follow: false, nocache: true },
};

export default function ReportsTriagePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <ReportsTriage />
    </main>
  );
}
