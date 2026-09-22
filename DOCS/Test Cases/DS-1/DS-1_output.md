# Test Plan: Create New Academic Program (DS-1)

**Feature:** Create new academic program  
**Scope:** Program creation modal from Programs page (admin)  
**Fields:** Program Name, Description

---

## Positive flows

### TC-001 — Program creation form displays required fields

**Priority:** High

**Preconditions**

- User `admin@example.com` is logged in with admin role.
- At least one program may exist on the Programs page (not required for opening the form).

**Steps**

1. Navigate to the Programs page.
2. Click **+ New Program**.

**Expected result**

- The program creation modal/form is visible.
- **Program Name** and **Description** fields are present and editable.

**Gherkin**

```gherkin
Scenario: Admin opens program creation form with required fields
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

---

### TC-002 — New program appears in list after successful create

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program **Web Development 2026** does not already exist in the list (delete or use a fresh test environment if needed).

**Steps**

1. Open the Programs page and click **+ New Program**.
2. Enter **Web Development 2026** in **Program Name**.
3. Enter **Full-stack web development program** in **Description**.
4. Click **Create**.

**Expected result**

- The creation modal closes.
- **Web Development 2026** appears in the program list with the saved description (if the list shows description).

**Gherkin**

```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-003 — Program can be created with Description left empty

**Priority:** Medium

**Preconditions**

- User is logged in as admin.
- Program **Cybersecurity Fundamentals 2026** does not exist.

**Steps**

1. Open **+ New Program**.
2. Enter **Cybersecurity Fundamentals 2026** in **Program Name**.
3. Leave **Description** empty.
4. Click **Create**.

**Expected result**

- Modal closes; **Cybersecurity Fundamentals 2026** appears in the list.
- No validation error on Description (unless product rules require it—see ambiguities).

**Gherkin**

```gherkin
Scenario: Create program with name only
  Given I am on the program creation form
  When I fill in Program Name with "Cybersecurity Fundamentals 2026"
  And I leave Description empty
  And I click Create
  Then the modal closes
  And the program list shows "Cybersecurity Fundamentals 2026"
```

---

## Negative flows

### TC-004 — Create remains disabled when Program Name is empty

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program creation form is open.

**Steps**

1. Leave **Program Name** empty.
2. Optionally enter text in **Description** (e.g. **Optional description text**).
3. Observe the **Create** button state.
4. Attempt to click **Create** (if clickable via keyboard or forced interaction).

**Expected result**

- **Create** is disabled while **Program Name** is empty.
- No program is added to the list.

**Gherkin**

```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

### TC-005 — Modal stays open and list unchanged when Create is disabled

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program creation form is open with empty **Program Name**.
- Note the current program count or list contents on the Programs page.

**Steps**

1. Confirm **Create** is disabled.
2. Close the modal via **Cancel** or **X** (if available) without saving.

**Expected result**

- No new row appears in the program list from an attempted create with empty name.
- User cannot submit the form through the disabled **Create** control.

**Gherkin**

```gherkin
Scenario: Empty name does not create a program
  Given I am on the program creation form
  And the Program Name field is empty
  And the Create button is disabled
  When I view the program list behind the modal
  Then no new program was added from this form session
```

---

### TC-006 — Duplicate program name is rejected

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program **Web Development 2026** already exists in the list.

**Steps**

1. Click **+ New Program**.
2. Enter **Web Development 2026** in **Program Name**.
3. Enter **Duplicate attempt description** in **Description**.
4. Click **Create** (if enabled).

**Expected result**

- Program is **not** duplicated in the list (still one **Web Development 2026**, or clear error).
- User sees an inline or toast error (e.g. name already exists); modal remains open or closes per product rule—must not silently create a duplicate.

**Gherkin**

```gherkin
Scenario: Duplicate program name is not accepted
  Given I am on the program creation form
  And a program named "Web Development 2026" already exists
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then the program list does not contain a second "Web Development 2026"
  And I see a validation or error message about duplicate name
