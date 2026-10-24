// The triage page must not exist (404) until the team's access key is configured, the same as
// its API: with no key there is nothing to find, not even a login form naming a setting.
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
vi.mock('@/components/custom/receptionist/reports-triage', () => ({ ReportsTriage: () => null }));

const KEY = 'REPORTS_ADMIN_TOKEN';
const saved = process.env[KEY];
afterEach(() => {
  if (saved === undefined) delete process.env[KEY];
  else process.env[KEY] = saved;
});

describe('/admin/reports page', () => {
  it('is a 404 when no access key is configured', async () => {
    delete process.env[KEY];
    const { default: Page } = await import('@/app/(dashboard)/admin/reports/page');
    expect(() => Page()).toThrow('NEXT_NOT_FOUND');
  });

  it('is a 404 when the configured key is too short to be safe', async () => {
    process.env[KEY] = 'short';
    const { default: Page } = await import('@/app/(dashboard)/admin/reports/page');
    expect(() => Page()).toThrow('NEXT_NOT_FOUND');
  });

  it('renders the triage sign-in once a proper key is configured', async () => {
    process.env[KEY] = 'k'.repeat(32);
    const { default: Page } = await import('@/app/(dashboard)/admin/reports/page');
    expect(() => Page()).not.toThrow();
  });
});
