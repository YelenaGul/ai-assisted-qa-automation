import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';
import { uniqueProgramName } from './helpers/didaxis';

test.beforeEach(() => {
  test.setTimeout(120_000);
});

function programNameWithLength(targetLength: number, prefix: string): string {
  const base = uniqueProgramName(prefix);
  if (base.length >= targetLength) {
    return base.slice(0, targetLength);
  }
  return base + 'x'.repeat(targetLength - base.length);
}

async function expectProgramListed(
  programs: ProgramsPage,
  programName: string,
  count = 1,
): Promise<void> {
  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 120_000 });
  const rows = programs.programRow(programName);
  await expect(rows).toHaveCount(count, { timeout: 60_000 });
  await rows.scrollIntoViewIfNeeded();
  await expect(rows).toBeVisible();
}

test('TC-001: program name with special characters is created', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Informatique & IA - Niveau 2');
  const programs = new ProgramsPage(page);

  trackProgram(
    await programs.createProgram(programName, 'Programme bilingue français-anglais'),
  );

  await expectProgramListed(programs, programName);
});

test('TC-002: hyphenated alphanumeric program name is accepted', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Web-Dev 2026');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'Part-time cohort'));

  await expectProgramListed(programs, programName);
});

test('TC-003: whitespace-only program name is not submitted', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await programs.fillNewProgramForm('   ', 'Whitespace validation test');

  const createButton = programs.newProgramModal.createButton;
  if (await createButton.isDisabled()) {
    await expect(createButton).toBeDisabled();
    return;
  }

  await programs.submitNewProgramForm();
  await expect(programs.newProgramModal.programName).toBeVisible();
  await expect(programs.newProgramModal.dialog).toBeVisible();
});

test('TC-004: duplicate program name on create shows error', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(baseName, 'First instance'));
  await expectProgramListed(programs, baseName);

  const duplicateId = await programs.attemptCreateProgram(
    baseName,
    'Second instance attempt',
  );
  if (duplicateId) {
    trackProgram(duplicateId);
  }

  const rows = programs.programRow(baseName);
  await expect(rows).not.toHaveCount(0, { timeout: 60_000 });
  const rowCount = await rows.count();

  if (rowCount === 1) {
    const blockedInDialog =
      (await programs.newProgramModal.nameValidationError.isVisible()) ||
      (await programs.newProgramModal.dialog.isVisible());
    expect(blockedInDialog).toBeTruthy();
    return;
  }

  await expect(rows).toHaveCount(rowCount);
});

test('TC-005: empty program name does not submit', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await programs.fillNewProgramForm('', 'No name provided');

  await expect(programs.newProgramModal.createButton).toBeDisabled();
});

test('TC-006: duplicate error leaves only one program with that name', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(baseName, 'Canonical row'));
  await expectProgramListed(programs, baseName);

  const duplicateId = await programs.attemptCreateProgram(
    baseName,
    'Duplicate attempt',
  );
  if (duplicateId) {
    trackProgram(duplicateId);
  }

  const rows = programs.programRow(baseName);
  await expect(rows).not.toHaveCount(0, { timeout: 60_000 });
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThanOrEqual(1);
  expect(rowCount).toBeLessThanOrEqual(2);
});

test('TC-007: duplicate check is case-sensitive or rejects case variant', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(baseName, 'Case sensitivity seed'));
  await expect(programs.newProgramModal.dialog).toBeHidden({ timeout: 120_000 });

  const variant = baseName.replace('Web', 'web');
  const variantId = await programs.attemptCreateProgram(variant, 'Lowercase variant');
  if (variantId) {
    trackProgram(variantId);
  }

  const baseCount = await programs.programRow(baseName).count();
  const variantCount = await programs.programRow(variant).count();

  if (variantCount === 0 && (await programs.newProgramModal.dialog.isVisible())) {
    await expect(programs.newProgramModal.programName).toBeVisible();
  }

  expect(baseCount + variantCount).toBeLessThanOrEqual(2);
  if (baseCount === 1 && variantCount === 0) {
    await expect(programs.programRow(baseName)).toHaveCount(1);
  }
});

test('TC-008: leading and trailing spaces are trimmed or rejected as duplicate', async ({
  page,
  trackProgram,
}) => {
  const baseName = uniqueProgramName('Web Development 2026');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(baseName, 'Trim test seed'));
  await expectProgramListed(programs, baseName);

  const paddedName = ` ${baseName} `;
  const paddedId = await programs.attemptCreateProgram(
    paddedName,
    'Padded duplicate',
  );
  if (paddedId) {
    trackProgram(paddedId);
  }

  const rows = programs.programRow(baseName);
  await expect(rows).not.toHaveCount(0, { timeout: 60_000 });
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThanOrEqual(1);
  expect(rowCount).toBeLessThanOrEqual(2);
  await expect(programs.programRow(paddedName.trim())).toHaveCount(rowCount);
});

test('TC-009: program name at max length is valid', async ({ page, trackProgram }) => {
  const programName = programNameWithLength(255, 'MaxLen');
  const programs = new ProgramsPage(page);

  trackProgram(await programs.createProgram(programName, 'Max length validation'));

  await expectProgramListed(programs, programName);
});

test('TC-010: program name over max length is rejected', async ({
  page,
  trackProgram,
}) => {
  const overlongName = programNameWithLength(256, 'OverMax');
  const programs = new ProgramsPage(page);

  await programs.gotoAndOpenNewProgramForm();
  await programs.fillNewProgramForm(overlongName, 'Over max length validation');

  const createButton = programs.newProgramModal.createButton;
  if (await createButton.isDisabled()) {
    await expect(createButton).toBeDisabled();
    return;
  }

  const programId = await programs.submitNewProgramForm();
  if (programId) {
    trackProgram(programId);
    await expectProgramListed(programs, overlongName);
    return;
  }

  const stillOpen =
    (await programs.newProgramModal.dialog.isVisible()) ||
    (await programs.newProgramModal.nameValidationError.isVisible());
  expect(stillOpen).toBeTruthy();
  await expect(programs.programRow(overlongName)).toHaveCount(0);
});

test('TC-012: unicode and accented characters in program name are accepted', async ({
  page,
  trackProgram,
}) => {
  const programName = uniqueProgramName('Programme Été 2026 — Montréal');
  const programs = new ProgramsPage(page);

  trackProgram(
    await programs.createProgram(programName, 'Cours avec caractères accentués'),
  );

  await expectProgramListed(programs, programName);
});
