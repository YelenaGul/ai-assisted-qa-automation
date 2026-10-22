import { test, expect } from '../fixtures/didaxis.fixture';
import {
  uniqueProgramName,
  gotoPrograms,
  openNewProgramModal,
  createProgram,
  createProgramDialog,
  newProgramButton,
  programNameField,
  descriptionField,
  createProgramButton,
  expectProgramListed,
  programsMain,
} from './helpers/didaxis';
import {
  expectDuplicateCreateRejected,
  programNameWithLength,
  PROGRAM_NAME_MAX_LENGTH,
} from './helpers/program-validation';
import { ProgramsPage } from '../pages/ProgramsPage';

test('TC-001: program creation form shows Program Name and Description', async ({
  page,
}) => {
  await gotoPrograms(page);
  await newProgramButton(page).click();

  const dialog = createProgramDialog(page);
  await expect(dialog).toBeVisible();
  await expect(programNameField(dialog)).toBeVisible();
  await expect(descriptionField(dialog)).toBeVisible();
  await expect(createProgramButton(dialog)).toBeVisible();
});

test('TC-002: created program appears in the list and modal closes', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  await createProgram(
    page,
    programName,
    'Full-stack web development program',
    trackProgram,
  );
});

test('TC-003: Create is disabled when Program Name is empty', async ({ page }) => {
  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill('');
  await descriptionField(dialog).fill('Optional description');

  await expect(createProgramButton(dialog)).toBeDisabled();
});

test('TC-004: program can be created with empty Description', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Program No Description');
  await createProgram(page, programName, '', trackProgram);
});

test('TC-005: program name with special characters is accepted and visible', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Pay & Learn (50%) — QA');
  await createProgram(page, programName, 'Special characters in title', trackProgram);
});

test('TC-006: long program name is accepted and visible', async ({
  page,
  trackProgram,
}) => {
  const programName = programNameWithLength(PROGRAM_NAME_MAX_LENGTH, 'Long');
  await createProgram(page, programName, 'Boundary length check', trackProgram);
});

test('TC-007: duplicate program name on create is rejected', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Duplicate Title Test');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'First instance'));
  await expectProgramListed(page, programName, 1);
  await expectDuplicateCreateRejected(programs, programName);
});

test('TC-008: whitespace-only Program Name does not create a program', async ({
  page,
}) => {
  const whitespaceName = '   ';

  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill(whitespaceName);

  const createButton = createProgramButton(dialog);
  if (await createButton.isDisabled()) {
    await expect(createButton).toBeDisabled();
    return;
  }

  await createButton.click();
  await expect(programNameField(dialog)).toBeVisible();
  await expect(programsMain(page).getByText(whitespaceName, { exact: true })).not.toBeVisible();
});
