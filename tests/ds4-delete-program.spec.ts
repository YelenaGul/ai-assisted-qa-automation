import { test } from '@playwright/test';
import {
  login,
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

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('TC-001: confirmed delete removes program from list', async ({ page }) => {
  const programName = uniqueProgramName('Test Program');
  await createProgram(page, programName, 'Delete flow test');

  await gotoPrograms(page);
  await acceptDeleteConfirmation(page, programName);
  await expectProgramNotListed(page, programName);
});

test('TC-002: cancel on confirmation keeps program', async ({ page }) => {
  const programName = uniqueProgramName('Cancel Delete Sample 2026');
  await createProgram(page, programName, 'Should remain after cancel');

  await gotoPrograms(page);
  await dismissDeleteConfirmation(page, programName);
  await expectProgramListed(page, programName);
});

test('TC-003: deleting one program leaves others intact', async ({ page }) => {
  const keepName = uniqueProgramName('Keep Me 2026');
  const removeName = uniqueProgramName('Remove Me 2026');
  await createProgram(page, keepName, 'Stays in list');
  await createProgram(page, removeName, 'Will be removed');

  await gotoPrograms(page);
  await acceptDeleteConfirmation(page, removeName);

  await expectProgramNotListed(page, removeName);
  await expectProgramListed(page, keepName);
});

test('TC-004: program persists when deletion is not confirmed', async ({ page }) => {
  const programName = uniqueProgramName('No Confirm Delete 2026');
  await createProgram(page, programName, 'Dismiss confirmation');

  await gotoPrograms(page);
  await dismissDeleteConfirmation(page, programName);
  await expectProgramListed(page, programName);
});

test('TC-005: repeated confirm click deletes program once', async ({ page }) => {
  const programName = uniqueProgramName('Double Click Test');
  await createProgram(page, programName, 'Double confirm');

  await gotoPrograms(page);
  await acceptDeleteConfirmationTwice(page, programName);
  await expectProgramNotListed(page, programName);
});

test('TC-007: confirmation dialog identifies program with special characters', async ({
  page,
}) => {
  const programName = uniqueProgramName('Informatique & IA - Niveau 2');
  await createProgram(page, programName, 'Special name delete check');

  await gotoPrograms(page);
  await previewDeleteConfirmationMessage(page, programName);
  await expectProgramListed(page, programName);
});

test('TC-008: deleting a program removes it from the visible list', async ({ page }) => {
  const programName = uniqueProgramName('Deleted Ghost Program');
  await createProgram(page, programName, 'Removed then verified absent');

  await deleteProgramConfirmed(page, programName);
  await gotoPrograms(page);
  await expectProgramNotListed(page, programName);
});
