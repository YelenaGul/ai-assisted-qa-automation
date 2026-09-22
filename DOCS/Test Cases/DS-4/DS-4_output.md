# Test Plan: Delete Program with Confirmation (DS-4)

**Feature:** Delete program with confirmation  
**Scope:** Delete action from Programs list and confirmation dialog

---

## Positive flows

### TC-001 — Confirmed delete removes program from list

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program **Test Program** exists on the Programs page.

**Steps**

1. Navigate to the Programs page.
2. Click the delete icon for **Test Program**.
3. Verify confirmation dialog appears.
4. Confirm deletion (e.g. **Confirm Delete** or **Delete**).

**Expected result**

- Dialog closes.
- **Test Program** is no longer in the program list.

**Gherkin**

```gherkin
Scenario: Delete program with confirmation
  Given a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program" is removed from the program list
```

---

### TC-002 — Cancel on confirmation keeps program

**Priority:** High

**Preconditions**

- Program **Cancel Delete Sample 2026** exists.

**Steps**

1. Click delete icon for **Cancel Delete Sample 2026**.
2. When confirmation dialog appears, click **Cancel**.

**Expected result**

- Dialog closes.
- **Cancel Delete Sample 2026** still appears in the list.

**Gherkin**

```gherkin
Scenario: Cancel program deletion
  Given I click the delete icon for a program
  When I see the confirmation dialog
  And I click Cancel
  Then the program still exists in the list
```

---

### TC-003 — Delete second program leaves others intact

**Priority:** Medium

**Preconditions**

- Programs **Keep Me 2026** and **Remove Me 2026** exist.

**Steps**

1. Delete **Remove Me 2026** and confirm.
2. Review list for **Keep Me 2026**.

**Expected result**

- **Remove Me 2026** gone; **Keep Me 2026** unchanged.

**Gherkin**

```gherkin
Scenario: Deleting one program does not affect others
  Given programs "Keep Me 2026" and "Remove Me 2026" exist
  When I delete "Remove Me 2026" and confirm deletion
  Then "Remove Me 2026" is removed from the program list
  And "Keep Me 2026" remains in the program list
```

---

## Negative flows

### TC-004 — Program not deleted without confirmation

**Priority:** High

**Preconditions**

- Program **No Confirm Delete 2026** exists.

**Steps**

1. Click delete icon for **No Confirm Delete 2026**.
2. Close dialog via **Cancel** or overlay/Escape if supported—without confirming delete.

**Expected result**

- **No Confirm Delete 2026** remains in the list.

**Gherkin**

```gherkin
Scenario: Program persists when deletion is not confirmed
  Given a program "No Confirm Delete 2026" exists
  When I click the delete icon for "No Confirm Delete 2026"
  And I dismiss the confirmation without confirming deletion
  Then "No Confirm Delete 2026" still exists in the list
```

---

### TC-005 — Double confirm does not cause error state

**Priority:** Low

**Preconditions**

- Program **Double Click Test** exists.

**Steps**

1. Open delete confirmation for **Double Click Test**.
2. Click confirm control twice quickly.

**Expected result**

- Program deleted once; no duplicate API errors shown to user; list consistent.

**Gherkin**

```gherkin
Scenario: Repeated confirm click handles idempotently
  Given a program "Double Click Test" exists
  When I confirm deletion twice in quick succession
  Then "Double Click Test" is removed from the program list
  And I do not see a broken or duplicate error state
```

---

### TC-006 — Non-admin cannot delete programs

**Priority:** Medium

**Preconditions**

- Non-admin user logged in; program **Protected Program 2026** exists.

**Steps**

1. Open Programs page.
2. Check delete icon visibility/action for **Protected Program 2026**.

**Expected result**

- Delete unavailable or action forbidden; program remains.

**Gherkin**

```gherkin
Scenario: Non-admin cannot delete programs
  Given I am logged in as a non-admin user
  And a program "Protected Program 2026" exists
  When I navigate to the Programs page
  Then I cannot successfully delete "Protected Program 2026"
```

---

## Edge cases

### TC-007 — Confirmation dialog shows correct program name

**Priority:** High

**Preconditions**

- Program **Informatique & IA - Niveau 2** exists.

**Steps**

1. Click delete for that program.
2. Read confirmation message text.

**Expected result**

- Dialog references **Informatique & IA - Niveau 2** (or clear identifier) so user deletes the intended row.

**Gherkin**

```gherkin
Scenario: Confirmation identifies program with special characters in name
  Given a program "Informatique & IA - Niveau 2" exists
  When I click the delete icon for "Informatique & IA - Niveau 2"
  Then I see a confirmation dialog that identifies "Informatique & IA - Niveau 2"
```

---

### TC-008 — Delete last remaining program shows empty state

**Priority:** Medium

**Preconditions**

- Only **Last Program Standing** exists (or delete others first).

**Steps**

1. Delete **Last Program Standing** and confirm.
2. View Programs page.

**Expected result**

- List empty; empty state messaging appears (align with DS-5).

**Gherkin**

```gherkin
Scenario: Deleting the only program leads to empty list
  Given only the program "Last Program Standing" exists
  When I delete "Last Program Standing" and confirm deletion
  Then the program list is empty
```

---

### TC-009 — Delete while search/filter applied updates visible list

**Priority:** Low

**Preconditions**

- Multiple programs exist; filter/search shows subset including **Filter Delete Target**.

**Steps**

1. Apply filter so **Filter Delete Target** is visible.
2. Delete and confirm.

**Expected result**

- Row removed from current view; counts/filters update correctly.

**Gherkin**

```gherkin
Scenario: Deleted program disappears from filtered view
  Given programs exist and I filter the list to show "Filter Delete Target"
  When I delete "Filter Delete Target" and confirm deletion
  Then "Filter Delete Target" is not shown in the program list
```

---

### TC-010 — Failed server delete shows error and retains program

**Priority:** Medium

**Preconditions**

- Ability to simulate API failure (network off or mock 500).

**Steps**

1. Attempt delete **Server Fail Program** and confirm.
2. Observe UI when delete API fails.

**Expected result**

- Error shown; **Server Fail Program** remains in list unless product defines otherwise.

**Gherkin**

```gherkin
Scenario: Failed delete request keeps program in list
  Given a program "Server Fail Program" exists
  And the delete API will fail
  When I confirm deletion of "Server Fail Program"
  Then I see an error message
  And "Server Fail Program" remains in the program list
```

---

## Traceability to acceptance criteria

| AC scenario | Test case(s) |
|-------------|----------------|
| Delete program with confirmation | TC-001 |
| Cancel program deletion | TC-002 |

---

## Ambiguities and gaps in the acceptance criteria

1. **Confirm control label** — “Confirm deletion” action name not specified (Delete vs Confirm Delete).
2. **Login role** — Admin vs other roles not stated (TC-006).
3. **Dialog content** — Whether program name/description shown in dialog not defined (TC-007).
4. **Soft delete vs hard delete** — Not specified; list removal only asserted.
5. **Dependencies** — Programs linked to courses/users—can they be deleted? Not in ACs.
6. **Close via X or Escape** — Not in ACs; covered under dismiss without confirm (TC-004).
7. **Undo** — No undo after confirm mentioned.
8. **Empty state after last delete** — Not in DS-4 ACs; cross-feature with DS-5 (TC-008).
