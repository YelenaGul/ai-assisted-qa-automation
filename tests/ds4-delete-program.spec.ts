import { test } from '../fixtures/didaxis.fixture';
import {
  uniqueProgramName,
  createProgram,
  gotoPrograms,
  expectProgramListed,
  expectProgramNotListed,
  acceptDeleteConfirmation,
  dismissDeleteConfirmation,
  deleteProgramConfirmed,
  acceptDeleteConfirmationTwice,
  previewDeleteConfirmationMessage,
} from './helpers/didaxis';

test('TC-001: confirmed delete removes program from list', {
  tag: '@smoke',
}, async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Test Program');
  await createProgram(page, programName, 'Delete flow test', trackProgram);

  await gotoPrograms(page);
  await acceptDeleteConfirmation(page, programName);
  await expectProgramNotListed(page, programName);
});

test('TC-002: cancel on confirmation keeps program', {
  tag: '@sanity',
}, async ({ page, trackProgram }) => {
  const programName = uniqueProgramName('Cancel Delete Sample 2026');
  await createProgram(page, programName, 'Should remain after cancel', trackProgram);

  await gotoPrograms(page);
  await dismissDeleteConfirmation(page, programName);
  await expectProgramListed(page, programName);
});

test('TC-003: deleting one program leaves others intact', {
  tag: '@regression',
}, async ({
  page,
  trackProgram,
}) => {
  const keepName = uniqueProgramName('Keep Me 2026');
  const removeName = uniqueProgramName('Remove Me 2026');
  await createProgram(page, keepName, 'Stays in list', trackProgram);
  await createProgram(page, removeName, 'Will be removed', trackProgram);

  await gotoPrograms(page);
  await acceptDeleteConfirmation(page, removeName);

  await expectProgramNotListed(page, removeName);
  await expectProgramListed(page, keepName);
});

test('TC-004: program persists when deletion is not confirmed', {
  tag: '@sanity',
}, async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('No Confirm Delete 2026');
  await createProgram(page, programName, 'Dismiss confirmation', trackProgram);

  await gotoPrograms(page);
  await dismissDeleteConfirmation(page, programName);
  await expectProgramListed(page, programName);
});

test('TC-005: repeated confirm click deletes program once', {
  tag: '@regression',
}, async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Double Click Test');
  await createProgram(page, programName, 'Double confirm', trackProgram);

  await gotoPrograms(page);
  await acceptDeleteConfirmationTwice(page, programName);
  await expectProgramNotListed(page, programName);
});

test('TC-007: confirmation dialog identifies program with special characters', {
  tag: '@regression',
}, async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Informatique & IA - Niveau 2');
  await createProgram(page, programName, 'Special name delete check', trackProgram);

  await gotoPrograms(page);
  await previewDeleteConfirmationMessage(page, programName);
  await expectProgramListed(page, programName);
});

test('TC-008: deleting a program removes it from the visible list', {
  tag: '@sanity',
}, async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Deleted Ghost Program');
  await createProgram(page, programName, 'Removed then verified absent', trackProgram);

  await deleteProgramConfirmed(page, programName);
  await gotoPrograms(page);
  await expectProgramNotListed(page, programName);
});
