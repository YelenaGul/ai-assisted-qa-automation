# Test Plan: Program Name Validation and Duplicate Prevention (DS-3)

**Feature:** Program name validation and duplicate prevention  
**Scope:** Create (and applicable edit) flows for **Program Name**  
**Related fields:** Program Name, Description, other required create fields

---

## Positive flows

### TC-001 — Program name with special characters is created

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program **Informatique & IA - Niveau 2** does not exist.

**Steps**

1. Navigate to Programs page and click **+ New Program**.
2. Enter **Informatique & IA - Niveau 2** in **Program Name**.
3. Enter **Programme bilingue français-anglais** in **Description**.
4. Click **Create**.

**Expected result**

- Program is created; list shows **Informatique & IA - Niveau 2**.

**Gherkin**

```gherkin
Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

---

### TC-002 — Valid name with hyphen and digits is accepted

**Priority:** Medium

**Preconditions**

- User is logged in as admin.
- **Web-Dev 2026** does not exist.

**Steps**

1. Open create form.
2. Enter **Web-Dev 2026** in **Program Name** and **Part-time cohort** in **Description**.
3. Click **Create**.

**Expected result**

- Program appears in the list as **Web-Dev 2026**.

**Gherkin**

```gherkin
Scenario: Hyphenated alphanumeric program name is accepted
  Given I am on the program creation form
  When I enter "Web-Dev 2026" as the program name
  And I fill in Description with "Part-time cohort"
  And I click Create
  Then the program is created successfully
```

---

## Negative flows

### TC-003 — Whitespace-only program name is not submitted

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program creation form is open.

**Steps**

1. Enter **   ** (spaces only) in **Program Name**.
2. Enter **Whitespace validation test** in **Description**.
3. Click **Create** if enabled; otherwise confirm **Create** is disabled.

**Expected result**

- Form is not submitted; name trimmed/treated as empty; no new program row.

**Gherkin**

```gherkin
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I click Create
  Then the form is not submitted (name is trimmed, treated as empty)
```

---

### TC-004 — Duplicate program name on create shows error

**Priority:** High

**Preconditions**

- Program **Web Development 2026** already exists.

**Steps**

1. Click **+ New Program**.
2. Enter **Web Development 2026** in **Program Name**.
3. Enter **Second instance attempt** in **Description**.
4. Click **Create**.

**Expected result**

- Error indicates name already exists; only one **Web Development 2026** in list.

**Gherkin**

```gherkin
Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists
```

---

### TC-005 — Empty program name cannot create duplicate of empty

**Priority:** Medium

**Preconditions**

- Program creation form open; **Program Name** empty.

**Steps**

1. Leave **Program Name** empty.
2. Attempt **Create**.

**Expected result**

- **Create** disabled or blocked; no program created.

**Gherkin**

```gherkin
Scenario: Empty program name does not submit
  Given I am on the program creation form
  When I leave the Program Name field empty
  And I attempt to click Create
  Then the form is not submitted
  And no new program is added to the list
```

---

### TC-006 — Duplicate not created when error is shown

**Priority:** High

**Preconditions**

- **Web Development 2026** exists; count programs before test.

**Steps**

1. Attempt create with duplicate name **Web Development 2026**.
2. Dismiss or read error; count list rows for that name.

**Expected result**

- Exactly one **Web Development 2026** remains.

**Gherkin**

```gherkin
Scenario: Duplicate error leaves database unchanged
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists
  And the program list contains only one "Web Development 2026"
```

---

## Edge cases

### TC-007 — Case-insensitive duplicate (if product rule)

**Priority:** Medium

**Preconditions**

- **Web Development 2026** exists.

**Steps**

1. Create new program with name **web development 2026**.
2. Click **Create**.

**Expected result**

- Either rejected as duplicate (recommended) or allowed—must match product rule; document actual behavior.

**Gherkin**

```gherkin
Scenario: Duplicate check case sensitivity boundary
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the name "web development 2026"
  Then the product applies the documented case sensitivity rule for duplicate names
```

---

### TC-008 — Leading/trailing spaces make name unique or duplicate

**Priority:** Medium

**Preconditions**

- **Web Development 2026** exists.

**Steps**

1. Try create with ** Web Development 2026 ** (leading/trailing spaces).

**Expected result**

- After trim, treated as duplicate of **Web Development 2026** with error (expected).

**Gherkin**

```gherkin
Scenario: Trimmed name matches existing program
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the name " Web Development 2026 "
  Then I see an error indicating the name already exists
  Or the name is trimmed and rejected as duplicate per product rules
```

---

### TC-009 — Program name at max length is valid

**Priority:** Medium

**Preconditions**

- Max **Program Name** length 255 characters (confirm in UI).

**Steps**

1. Create program with 255-character unique name and Description **Max length validation**.
2. Click **Create**.

**Expected result**

- Created successfully.

**Gherkin**

```gherkin
Scenario: Max length program name passes validation
  Given I am on the program creation form
  When I enter a unique 255-character program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

---

### TC-010 — Program name over max length is rejected

**Priority:** Medium

**Preconditions**

- Creation form open.

**Steps**

1. Enter 256-character string in **Program Name**.
2. Attempt **Create**.

**Expected result**

- Not submitted; validation or disabled **Create**.

**Gherkin**

```gherkin
Scenario: Over max length program name is rejected
  Given I am on the program creation form
  When I enter a 256-character string as the program name
  Then the form is not submitted
  And I see max length validation or Create is disabled
```

---

### TC-011 — Duplicate prevention on edit rename

**Priority:** Medium

**Preconditions**

- **Data Science 2026** and **Web Development 2026** exist.

**Steps**

1. Edit **Data Science 2026**.
2. Rename to **Web Development 2026**.
3. Click **Save**.

**Expected result**

- Duplicate error; **Data Science 2026** unchanged.

**Gherkin**

```gherkin
Scenario: Edit rename to existing name is rejected
  Given a program "Web Development 2026" already exists
  And I am editing "Data Science 2026"
  When I change the program name to "Web Development 2026"
  And I click Save
  Then I see an error indicating the name already exists
```

---

### TC-012 — Unicode and accented characters in name

**Priority:** Low

**Preconditions**

- **Programme Été 2026 — Montréal** does not exist.

**Steps**

1. Create with that **Program Name** and Description **Accented name test**.
2. Click **Create**.

**Expected result**

- Created and displayed correctly in list.

**Gherkin**

```gherkin
Scenario: Accented Unicode program name is accepted
  Given I am on the program creation form
  When I enter "Programme Été 2026 — Montréal" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully
```

---

## Traceability to acceptance criteria

| AC scenario | Test case(s) |
|-------------|----------------|
| Reject program name with only whitespace | TC-003 |
| Accept program name with special characters | TC-001 |
| Reject duplicate program name | TC-004, TC-006 |

---

## Ambiguities and gaps in the acceptance criteria

1. **“Fill other required fields”** — Which fields are required besides name is not listed (Description assumed optional unless spec says otherwise).
2. **Click Create when invalid** — AC says click Create for whitespace; product may disable button instead—both should count as “not submitted.”
3. **Case sensitivity** — Duplicate rule does not define case (TC-007).
4. **Trim rules** — Stated for whitespace-only; not for leading/trailing on non-empty names (TC-008).
5. **Edit flow** — ACs only mention creation form; duplicate/whitespace on edit implied but not in ACs (TC-011).
6. **Error UX** — Inline field error vs toast vs modal not specified.
7. **Max length** — Not in ACs; added as edge coverage (TC-009, TC-010).
8. **Rename to same name on edit** — Saving unchanged name on edit not specified.
