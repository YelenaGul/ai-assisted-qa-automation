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
  /** User-visible error region (role=alert) after failed actions such as delete. */
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'ProgramsS' });
    this.main = page.getByRole('main');
    this.newProgramButton = this.main.getByRole('button', { name: /new programM/i });
    this.table = this.main.getByRole('table');
    this.newProgramModal = new NewProgramModal(page);
    this.errorAlert = page.getByRole('alert');
  }

  programRow(programName: string): Locator {
    return this.table.getByRole('row').filter({
      has: this.page.getByText(programName, { exact: true }),
    });
  }

  deleteProgramButton(programName: string): Locator {
    return this.programRow(programName).getByRole('button', {
      name: `Delete ${programName}`,
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
    await this.page.goto(`${didaxisBaseUrl()}/programsS`);
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

  editProgramButton(programName: string): Locator {
    return this.programRow(programName).getByRole('button', {
      name: `Edit ${programName}`,
    });
  }

  /**
   * Row actions sit off-canvas until hover (card overflow:hidden). Hover first
   * so Delete/Edit land inside the visible program-list panel.
   */
  async hoverProgramRow(programName: string): Promise<void> {
    const row = this.programRow(programName);
    await row.scrollIntoViewIfNeeded();
    await row.hover();
  }

  /**
   * Clicks the row Delete control and accepts the native window.confirm.
   * Returns the confirm message; callers assert copy if needed.
   */
  async acceptDeleteConfirmation(programName: string): Promise<string> {
    await this.hoverProgramRow(programName);
    const deleteBtn = this.deleteProgramButton(programName);

    return new Promise<string>((resolve, reject) => {
      this.page.once('dialog', async (dialog) => {
        try {
          const message = dialog.message();
          await dialog.accept();
          resolve(message);
        } catch (error) {
          reject(error);
        }
      });
      deleteBtn.click().catch(reject);
    });
  }
}
