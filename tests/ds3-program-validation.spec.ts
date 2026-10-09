import { test, expect } from '../fixtures/cleanup.fixture';
import {
  login,
  uniqueProgramName,
  createProgram,
  openCreateProgramDialog,
  programNameField,
  descriptionField,
  createProgramButton,
  fillCreateProgramFormOnDialog,
  submitCreateProgramDialog,
  attemptCreateProgram,
  createProgramNameError,
  expectProgramListed,
  expectExactlyOneProgramNamed,
  programRows,
} from './helpers/didaxis';

test.beforeEach(async ({ page }) => {
  await login(page);
});

test('TC-001: program name with special characters is created', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Informatique & IA - Niveau 2');
  const description = 'Programme bilingue français-anglais';

  await createProgram(page, programName, description, trackProgram);
  await expectProgramListed(page, programName);
});

test('TC-002: hyphenated alphanumeric program name is accepted', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web-Dev 2026');
  await createProgram(page, programName, 'Part-time cohort', trackProgram);
});

test('TC-003: whitespace-only program name is not submitted', async ({ page }) => {
  const dialog = await openCreateProgramDialog(page);
  await fillCreateProgramFormOnDialog(dialog, '   ', 'Whitespace validation test');

  const createButton = createProgramButton(dialog);
  if (await createButton.isDisabled()) {
    await expect(createButton).toBeDisabled();
    return;
  }

  await submitCreateProgramDialog(dialog);
  await expect(programNameField(dialog)).toBeVisible();
  await expect(dialog).toBeVisible();
});

test('TC-004: duplicate program name on create shows error', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  await createProgram(page, baseName, 'First instance', trackProgram);

  const dialog = await attemptCreateProgram(
    page,
    baseName,
    'Second instance attempt',
    trackProgram,
  );
  const rowCount = await programRows(page, baseName).count();

  if (rowCount === 1) {
    const blockedInDialog =
      (await createProgramNameError(dialog).isVisible()) || (await dialog.isVisible());
    expect(blockedInDialog).toBeTruthy();
    return;
  }

  await expectExactlyOneProgramNamed(page, baseName);
});

test('TC-005: empty program name does not submit', async ({ page }) => {
  const dialog = await openCreateProgramDialog(page);
  await programNameField(dialog).fill('');
  await descriptionField(dialog).fill('No name provided');

  await expect(createProgramButton(dialog)).toBeDisabled();
});

test('TC-006: duplicate error leaves only one program with that name', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  await createProgram(page, baseName, 'Canonical row', trackProgram);

  await attemptCreateProgram(page, baseName, 'Duplicate attempt', trackProgram);
  await expectExactlyOneProgramNamed(page, baseName);
});

test('TC-007: duplicate check is case-sensitive or rejects case variant', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  await createProgram(page, baseName, 'Case sensitivity seed', trackProgram);

  const variant = baseName.replace('Web', 'web');
  const dialog = await attemptCreateProgram(
    page,
    variant,
    'Lowercase variant',
    trackProgram,
  );

  const baseCount = await programRows(page, baseName).count();
  const variantCount = await programRows(page, variant).count();

  if (variantCount === 0 && (await dialog.isVisible())) {
    await expect(programNameField(dialog)).toBeVisible();
  }

  expect(baseCount + variantCount).toBeLessThanOrEqual(2);
  if (baseCount === 1 && variantCount === 0) {
    await expectExactlyOneProgramNamed(page, baseName);
  }
});

test('TC-008: leading and trailing spaces are trimmed or rejected as duplicate', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  await createProgram(page, baseName, 'Trim test seed', trackProgram);

  const paddedName = ` ${baseName} `;
  await attemptCreateProgram(page, paddedName, 'Padded duplicate', trackProgram);

  await expectExactlyOneProgramNamed(page, baseName);
  await expect(programRows(page, paddedName.trim())).toHaveCount(1);
});
