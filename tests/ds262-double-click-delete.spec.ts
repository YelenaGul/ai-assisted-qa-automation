import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

const deleteConfirmPattern = /delete program/i;

test.setTimeout(180_000);

test('Double-clicking delete opens a single confirmation dialog', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Double Click Delete Probe');
  const programs = new ProgramsPage(page);
  trackProgram(await programs.createProgram(programName, 'DS-262 single-dialog probe'));
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });

  const { count, messages } = await programs.doubleClickDeleteAndCollectDialogs(
    programName,
    'dismiss',
  );

  expect(messages.length).toBeGreaterThan(0);
  for (const message of messages) {
    expect(message).toMatch(deleteConfirmPattern);
    expect(message).toContain(programName);
  }

  // Known defect: live app opens two sequential confirms on dblclick.
  test.fail(true, 'DS-262: double-click opens two confirmation dialogs');
  expect(count).toBe(1);
});

test('Dismissing the confirmation keeps the program', async ({ page, trackProgram }) => {
  const programName = uniqueProgramName('Double Click Delete Probe');
  const programs = new ProgramsPage(page);
  trackProgram(await programs.createProgram(programName, 'DS-262 dismiss keeps program'));
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });

  const { messages } = await programs.doubleClickDeleteAndCollectDialogs(
    programName,
    'dismiss',
  );

  expect(messages.length).toBeGreaterThan(0);
  for (const message of messages) {
    expect(message).toMatch(deleteConfirmPattern);
    expect(message).toContain(programName);
  }

  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });
});

test('Accepting the confirmation deletes the program once', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Double Click Delete Probe');
  const programs = new ProgramsPage(page);
  trackProgram(await programs.createProgram(programName, 'DS-262 accept deletes once'));
  await expect(programs.programRow(programName)).toHaveCount(1, { timeout: 60_000 });

  const { messages } = await programs.doubleClickDeleteAndCollectDialogs(
    programName,
    'accept',
  );

  expect(messages.length).toBeGreaterThan(0);
  for (const message of messages) {
    expect(message).toMatch(deleteConfirmPattern);
    expect(message).toContain(programName);
  }

  await expect(programs.programRow(programName)).toHaveCount(0, { timeout: 60_000 });
});
