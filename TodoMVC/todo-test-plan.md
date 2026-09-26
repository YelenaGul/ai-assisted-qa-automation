# Test Plan: TodoMVC (Playwright Demo)

**Application:** [https://demo.playwright.dev/todomvc/](https://demo.playwright.dev/todomvc/)  
**Scope:** Add, complete, and delete todo items  
**Acceptance criteria covered:** add item, complete item, delete item

---

## Positive flows

### TC-001 — New todo appears in the list after Enter

**Preconditions**

- Browser is open on the TodoMVC demo.
- The todo list is empty (no items under **todos**).

**Steps**

1. Click the field **What needs to be done?**.
2. Type `Buy milk`.
3. Press **Enter**.

**Expected result**

- One row appears in the todo list with label **Buy milk**.
- The footer shows **1 item left**.
- The input **What needs to be done?** is empty and ready for another entry.

---

### TC-002 — User can add several todos in one session

**Preconditions**

- User is on the TodoMVC demo with an empty list.

**Steps**

1. Add `Buy milk` via **What needs to be done?** and **Enter**.
2. Add `Walk the dog` the same way.

**Expected result**

- Both **Buy milk** and **Walk the dog** are visible in the list (order: first added on top).
- The footer shows **2 items left**.

---

### TC-003 — Todo is marked completed when its checkbox is checked

**Preconditions**

- Todo **Buy milk** exists in the list and is not completed.

**Steps**

1. Click the round toggle checkbox for **Buy milk**.

**Expected result**

- **Buy milk** shows as completed (strikethrough / `completed` styling).
- The checkbox for that row is checked.
- The footer shows **0 items left**.

---

### TC-004 — Completed todo can be marked active again

**Preconditions**

- Todo **Buy milk** exists and is completed.

**Steps**

1. Click the checkbox for **Buy milk** again.

**Expected result**

- **Buy milk** is no longer styled as completed.
- The footer shows **1 item left**.

---

### TC-005 — Todo is removed when Delete is used

**Preconditions**

- Todo **Buy milk** exists in the list (active or completed).

**Steps**

1. Hover the row for **Buy milk** (if needed to reveal controls).
2. Click **Delete** (×) on that row.

**Expected result**

- **Buy milk** is no longer in the list.
- If it was the only item, the footer and filter bar are hidden.
- No error message is shown.

---

### TC-006 — Delete removes only the selected todo

**Preconditions**

- Todos **Buy milk** and **Walk the dog** exist in the list.

**Steps**

1. Delete **Buy milk** using **Delete** (×).

**Expected result**

- **Buy milk** is removed.
- **Walk the dog** remains in the list.
- The footer shows **1 item left**.

---

## Negative flows

### TC-007 — Empty submit does not create a todo

**Preconditions**

- The list is empty.

**Steps**

1. Click **What needs to be done?**.
2. Press **Enter** without typing text.

**Expected result**

- No new row appears in the list.
- The footer/counter section stays hidden.
- The input remains focused in **What needs to be done?**.

---

### TC-008 — Completing a todo does not remove it from the list

**Preconditions**

- Active todo **Buy milk** exists.

**Steps**

1. Check the completion checkbox for **Buy milk**.

**Expected result**

- **Buy milk** is still visible in the list (completed state).
- **Buy milk** is not deleted and no **Delete** action was required for this step.

---

### TC-009 — Deleting a todo does not affect the new-todo input

**Preconditions**

- Todo **Buy milk** exists.

**Steps**

1. Type `Eggs` in **What needs to be done?** but do not press **Enter**.
2. Delete **Buy milk** with **Delete** (×).

**Expected result**

- **Buy milk** is removed from the list.
- **What needs to be done?** still contains `Eggs`; `Eggs` was not added to the list.

---

## Edge cases

### TC-010 — Whitespace-only input is rejected or does not add a visible todo

**Preconditions**

- The list is empty.

**Steps**

1. In **What needs to be done?**, type three spaces `   `.
2. Press **Enter**.

**Expected result**

- No meaningful todo row is added (empty list or no row with only spaces).
- The counter does not show active items for whitespace-only entries.

---

### TC-011 — Todo text with special characters is stored and displayed correctly

**Preconditions**

- The list is empty.

**Steps**

1. Add `Pay rent & utilities (50%)` via **What needs to be done?** and **Enter**.

**Expected result**

- The list shows exactly **Pay rent & utilities (50%)** (no HTML/script execution, no broken layout).

---

### TC-012 — Duplicate todo titles are allowed as separate items

**Preconditions**

- The list is empty.

**Steps**

1. Add `Buy milk`.
2. Add `Buy milk` again.

**Expected result**

- Two separate rows both labeled **Buy milk** appear.
- The footer shows **2 items left**.

---

### TC-013 — Very long todo text is accepted and visible

**Preconditions**

- The list is empty.

**Steps**

1. Add a single todo whose text is 200 characters (e.g. repeat `a` 200 times).
2. Press **Enter**.

**Expected result**

- One row is added; the full text is stored (may wrap in the UI).
- The app remains usable (no crash, list still scrollable if needed).

---

### TC-014 — Delete completed todo updates active count correctly

**Preconditions**

- **Buy milk** is completed; **Walk the dog** is active.

**Steps**

1. Delete completed **Buy milk**.

**Expected result**

- **Buy milk** is removed.
- **Walk the dog** remains active.
- The footer shows **1 item left**.

---

### TC-015 — Emoji and non-Latin characters in todo text

**Preconditions**

- The list is empty.

**Steps**

1. Add `🥛 Lait — achat`.

**Expected result**

- The list displays **🥛 Lait — achat** correctly.
- Complete and delete work on that row like any other todo.

---

## Ambiguities and gaps in the acceptance criteria

1. **Whitespace:** AC does not say whether `   ` should create a todo, be trimmed, or be ignored. TC-010 documents expected “no real todo”; confirm with product owner.
2. **Duplicates:** AC does not forbid duplicate titles; this demo allows them (TC-012). Some products deduplicate—clarify if that is required.
3. **Max length:** No maximum length in AC; TC-013 probes long text but does not define an upper bound or error message.
4. **Complete vs delete:** AC does not mention un-completing, bulk “Mark all as complete,” **Clear completed**, or filters (**All** / **Active** / **Completed**). Out of scope unless AC is extended.
5. **Persistence:** Demo does not require localStorage/session persistence across refresh; not covered unless AC adds “todos survive reload.”
6. **Draft text in new-todo field:** AC does not specify behavior when list rows are deleted while text remains in **What needs to be done?** (covered by TC-009 for this demo).

---

## Traceability (AC → tests)

| Acceptance criterion | Test case IDs |
|----------------------|---------------|
| User can add a todo item to the list | TC-001, TC-002 |
| User can complete an item | TC-003, TC-004 |
| User can delete item from the list | TC-005, TC-006, TC-014 |

Edge and negative cases support robustness beyond minimum AC coverage.
