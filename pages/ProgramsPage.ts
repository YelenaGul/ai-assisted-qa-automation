import { type Locator, type Page } from '@playwright/test';
import {
  programIdFromCreateResponse,
  waitForProgramCreateResponse,
} from '../tests/helpers/didaxis-api';
import { didaxisBaseUrl } from '../tests/helpers/didaxis-env';
import { NewProgramModal } from './NewProgramModal';

export class ProgramsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly main: Locator;
  readonly newProgramButton: Locator;
  readonly table: Locator;
  readonly newProgramModal: NewProgramModal;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Programs' });
    this.main = page.getByRole('main');
    this.newProgramButton = this.main.getByRole('button', { name: /new program/i });
    this.table = this.main.getByRole('table');
    this.newProgramModal = new NewProgramModal(page);
  }

  programRow(programName: string): Locator {
    return this.table.getByRole('row').filter({
      has: this.page.getByText(programName, { exact: true }),
    });
  }

  programNameInList(programName: string): Locator {
    return this.main.getByText(programName, { exact: true });
  }

  /**
   * Full program-name text, including leading and trailing spaces.
   * getByText({ exact: true }) trims whitespace, so "  Name  " and "Name" match the same element.
   */
  programNameWithExactSpacing(programName: string): Locator {
    const escaped = programName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.main.getByText(new RegExp(`^${escaped}$`));
  }

  async goto(): Promise<void> {
    await this.page.goto(`${didaxisBaseUrl()}/programs`);
  }

  async openNewProgramForm(): Promise<void> {
    await this.newProgramButton.click();
  }

  async gotoAndOpenNewProgramForm(): Promise<void> {
    await this.goto();
    await this.openNewProgramForm();
  }

  async fillNewProgramForm(programName: string, description: string): Promise<void> {
    await this.newProgramModal.programName.fill(programName);
    await this.newProgramModal.description.fill(description);
  }

  async submitNewProgramForm(createResponseTimeout?: number): Promise<string | null> {
    const createResponsePromise = waitForProgramCreateResponse(
      this.page,
      createResponseTimeout,
    ).catch(() => null);
    await this.newProgramModal.createButton.click();
    const response = await createResponsePromise;
    if (!response) {
      return null;
    }
    return programIdFromCreateResponse(response);
  }

  async createProgram(programName: string, description: string): Promise<string> {
    await this.gotoAndOpenNewProgramForm();
    await this.fillNewProgramForm(programName, description);
    const programId = await this.submitNewProgramForm();
    if (!programId) {
      throw new Error('Program create did not return an id');
    }
    return programId;
  }

  async attemptCreateProgram(
    programName: string,
    description: string,
    createResponseTimeout?: number,
  ): Promise<string | null> {
    await this.gotoAndOpenNewProgramForm();
    await this.fillNewProgramForm(programName, description);
    return this.submitNewProgramForm(createResponseTimeout);
  }

  deleteProgramButton(programName: string): Locator {
    return this.programRow(programName).getByRole('button', {
      name: `Delete ${programName}`,
    });
  }

  /**
   * Native window.confirm — Didaxis delete does not use a Mantine dialog.
   */
  private async clickDeleteWithNativeConfirm(
    programName: string,
    action: 'accept' | 'dismiss',
  ): Promise<string> {
    const deleteBtn = this.deleteProgramButton(programName);
    await deleteBtn.scrollIntoViewIfNeeded();

    return new Promise<string>((resolve, reject) => {
      this.page.once('dialog', async (dialog) => {
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
  }

  async confirmDelete(programName: string): Promise<string> {
    return this.clickDeleteWithNativeConfirm(programName, 'accept');
  }

  async cancelDelete(programName: string): Promise<string> {
    return this.clickDeleteWithNativeConfirm(programName, 'dismiss');
  }
}
