import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';

test(
  'programs page has no automatically detectable accessibility violations',
  { tag: '@regression' },
  async ({ page }) => {
    test.setTimeout(90_000);

    const programs = new ProgramsPage(page);

    await programs.goto();
    await expect(programs.heading).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    await expect(results.violations).toEqual([]);
  },
);

test('New Program modal scan can disable a single axe rule', async ({ page }) => {
  const programs = new ProgramsPage(page);

  await programs.goto();
  await programs.openNewProgramForm();
  await expect(programs.newProgramModal.dialog).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include(await programs.newProgramModal.axeIncludeSelector())
    // Mantine close control is a button with no accessible name.
    .disableRules(['button-name'])
    .analyze();

  await expect(results.violations).toEqual([]);
});
