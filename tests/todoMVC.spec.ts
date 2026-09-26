import { test, expect, type Page } from '@playwright/test';

const TODO_URL = 'https://demo.playwright.dev/todomvc/';

test.beforeEach(async ({ page }) => {
  await page.goto(TODO_URL);
});

function newTodoInput(page: Page) {
  return page.getByPlaceholder('What needs to be done?');
}

async function addTodo(page: Page, text: string) {
  const input = newTodoInput(page);
  await input.fill(text);
  await input.press('Enter');
}

function todoListItems(page: Page) {
  return page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
}

function todoItem(page: Page, label: string) {
  return todoListItems(page).filter({ hasText: label });
}

test('TC-001: new todo appears in the list after Enter', async ({ page }) => {
  const input = newTodoInput(page);
  await input.click();
  await input.fill('Buy milk');
  await input.press('Enter');

  await expect(page.getByText('Buy milk')).toBeVisible();
  await expect(page.getByText('1 item left')).toBeVisible();
  await expect(input).toHaveValue('');
});

test('TC-002: user can add several todos in one session', async ({ page }) => {
  await addTodo(page, 'Buy milk');
  await addTodo(page, 'Walk the dog');

  const items = todoListItems(page);
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('Buy milk');
  await expect(items.nth(1)).toContainText('Walk the dog');
  await expect(page.getByText('2 items left')).toBeVisible();
});

test('TC-003: todo is marked completed when its checkbox is checked', async ({
  page,
}) => {
  await addTodo(page, 'Buy milk');

  const item = todoItem(page, 'Buy milk');
  const checkbox = item.getByRole('checkbox');
  await checkbox.check();

  await expect(item).toHaveClass(/completed/);
  await expect(checkbox).toBeChecked();
  await expect(page.getByText('0 items left')).toBeVisible();
});

test('TC-004: completed todo can be marked active again', async ({ page }) => {
  await addTodo(page, 'Buy milk');
  const item = todoItem(page, 'Buy milk');
  const checkbox = item.getByRole('checkbox');

  await checkbox.check();
  await checkbox.uncheck();

  await expect(item).not.toHaveClass(/completed/);
  await expect(page.getByText('1 item left')).toBeVisible();
});

test('TC-005: todo is removed when Delete is used', async ({ page }) => {
  await addTodo(page, 'Buy milk');

  const item = todoItem(page, 'Buy milk');
  await item.hover();
  await item.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Buy milk')).not.toBeVisible();
  await expect(page.getByText(/items left/)).not.toBeVisible();
});

test('TC-006: delete removes only the selected todo', async ({ page }) => {
  await addTodo(page, 'Buy milk');
  await addTodo(page, 'Walk the dog');

  const milk = todoItem(page, 'Buy milk');
  await milk.hover();
  await milk.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Buy milk')).not.toBeVisible();
  await expect(page.getByText('Walk the dog')).toBeVisible();
  await expect(page.getByText('1 item left')).toBeVisible();
});

test('TC-007: empty submit does not create a todo', async ({ page }) => {
  const input = newTodoInput(page);
  await input.click();
  await input.press('Enter');

  await expect(todoListItems(page)).toHaveCount(0);
  await expect(page.getByText(/items left/)).not.toBeVisible();
  await expect(input).toBeFocused();
});

test('TC-008: completing a todo does not remove it from the list', async ({
  page,
}) => {
  await addTodo(page, 'Buy milk');

  await todoItem(page, 'Buy milk').getByRole('checkbox').check();

  await expect(page.getByText('Buy milk')).toBeVisible();
  await expect(todoListItems(page)).toHaveCount(1);
});

test('TC-009: deleting a todo does not affect the new-todo input', async ({
  page,
}) => {
  await addTodo(page, 'Buy milk');

  const input = newTodoInput(page);
  await input.fill('Eggs');

  const milk = todoItem(page, 'Buy milk');
  await milk.hover();
  await milk.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Buy milk')).not.toBeVisible();
  await expect(input).toHaveValue('Eggs');
  await expect(page.getByText('Eggs', { exact: true })).not.toBeVisible();
});

test('TC-010: whitespace-only input does not add a visible todo', async ({
  page,
}) => {
  const input = newTodoInput(page);
  await input.fill('   ');
  await input.press('Enter');

  await expect(todoListItems(page)).toHaveCount(0);
  await expect(page.getByText(/items left/)).not.toBeVisible();
});

test('TC-011: todo text with special characters is displayed correctly', async ({
  page,
}) => {
  const text = 'Pay rent & utilities (50%)';
  await addTodo(page, text);

  await expect(page.getByText(text)).toBeVisible();
});

test('TC-012: duplicate todo titles are allowed as separate items', async ({
  page,
}) => {
  await addTodo(page, 'Buy milk');
  await addTodo(page, 'Buy milk');

  await expect(todoItem(page, 'Buy milk')).toHaveCount(2);
  await expect(page.getByText('2 items left')).toBeVisible();
});

test('TC-013: very long todo text is accepted and visible', async ({ page }) => {
  const longText = 'a'.repeat(200);
  await addTodo(page, longText);

  const item = todoListItems(page).first();
  await expect(item).toContainText(longText);
});

test('TC-014: delete completed todo updates active count correctly', async ({
  page,
}) => {
  await addTodo(page, 'Buy milk');
  await addTodo(page, 'Walk the dog');

  await todoItem(page, 'Buy milk').getByRole('checkbox').check();

  const milk = todoItem(page, 'Buy milk');
  await milk.hover();
  await milk.getByRole('button', { name: 'Delete' }).click();

  await expect(page.getByText('Buy milk')).not.toBeVisible();
  await expect(page.getByText('Walk the dog')).toBeVisible();
  await expect(page.getByText('1 item left')).toBeVisible();
});

test('TC-015: emoji and non-Latin characters in todo text', async ({ page }) => {
  const text = '🥛 Lait — achat';
  await addTodo(page, text);

  const item = todoItem(page, text);
  await expect(item).toBeVisible();

  await item.getByRole('checkbox').check();
  await expect(item).toHaveClass(/completed/);

  await item.hover();
  await item.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText(text)).not.toBeVisible();
});
