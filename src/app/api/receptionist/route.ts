// @polsia:user-owned — the Renor Guide. POST a question, get a grounded answer with its sources.
// GET reports which mode is active (live model or offline knowledge base), never the config.
import {
  askLimiter,
  createAskHandler,
  createStatusHandler,
  productionDeps,
} from '@/lib/business/receptionist/handlers';

const limiter = askLimiter();

export const POST = createAskHandler({ config: productionDeps.config, limiter });
export const GET = createStatusHandler(productionDeps);
