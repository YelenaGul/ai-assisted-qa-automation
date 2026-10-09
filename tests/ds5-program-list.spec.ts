import { test, expect } from '../fixtures/cleanup.fixture';
import {
  login,
  uniqueProgramName,
  createProgram,
  gotoPrograms,
  expectProgramRowDetails,
  expectProgramListed,
  expectProgramNotListed,
  deleteProgramConfirmed,
  programRow,
  programRowDescription,
  programsTable,
  expectProgramsPageLayout,
} from './helpers/didaxis';

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('TC-001: list shows each program name and description', async ({
  page,
  trackProgram,
}) => {
  const firstName = uniqueProgramName('Web Development 2026');
  const secondName = uniqueProgramName('Data Science 2026');
  await createProgram(page, firstName, 'Full-stack web development program', trackProgram);
  await createProgram(page, secondName, 'Intro to data science', trackProgram);

  await gotoPrograms(page);
  await expect(programsTable(page)).toBeVisible();
  await expectProgramRowDetails(page, firstName, 'Full-stack web development program');
  await expectProgramRowDetails(page, secondName, 'Intro to data science');
});

test('TC-003: single program entry shows full details', async ({ page, trackProgram }) => {
  const programName = uniqueProgramName('Solo Program 2026');
  const description = 'Only program in catalog';
  await createProgram(page, programName, description, trackProgram);

  await gotoPrograms(page);
  await expectProgramRowDetails(page, programName, description);
});

test('TC-004: deleted programs are not listed', async ({ page, trackProgram }) => {
  const programName = uniqueProgramName('Deleted Ghost Program');
  await createProgram(page, programName, 'Will be deleted', trackProgram);

  await deleteProgramConfirmed(page, programName);
  await gotoPrograms(page);
  await expectProgramNotListed(page, programName);
});

test('TC-006: long description displays in list without breaking layout', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Long Description Program 2026');
  const description = 'L'.repeat(500);
  await createProgram(page, programName, description, trackProgram);

  await gotoPrograms(page);
  const row = programRow(page, programName);
  await row.scrollIntoViewIfNeeded();
  await expect(row).toBeVisible();
  await expect(programRowDescription(row)).toContainText(description.slice(0, 80));
});

test('TC-007: special characters render as plain text in list', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('QA & Testing — "Phase 1"');
  const description = "Symbols: <tag> & 'quote'";
  await createProgram(page, programName, description, trackProgram);

  await gotoPrograms(page);
  await expectProgramRowDetails(page, programName, description);
});

test('TC-010: programs page shows list controls and new program action', async ({
  page,
}) => {
  await gotoPrograms(page);
  await expectProgramsPageLayout(page);
});

test('TC-002: empty state messaging when catalog has no rows', async ({ page }) => {
  test.skip(
    true,
    'Empty catalog requires an isolated tenant; shared test.didaxis.studio always has programs',
  );
  await gotoPrograms(page);
  await expect(programsTable(page).getByRole('row')).toHaveCount(0);
  await expect(page.getByText(/no programs/i)).toBeVisible();
});
