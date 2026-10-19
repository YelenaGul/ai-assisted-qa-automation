import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/** One-off config: DS specs with per-test UI login (no storageState / setup). */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/manual/**'],
  fullyParallel: true,
  retries: 0,
  reporter: 'line',
  use: {
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'chromium',
      testMatch: /ds\d-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
