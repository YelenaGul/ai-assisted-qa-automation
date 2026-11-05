import { test, expect } from '../fixtures/didaxis.fixture';
import { NewProgramModal } from '../pages/NewProgramModal';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

const programDescription = 'Full-stack web development program';

test.setTimeout(180_000);

test('DS-270: New Program dialog shows Program Name, Description, and Create', async ({
  page,
}) => {
  const programs = new ProgramsPage(page);
  const modal: NewProgramModal = programs.newProgramModal;

  await programs.goto();
  await programs.openNewProgramForm();

  await expect(modal.dialog).toBeVisible();
  await expect(modal.programName).toBeVisible();
  await expect(modal.description).toBeVisible();
  await expect(modal.createButton).toBeVisible();
});

test('DS-270: created program closes the dialog and is listed once', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);
  const modal: NewProgramModal = programs.newProgramModal;

  const programId = await programs.createProgram(programName, programDescription);
  trackProgram(programId);

  await expect(modal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  await expect(programs.programNameInList(programName)).toBeVisible();
});

test('DS-270: empty Program Name keeps Create disabled and the dialog open', async ({
  page,
}) => {
  const programs = new ProgramsPage(page);
  const modal: NewProgramModal = programs.newProgramModal;

  await programs.gotoAndOpenNewProgramForm();
  await expect(modal.dialog).toBeVisible();
  await modal.programName.fill('');

  await expect(modal.createButton).toBeDisabled();
  await expect(modal.dialog).toBeVisible();
});

test('DS-270: Cancel closes the dialog without listing the unsaved program', async ({
  page,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);
  const modal: NewProgramModal = programs.newProgramModal;

  await programs.gotoAndOpenNewProgramForm();
  await expect(modal.dialog).toBeVisible();
  await programs.fillNewProgramForm(programName, programDescription);
  await modal.cancelButton.click();

  await expect(modal.dialog).toBeHidden();
  await expect(programs.programRow(programName)).toHaveCount(0);
});

test('DS-270: a program with an empty Description is created and listed once', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);
  const modal: NewProgramModal = programs.newProgramModal;

  const programId = await programs.createProgram(programName, '');
  trackProgram(programId);

  await expect(modal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  await expect(programs.programNameInList(programName)).toBeVisible();
});

test('DS-270: whitespace-only Program Name keeps Create disabled and the dialog open', async ({
  page,
}) => {
  const programs = new ProgramsPage(page);
  const modal: NewProgramModal = programs.newProgramModal;

  await programs.gotoAndOpenNewProgramForm();
  await expect(modal.dialog).toBeVisible();
  await modal.programName.fill('   ');

  await expect(modal.createButton).toBeDisabled();
  await expect(modal.dialog).toBeVisible();
});

test(
  'DS-270: HTTP 503 on create leaves the dialog open and does not list the program',
  { tag: ['@programs-503-save'] },
  async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    const programs = new ProgramsPage(page);
    const modal: NewProgramModal = programs.newProgramModal;

    await page.route('**/api/programs', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await programs.gotoAndOpenNewProgramForm();
    await expect(modal.dialog).toBeVisible();
    await programs.fillNewProgramForm(programName, programDescription);

    const createFailed = page.waitForResponse((response) => {
      if (response.request().method() !== 'POST' || response.status() !== 503) {
        return false;
      }
      try {
        return /\/api\/programs\/?$/.test(new URL(response.url()).pathname);
      } catch {
        return false;
      }
    });
    await modal.createButton.click();
    await createFailed;

    // Live error copy was not recorded; assert only that save did not complete.
    await expect(modal.dialog).toBeVisible();
    await expect(programs.programRow(programName)).toHaveCount(0);
  },
);
