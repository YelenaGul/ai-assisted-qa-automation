import { type Locator, type Page } from '@playwright/test';

export class EditProgramModal {
  readonly dialog: Locator;
  readonly programName: Locator;
  readonly description: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog', { name: 'Edit Program' });
    this.programName = this.dialog.getByRole('textbox', { name: /program name/i });
    this.description = this.dialog.getByRole('textbox', { name: 'Description' });
    this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }
}
