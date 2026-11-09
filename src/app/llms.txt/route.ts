// @polsia:user-owned — /llms.txt for AI assistants and answer engines (llmstxt.org format).
// The text is built in src/lib/business/llms.ts from the same sources as the site.
import { llmsText } from '@/lib/business/llms';

export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsText(), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
