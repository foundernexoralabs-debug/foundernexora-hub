// @vitest-environment node
// node not jsdom — keep config loading behavior representative of the build.
import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => vi.resetModules());

test('public hub config does not require DATABASE_URL', async () => {
  const prevDb = process.env.DATABASE_URL;
  const prevSkip = process.env.SKIP_ENV_VALIDATION;
  delete process.env.DATABASE_URL;
  delete process.env.SKIP_ENV_VALIDATION;
  vi.resetModules();
  try {
    await expect(import('../../next.config')).resolves.toBeDefined();
  } finally {
    if (prevDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevDb;
    if (prevSkip === undefined) delete process.env.SKIP_ENV_VALIDATION;
    else process.env.SKIP_ENV_VALIDATION = prevSkip;
  }
});

test('SKIP_ENV_VALIDATION bypasses validation', async () => {
  const prevDb = process.env.DATABASE_URL;
  const prevSkip = process.env.SKIP_ENV_VALIDATION;
  delete process.env.DATABASE_URL;
  process.env.SKIP_ENV_VALIDATION = '1';
  vi.resetModules();
  try {
    await expect(import('../../next.config')).resolves.toBeDefined();
  } finally {
    if (prevDb === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevDb;
    if (prevSkip === undefined) delete process.env.SKIP_ENV_VALIDATION;
    else process.env.SKIP_ENV_VALIDATION = prevSkip;
  }
});
