import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

/** Matches live UI verification viewport for DS-263 geometry (card right ≈ 620). */
const VIEWPORT = { width: 1280, height: 800 };

test.describe('DS-263 Edit and delete actions reachable on a selected program row', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
  });

  test('Selected program row shows edit and delete inside the list panel on hover', async ({
    page,
    trackProgram,
  }) => {
    // Known defect DS-263: on hover, Edit/Delete land past the card edge (~x=663 > cardRight 620).
    test.fail(
      true,
      'DS-263: edit/delete clipped outside program-list card on selected row hover',
    );

    const programName = uniqueProgramName('Clip Probe');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(programName, 'DS-263 selected-row geometry'),
    );

    await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
    await programs.selectProgramRow(programName);
    await programs.hoverProgramRow(programName);

    const geometry = await programs.rowActionGeometry(programName);
    expect(geometry.editInPanel).toBe(true);
    expect(geometry.deleteInPanel).toBe(true);
  });

  test('Delete on a selected hovered row still opens the confirmation dialog', async ({
    page,
    trackProgram,
  }) => {
    const programName = uniqueProgramName('Clip Probe');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(programName, 'DS-263 delete confirm while selected'),
    );

    await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
    await programs.selectProgramRow(programName);

    const message = await programs.dismissDeleteConfirmation(programName);

    expect(message).toMatch(/delete program/i);
    expect(message).toContain(programName);
    expect(message).toMatch(/semesters and courses will be removed/i);
    expect(message).toMatch(/cannot be undone/i);

    await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
  });

  test('Unselected hovered row also keeps delete inside the list panel', async ({
    page,
    trackProgram,
  }) => {
    // Same clip geometry as selected hover on current test env (deleteX≈663).
    test.fail(
      true,
      'DS-263: edit/delete clipped outside program-list card on unselected row hover',
    );

    const programName = uniqueProgramName('Clip Probe');
    const otherName = uniqueProgramName('Other Selected');
    const programs = new ProgramsPage(page);

    trackProgram(
      await programs.createProgram(programName, 'DS-263 unselected hover geometry'),
    );
    trackProgram(
      await programs.createProgram(otherName, 'Selected so Clip Probe stays unselected'),
    );

    await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
    await expect(programs.programRow(otherName)).toHaveCount(1, { timeout: 60_000 });

    await programs.selectProgramRow(otherName);
    await programs.hoverProgramRow(programName);

    const geometry = await programs.rowActionGeometry(programName);
    expect(geometry.deleteInPanel).toBe(true);
  });
});
