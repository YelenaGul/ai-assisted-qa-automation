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
      /already exists|duplicate|name.*taken/i,
    );
  }
}
