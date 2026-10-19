import { expect, type Page, test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { didaxisBaseUrl } from './helpers/didaxis-env';
import {
  DIDAXIS_USER_IDS,
  authStoragePath,
  getDidaxisUserCredentials,
  isDidaxisUserConfigured,
  type DidaxisUserId,
} from './helpers/didaxis-users';

const authDir = path.join(__dirname, '..', 'playwright', '.auth');

async function authenticateUser(page: Page, id: DidaxisUserId) {
  const { email, password } = getDidaxisUserCredentials(id);

  await page.goto(`${didaxisBaseUrl()}/login`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);

  fs.mkdirSync(authDir, { recursive: true });
  const authFile = path.join(__dirname, '..', authStoragePath(id));
  await page.context().storageState({ path: authFile });
}

for (const id of DIDAXIS_USER_IDS) {
  setup(`authenticate ${id}`, async ({ page }) => {
    setup.skip(
      !isDidaxisUserConfigured(id),
      'Didaxis user credentials not set in .env',
    );
    await authenticateUser(page, id);
  });
}
