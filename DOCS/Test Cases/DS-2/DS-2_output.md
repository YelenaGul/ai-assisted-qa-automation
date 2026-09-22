# Test Plan: Edit Existing Program Details (DS-2)

**Feature:** Edit existing program details  
**Scope:** Edit modal from Programs page  
**Fields:** Name, Description (and other existing program fields)

---

## Positive flows

### TC-001 — Edit form shows current program data

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Program **Web Development 2026** exists with Description **Full-stack web development program**.

**Steps**

1. Navigate to the Programs page.
2. Click the edit icon on **Web Development 2026**.

**Expected result**

- Edit modal opens.
- **Name** shows **Web Development 2026**.
- **Description** shows **Full-stack web development program**.

**Gherkin**

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data
```

---

### TC-002 — Updated name appears in list after Save

**Priority:** High

**Preconditions**

- User is editing **Web Development 2026** on the Programs page.

**Steps**

1. Change **Name** to **Web Development 2026 - Updated**.
2. Click **Save**.

**Expected result**

- Modal closes.
- Program list shows **Web Development 2026 - Updated** and no longer shows **Web Development 2026** as the name.

**Gherkin**

```gherkin
Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
```

---

### TC-003 — Name unchanged when only Description is edited

**Priority:** High

**Preconditions**

- Program **Data Science 2026** exists with Name **Data Science 2026** and Description **Intro to data science**.

**Steps**

1. Open edit for **Data Science 2026**.
2. Change **Description** to **Intro to data science — advanced track**.
3. Leave **Name** as **Data Science 2026**.
4. Click **Save**.

**Expected result**

- **Name** remains **Data Science 2026** in the list.
- **Description** updates to the new text (where shown).

**Gherkin**

```gherkin
Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

---

### TC-004 — Save with no field changes keeps data intact

**Priority:** Medium

**Preconditions**

- Program **Mobile Apps 2026** exists with known Name and Description.

**Steps**

1. Open edit for **Mobile Apps 2026**.
2. Do not change any fields.
3. Click **Save**.

**Expected result**

- Modal closes; list still shows **Mobile Apps 2026** with original values.
- No duplicate row or corrupted data.

**Gherkin**

```gherkin
Scenario: Save without edits leaves program unchanged
  Given I am editing "Mobile Apps 2026"
  When I click Save without changing any fields
  Then the modal closes
  And the program list still shows "Mobile Apps 2026" with the same details
```

---

## Negative flows

### TC-005 — Empty Name prevents save on edit

**Priority:** High

**Preconditions**

- User is editing **Web Development 2026 - Updated**.

**Steps**

1. Clear the **Name** field completely.
2. Observe **Save** and attempt submit.

**Expected result**

- **Save** is disabled or validation blocks submit.
- Program name in the list remains **Web Development 2026 - Updated**.

**Gherkin**

```gherkin
Scenario: Empty name on edit is not saved
  Given I am editing "Web Development 2026 - Updated"
  When I clear the Name field
  Then the Save button is disabled or save is rejected
  And the program list still shows "Web Development 2026 - Updated"
```

---

### TC-006 — Duplicate name on edit is rejected

**Priority:** High

**Preconditions**

- Programs **Web Development 2026 - Updated** and **Data Science 2026** exist.

**Steps**

1. Edit **Data Science 2026**.
2. Change **Name** to **Web Development 2026 - Updated**.
3. Click **Save**.

**Expected result**

- Save fails with duplicate-name error.
- List still shows **Data Science 2026** and **Web Development 2026 - Updated** as separate programs.

**Gherkin**

```gherkin
Scenario: Renaming to an existing program name is rejected
  Given I am editing "Data Science 2026"
  And a program named "Web Development 2026 - Updated" already exists
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then I see an error indicating the name already exists
  And the program list still shows "Data Science 2026"
```

---

### TC-007 — Unsaved edit changes do not appear after Cancel

**Priority:** Medium

**Preconditions**

- Program **Cloud Computing 2026** exists.

**Steps**

1. Open edit for **Cloud Computing 2026**.
2. Change **Name** to **Should Not Persist**.
3. Click **Cancel**.

