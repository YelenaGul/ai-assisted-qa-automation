import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures/didaxis.fixture';
import {
  uniqueProgramName,
  createProgram,
  gotoPrograms,
  expectProgramListed,
  acceptDeleteConfirmation,
} from './helpers/didaxis';

/** Mock only DELETE /api/programs/:id → 500; leave GET/POST and other methods real. */
async function mockProgramDelete500(page: Page): Promise<void> {
  await page.route('**/api/programs/**', async (route) => {
    if (route.request().method() !== 'DELETE') {
      return route.continue();
    }
    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });
}

test(
  'DS-261: program remains listed when DELETE /api/programs/:id returns 500',
  { tag: ['@programs-delete-500'] },
  async ({ page, trackProgram }) => {
    const programName = uniqueProgramName('DS261 Fail Delete');
    await createProgram(page, programName, 'DELETE 500 keeps row', trackProgram);

    await mockProgramDelete500(page);
    await gotoPrograms(page);
    await acceptDeleteConfirmation(page, programName);

    // List stays consistent: still exactly one row for this program (feature scenario 3).
    await expectProgramListed(page, programName, 1);
  },
);

test(
  'DS-261: user sees an accessible error after DELETE /api/programs/:id returns 500',
  { tag: ['@programs-delete-500-error'] },
  async ({ page, trackProgram }) => {
    // Live app (2026-11-05): alerts=0, toastLike=0 — no user-visible error copy.
    // Do not invent toast/error strings; assert role=alert until product ships real copy.
    test.fail(true, 'DS-261 open: no error UI on DELETE 500');

    const programName = uniqueProgramName('DS261 Fail Delete Error');
    await createProgram(page, programName, 'DELETE 500 should show error', trackProgram);

    await mockProgramDelete500(page);
    await gotoPrograms(page);
    await acceptDeleteConfirmation(page, programName);

    await expectProgramListed(page, programName, 1);
    // POM gap: no ProgramsPage alert/error locator yet — role=alert is the accessible contract.
    await expect(page.getByRole('alert')).toBeVisible();
  },
);
