import { test as cleanup, expect } from './cleanup.fixture';
import { login } from '../tests/helpers/didaxis';

export const test = cleanup.extend({
  page: async ({ page }, use) => {
    if (process.env.DIDAXIS_LEGACY_UI_LOGIN === '1') {
      await login(page);
    }
    await use(page);
  },
});

export { expect };
