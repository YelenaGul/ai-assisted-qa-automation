import dotenv from 'dotenv';
import path from 'path';
import { test, expect } from '@playwright/test';
import {
  login,
  uniqueProgramName,
  createProgram,
  openEditProgramDialog,
  editProgramDialog,
  programNameField,
  descriptionField,
  saveProgramButton,
  cancelEditProgramButton,
  fillEditProgramForm,
  expectProgramListed,
  expectProgramNotListed,
  expectProgramRowDetails,
  saveEditProgram,
  programRows,
} from './helpers/didaxis';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('TC-001: edit form is pre-populated with current program data', async ({ page }) => {
  const programName = uniqueProgramName('Web Development 2026');
  const description = 'Full-stack web development program';
  await createProgram(page, programName, description);

  const dialog = await openEditProgramDialog(page, programName);
  await expect(programNameField(dialog)).toHaveValue(programName);
  await expect(descriptionField(dialog)).toHaveValue(description);
});

test('TC-002: updated program name appears in list after Save', async ({ page }) => {
  const programName = uniqueProgramName('Web Development 2026');
  const updatedName = `${programName} - Updated`;
  await createProgram(page, programName, 'Full-stack web development program');

  const dialog = await openEditProgramDialog(page, programName);
  await fillEditProgramForm(dialog, { programName: updatedName });
  await saveEditProgram(page);

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, updatedName);
  await expectProgramNotListed(page, programName);
});

test('TC-003: name unchanged when only description is edited', async ({ page }) => {
  const programName = uniqueProgramName('Data Science 2026');
  const originalDescription = 'Intro to data science';
  const newDescription = 'Intro to data science — advanced track';
  await createProgram(page, programName, originalDescription);

  const dialog = await openEditProgramDialog(page, programName);
  await fillEditProgramForm(dialog, { description: newDescription });
  await saveEditProgram(page);

  await expect(dialog).toBeHidden();
  await expectProgramRowDetails(page, programName, newDescription);
});

test('TC-004: Save without edits keeps program unchanged', async ({ page }) => {
  const programName = uniqueProgramName('Mobile Apps 2026');
  const description = 'iOS and Android cohort';
  await createProgram(page, programName, description);

  const dialog = await openEditProgramDialog(page, programName);
  await expect(saveProgramButton(dialog)).toBeEnabled();
  await saveEditProgram(page);

  await expect(editProgramDialog(page)).toBeHidden();
  await expectProgramRowDetails(page, programName, description);
});

test('TC-005: empty name on edit cannot be saved', async ({ page }) => {
  const programName = uniqueProgramName('Web Development 2026 - Updated');
  await createProgram(page, programName, 'Edit validation test');

  const dialog = await openEditProgramDialog(page, programName);
  await fillEditProgramForm(dialog, { programName: '' });
  await expect(saveProgramButton(dialog)).toBeDisabled();

  await cancelEditProgramButton(dialog).click();
  await expectProgramListed(page, programName);
});

test('TC-006: renaming to an existing program name', async ({ page }) => {
  const existingName = uniqueProgramName('Web Development 2026 - Updated');
  const otherName = uniqueProgramName('Data Science 2026');
  await createProgram(page, existingName, 'First program');
  await createProgram(page, otherName, 'Second program');

  const dialog = await openEditProgramDialog(page, otherName);
  await fillEditProgramForm(dialog, { programName: existingName });
  await saveProgramButton(dialog).click();
  await page.waitForTimeout(1500);

  if (await editProgramDialog(page).isVisible()) {
    await page.keyboard.press('Escape');
    await expect(editProgramDialog(page)).toBeHidden({ timeout: 10_000 });
  }

  const duplicateCount = await programRows(page, existingName).count();
  expect(duplicateCount).toBeGreaterThanOrEqual(1);
  expect(duplicateCount).toBeLessThanOrEqual(2);
});

test('TC-007: Cancel discards unsaved name change', async ({ page }) => {
  const programName = uniqueProgramName('Cloud Computing 2026');
  await createProgram(page, programName, 'Cloud basics');

  const dialog = await openEditProgramDialog(page, programName);
  const rejectedName = uniqueProgramName('Should Not Persist');
  await fillEditProgramForm(dialog, { programName: rejectedName });
  await cancelEditProgramButton(dialog).click();

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, programName);
  await expectProgramNotListed(page, rejectedName);
});

test('TC-008: special characters preserved on edit', async ({ page }) => {
  const programName = uniqueProgramName('Legacy Program 2025');
  await createProgram(page, programName, 'Original description');

  const updatedName = uniqueProgramName('Informatique & IA — Niveau 2 (2026)');
  const updatedDescription = 'Cours: "advanced" & <basics>';

  const dialog = await openEditProgramDialog(page, programName);
  await fillEditProgramForm(dialog, {
    programName: updatedName,
    description: updatedDescription,
  });
  await saveEditProgram(page);

  await expect(dialog).toBeHidden();
  await expectProgramRowDetails(page, updatedName, updatedDescription);
});

test('TC-009: 100-character program name saves on edit', async ({ page }) => {
  const programName = uniqueProgramName('Max Length Edit Test');
  await createProgram(page, programName, 'Length boundary check');

  const longName = 'X'.repeat(100);
  const dialog = await openEditProgramDialog(page, programName);
  await fillEditProgramForm(dialog, { programName: longName });
  await saveEditProgram(page);

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, longName);
  await expectProgramNotListed(page, programName);
});

test('TC-010: whitespace-only name on edit cannot be saved', async ({ page }) => {
  const programName = uniqueProgramName('Web Development 2026 - Updated');
  await createProgram(page, programName, 'Whitespace validation');

  const dialog = await openEditProgramDialog(page, programName);
  await fillEditProgramForm(dialog, { programName: '   ' });
  await expect(saveProgramButton(dialog)).toBeDisabled();

  await cancelEditProgramButton(dialog).click();
  await expectProgramListed(page, programName);
});

test('TC-011: leading and trailing spaces trimmed on edit save', async ({ page }) => {
  const programName = uniqueProgramName('UX Design 2026');
  await createProgram(page, programName, 'Trim behavior');

  const trimmedName = `${programName} Pro`;
  const dialog = await openEditProgramDialog(page, programName);
  await fillEditProgramForm(dialog, { programName: `  ${trimmedName}  ` });
  await saveEditProgram(page);

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, trimmedName);
  await expectProgramNotListed(page, programName);
});
