# Test Cases: Edit Program (DS-2)

**Application:** Didaxis Studio (`https://test.didaxis.studio`)  
**Jira:** [DS-2 — Edit existing program details](https://legionqaschool.atlassian.net/browse/DS-2)  
**Full test plan:** [DS-2_output.md](./DS-2_output.md)  
**Playwright:** `tests/ds2-edit-program.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## UI reference (verified on test env)

- **Programs page:** heading `Programs`, subtitle `Manage academic programs and semesters`, table columns **Program** + actions column.
- **Row actions:** icon buttons with accessible names **`Edit {programName}`** and **`Delete {programName}`** (scroll row into view on large lists).
- **Edit modal:** dialog **`Edit Program`**; fields **`Program Name`** (textbox), **`Description`** (textbox); buttons **`Save`**, **`Cancel`**.
- **Validation observed:** empty or whitespace-only **Program Name** → **Save** disabled. **Save** stays **enabled** when opening edit with no changes.
- **Known gaps (test env):** duplicate rename on edit may not close the modal and may allow two rows with the same name; 101+ character names are not blocked in the form.

## Common preconditions

- Logged in via `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` (`.env`, loaded by `playwright.config.ts`).
- Target program created in-test with a unique name before edit steps.
- Open edit via row action **`Edit {programName}`**.

## Automation coverage summary

| Plan TC | Title (short) | Status | Playwright test |
|---------|---------------|--------|-----------------|
| TC-001 | Edit form shows current data | **Automated** | TC-001 |
| TC-002 | Updated name in list after Save | **Automated** | TC-002 |
| TC-003 | Name unchanged when only Description edited | **Automated** | TC-003 |
| TC-004 | Save with no changes | **Automated** | TC-004 |
| TC-005 | Empty Name prevents save | **Automated** | TC-005 |
| TC-006 | Duplicate name on edit | **Automated** | TC-006 *(documents current app behavior)* |
| TC-007 | Cancel discards unsaved changes | **Automated** | TC-007 |
| TC-008 | Special characters preserved | **Automated** | TC-008 |
| TC-009 | Name at 100 characters on edit | **Automated** | TC-009 |
| TC-010 | Whitespace-only Name on edit invalid | **Automated** | TC-010 |
| TC-011 | Leading/trailing spaces trimmed on save | **Automated** | TC-011 |

**Counts:** 11 plan cases — **11 automated**.

---

### TC-001 — Edit form shows current program data

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-001: edit form is pre-populated with current program data`

**Steps**

1. Create program with known name and description; click **Edit {name}** on the row.

**Expected result**

- **Edit Program** dialog opens.
- **Program Name** and **Description** match saved values.

---

### TC-002 — Updated name appears in list after Save

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-002: updated program name appears in list after Save`

**Steps**

1. Edit program; change **Program Name** to `{original} - Updated`; **Save**.

**Expected result**

- Dialog closes; new name in list; old name absent.

---

### TC-003 — Name unchanged when only Description is edited

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-003: name unchanged when only description is edited`

**Steps**

1. Edit; change **Description** only; **Save**.

**Expected result**

- Name unchanged; description updated in list row (second paragraph in **Program** column).

---

### TC-004 — Save with no field changes keeps data intact

**Priority:** Medium | **Type:** Positive  
**Automation:** **Automated** — `TC-004: Save without edits keeps program unchanged`

**Steps**

1. Open **Edit Program** without changing fields; **Save**.

**Expected result**

- **Save** is enabled (no client-side “no changes” disable).
- Dialog closes; name and description unchanged in list.

---

### TC-005 — Empty Name prevents save on edit

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-005: empty name on edit cannot be saved`

**Steps**

1. Clear **Program Name**; observe **Save**.

**Expected result**

- **Save** is disabled; original program still listed after **Cancel**.

---

### TC-006 — Duplicate name on edit

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-006: renaming to an existing program name`

**Steps**

1. Create programs **A** and **B**; rename **B** to **A**; **Save**.

**Expected result (product intent / Jira AC analogy)**

- Error; **B** unchanged; one row per name.

**Expected result (test env — documented)**

- **Save** may leave the modal open; duplicate **Program** rows for the same name may appear. Test asserts safe bounds and closes the modal if it remains open.

---

### TC-007 — Unsaved edit changes do not appear after Cancel

**Priority:** Medium | **Type:** Negative  
**Automation:** **Automated** — `TC-007: Cancel discards unsaved name change`

**Steps**

1. Change name; **Cancel**.

**Expected result**

- Original name remains in list; rejected name absent.

---

### TC-008 — Special characters preserved on edit

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-008: special characters preserved on edit`

**Steps**

1. Edit name/description with `&`, quotes, `<`, `>`; **Save**.

**Expected result**

- Plain text in list (no HTML injection).

---

### TC-009 — Name at 100 characters on edit

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-009: 100-character program name saves on edit`

**Steps**

1. Edit program; set **Program Name** to exactly 100 characters; **Save**.

**Expected result**

- Dialog closes; list shows the full 100-character name.

---

### TC-010 — Whitespace-only Name on edit treated as invalid

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-010: whitespace-only name on edit cannot be saved`

**Steps**

1. Replace **Program Name** with spaces only; observe **Save**.

**Expected result**

- **Save** disabled; list unchanged after **Cancel**.

---

### TC-011 — Leading and trailing spaces trimmed on save

**Priority:** Low | **Type:** Edge  
**Automation:** **Automated** — `TC-011: leading and trailing spaces trimmed on edit save`

**Steps**

1. Set **Program Name** to `  {base} Pro  `; **Save**.

**Expected result**

- List shows `{base} Pro` without leading/trailing spaces.
