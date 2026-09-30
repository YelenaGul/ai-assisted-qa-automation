# Automated Test Cases: Edit Program (DS-2)

**Application:** Didaxis Studio  
**Automation:** `tests/ds2-edit-program.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- User logged in via `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD`.
- A target program exists (created in-test with unique name) before edit steps.
- Edit opens **Edit Program** dialog; row actions use **Edit {programName}** on the program row.

---

### TC-001 — Edit form is pre-populated with current program data

**Priority:** High  
**Type:** Positive

**Steps**

1. Create a program with known name and description.
2. Click **Edit** on that program’s row.

**Expected result**

- **Program Name** and **Description** fields match saved values.

**Gherkin**

```gherkin
Scenario: Open program for editing
  Given a program exists with name and description
  When I click the edit control for that program
  Then I see the edit form pre-populated with the program's current data
```

---

### TC-002 — Updated program name appears in list after Save

**Priority:** High  
**Type:** Positive

**Steps**

1. Open edit for an existing program.
2. Change **Program Name** to `{original} - Updated`.
3. Click **Save**.

**Expected result**

- Dialog closes; updated name appears; old name is not listed.

---

### TC-003 — Name unchanged when only description is edited

**Priority:** High  
**Type:** Positive

**Steps**

1. Open edit; change **Description** only.
2. Click **Save**.

**Expected result**

- Name unchanged; description updated in the list row.

---

### TC-004 — Save without edits keeps program unchanged

**Priority:** Medium  
**Type:** Positive

**Steps**

1. Open edit without changing fields.
2. Click **Save**.

**Expected result**

- Dialog closes; name and description unchanged in list.

---

### TC-005 — Empty name on edit cannot be saved

**Priority:** High  
**Type:** Negative

**Steps**

1. Open edit; clear **Program Name**.
2. Attempt **Save** (or verify **Save** disabled).
3. Click **Cancel**.

**Expected result**

- Empty name is not persisted; original program still listed.

---

### TC-006 — Renaming to an existing program name is rejected or blocked

**Priority:** High  
**Type:** Negative

**Steps**

1. Create two programs **A** and **B**.
2. Edit **B**; set name to **A**; click **Save**.

**Expected result**

- Either **B** remains as **B** (one row each), or duplicate-name behavior is documented (two rows named **A** if rename succeeds).

---

### TC-007 — Cancel discards unsaved name change

**Priority:** Medium  
**Type:** Negative

**Steps**

1. Open edit; change name to a new value.
2. Click **Cancel**.

**Expected result**

- Original name remains; rejected name not in list.

---

### TC-008 — Special characters preserved on edit

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Edit a program; set name and description with `&`, quotes, `<`, `>`.
2. Click **Save**.

**Expected result**

- List shows exact text (plain text, not HTML).