**Expected result**

- Modal closes; list still shows **Cloud Computing 2026**.

**Gherkin**

```gherkin
Scenario: Cancel edit discards name change
  Given I am editing "Cloud Computing 2026"
  When I change the Name to "Should Not Persist"
  And I click Cancel
  Then the modal closes
  And the program list still shows "Cloud Computing 2026"
```

---

## Edge cases

### TC-008 — Special characters preserved on edit

**Priority:** Medium

**Preconditions**

- Program **Legacy Program 2025** exists.

**Steps**

1. Edit **Legacy Program 2025**.
2. Set **Name** to **Informatique & IA — Niveau 2 (2026)**.
3. Set **Description** to **Cours: "advanced" & <basics>**.
4. Click **Save**.

**Expected result**

- Values display as plain text in the list; no script execution.

**Gherkin**

```gherkin
Scenario: Special characters saved on edit
  Given I am editing "Legacy Program 2025"
  When I change the Name to "Informatique & IA — Niveau 2 (2026)"
  And I change the Description to "Cours: \"advanced\" & <basics>"
  And I click Save
  Then the program list shows "Informatique & IA — Niveau 2 (2026)"
```

---

### TC-009 — Name at maximum length on edit

**Priority:** Medium

**Preconditions**

- Program **Max Length Edit Test** exists; max name length is 255 characters (confirm in spec).

**Steps**

1. Edit the program.
2. Set **Name** to a valid 255-character string.
3. Click **Save**.

**Expected result**

- Save succeeds; full name stored.

**Gherkin**

```gherkin
Scenario: Program name at max length on edit is accepted
  Given I am editing "Max Length Edit Test"
  When I change the Name to a 255-character valid string
  And I click Save
  Then the modal closes
  And the program list shows the updated 255-character name
```

---

### TC-010 — Whitespace-only Name on edit treated as invalid

**Priority:** Medium

**Preconditions**

- User is editing **Web Development 2026 - Updated**.

**Steps**

1. Replace **Name** with three spaces only.
2. Attempt **Save**.

**Expected result**

- Form not submitted; name treated as empty/invalid; list unchanged.

**Gherkin**

```gherkin
Scenario: Whitespace-only name on edit is rejected
  Given I am editing "Web Development 2026 - Updated"
  When I change the Name to "   "
  Then the Save button is disabled or save is rejected
  And the program list still shows "Web Development 2026 - Updated"
```

---

### TC-011 — Leading and trailing spaces on Name handled consistently

**Priority:** Low

**Preconditions**

- Program **UX Design 2026** exists.

**Steps**

1. Edit **UX Design 2026**.
2. Set **Name** to **  UX Design 2026 Pro  **.
3. Click **Save**.

**Expected result**

- Trim or reject per product rules; no confusing duplicate entries.

**Gherkin**

```gherkin
Scenario: Leading and trailing spaces on edit handled consistently
  Given I am editing "UX Design 2026"
  When I change the Name to "  UX Design 2026 Pro  "
  And I click Save
  Then the saved name follows documented trim rules
```

---

## Traceability to acceptance criteria

| AC scenario | Test case(s) |
|-------------|----------------|
| Open program for editing | TC-001 |
| Successfully edit a program name | TC-002 |
| Edit preserves unchanged fields | TC-003 |

---

## Ambiguities and gaps in the acceptance criteria

1. **Login role** — Not stated for edit flows; assumed admin like DS-1.
2. **Save disabled vs validation message** — Not specified when Name is invalid.
3. **Duplicate names on edit** — Not in ACs; covered in TC-006 by analogy to create rules.
4. **Description required on edit** — AC only covers changing Description; clearing Description not specified.
5. **Immediate list update** — AC says “immediately”; pagination/search refresh behavior undefined.
6. **Concurrent edits** — Two admins editing same program not addressed.
7. **Field label** — AC uses “Name” vs DS-1 “Program Name”; assumed same field.
8. **Cancel / X** — Not in DS-2 ACs; partial overlap with discard behavior (TC-007).
