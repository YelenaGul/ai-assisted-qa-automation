import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

test.setTimeout(180_000);

async function mockDeleteProgramsAs500(page: ProgramsPage['page']): Promise<void> {
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
  'Failed delete keeps the program and shows an error',
  { tag: ['@programs-delete-500'] },
  async ({ page, trackProgram }) => {
    // Known defect DS-261: DELETE 500 leaves the row but shows no user-visible error.
    test.fail(true, 'DS-261: no user-visible error on delete 500');

    const programName = uniqueProgramName('Delete Fail Probe');
    const programs = new ProgramsPage(page);

    trackProgram(await programs.createProgram(programName, 'DS-261 delete 500 probe'));
    await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });

    await mockDeleteProgramsAs500(page);
    await programs.acceptDeleteConfirmation(programName);

    await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
    await expect(programs.programNameInList(programName)).toBeVisible();
    // Do not invent toast copy — assert a role=alert region once product surfaces one.
    await expect(programs.errorAlert).toBeVisible();
  },
);

test('Successful delete still removes the program when the API succeeds', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Delete Success Probe');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'DS-261 successful delete'));
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });

  await programs.acceptDeleteConfirmation(programName);

  await expect(programs.programRow(programName)).toHaveCount(0, { timeout: 60_000 });
});

test('Failed delete does not leave the UI in a broken state', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Delete Fail Probe');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'DS-261 UI usable after 500'));
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });

  await mockDeleteProgramsAs500(page);
  await programs.acceptDeleteConfirmation(programName);

  await expect(programs.heading).toBeVisible();
  await expect(programs.newProgramButton).toBeVisible();
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  await expect(programs.programNameInList(programName)).toBeVisible();
});
