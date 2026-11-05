import { test, expect } from '../fixtures/didaxis.fixture';
import {
  uniqueProgramName,
  createProgram,
  gotoPrograms,
  expectProgramListed,
  deleteProgramButton,
  expectDeleteConfirmMessage,
} from './helpers/didaxis';

test(
  'DS-262: double-clicking delete opens a single confirmation dialog',
  { tag: ['@programs-delete-dblclick'] },
  async ({ page, trackProgram }) => {
    test.fail(true, 'DS-262 open: double-click opens two confirms');

    const programName = uniqueProgramName('DS262 Double Click');
    await createProgram(page, programName, 'Double-click delete dialog count', trackProgram);

    await gotoPrograms(page);
    await expectProgramListed(page, programName);

    const deleteBtn = deleteProgramButton(page, programName);
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.hover();

    let dialogCount = 0;
    page.on('dialog', async (dialog) => {
      dialogCount += 1;
      expectDeleteConfirmMessage(dialog.message(), programName);
      await dialog.dismiss();
    });

    await deleteBtn.dblclick();

    expect(dialogCount).toBe(1);
  },
);

test(
  'DS-262: dismissing confirm(s) after delete double-click keeps program listed',
  { tag: ['@programs-delete-dblclick-dismiss'] },
  async ({ page, trackProgram }) => {
    const programName = uniqueProgramName('DS262 Dismiss Dblclick');
    await createProgram(page, programName, 'Double-click delete dismiss path', trackProgram);

    await gotoPrograms(page);
    await expectProgramListed(page, programName);

    const deleteBtn = deleteProgramButton(page, programName);
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.hover();

    page.on('dialog', async (dialog) => {
      expectDeleteConfirmMessage(dialog.message(), programName);
      await dialog.dismiss();
    });

    await deleteBtn.dblclick();

    await expectProgramListed(page, programName);
  },
);
