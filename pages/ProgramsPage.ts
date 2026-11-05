import { type Dialog, type Locator, type Page } from '@playwright/test';
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

  /** Delete action — visible after hovering the program row (card overflow:hidden). */
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

  /** Reveals off-canvas row actions (Mantine Card overflow:hidden). */
  async hoverProgramRow(programName: string): Promise<void> {
    const row = this.programRow(programName);
    await row.scrollIntoViewIfNeeded();
    await row.hover();
  }

  /**
   * Double-clicks Delete and handles every native confirm that appears.
   * Returns dialog count/messages for the spec to assert — no expect() here.
   * Accepts or dismisses every dialog so a known double-confirm bug does not flake.
   */
  async doubleClickDeleteAndCollectDialogs(
    programName: string,
    action: 'accept' | 'dismiss',
  ): Promise<{ count: number; messages: string[] }> {
    const messages: string[] = [];
    let chain: Promise<void> = Promise.resolve();
    const deleteBtn = this.deleteProgramButton(programName);

    const onDialog = (dialog: Dialog) => {
      chain = chain.then(async () => {
        messages.push(dialog.message());
        if (action === 'accept') {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
      });
    };

    await this.hoverProgramRow(programName);
    this.page.on('dialog', onDialog);
    try {
      await deleteBtn.dblclick();
      await chain;
      // Allow a follow-up confirm (DS-262) to enqueue before removing the listener.
      await new Promise<void>((resolve) => setTimeout(resolve, 400));
      await chain;
    } finally {
      this.page.off('dialog', onDialog);
    }

    return { count: messages.length, messages };
  }
}
