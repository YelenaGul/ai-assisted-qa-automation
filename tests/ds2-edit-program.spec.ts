import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

test.setTimeout(180_000);

const listTimeout = 60_000;

async function createListedProgram(
  programs: ProgramsPage,
  trackProgram: (programId: string) => void,
  programName: string,
  description: string,
): Promise<void> {
  trackProgram(await programs.createProgram(programName, description));
  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: listTimeout });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: listTimeout });
}

test('Edit form opens with the program\'s current name and description', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const description = 'Full-stack web development program';
  const programs = new ProgramsPage(page);

  await createListedProgram(programs, trackProgram, programName, description);
  await programs.openEditDialog(programName);

  await expect(programs.editProgramModal.dialog).toBeVisible();
  await expect(programs.editProgramModal.programName).toHaveValue(programName);
  await expect(programs.editProgramModal.description).toHaveValue(description);
});

test('Saving a new name closes the dialog and updates the list', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const updatedName = `${programName} - Updated`;
  const programs = new ProgramsPage(page);

  await createListedProgram(
    programs,
    trackProgram,
    programName,
    'Full-stack web development program',
  );
  await programs.openEditDialog(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();

  await programs.fillEditProgramName(updatedName);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).toBeHidden({ timeout: listTimeout });
  await expect(programs.programRow(updatedName)).toHaveCount(1, { timeout: listTimeout });
  await programs.programRow(updatedName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(updatedName)).toBeVisible();
  await expect(programs.programNameInList(programName)).toHaveCount(0);
  await expect(programs.programRow(programName)).toHaveCount(0);
});

test('Changing only the description leaves the name unchanged', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const updatedDescription = 'Updated curriculum overview';
  const programs = new ProgramsPage(page);

  await createListedProgram(
    programs,
    trackProgram,
    programName,
    'Full-stack web development program',
  );
  await programs.openEditDialog(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();

  await programs.fillEditProgramDescription(updatedDescription);
  await expect(programs.editProgramModal.programName).toHaveValue(programName);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).toBeHidden({ timeout: listTimeout });
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: listTimeout });
  await programs.programRow(programName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(programName)).toBeVisible();
  await expect(
    programs.programDescriptionInRow(programName, updatedDescription),
  ).toBeVisible();
});

test('Cancel discards an unsaved name change', async ({ page, trackProgram }) => {
  const programName = uniqueProgramName('Web Development 2026');
  const rejectedName = uniqueProgramName('Should Not Persist');
  const programs = new ProgramsPage(page);

  await createListedProgram(
    programs,
    trackProgram,
    programName,
    'Full-stack web development program',
  );
  await programs.openEditDialog(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();

  await programs.fillEditProgramName(rejectedName);
  await programs.cancelEdit();

  await expect(programs.editProgramModal.dialog).toBeHidden();
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: listTimeout });
  await programs.programRow(programName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(programName)).toBeVisible();
  await expect(programs.programNameInList(rejectedName)).toHaveCount(0);
  await expect(programs.programRow(rejectedName)).toHaveCount(0);
});

test('An empty Program Name cannot be saved', async ({ page, trackProgram }) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  await createListedProgram(programs, trackProgram, programName, '');
  await programs.openEditDialog(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();

  await programs.fillEditProgramName('');

  await expect(programs.editProgramModal.saveButton).toBeDisabled();
  await expect(programs.editProgramModal.dialog).toBeVisible();
  await expect(programs.programNameInList(programName)).toHaveCount(1);
  await expect(programs.programNameInList(programName)).toBeVisible();
});

test('A whitespace-only Program Name cannot be saved', async ({ page, trackProgram }) => {
  const programName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  await createListedProgram(programs, trackProgram, programName, '');
  await programs.openEditDialog(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();

  await programs.fillEditProgramName('   ');

  await expect(programs.editProgramModal.saveButton).toBeDisabled();
  await expect(programs.editProgramModal.dialog).toBeVisible();
  await expect(programs.programNameInList(programName)).toHaveCount(1);
  await expect(programs.programNameInList(programName)).toBeVisible();
});

test('Leading and trailing spaces are removed from the saved Program Name', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const trimmedName = `${programName} - Updated`;
  const paddedName = `  ${trimmedName}  `;
  const programs = new ProgramsPage(page);

  await createListedProgram(programs, trackProgram, programName, '');
  await programs.openEditDialog(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();

  await programs.fillEditProgramName(paddedName);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).toBeHidden({ timeout: listTimeout });
  await expect(programs.programNameWithExactSpacing(trimmedName)).toBeVisible({
    timeout: listTimeout,
  });
  await expect(programs.programRow(trimmedName)).toHaveCount(1, { timeout: listTimeout });
  await expect(programs.programNameWithExactSpacing(paddedName)).toHaveCount(0);
});

test('Special characters in the name and description are kept after save', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const updatedName = uniqueProgramName('Informatique & IA - Niveau 2');
  const updatedDescription = 'Cours: advanced & basics';
  const programs = new ProgramsPage(page);

  await createListedProgram(
    programs,
    trackProgram,
    programName,
    'Full-stack web development program',
  );
  await programs.openEditDialog(programName);
  await expect(programs.editProgramModal.dialog).toBeVisible();

  await programs.fillEditProgramName(updatedName);
  await programs.fillEditProgramDescription(updatedDescription);
  await programs.saveEdit();

  await expect(programs.editProgramModal.dialog).toBeHidden({ timeout: listTimeout });
  await expect(programs.programRow(updatedName)).toHaveCount(1, { timeout: listTimeout });
  await programs.programRow(updatedName).scrollIntoViewIfNeeded();
  await expect(programs.programNameInList(updatedName)).toBeVisible();
  await expect(
    programs.programDescriptionInRow(updatedName, updatedDescription),
  ).toBeVisible();
});
