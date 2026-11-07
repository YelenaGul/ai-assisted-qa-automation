import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

test.describe('DS-4 Delete program with confirmation', () => {
  test('Confirmed delete removes program from list', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueProgramName('Test Program');
    const programs = new ProgramsPage(page);

    trackProgram(await programs.createProgram(programName, 'Delete flow test'));
    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.programRow(programName)).toHaveCount(1);

    await programs.goto();
    const message = await programs.confirmDelete(programName);
    expect(message).toMatch(/delete program/i);
    expect(message).toContain(programName);

    await expect(programs.programRow(programName)).toHaveCount(0);
  });

  test('Cancel program deletion keeps the program', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueProgramName('Cancel Delete Sample');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(programName, 'Should remain after cancel'),
    );
    await expect(programs.newProgramModal.dialog).toBeHidden();
    await expect(programs.programRow(programName)).toHaveCount(1);

    await programs.goto();
    const message = await programs.cancelDelete(programName);
    expect(message).toMatch(/delete program/i);
    expect(message).toContain(programName);

    const row = programs.programRow(programName);
    await expect(row).toHaveCount(1);
    await row.scrollIntoViewIfNeeded();
    await expect(programs.programNameInList(programName)).toBeVisible();
  });

  test('Deleting one program leaves others intact', async ({
    page,
    trackProgram,
  }) => {
    const keepName = uniqueProgramName('Keep Me');
    const removeName = uniqueProgramName('Remove Me');
    const programs = new ProgramsPage(page);

    trackProgram(await programs.createProgram(keepName, 'Stays in list'));
    await expect(programs.programRow(keepName)).toHaveCount(1);

    trackProgram(await programs.createProgram(removeName, 'Will be removed'));
    await expect(programs.programRow(removeName)).toHaveCount(1);

    await programs.goto();
    await programs.confirmDelete(removeName);

    await expect(programs.programRow(removeName)).toHaveCount(0);
    const keepRow = programs.programRow(keepName);
    await expect(keepRow).toHaveCount(1);
    await keepRow.scrollIntoViewIfNeeded();
    await expect(programs.programNameInList(keepName)).toBeVisible();
  });

  test('Confirmation dialog identifies program with special characters', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueProgramName('Informatique & IA - Niveau 2');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(programName, 'Special name delete check'),
    );
    await expect(programs.programRow(programName)).toHaveCount(1);

    await programs.goto();
    const message = await programs.cancelDelete(programName);
    expect(message).toBe(
      `Delete program "${programName}"? All its semesters and courses will be removed. This cannot be undone.`,
    );

    const row = programs.programRow(programName);
    await expect(row).toHaveCount(1);
    await row.scrollIntoViewIfNeeded();
    await expect(programs.programNameInList(programName)).toBeVisible();
  });
});
