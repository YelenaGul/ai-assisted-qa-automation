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

  editProgramButton(programName: string): Locator {
    return this.programRow(programName).getByRole('button', {
      name: `Edit ${programName}`,
    });
  }

  deleteProgramButton(programName: string): Locator {
    return this.programRow(programName).getByRole('button', {
      name: `Delete ${programName}`,
    });
  }

  /**
   * Hover a program row so Edit/Delete actions become reachable.
   * Hover the name text — the row box is extremely wide (~table scroll width),
   * so hovering the row center lands outside the overflow:hidden card.
   */
  async hoverProgramRow(programName: string): Promise<void> {
    const name = this.programRow(programName).getByText(programName, { exact: true });
    await name.scrollIntoViewIfNeeded();
    await name.hover();
  }

  /**
   * Select a program by clicking its name (not Edit/Delete), opening the semester panel.
   */
  async selectProgramRow(programName: string): Promise<void> {
    const nameCell = this.programRow(programName).getByText(programName, { exact: true });
    await nameCell.scrollIntoViewIfNeeded();
    await nameCell.click();
  }

  /**
   * Bounding metrics for Edit/Delete vs the nearest overflow:hidden card around the row.
   * Re-hovers the row immediately before measuring so actions are on-canvas.
   * No assertions — specs interpret the booleans.
   */
  async rowActionGeometry(programName: string): Promise<{
    cardRight: number;
    editX: number;
    deleteX: number;
    editInPanel: boolean;
    deleteInPanel: boolean;
  }> {
    await this.hoverProgramRow(programName);

    const metrics = await this.programRow(programName).evaluate((rowEl) => {
      let node: Element | null = rowEl;
      let cardRight: number | null = null;
      while (node && node !== document.documentElement) {
        const style = window.getComputedStyle(node);
        if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
          cardRight = node.getBoundingClientRect().right;
          break;
        }
        node = node.parentElement;
      }
      if (cardRight == null) {
        throw new Error('No overflow:hidden ancestor found for program row');
      }

      const buttons = Array.from(rowEl.querySelectorAll('button'));
      const edit = buttons.find((b) =>
        (b.getAttribute('aria-label') || '').startsWith('Edit'),
      );
      const del = buttons.find((b) =>
        (b.getAttribute('aria-label') || '').startsWith('Delete'),
      );
      if (!edit || !del) {
        throw new Error('Edit/Delete buttons not found on program row');
      }
      const editRect = edit.getBoundingClientRect();
      const deleteRect = del.getBoundingClientRect();
      const tolerance = 1;
      return {
        cardRight,
        editX: editRect.x,
        deleteX: deleteRect.x,
        editInPanel: editRect.right <= cardRight + tolerance,
        deleteInPanel: deleteRect.right <= cardRight + tolerance,
      };
    });

    return metrics;
  }

  /**
   * Hover the row, click Delete, and dismiss the native confirm dialog.
   * Returns the dialog message for the caller to assert.
   */
  async dismissDeleteConfirmation(programName: string): Promise<string> {
    await this.hoverProgramRow(programName);
    const deleteBtn = this.deleteProgramButton(programName);

    return new Promise<string>((resolve, reject) => {
      this.page.once('dialog', async (dialog) => {
        try {
          const message = dialog.message();
          await dialog.dismiss();
          resolve(message);
        } catch (error) {
          reject(error);
        }
      });
      deleteBtn.click().catch(reject);
    });
  }
}
