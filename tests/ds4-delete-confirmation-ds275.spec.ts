import { test } from '../fixtures/didaxis.fixture';
import {
  uniqueProgramName,
  createProgram,
  gotoPrograms,
  expectProgramListed,
  expectProgramNotListed,
  acceptDeleteConfirmation,
  dismissDeleteConfirmation,
  previewDeleteConfirmationMessage,
} from './helpers/didaxis';

test('DS-275: confirmed delete removes program from list', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Test Program');
  await createProgram(page, programName, 'DS-275 delete confirm', trackProgram);

  await gotoPrograms(page);
  await acceptDeleteConfirmation(page, programName);
  await expectProgramNotListed(page, programName);
});

test('DS-275: cancel/dismiss on confirmation keeps program', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('DS275 Keep Me');
  await createProgram(page, programName, 'DS-275 dismiss confirm', trackProgram);

  await gotoPrograms(page);
  await dismissDeleteConfirmation(page, programName);
  await expectProgramListed(page, programName);
});

test('DS-275: confirmation message names the program being deleted', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Informatique & IA - Niveau 2');
  await createProgram(
    page,
    programName,
    'DS-275 confirm message name check',
    trackProgram,
  );

  await gotoPrograms(page);
  await previewDeleteConfirmationMessage(page, programName);
  await expectProgramListed(page, programName);
});
