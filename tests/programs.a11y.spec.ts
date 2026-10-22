import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures/didaxis.fixture';
import { reportAxeInformative } from './helpers/axe-informative';
import { ProgramsPage } from '../pages/ProgramsPage';

test(
  'programs page axe scan (informative)',
  { tag: ['@a11y', '@informative'] },
  async ({ page }, testInfo) => {
    test.setTimeout(90_000);

    const programs = new ProgramsPage(page);

    await programs.goto();
    await expect(programs.heading).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    await reportAxeInformative(testInfo, results, 'programs-page');
  },
);

test(
  'New Program modal axe scan (informative)',
  { tag: ['@a11y', '@informative'] },
  async ({ page }, testInfo) => {
    const programs = new ProgramsPage(page);

    await programs.goto();
    await programs.openNewProgramForm();
    await expect(programs.newProgramModal.dialog).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include(await programs.newProgramModal.axeIncludeSelector())
      // Mantine close control is a button with no accessible name.
      .disableRules(['button-name'])
      .analyze();

    await reportAxeInformative(testInfo, results, 'new-program-modal');
  },
);
