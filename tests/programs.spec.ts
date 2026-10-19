import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

test('TC-001: program creation form shows Program Name and Description', async ({
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

test('TC-002: created program appears in the list and modal closes', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(
    await programs.createProgram(programName, 'Full-stack web development program'),
  );

  await expect(programs.newProgramModal.dialog).toBeHidden();
  await expect(programs.programRow(programName)).toHaveCount(1);
  await programs.programRow(programName).first().scrollIntoViewIfNeeded();
  await expect(programs.programRow(programName).first()).toBeVisible();
});

test('TC-003: Create is disabled when Program Name is empty', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.programName.fill('');
  await programs.newProgramModal.description.fill('Optional description');

  await expect(programs.newProgramModal.createButton).toBeDisabled();
});

test('TC-004: program can be created with empty Description', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Program No Description');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, ''));

  await expect(programs.newProgramModal.dialog).toBeHidden();
  await expect(programs.programRow(programName)).toHaveCount(1);
  await programs.programRow(programName).first().scrollIntoViewIfNeeded();
  await expect(programs.programRow(programName).first()).toBeVisible();
});

test('TC-005: program name with special characters is accepted and visible', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Pay & Learn (50%) — QA');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'Special characters in title'));

  await expect(programs.newProgramModal.dialog).toBeHidden();
  await expect(programs.programRow(programName)).toHaveCount(1);
  await programs.programRow(programName).first().scrollIntoViewIfNeeded();
  await expect(programs.programRow(programName).first()).toBeVisible();
});

test('TC-006: long program name is accepted and visible', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName(`Long-${'a'.repeat(100)}`);
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'Boundary length check'));

  await expect(programs.newProgramModal.dialog).toBeHidden();
  await expect(programs.programRow(programName)).toHaveCount(1);
  await programs.programRow(programName).first().scrollIntoViewIfNeeded();
  await expect(programs.programRow(programName).first()).toBeVisible();
});

test('TC-007: duplicate program titles can exist as separate list entries', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Duplicate Title Test');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'First instance'));
  await expect(programs.programRow(programName)).toHaveCount(1);

  trackProgram(await programs.createProgram(programName, 'Second instance'));
  await expect(programs.programRow(programName)).toHaveCount(2);
  await programs.programRow(programName).first().scrollIntoViewIfNeeded();
  await expect(programs.programRow(programName).first()).toBeVisible();
});

test('TC-008: whitespace-only Program Name does not create a program', async ({
  page,
}) => {
  const whitespaceName = '   ';
  const programs = new ProgramsPage(page);

  await programs.goto();
  await programs.openNewProgramForm();
  await programs.newProgramModal.programName.fill(whitespaceName);

  if (await programs.newProgramModal.createButton.isDisabled()) {
    await expect(programs.newProgramModal.createButton).toBeDisabled();
    return;
  }

  await programs.newProgramModal.createButton.click();
  await expect(programs.newProgramModal.programName).toBeVisible();
  await expect(programs.programNameInList(whitespaceName)).not.toBeVisible();
});
