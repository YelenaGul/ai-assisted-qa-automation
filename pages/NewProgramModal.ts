import { type Locator, type Page } from '@playwright/test';

export class NewProgramModal {
  readonly dialog: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly createButton: Locator;
  readonly nameValidationError: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'New Program' });
    this.programName = this.dialog.getByRole('textbox', { name: /program name/i });
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.createButton = this.dialog.getByRole('button', { name: 'Create' });
    this.nameValidationError = this.dialog.getByText(
      /already exists|duplicate|name.*taken|too long|maximum|exceeds|100 character/i,
    );
  }

  /**
   * CSS selector for AxeBuilder.include(). Axe accepts selectors, not Playwright locators.
   * Derived from this dialog's role and accessible name (aria-labelledby or aria-label).
   */
  async axeIncludeSelector(): Promise<string> {
    return this.dialog.evaluate((element) => {
      const explicitRole = element.getAttribute('role');
      const root = explicitRole ? `[role="${explicitRole}"]` : element.tagName.toLowerCase();
      const escapeAttr = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        return `${root}[aria-labelledby="${escapeAttr(labelledBy)}"]`;
      }
      const label = element.getAttribute('aria-label');
      if (label) {
        return `${root}[aria-label="${escapeAttr(label)}"]`;
      }
      throw new Error(
        'New Program dialog is missing aria-labelledby or aria-label, so the axe scan cannot be scoped to it.',
      );
    });
  }
}
