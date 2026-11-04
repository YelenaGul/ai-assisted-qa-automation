import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

// Live creates wait on the programs API; the default 30s test timeout is too short.
test.setTimeout(180_000);

test('Admin opens the program creation form', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  await programs.openNewProgramForm();

  await expect(programs.newProgramModal.dialog).toBeVisible();
  await expect(programs.newProgramModal.programName).toBeVisible();
  await expect(programs.newProgramModal.description).toBeVisible();
  await expect(programs.newProgramModal.createButton).toBeVisible();
});

test('Created program appears in the list and the dialog closes', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(
    await programs.createProgram(programName, 'Full-stack web development program'),
  );

  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  await programs.programRow(programName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(programName)).toBeVisible();
});

test('Empty Program Name keeps Create disabled', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await programs.newProgramModal.programName.fill('');

  await expect(programs.newProgramModal.createButton).toBeDisabled();
  await expect(programs.newProgramModal.dialog).toBeVisible();
});

test('Program can be created when Description is empty', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026 empty description');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, ''));

  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  await programs.programRow(programName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(programName)).toBeVisible();
});

test(
  'Create stays on the form when saving the program returns 503',
  { tag: ['@programs-503-save'] },
  async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026 503');
    const programs = new ProgramsPage(page);

    // HTTP 503 copy was not observed. Assert dialog, heading, and that this name is not listed.
    await page.route('**/api/programs', (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{}',
      });
    });

    // attemptCreateProgram only resolves when the create POST is ok, so a 503 settles by timeout.
    const programId = await programs.attemptCreateProgram(
      programName,
      'Full-stack web development program',
      5_000,
    );
    expect(programId).toBeNull();

    await expect(programs.newProgramModal.dialog).toBeVisible();
    await expect(programs.heading).toBeVisible();
    await expect(programs.programRow(programName)).toHaveCount(0);
  },
);
