import { expect, type Locator, type Page } from '@playwright/test';
import {
  isProgramCreatePost,
  programIdFromCreateResponse,
  waitForProgramCreateResponse,
} from './didaxis-api';

import { didaxisBaseUrl, requireEnv } from './didaxis-env';

export { didaxisBaseUrl, requireEnv };

export type TrackProgram = (programId: string) => void;

export async function submitCreateProgramDialogWithTracking(
  page: Page,
  dialog: Locator,
  trackProgram: TrackProgram,
): Promise<void> {
  const createResponse = waitForProgramCreateResponse(page);
  await createProgramButton(dialog).click();
  trackProgram(await programIdFromCreateResponse(await createResponse));
}

export function programsUrl(): string {
  return `${didaxisBaseUrl()}/programs`;
}

export function uniqueProgramName(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

/** Programs list lives under the main landmark (avoids matching sidebar/nav). */
export function programsMain(page: Page) {
  return page.getByRole('main');
}

export function programsTable(page: Page) {
  return programsMain(page).getByRole('table');
}

export function newProgramButton(page: Page) {
  return programsMain(page).getByRole('button', { name: /new program/i });
}

/** Create modal — accessible name from dialog heading "New Program". */
export function createProgramDialog(page: Page) {
  return page.getByRole('dialog', { name: 'New Program' });
}

/** Edit modal — accessible name from dialog heading "Edit Program". */
export function editProgramDialog(page: Page) {
  return page.getByRole('dialog', { name: 'Edit Program' });
}

/** @deprecated Prefer createProgramDialog or editProgramDialog for scoped fields. */
export function programDialog(page: Page) {
  return page.getByRole('dialog');
}

export function programNameField(scope: Page | Locator) {
  return scope.getByRole('textbox', { name: /program name/i });
}

export function descriptionField(scope: Page | Locator) {
  return scope.getByRole('textbox', { name: 'Description' });
}

export function createProgramButton(scope: Page | Locator) {
  return scope.getByRole('button', { name: 'Create' });
}

export function saveProgramButton(scope: Page | Locator) {
  return scope.getByRole('button', { name: 'Save' });
}

export function programRows(page: Page, programName: string) {
  return programsTable(page).getByRole('row').filter({
    has: page.getByText(programName, { exact: true }),
  });
}

export function programRow(page: Page, programName: string) {
  return programRows(page, programName).first();
}

export async function expectProgramListed(
  page: Page,
  programName: string,
  count = 1,
): Promise<void> {
  const rows = programRows(page, programName);
  await expect(rows).toHaveCount(count);
  await rows.first().scrollIntoViewIfNeeded();
  await expect(rows.first()).toBeVisible();
}

export async function expectProgramNotListed(page: Page, programName: string): Promise<void> {
  await expect(programRows(page, programName)).toHaveCount(0);
}

export async function login(page: Page): Promise<void> {
  const email = requireEnv('DIDAXIS_EMAIL');
  const password = requireEnv('DIDAXIS_PASSWORD');

  await page.goto(`${didaxisBaseUrl()}/login`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

export async function gotoPrograms(page: Page): Promise<void> {
  await page.goto(programsUrl());
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
}

export async function openNewProgramModal(page: Page): Promise<void> {
  await gotoPrograms(page);
  await newProgramButton(page).click();
  const dialog = createProgramDialog(page);
  await expect(dialog).toBeVisible();
  await expect(programNameField(dialog)).toBeVisible();
  await expect(descriptionField(dialog)).toBeVisible();
}

/** Opens the New Program modal and returns the scoped dialog locator. */
export async function openCreateProgramDialog(page: Page): Promise<Locator> {
  await openNewProgramModal(page);
  return createProgramDialog(page);
}

export async function fillCreateProgramFormOnDialog(
  dialog: Locator,
  programName: string,
  description: string,
): Promise<void> {
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill(description);
}

export async function submitCreateProgramDialog(dialog: Locator): Promise<void> {
  await createProgramButton(dialog).click();
}

/** Validation message for duplicate program names (scoped to create dialog). */
export function createProgramNameError(dialog: Locator) {
  return dialog.getByText(/already exists|duplicate|name.*taken/i);
}

export async function attemptCreateProgram(
  page: Page,
  programName: string,
  description: string,
  trackProgram?: TrackProgram,
): Promise<Locator> {
  const dialog = await openCreateProgramDialog(page);
  await fillCreateProgramFormOnDialog(dialog, programName, description);
  const createResponsePromise = page
    .waitForResponse(isProgramCreatePost, { timeout: 120_000 })
    .catch(() => null);
  await submitCreateProgramDialog(dialog);
  if (trackProgram) {
    const createResponse = await createResponsePromise;
    if (createResponse) {
      trackProgram(await programIdFromCreateResponse(createResponse));
    }
  }
  return dialog;
}

export async function expectExactlyOneProgramNamed(
  page: Page,
  programName: string,
): Promise<void> {
  await expect(programRows(page, programName)).toHaveCount(1);
}

export async function createProgram(
  page: Page,
  programName: string,
  description: string,
  trackProgram: TrackProgram,
  listedCount = 1,
): Promise<void> {
  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill(description);
  await submitCreateProgramDialogWithTracking(page, dialog, trackProgram);
  await expect(dialog).toBeHidden({ timeout: 120_000 });
  await expectProgramListed(page, programName, listedCount);
}

export function editProgramButton(page: Page, programName: string) {
  return programRow(page, programName).getByRole('button', {
    name: `Edit ${programName}`,
  });
}

export function deleteProgramButton(page: Page, programName: string) {
  return programRow(page, programName).getByRole('button', {
    name: `Delete ${programName}`,
  });
}

export function cancelEditProgramButton(scope: Page | Locator) {
  return scope.getByRole('button', { name: 'Cancel' });
}

export async function openEditProgram(page: Page, programName: string): Promise<void> {
  await gotoPrograms(page);
  const edit = editProgramButton(page, programName);
  await edit.scrollIntoViewIfNeeded({ timeout: 60_000 });
  await edit.click({ timeout: 60_000 });
  await expect(editProgramDialog(page)).toBeVisible();
  await expect(programNameField(editProgramDialog(page))).toBeVisible();
}

/** Opens edit for a program and returns the scoped Edit Program dialog. */
export async function openEditProgramDialog(
  page: Page,
  programName: string,
): Promise<Locator> {
  await openEditProgram(page, programName);
  return editProgramDialog(page);
}

export async function fillEditProgramForm(
  dialog: Locator,
  fields: { programName?: string; description?: string },
): Promise<void> {
  if (fields.programName !== undefined) {
    await programNameField(dialog).fill(fields.programName);
  }
  if (fields.description !== undefined) {
    await descriptionField(dialog).fill(fields.description);
  }
}

export async function cancelEditProgram(page: Page, programName: string): Promise<void> {
  const dialog = await openEditProgramDialog(page, programName);
  await cancelEditProgramButton(dialog).click();
  await expect(dialog).toBeHidden();
}

/** Native `window.confirm` copy when deleting a program (Didaxis uses browser confirm, not a Mantine dialog). */
export const deleteProgramConfirmPattern = /delete program/i;

export function expectDeleteConfirmMessage(message: string, programName: string): void {
  expect(message).toMatch(deleteProgramConfirmPattern);
  expect(message).toContain(programName);
}

export function programsPageSubtitle(page: Page) {
  return programsMain(page).getByText('Manage academic programs and semesters');
}

export async function expectProgramsPageLayout(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible();
  await expect(programsPageSubtitle(page)).toBeVisible();
  await expect(programsTable(page)).toBeVisible();
  await expect(newProgramButton(page)).toBeVisible();
  await expect(programsTable(page).getByRole('columnheader', { name: 'Program' })).toBeVisible();
}

export function programRowName(row: Locator) {
  return row.getByRole('paragraph').nth(0);
}

export function programRowDescription(row: Locator) {
  return row.getByRole('paragraph').nth(1);
}

export function programRowCell(page: Page, programName: string) {
  return programRows(page, programName).first();
}

export async function expectProgramRowDetails(
  page: Page,
  programName: string,
  description: string,
): Promise<void> {
  const row = programRow(page, programName);
  await row.scrollIntoViewIfNeeded();
  await expect(programRowName(row)).toHaveText(programName);
  await expect(programRowDescription(row)).toHaveText(description);
}

export async function fillCreateProgramForm(
  page: Page,
  programName: string,
  description: string,
  dialog?: Locator,
): Promise<void> {
  const formDialog = dialog ?? createProgramDialog(page);
  await fillCreateProgramFormOnDialog(formDialog, programName, description);
}

export async function submitCreateProgram(page: Page, dialog?: Locator): Promise<void> {
  await submitCreateProgramDialog(dialog ?? createProgramDialog(page));
}

export async function saveEditProgram(page: Page): Promise<void> {
  await saveProgramButton(editProgramDialog(page)).click();
}

async function clickDeleteWithDialog(
  page: Page,
  programName: string,
  action: 'accept' | 'dismiss',
): Promise<string> {
  const deleteBtn = deleteProgramButton(page, programName);
  await deleteBtn.scrollIntoViewIfNeeded();

  const dialogMessage = await new Promise<string>((resolve, reject) => {
    page.once('dialog', async (dialog) => {
      try {
        const message = dialog.message();
        if (action === 'accept') {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
        resolve(message);
      } catch (error) {
        reject(error);
      }
    });

    deleteBtn.click().catch(reject);
  });

  return dialogMessage;
}

export async function acceptDeleteConfirmation(
  page: Page,
  programName: string,
): Promise<void> {
  const message = await clickDeleteWithDialog(page, programName, 'accept');
  expectDeleteConfirmMessage(message, programName);
}

export async function dismissDeleteConfirmation(
  page: Page,
  programName: string,
): Promise<void> {
  const message = await clickDeleteWithDialog(page, programName, 'dismiss');
  expectDeleteConfirmMessage(message, programName);
}

export async function acceptDeleteConfirmationTwice(
  page: Page,
  programName: string,
): Promise<void> {
  const deleteBtn = deleteProgramButton(page, programName);
  await deleteBtn.scrollIntoViewIfNeeded();

  const message = await new Promise<string>((resolve, reject) => {
    page.once('dialog', async (dialog) => {
      try {
        const text = dialog.message();
        await dialog.accept();
        await dialog.accept().catch(() => {});
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });
    deleteBtn.click().catch(reject);
  });

  expectDeleteConfirmMessage(message, programName);
}

export async function previewDeleteConfirmationMessage(
  page: Page,
  programName: string,
): Promise<string> {
  const message = await clickDeleteWithDialog(page, programName, 'dismiss');
  expectDeleteConfirmMessage(message, programName);
  return message;
}

export async function deleteProgramConfirmed(
  page: Page,
  programName: string,
): Promise<void> {
  await gotoPrograms(page);
  await acceptDeleteConfirmation(page, programName);
  await expectProgramNotListed(page, programName);
}
