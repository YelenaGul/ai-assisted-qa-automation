import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';
import {
  programNameWithLength,
  PROGRAM_NAME_MAX_LENGTH,
} from './helpers/program-validation';

test.describe('DS-1 Create new academic program', () => {
  test('Program creation form shows Program Name and Description', async ({
    page,
  }) => {
    const programs = new ProgramsPage(page);

    await programs.goto();
    await programs.openNewProgramForm();

    await expect(programs.newProgramModal.dialog).toBeVisible();
    await expect(programs.newProgramModal.programName).toBeVisible();
    await expect(programs.newProgramModal.description).toBeVisible();
    await expect(programs.newProgramModal.createButton).toBeVisible();
  });

  test('Successfully create a program', async ({ page, trackProgram }) => {
    const programName = uniqueProgramName('Web Development 2026');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(
        programName,
        'Full-stack web development program',
      ),
    );

    await expect(programs.newProgramModal.dialog).toBeHidden();
    const row = programs.programRow(programName);
    await expect(row).toHaveCount(1);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
  });

  test('Program can be created with empty Description', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueProgramName('Program No Description');
    const programs = new ProgramsPage(page);

    trackProgram(await programs.createProgram(programName, ''));

    await expect(programs.newProgramModal.dialog).toBeHidden();
    const row = programs.programRow(programName);
    await expect(row).toHaveCount(1);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
  });

  test('Validation prevents empty program name', async ({ page }) => {
    const programs = new ProgramsPage(page);

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.programName.fill('');
    await programs.newProgramModal.description.fill('Optional description');

    await expect(programs.newProgramModal.createButton).toBeDisabled();
  });

  test('Whitespace-only Program Name cannot be submitted', async ({ page }) => {
    const programs = new ProgramsPage(page);

    await programs.goto();
    await programs.openNewProgramForm();
    await programs.newProgramModal.programName.fill('   ');

    await expect(programs.newProgramModal.createButton).toBeDisabled();
    await expect(programs.newProgramModal.dialog).toBeVisible();
  });

  test('Program name with special characters is accepted and listed', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueProgramName('Pay & Learn (50%) — QA');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(
        programName,
        'Special characters in title',
      ),
    );

    await expect(programs.newProgramModal.dialog).toBeHidden();
    const row = programs.programRow(programName);
    await expect(row).toHaveCount(1);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
  });

  test('Program name at max length 100 is accepted and listed', async ({
    page,
    trackProgram,
  }) => {
    const programName = programNameWithLength(PROGRAM_NAME_MAX_LENGTH, 'Long');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(programName, 'Boundary length check'),
    );

    await expect(programs.newProgramModal.dialog).toBeHidden();
    const row = programs.programRow(programName);
    await expect(row).toHaveCount(1);
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();
  });
});
