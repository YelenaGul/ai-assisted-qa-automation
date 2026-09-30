# Automated Test Cases: Program List & Display (DS-5)

**Application:** Didaxis Studio  
**Automation:** `tests/ds5-program-list.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- User logged in; list assertions use **main** → **table** with **Program** column.
- Row cells show program name and description as separate paragraphs in the first column.

---

### TC-001 — List shows each program name and description

**Priority:** High  
**Type:** Positive

**Steps**

1. Create two programs with distinct names and descriptions.
2. Open **Programs**.

**Expected result**

- Table visible; each program row shows correct name and description text.

**Gherkin**

```gherkin
Scenario: Display program list with key details
  Given programs exist in the system
  When I navigate to the Programs page
  Then I see each program's name and description in the list
```

---

### TC-002 — Empty state when catalog has no rows

**Priority:** High  
**Type:** Positive  
**Automation status:** Skipped on shared `test.didaxis.studio` (tenant always has data).

**Steps**

1. Navigate to **Programs** with zero programs.

**Expected result**

- Empty-state message and **+ New Program** action.

---

### TC-003 — Single program entry shows full details

**Priority:** Medium  
**Type:** Positive

**Steps**

1. Create one program with known name and description.
2. Open **Programs**.

**Expected result**

- Row matches name and description exactly.

---

### TC-004 — Deleted programs are not listed

**Priority:** High  
**Type:** Negative

**Steps**

1. Create program; delete with confirm.
2. Open **Programs**.

**Expected result**

- Deleted name absent from table.

---

### TC-006 — Long description displays without breaking layout

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Create program with 500-character description.
2. Open **Programs**; locate row.

**Expected result**

- Row visible; description paragraph contains at least first 80 characters.

---

### TC-007 — Special characters render as plain text in list

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Create program with `&`, em dash, quotes in name; `<tag> & 'quote'` in description.

**Expected result**

- Exact text shown in list (no HTML rendering).

---

### TC-010 — Programs page shows list controls and new program action

**Priority:** High  
**Type:** Positive

**Steps**

1. Navigate to **Programs**.

**Expected result**

- Heading **Programs**; subtitle *Manage academic programs and semesters*; **Program** column; **+ New Program** button; table visible.

**Note:** Filter/search TCs (TC-008/009) are not automated — no filter control on current UI.
