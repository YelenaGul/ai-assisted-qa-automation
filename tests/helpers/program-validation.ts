import { expect } from '@playwright/test';
import type { ProgramsPage } from '../../pages/ProgramsPage';
import { uniqueProgramName } from './didaxis';

/** Confluence: Program Setup — Validation Rules */
export const PROGRAM_NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export function programNameWithLength(targetLength: number, prefix: string): string {
  const base = uniqueProgramName(prefix);
  if (base.length >= targetLength) {
    return base.slice(0, targetLength);
  }
  return base + 'x'.repeat(targetLength - base.length);
}

export function descriptionWithLength(targetLength: number): string {
  if (targetLength <= 0) {
    return '';
  }
  return 'd'.repeat(targetLength);
}

/**
 * After a program with `existingName` exists, second create with same name must be blocked
 * (400/409 per validation rules) — at most one row, modal or validation error visible.
 */
export async function expectDuplicateCreateRejected(
  programs: ProgramsPage,
  existingName: string,
): Promise<void> {
  const duplicateId = await programs.attemptCreateProgram(
    existingName,
    'Duplicate instance attempt',
  );
  if (duplicateId) {
    throw new Error(
      'Duplicate create returned a program id; server should reject duplicate names.',
    );
  }

  await expect(programs.programRow(existingName)).toHaveCount(1, {
    timeout: 60_000,
  });

  const blockedInDialog =
    (await programs.newProgramModal.nameValidationError.isVisible()) ||
    (await programs.newProgramModal.dialog.isVisible());
  expect(blockedInDialog).toBeTruthy();
}

export async function expectCreateRejectedWithModalOpen(
  programs: ProgramsPage,
  programName: string,
): Promise<void> {
  const programId = await programs.submitNewProgramForm();
  if (programId) {
    throw new Error('Create should have been rejected by validation.');
  }

  const stillOpen =
    (await programs.newProgramModal.dialog.isVisible()) ||
    (await programs.newProgramModal.nameValidationError.isVisible());
  expect(stillOpen).toBeTruthy();
  await expect(programs.programRow(programName)).toHaveCount(0);
}
