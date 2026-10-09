import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/** Config for `tests/manual/*` only — not used by `npm test`. */
export default defineConfig({
  testDir: './tests/manual',
  timeout: 600_000,
  workers: 1,
  reporter: [['list']],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
