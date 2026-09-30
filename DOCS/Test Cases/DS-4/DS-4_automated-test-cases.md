# Automated Test Cases: Delete Program (DS-4)

**Application:** Didaxis Studio  
**Automation:** `tests/ds4-delete-program.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- User logged in on **Programs** page.
- Delete uses row action **Delete {programName}** (scoped to program row).
- Confirmation is a **browser native confirm** (not a Mantine modal), message contains `Delete program` and the program name.

---

### TC-001 — Confirmed delete removes program from list

**Priority:** High  
**Type:** Positive

**Steps**

1. Create program `Test Program-{timestamp}`.
2. Click **Delete** on its row.
3. Accept browser confirm.

**Expected result**

- Program no longer appears in the table.

**Gherkin**

```gherkin
Scenario: Delete program with confirmation
  Given a program exists
  When I click delete and confirm
  Then the program is removed from the program list
```

---

### TC-002 — Cancel on confirmation keeps program

**Priority:** High  
**Type:** Positive

**Steps**

1. Create program; click **Delete**.
2. Dismiss browser confirm.

**Expected result**

- Program still listed.

---

### TC-003 — Deleting one program leaves others intact

**Priority:** Medium  
**Type:** Positive

**Steps**

1. Create **Keep Me** and **Remove Me** programs.
2. Delete **Remove Me** and confirm.

**Expected result**

- **Remove Me** gone; **Keep Me** unchanged.

---

### TC-004 — Program persists when deletion is not confirmed

**Priority:** High  
**Type:** Negative

**Steps**

1. Create program; open delete confirm; dismiss.

**Expected result**

- Program remains in list.

---

### TC-005 — Repeated confirm click deletes program once

**Priority:** Low  
**Type:** Edge

**Steps**

1. Create program; click **Delete**; accept confirm twice if prompted.

**Expected result**

- Program removed; no broken UI state.

---

### TC-007 — Confirmation identifies program with special characters

**Priority:** High  
**Type:** Edge

**Steps**

1. Create `Informatique & IA - Niveau 2-{timestamp}`.
2. Click **Delete**; read confirm message; dismiss.

**Expected result**

- Confirm text includes full program name; program still listed after dismiss.

---

### TC-008 — Deleting a program removes it from the visible list

**Priority:** High  
**Type:** Positive

**Steps**

1. Create `Deleted Ghost Program-{timestamp}`.
2. Delete with confirm; reload **Programs** view.

**Expected result**

- Name not found in table.

**Note:** TC-006 (non-admin delete) is not automated.
