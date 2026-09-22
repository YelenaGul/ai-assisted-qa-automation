# Test Plan: Program List Filtering and Display (DS-5)

**Feature:** Program list filtering and display  
**Scope:** Programs page list, empty state, and list filtering (where implemented)

---

## Positive flows

### TC-001 — List shows name and description for each program

**Priority:** High

**Preconditions**

- User is logged in as admin.
- Programs exist:
  - **Web Development 2026** — **Full-stack web development program**
  - **Data Science 2026** — **Intro to data science**

**Steps**

1. Navigate to the Programs page.

**Expected result**

- List displays each program’s **name** and **description** (columns or cards per UI).

**Gherkin**

```gherkin
Scenario: Display program list with key details
  Given programs exist in the system
  When I navigate to the Programs page
  Then I see a list showing each program's name and description
```

---

### TC-002 — Empty state when no programs exist

**Priority:** High

**Preconditions**

- No academic programs exist in the system (fresh tenant or test data cleared).

**Steps**

1. Navigate to the Programs page.

**Expected result**

- Message indicates no programs have been created.
- Prompt to create the first program (e.g. **+ New Program** or equivalent CTA).

**Gherkin**

```gherkin
Scenario: Empty state when no programs exist
  Given no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
```

---

### TC-003 — Single program displays correctly in list

**Priority:** Medium

**Preconditions**

- Only **Solo Program 2026** exists with Description **Only program in catalog**.

**Steps**

1. Open Programs page.

**Expected result**

- One row/card shows **Solo Program 2026** and **Only program in catalog**.

**Gherkin**

```gherkin
Scenario: Single program list entry shows full details
  Given only the program "Solo Program 2026" exists with description "Only program in catalog"
  When I navigate to the Programs page
  Then I see "Solo Program 2026" with description "Only program in catalog"
```

---

## Negative flows

### TC-004 — List does not show programs that were deleted

**Priority:** High

**Preconditions**

- **Deleted Ghost Program** was removed via delete flow.

**Steps**

1. Navigate to Programs page.
2. Search list for **Deleted Ghost Program**.

**Expected result**

- Program not displayed.

**Gherkin**

```gherkin
Scenario: Deleted programs are not listed
  Given the program "Deleted Ghost Program" was deleted
  When I navigate to the Programs page
  Then I do not see "Deleted Ghost Program" in the list
```

---

### TC-005 — Unauthorized user does not see admin-only list data incorrectly

**Priority:** Medium

**Preconditions**

- Non-admin user without program access (if role model exists).

**Steps**

1. Navigate to Programs page as non-admin.

**Expected result**

- Access denied, empty allowed view, or filtered subset per permissions—not full admin catalog if forbidden.

**Gherkin**

```gherkin
Scenario: User without access does not see unauthorized program details
  Given I am logged in as a user without program management access
  When I navigate to the Programs page
  Then I do not see program details I am not permitted to view
```

---

## Edge cases

### TC-006 — Long description display (truncate vs wrap)

**Priority:** Medium

**Preconditions**

- Program **Long Description Program 2026** exists with Description of 2000 characters.

**Steps**

1. Open Programs page.
2. Observe how description renders in list.

**Expected result**

- Full text on expand/tooltip or consistent truncation with access to full text on detail/edit—no layout break.

**Gherkin**

```gherkin
Scenario: Long program description displays without breaking layout
  Given a program "Long Description Program 2026" exists with a 2000-character description
  When I navigate to the Programs page
  Then the list displays the description according to UI rules without layout breakage
```

---

### TC-007 — Special characters visible in name and description

**Priority:** Medium

**Preconditions**

- Program **QA & Testing — "Phase 1"** with Description **Symbols: <tag> & 'quote'**.

**Steps**

1. View Programs page.

**Expected result**

- Text rendered as plain text; HTML not executed.

**Gherkin**

```gherkin
Scenario: Special characters render safely in list
  Given a program "QA & Testing — \"Phase 1\"" exists with description "Symbols: <tag> & 'quote'"
  When I navigate to the Programs page
  Then I see the program name and description displayed as plain text
```

---

### TC-008 — Filter list by program name (if filter control exists)

**Priority:** Medium

**Preconditions**

- **Web Development 2026** and **Data Science 2026** exist.
- Programs page has search/filter input (feature title implies filtering).

**Steps**

1. Navigate to Programs page.
2. Enter **Web Development** in filter/search.
3. Apply filter.

**Expected result**

- **Web Development 2026** shown; **Data Science 2026** hidden until filter cleared.

**Gherkin**

```gherkin
Scenario: Filter programs by name substring
  Given programs "Web Development 2026" and "Data Science 2026" exist
  When I navigate to the Programs page
  And I filter the list by "Web Development"
  Then I see "Web Development 2026"
  And I do not see "Data Science 2026"
```

---

### TC-009 — Filter with no matches shows empty results state

**Priority:** Medium

**Preconditions**

- At least one program exists.

**Steps**

1. Filter by **NoMatchXYZ123**.

**Expected result**

- No program rows; clear “no results” message (distinct from global empty catalog in TC-002).

**Gherkin**

```gherkin
Scenario: Filter with no matches shows no results message
  Given programs exist in the system
  When I navigate to the Programs page
  And I filter the list by "NoMatchXYZ123"
  Then I see a message indicating no programs match the filter
  And I can clear the filter to see all programs again
```

---

### TC-010 — Many programs — pagination or scroll

**Priority:** Low

**Preconditions**

- 50+ programs seeded (e.g. **Batch Program 001** … **Batch Program 050**).

**Steps**

1. Open Programs page.
2. Navigate pages or scroll through list.

**Expected result**

- All programs reachable; name and description shown per row; performance acceptable.

**Gherkin**

```gherkin
Scenario: Large program catalog remains navigable
  Given 50 programs exist in the system
  When I navigate to the Programs page
  Then I can view all programs via pagination or scrolling
  And each visible entry shows the program name and description
```

---

### TC-011 — Empty description displays gracefully

**Priority:** Low

**Preconditions**

- **No Description Program 2026** exists with empty Description.

**Steps**

1. View Programs page.

**Expected result**

- Program listed; empty description shown as blank, em dash, or “—” per design—not undefined error.

**Gherkin**

```gherkin
Scenario: Program with empty description still appears in list
  Given a program "No Description Program 2026" exists with an empty description
  When I navigate to the Programs page
  Then I see "No Description Program 2026" in the list
  And the description area handles empty value gracefully
```

---

## Traceability to acceptance criteria

| AC scenario | Test case(s) |
|-------------|----------------|
| Display program list with key details | TC-001, TC-003 |
| Empty state when no programs exist | TC-002 |

---

## Ambiguities and gaps in the acceptance criteria

1. **Filtering** — Feature title mentions filtering; ACs only cover display and empty state (TC-008, TC-009 assume filter UI exists).
2. **Exact empty message copy** — Not specified; only intent (“no programs have been created”).
3. **Create first program prompt** — Exact CTA (**+ New Program** vs link text) not defined.
4. **Sort order** — Alphabetical, created date, or manual order not specified.
5. **Pagination** — Not mentioned for large lists (TC-010).
6. **Description optional** — Display rules for empty description not in ACs (TC-011).
7. **Roles** — Who can view the list not stated (TC-005).
8. **Real-time updates** — List refresh after create/edit/delete from another session not specified (TC-004 relates to delete).
