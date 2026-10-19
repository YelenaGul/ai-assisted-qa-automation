import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import {
  authStoragePath,
  listConfiguredDidaxisUsers,
} from './tests/helpers/didaxis-users';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const userId = listConfiguredDidaxisUsers()[0];
if (!userId) {
  throw new Error('No Didaxis user configured for benchmark.');
}

/** One-off config: DS specs with storageState (single user). */
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
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium-user-1',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authStoragePath(userId),
      },
      dependencies: ['setup'],
      testMatch: /ds\d-.*\.spec\.ts/,
      testIgnore: /.*\.setup\.ts/,
    },
  ],
});
