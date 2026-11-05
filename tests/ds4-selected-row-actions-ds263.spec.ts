import { type Locator, type Page } from '@playwright/test';
import { test, expect } from '../fixtures/didaxis.fixture';
import {
  uniqueProgramName,
  createProgram,
  gotoPrograms,
  programRow,
  deleteProgramButton,
  editProgramButton,
  programsMain,
} from './helpers/didaxis';

/**
 * Mantine Card that wraps the programs table (overflow:hidden clips row actions).
 * No accessible name — class filter scoped via table (SPEC-only; prefer pages/ later).
 * Use page.getByRole('table') in `has` (not programsTable): programsTable is rooted at
 * main, so a relative has would look for main inside the card and match nothing.
 */
function programsListCard(page: Page): Locator {
  return programsMain(page)
    .locator('.mantine-Card-root')
    .filter({ has: page.getByRole('table') });
}

type Box = { x: number; y: number; width: number; height: number };

async function boundingBoxOrThrow(locator: Locator, label: string): Promise<Box> {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(`Expected ${label} to have a bounding box`);
  }
  return box;
}

function expectBoxWithinCard(inner: Box, card: Box, label: string): void {
  expect(inner.x, `${label} left`).toBeGreaterThanOrEqual(card.x);
  expect(inner.y, `${label} top`).toBeGreaterThanOrEqual(card.y);
  expect(inner.x + inner.width, `${label} right`).toBeLessThanOrEqual(card.x + card.width);
  expect(inner.y + inner.height, `${label} bottom`).toBeLessThanOrEqual(card.y + card.height);
}

test(
  'DS-263: selected program row keeps edit and delete icons inside the list card',
  { tag: ['@programs-selected-row-actions'] },
  async ({ page, trackProgram }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const programName = uniqueProgramName('DS263 Clip Probe');
    await createProgram(page, programName, 'Selected-row action clip probe', trackProgram);
    await gotoPrograms(page);

    const row = programRow(page, programName);
    await row.click();
    await row.hover();

    const deleteBtn = deleteProgramButton(page, programName);
    const editBtn = editProgramButton(page, programName);
    await expect(deleteBtn).toBeVisible();
    await expect(editBtn).toBeVisible();

    const card = programsListCard(page);
    await expect(card).toBeVisible();

    const cardBox = await boundingBoxOrThrow(card, 'programs list card');
    const deleteBox = await boundingBoxOrThrow(deleteBtn, 'Delete button');
    const editBox = await boundingBoxOrThrow(editBtn, 'Edit button');

    expectBoxWithinCard(deleteBox, cardBox, 'Delete button');
    expectBoxWithinCard(editBox, cardBox, 'Edit button');
    expect(deleteBox.x + deleteBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width);
  },
);

test(
  'DS-263: unselected hover still shows reachable delete icon',
  { tag: ['@programs-row-actions-hover'] },
  async ({ page, trackProgram }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const programName = uniqueProgramName('DS263 Clip Probe');
    await createProgram(page, programName, 'Unselected hover baseline', trackProgram);
    await gotoPrograms(page);

    const row = programRow(page, programName);
    await row.hover();

    const deleteBtn = deleteProgramButton(page, programName);
    await expect(deleteBtn).toBeVisible();

    const card = programsListCard(page);
    await expect(card).toBeVisible();

    const cardBox = await boundingBoxOrThrow(card, 'programs list card');
    const deleteBox = await boundingBoxOrThrow(deleteBtn, 'Delete button');
    expectBoxWithinCard(deleteBox, cardBox, 'Delete button');
  },
);