```

---

### TC-007 — Non-admin user cannot create a program

**Priority:** Medium

**Preconditions**

- User is logged in as a non-admin role (e.g. instructor or viewer), if such roles exist in the product.

**Steps**

1. Navigate to the Programs page.
2. Check visibility of **+ New Program** and ability to open the creation form.

**Expected result**

- **+ New Program** is hidden or disabled, **or** opening/submitting the form returns forbidden/unauthorized.
- No new program is created.

**Gherkin**

```gherkin
Scenario: Non-admin cannot create programs
  Given I am logged in as a non-admin user
  When I navigate to the Programs page
  Then I do not see "+ New Program" or I cannot successfully submit a new program
```

---

## Edge cases

### TC-008 — Program Name at maximum allowed length

**Priority:** Medium

**Preconditions**

- User is logged in as admin.
- Known max length for **Program Name** (e.g. 255 characters)—adjust steps if spec differs.

**Steps**

1. Open **+ New Program**.
2. Enter a **Program Name** of exactly 255 characters (e.g. `A` repeated 255 times, or 252 chars + `2026`).
3. Enter **Max length name test program** in **Description**.
4. Click **Create**.

**Expected result**

- Program saves successfully and appears in the list (truncated display only if UI truncates visually, full name in detail/edit).

**Gherkin**

```gherkin
Scenario: Program name at max length is accepted
  Given I am on the program creation form
  When I fill in Program Name with a 255-character valid name
  And I fill in Description with "Max length name test program"
  And I click Create
  Then the modal closes
  And the program list shows the program with that name
```

---

### TC-009 — Program Name one character over maximum is rejected

**Priority:** Medium

**Preconditions**

- User is logged in as admin.
- Max length for **Program Name** is 255 characters.

**Steps**

1. Open **+ New Program**.
2. Enter a **Program Name** of 256 characters.
3. Enter **Over max length test** in **Description**.
4. Attempt to click **Create**.

**Expected result**

- **Create** disabled or validation error; program not saved.

**Gherkin**

```gherkin
Scenario: Program name over max length is rejected
  Given I am on the program creation form
  When I fill in Program Name with a 256-character string
  Then the Create button is disabled or I see a max length validation message
  And no new program is added to the list
```

---

### TC-010 — Special characters in Program Name and Description

**Priority:** Medium

**Preconditions**

- User is logged in as admin.
- Program **QA & Testing — "Phase 1" (2026)** does not exist.

**Steps**

1. Open **+ New Program**.
2. Enter **QA & Testing — "Phase 1" (2026)** in **Program Name**.
3. Enter **Description with symbols: <test> 'quotes' & ampersand** in **Description**.
4. Click **Create**.

**Expected result**

- Values are stored and displayed as plain text (HTML/script not executed).
- Program appears in the list with correct visible text.

**Gherkin**

```gherkin
Scenario: Special characters are stored safely in name and description
  Given I am on the program creation form
  When I fill in Program Name with "QA & Testing — \"Phase 1\" (2026)"
  And I fill in Description with "Description with symbols: <test> 'quotes' & ampersand"
  And I click Create
  Then the modal closes
  And the program list shows "QA & Testing — \"Phase 1\" (2026)"
  And the description is displayed as plain text without script execution
```

---

### TC-011 — Whitespace-only Program Name keeps Create disabled

**Priority:** Medium

**Preconditions**

- User is logged in as admin.
- Program creation form is open.

**Steps**

1. Enter only spaces (e.g. three spaces) in **Program Name**.
2. Enter **Whitespace name test** in **Description**.
3. Check **Create** button state.

**Expected result**

- **Create** remains disabled or validation treats whitespace-only as empty.
- No program named only spaces is created.

**Gherkin**

```gherkin
Scenario: Whitespace-only program name is treated as invalid
  Given I am on the program creation form
  When I fill in Program Name with "   "
  Then the Create button is disabled
