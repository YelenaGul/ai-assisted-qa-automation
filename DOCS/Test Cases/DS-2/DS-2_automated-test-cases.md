# Test Cases: Edit Program (DS-2)

**Application:** Didaxis Studio  
**Full test plan:** [DS-2_output.md](./DS-2_output.md)  
**Playwright:** `tests/ds2-edit-program.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- Logged in via `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD`.
- Target program created in-test with unique name before edit steps.
- **Edit Program** dialog; row action **Edit {programName}**.

## Automation coverage summary

| Plan TC | Title (short) | Status | Playwright test |
|---------|---------------|--------|-----------------|
| TC-001 | Edit form shows current data | **Automated** | TC-001 |
| TC-002 | Updated name in list after Save | **Automated** | TC-002 |
| TC-003 | Name unchanged when only Description edited | **Automated** | TC-003 |
| TC-004 | Save with no changes | **Automated** | TC-004 |
| TC-005 | Empty Name prevents save | **Automated** | TC-005 |
| TC-006 | Duplicate name on edit rejected | **Automated** | TC-006 *(flexible: block or allow)* |
| TC-007 | Cancel discards unsaved changes | **Automated** | TC-007 |
| TC-008 | Special characters preserved | **Automated** | TC-008 |
| TC-009 | Name at max length on edit | **Not automated** | — |
| TC-010 | Whitespace-only Name on edit invalid | **Not automated** | — |
| TC-011 | Leading/trailing spaces on edit | **Not automated** | — |

**Counts:** 11 plan cases — 8 automated; 3 not automated.

---

### TC-001 — Edit form shows current program data

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-001: edit form is pre-populated with current program data`

**Steps**

1. Create program with known name and description; click **Edit** on row.

**Expected result**

- **Program Name** and **Description** match saved values.

---

### TC-002 — Updated name appears in list after Save

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-002: updated program name appears in list after Save`

**Steps**

1. Edit program; change name to `{original} - Updated`; **Save**.

**Expected result**

- Dialog closes; new name in list; old name absent.

---

### TC-003 — Name unchanged when only Description is edited

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-003: name unchanged when only description is edited`

**Steps**

1. Edit; change **Description** only; **Save**.

**Expected result**

- Name unchanged; description updated in list row.

---

### TC-004 — Save with no field changes keeps data intact

**Priority:** Medium | **Type:** Positive  
**Automation:** **Automated** — `TC-004: Save without edits keeps program unchanged`

**Steps**

1. Open edit without changes; **Save**.

**Expected result**

- Name and description unchanged in list.

---

### TC-005 — Empty Name prevents save on edit

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-005: empty name on edit cannot be saved`

**Steps**

1. Clear **Program Name**; attempt **Save** or verify disabled; **Cancel** if needed.

**Expected result**

- Empty name not persisted; original program still listed.

---

### TC-006 — Duplicate name on edit is rejected

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-006: renaming to an existing program name is rejected or blocked`

**Steps**

1. Create programs **A** and **B**; rename **B** to **A**; **Save**.

**Expected result (plan)**

- Error; **B** unchanged.

**Expected result (automation)**

- Either one row each or documented duplicate-name behavior if rename succeeds.

---

### TC-007 — Unsaved edit changes do not appear after Cancel

**Priority:** Medium | **Type:** Negative  
**Automation:** **Automated** — `TC-007: Cancel discards unsaved name change`

**Steps**

1. Change name; **Cancel**.

**Expected result**

- Original name remains in list.

---

### TC-008 — Special characters preserved on edit

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-008: special characters preserved on edit`

**Steps**

1. Edit name/description with `&`, quotes, `<`, `>`; **Save**.

**Expected result**

- Plain text in list.

---

### TC-009 — Name at maximum length on edit

**Priority:** Medium | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Edit program; set **Name** to 255 valid characters; **Save**.

**Expected result**

- Save succeeds; full name stored.

---

### TC-010 — Whitespace-only Name on edit treated as invalid

**Priority:** Medium | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Replace **Name** with spaces only; attempt **Save**.

**Expected result**

- Not submitted; list unchanged.

---

### TC-011 — Leading and trailing spaces on Name handled consistently

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Set **Name** to `  UX Design 2026 Pro  `; **Save**.

**Expected result**

- Trim or reject per rules; no confusing duplicates.
