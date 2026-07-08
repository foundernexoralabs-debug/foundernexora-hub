// @polsia:shared — edit only through declared slots. Code installed by polsia/template-next@0.3.0.
//
// Typed env via @t3-oss/env-nextjs.
//
// Modules contribute env vars via their manifest `contributions` block.
// The installer regenerates this file's slots between the markers below.
// Hand-editing outside those slots is rejected by the ownership validator.
//
// The `no-secrets-in-client-bundle` validator scans the build output and rejects
// the install if any non-NEXT_PUBLIC_ env name appears in client chunks.

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // @polsia:slot env_vars_server start
    // Modules append additional server-side env vars here at install time.
    // @polsia:slot env_vars_server end
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    // Base for @/lib/api-client + proxy.ts connect-src. Default-empty
    // (unset) means same-origin `/api`; set only for an external API origin.
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    // FounderLab AI live app URL — set in Vercel env to the real deployment URL
    NEXT_PUBLIC_FOUNDERLAB_URL: z.string().url().default('https://founderlab-ai0-1.vercel.app'),
    // Desktop app GitHub Releases download page
    NEXT_PUBLIC_DESKTOP_RELEASE_URL: z.string().url().default('https://github.com/foundernexoralabs-debug/founderlab-desktop/releases/latest'),
    // @polsia:slot env_vars_client start
    // Modules append NEXT_PUBLIC_* env vars here at install time.
    // @polsia:slot env_vars_client end
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FOUNDERLAB_URL: process.env.NEXT_PUBLIC_FOUNDERLAB_URL,
    NEXT_PUBLIC_DESKTOP_RELEASE_URL: process.env.NEXT_PUBLIC_DESKTOP_RELEASE_URL,
    // @polsia:slot env_runtime start
    // Modules append runtime-env entries here at install time.
    // @polsia:slot env_runtime end
  },
  emptyStringAsUndefined: true,
  // SKIP_ENV_VALIDATION=1 bypasses validation for envless builds (lint/CI/local).
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
