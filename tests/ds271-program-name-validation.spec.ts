import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

test.setTimeout(180_000);

test('DS-271 Program name with special characters is created and listed', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Informatique & IA - Niveau 2');
  const programs = new ProgramsPage(page);

  trackProgram(
    await programs.createProgram(
      programName,
      'Full-stack curriculum with ampersand',
    ),
  );

  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  await programs.programRow(programName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(programName)).toBeVisible();
  await expect(programs.programNameWithExactSpacing(programName)).toBeVisible();
});

test('DS-271 Whitespace-only Program Name cannot be submitted', async ({ page }) => {
  const whitespaceName = '   ';
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  await programs.newProgramModal.programName.fill(whitespaceName);

  await expect(programs.newProgramModal.createButton).toBeDisabled();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  await expect(programs.programNameWithExactSpacing(whitespaceName)).toHaveCount(0);
});

test('DS-271 Duplicate Program Name is rejected with an error', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'First instance'));
  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });

  const duplicateId = await programs.attemptCreateProgram(
    programName,
    'Second attempt',
    45_000,
  );
  if (duplicateId) {
    trackProgram(duplicateId);
  }

  await expect(programs.newProgramModal.dialog).toBeVisible();
  await expect(programs.newProgramModal.nameValidationError).toBeVisible();
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
});

test('DS-271 Empty Program Name keeps Create disabled', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await expect(programs.newProgramModal.dialog).toBeVisible();
  await programs.newProgramModal.programName.fill('');

  await expect(programs.newProgramModal.createButton).toBeDisabled();
  await expect(programs.newProgramModal.dialog).toBeVisible();
});

test('DS-271 Leading and trailing spaces are removed from the saved Program Name', async ({
  page,
  trackProgram,
}) => {
  const trimmedName = uniqueProgramName('Informatique & IA - Niveau 2');
  const paddedName = `  ${trimmedName}  `;
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(paddedName, ''));

  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 60_000 });
  await expect(programs.programNameWithExactSpacing(trimmedName)).toBeVisible({
    timeout: 60_000,
  });
  await expect(programs.programRow(trimmedName)).toHaveCount(1, { timeout: 60_000 });
  await expect(programs.programNameWithExactSpacing(paddedName)).toHaveCount(0);
});
