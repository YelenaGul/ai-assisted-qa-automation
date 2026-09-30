import { test, expect } from '@playwright/test';
import {
  login,
  uniqueProgramName,
  gotoPrograms,
  openNewProgramModal,
  createProgramDialog,
  newProgramButton,
  programNameField,
  descriptionField,
  createProgramButton,
  expectProgramListed,
  programsMain,
} from './helpers/didaxis';

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('TC-001: program creation form shows Program Name and Description', async ({
  page,
}) => {
  await gotoPrograms(page);
  await newProgramButton(page).click();

  const dialog = createProgramDialog(page);
  await expect(dialog).toBeVisible();
  await expect(programNameField(dialog)).toBeVisible();
  await expect(descriptionField(dialog)).toBeVisible();
  await expect(createProgramButton(dialog)).toBeVisible();
});

test('TC-002: created program appears in the list and modal closes', async ({
  page,
}) => {
  const programName = uniqueProgramName('Web Development 2026');
  const description = 'Full-stack web development program';

  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill(description);
  await createProgramButton(dialog).click();

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, programName);
});

test('TC-003: Create is disabled when Program Name is empty', async ({ page }) => {
  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill('');
  await descriptionField(dialog).fill('Optional description');

  await expect(createProgramButton(dialog)).toBeDisabled();
});

test('TC-004: program can be created with empty Description', async ({ page }) => {
  const programName = uniqueProgramName('Program No Description');

  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill('');
  await createProgramButton(dialog).click();

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, programName);
});

test('TC-005: program name with special characters is accepted and visible', async ({
  page,
}) => {
  const programName = uniqueProgramName('Pay & Learn (50%) — QA');
  const description = 'Special characters in title';

  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill(description);
  await createProgramButton(dialog).click();

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, programName);
});

test('TC-006: long program name is accepted and visible', async ({ page }) => {
  const programName = uniqueProgramName(`Long-${'a'.repeat(100)}`);

  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill('Boundary length check');
  await createProgramButton(dialog).click();

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, programName);
});

test('TC-007: duplicate program titles can exist as separate list entries', async ({
  page,
}) => {
  const programName = uniqueProgramName('Duplicate Title Test');
  const description = 'First instance';

  await openNewProgramModal(page);
  let dialog = createProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill(description);
  await createProgramButton(dialog).click();
  await expectProgramListed(page, programName);

  await newProgramButton(page).click();
  dialog = createProgramDialog(page);
  await programNameField(dialog).fill(programName);
  await descriptionField(dialog).fill('Second instance');
  await createProgramButton(dialog).click();

  await expect(dialog).toBeHidden();
  await expectProgramListed(page, programName, 2);
});

test('TC-008: whitespace-only Program Name does not create a program', async ({
  page,
}) => {
  const whitespaceName = '   ';

  await openNewProgramModal(page);
  const dialog = createProgramDialog(page);
  await programNameField(dialog).fill(whitespaceName);

  const createButton = createProgramButton(dialog);
  if (await createButton.isDisabled()) {
    await expect(createButton).toBeDisabled();
    return;
  }

  await createButton.click();
  await expect(programNameField(dialog)).toBeVisible();
  await expect(programsMain(page).getByText(whitespaceName, { exact: true })).not.toBeVisible();
});
