import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

test.setTimeout(180_000);

test('Programs page opens the New Program form', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  await expect(programs.heading).toBeVisible();
  await programs.openNewProgramForm();

  await expect(programs.newProgramModal.dialog).toBeVisible();
  await expect(programs.newProgramModal.programName).toBeVisible();
  await expect(programs.newProgramModal.description).toBeVisible();
  await expect(programs.newProgramModal.createButton).toBeVisible();
});

test('A program is created and appears in the list', async ({ page, trackProgram }) => {
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

test('An empty Program Name keeps Create disabled', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  await programs.newProgramModal.programName.fill('');

  await expect(programs.newProgramModal.createButton).toBeDisabled();
  await expect(programs.newProgramModal.dialog).toBeVisible();
});

test('Cancel closes the form without adding the program', async ({ page }) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  await programs.fillNewProgramForm(programName, 'Full-stack web development program');
  await programs.cancelNewProgramForm();

  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(0);
  await expect(programs.programNameInList(programName)).toHaveCount(0);
});

test('A whitespace-only Program Name keeps Create disabled', async ({ page }) => {
  const whitespaceName = '   ';
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  await programs.newProgramModal.programName.fill(whitespaceName);

  await expect(programs.newProgramModal.createButton).toBeDisabled();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  await expect(programs.programNameWithExactSpacing(whitespaceName)).toHaveCount(0);
});

test('A program can be created with an empty Description', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, ''));

  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  await programs.programRow(programName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(programName)).toBeVisible();
});
