// @polsia:user-owned — the feedback bridge. POST a bug report, request or question; it is stored
// privately for the team (redacted, with a reference number), or handed back as an email when no
// private store is configured. Nothing is posted to GitHub or any public tracker.
import {
  createReportHandler,
  productionDeps,
  reportLimiter,
} from '@/lib/business/receptionist/handlers';

const limiter = reportLimiter();

export const POST = createReportHandler({
  store: productionDeps.store,
  handoff: productionDeps.handoff,
  limiter,
});