```

---

### TC-012 — Leading and trailing spaces in Program Name

**Priority:** Low

**Preconditions**

- User is logged in as admin.

**Steps**

1. Open **+ New Program**.
2. Enter **  Mobile Apps 2026  ** (leading/trailing spaces) in **Program Name**.
3. Enter **Trim behavior test** in **Description**.
4. Click **Create**.

**Expected result**

- Product either trims to **Mobile Apps 2026** on save or rejects with validation; list must not show ambiguous duplicate entries differing only by spaces.

**Gherkin**

```gherkin
Scenario: Leading and trailing spaces handled consistently
  Given I am on the program creation form
  When I fill in Program Name with "  Mobile Apps 2026  "
  And I fill in Description with "Trim behavior test"
  And I click Create
  Then the saved program name is handled per product rules (trimmed or rejected)
  And the program list does not show confusing duplicate spacing variants
```

---

### TC-013 — Description at maximum allowed length

**Priority:** Low

**Preconditions**

- User is logged in as admin.
- Known max length for **Description** (e.g. 2000 characters).

**Steps**

1. Open **+ New Program**.
2. Enter **Long Description Program 2026** in **Program Name**.
3. Paste a **Description** of exactly 2000 characters.
4. Click **Create**.

**Expected result**

- Program saves; full description retrievable on edit/view.

**Gherkin**

```gherkin
Scenario: Description at max length is accepted
  Given I am on the program creation form
  When I fill in Program Name with "Long Description Program 2026"
  And I fill in Description with a 2000-character string
  And I click Create
  Then the modal closes
  And the program list shows "Long Description Program 2026"
```

---

### TC-014 — Minimum valid Program Name (single character)

**Priority:** Low

**Preconditions**

- User is logged in as admin.
- Program **X** does not exist (if single-char names allowed).

**Steps**

1. Open **+ New Program**.
2. Enter **X** in **Program Name**.
3. Enter **Single character name boundary** in **Description**.
4. Click **Create**.

**Expected result**

- Either accepted and listed as **X**, or rejected with min-length rule—behavior must be consistent and documented.

**Gherkin**

```gherkin
Scenario: Single-character program name boundary
  Given I am on the program creation form
  When I fill in Program Name with "X"
  And I fill in Description with "Single character name boundary"
  And I click Create
  Then the product applies the documented minimum name length rule
```

---

## Traceability to acceptance criteria

| AC scenario | Test case(s) |
|-------------|----------------|
| Navigate to program creation form | TC-001 |
| Successfully create a program | TC-002 |
| Validation prevents empty program name | TC-004, TC-005 |

---

## Ambiguities and gaps in the acceptance criteria

1. **Description required or optional** — ACs show Description on create but do not state whether it is mandatory; TC-003 assumes optional.
2. **Max/min length** — No limits for **Program Name** or **Description**; edge cases assume common limits (255 / 2000) until confirmed in UI or spec.
3. **Duplicate names** — Not mentioned in ACs; duplicate handling is assumed (TC-006) based on typical program master data rules.
4. **Whitespace trimming** — ACs do not define trim rules for **Program Name** (TC-011, TC-012).
5. **Cancel / close without save** — Not in DS-1 ACs (covered in DS-5 if applicable); no test here unless merged into create scope.
6. **Permissions** — Only admin is mentioned for navigation AC; other roles’ access to **+ New Program** is unspecified (TC-007).
7. **List refresh timing** — AC says list “shows” new program; not specified whether sorting, pagination, or search affects visibility immediately.
8. **Error messaging** — Disabled **Create** vs inline field errors vs toast on failure is not defined.
9. **Case sensitivity for duplicate names** — e.g. **web development 2026** vs **Web Development 2026** is not specified.
10. **Network/server failure on Create** — No AC for failed API; recommend add retry/error state tests in a follow-up story.
