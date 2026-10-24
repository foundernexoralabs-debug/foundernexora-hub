// @polsia:user-owned — private triage API for the team. Requires REPORTS_ADMIN_TOKEN as a bearer
// token; responds 404 when no token is configured. Used by /admin/reports.
import {
  adminLimiter,
  createAdminHandlers,
  productionDeps,
} from '@/lib/business/receptionist/handlers';

const handlers = createAdminHandlers({
  adminToken: productionDeps.adminToken,
  store: productionDeps.store,
  limiter: adminLimiter(),
});

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
