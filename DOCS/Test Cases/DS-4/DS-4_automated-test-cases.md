# Test Cases: Delete Program (DS-4)

**Application:** Didaxis Studio  
**Full test plan:** [DS-4_output.md](./DS-4_output.md)  
**Playwright:** `tests/ds4-delete-program.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- Logged in on **Programs** page.
- Row action **Delete {programName}** on program row.
- Confirmation is **browser native `confirm`** (message includes `Delete program` and program name).

## Automation coverage summary

| Plan TC | Title (short) | Status | Playwright test |
|---------|---------------|--------|-----------------|
| TC-001 | Confirmed delete removes program | **Automated** | TC-001 |
| TC-002 | Cancel keeps program | **Automated** | TC-002 |
| TC-003 | Delete one leaves others | **Automated** | TC-003 |
| TC-004 | Not deleted without confirm | **Automated** | TC-004 |
| TC-005 | Double confirm / no error state | **Automated** | TC-005 |
| TC-006 | Non-admin cannot delete | **Not automated** | — |
| TC-007 | Confirm shows correct program name | **Automated** | TC-007 |
| TC-008 | Delete last program → empty state | **Not automated** | — |
| TC-009 | Delete under filter updates view | **Not automated** | — |
| TC-010 | Failed API delete retains program | **Not automated** | — |

**Supplementary automation (not a separate plan TC):** `TC-008: deleting a program removes it from the visible list` — reload/list visibility after delete (overlaps plan TC-001 / TC-004).

**Counts:** 10 plan cases — 7 automated (+1 supplementary spec TC-008); 4 plan cases not automated.

---

### TC-001 — Confirmed delete removes program from list

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-001: confirmed delete removes program from list`

**Steps**

1. Create program; **Delete**; accept confirm.

**Expected result**

- Program absent from table.

---

### TC-002 — Cancel on confirmation keeps program

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-002: cancel on confirmation keeps program`

**Steps**

1. **Delete**; dismiss confirm.

**Expected result**

- Program still listed.

---

### TC-003 — Delete second program leaves others intact

**Priority:** Medium | **Type:** Positive  
**Automation:** **Automated** — `TC-003: deleting one program leaves others intact`

**Steps**

1. Create **Keep Me** and **Remove Me**; delete **Remove Me** with confirm.

**Expected result**

- **Remove Me** gone; **Keep Me** unchanged.

---

### TC-004 — Program not deleted without confirmation

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-004: program persists when deletion is not confirmed`

**Steps**

1. Open delete confirm; dismiss.

**Expected result**

- Program remains.

---

### TC-005 — Double confirm does not cause error state

**Priority:** Low | **Type:** Edge  
**Automation:** **Automated** — `TC-005: repeated confirm click deletes program once`

**Steps**

1. Delete; accept confirm (twice if prompted).

**Expected result**

- Program removed; no broken UI.

---

### TC-006 — Non-admin cannot delete programs

**Priority:** Medium | **Type:** Negative  
**Automation:** **Not automated** — requires non-admin user.

**Steps**

1. As non-admin, open **Programs**; attempt delete on **Protected Program 2026**.

**Expected result**

- Delete unavailable or forbidden; program remains.

---

### TC-007 — Confirmation dialog shows correct program name

**Priority:** High | **Type:** Edge  
**Automation:** **Automated** — `TC-007: confirmation dialog identifies program with special characters`

**Steps**

1. Create name with `&` and hyphens; **Delete**; read confirm; dismiss.

**Expected result**

- Confirm text includes full program name.

---

### TC-008 — Delete last remaining program shows empty state

**Priority:** Medium | **Type:** Edge  
**Automation:** **Not automated** — needs isolated empty catalog (see DS-5 TC-002).

**Steps**

1. With only one program, delete and confirm; view **Programs**.

**Expected result**

- Empty list; empty-state messaging (align DS-5).

---

### TC-009 — Delete while search/filter applied updates visible list

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated** — no filter UI on current Programs page.

**Steps**

1. Filter to show target; delete and confirm.

**Expected result**

- Row removed from filtered view; counts update.

---

### TC-010 — Failed server delete shows error and retains program

**Priority:** Medium | **Type:** Negative  
**Automation:** **Not automated** — needs API failure simulation.

**Steps**

1. Confirm delete while delete API fails.

**Expected result**

- Error shown; program remains in list.

---

### Supplementary — Deleting a program removes it from the visible list

**Automation:** **Automated** — `TC-008: deleting a program removes it from the visible list` *(Playwright ID; not the same as plan TC-008 empty state)*

**Steps**

1. Create **Deleted Ghost Program**; delete with confirm; revisit **Programs**.

**Expected result**

- Name not found in table.
