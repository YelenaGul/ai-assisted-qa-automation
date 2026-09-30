# Test Cases: Program List & Display (DS-5)

**Application:** Didaxis Studio  
**Full test plan:** [DS-5_output.md](./DS-5_output.md)  
**Playwright:** `tests/ds5-program-list.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- Logged in; list assertions use **main** → **table** with **Program** column.
- Row cells: name and description as paragraphs in the first column.

## Automation coverage summary

| Plan TC | Title (short) | Status | Playwright test |
|---------|---------------|--------|-----------------|
| TC-001 | List shows name and description | **Automated** | TC-001 |
| TC-002 | Empty catalog empty state | **Skipped** | TC-002 *(always skip on shared tenant)* |
| TC-003 | Single program full details | **Automated** | TC-003 |
| TC-004 | Deleted programs not listed | **Automated** | TC-004 |
| TC-005 | Unauthorized user list access | **Not automated** | — |
| TC-006 | Long description layout | **Automated** | TC-006 *(500 chars; plan 2000)* |
| TC-007 | Special characters plain text | **Automated** | TC-007 |
| TC-008 | Filter by program name | **Not automated** | — |
| TC-009 | Filter no matches empty results | **Not automated** | — |
| TC-010 | Many programs pagination/scroll | **Not automated** | — |
| TC-011 | Empty description in list | **Not automated** | — |

**Supplementary automation (Playwright `TC-010`, not in plan as separate ID):** Programs page layout — heading, subtitle, **Program** column, **+ New Program**, table visible. Plan **TC-010** is large-catalog pagination; spec reuses ID **TC-010** for layout.

**Counts:** 11 plan cases — 6 automated, 1 skipped, 4 not automated; +1 supplementary layout test.

---

### TC-001 — List shows name and description for each program

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-001: list shows each program name and description`

**Steps**

1. Create two programs with distinct names and descriptions; open **Programs**.

**Expected result**

- Table visible; each row shows correct name and description.

---

### TC-002 — Empty state when no programs exist

**Priority:** High | **Type:** Positive  
**Automation:** **Skipped** — `TC-002: empty state messaging when catalog has no rows`  
**Reason:** Shared `test.didaxis.studio` always has programs; needs isolated tenant.

**Steps**

1. Open **Programs** with zero programs.

**Expected result**

- No-program message and **+ New Program** (or equivalent CTA).

---

### TC-003 — Single program displays correctly in list

**Priority:** Medium | **Type:** Positive  
**Automation:** **Automated** — `TC-003: single program entry shows full details`

**Steps**

1. Create one program; open **Programs**.

**Expected result**

- Row matches name and description.

---

### TC-004 — List does not show programs that were deleted

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-004: deleted programs are not listed`

**Steps**

1. Create program; delete with confirm; open **Programs**.

**Expected result**

- Deleted name absent.

---

### TC-005 — Unauthorized user does not see admin-only list data incorrectly

**Priority:** Medium | **Type:** Negative  
**Automation:** **Not automated** — requires non-admin / permission model.

**Steps**

1. Open **Programs** as user without program management access.

**Expected result**

- Access denied, allowed empty view, or permission-filtered subset—not forbidden full catalog.

---

### TC-006 — Long description display (truncate vs wrap)

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-006: long description displays in list without breaking layout`  
**Note:** Automation uses 500-character description; plan assumes up to 2000.

**Steps**

1. Create program with long description; open **Programs**.

**Expected result**

- No layout break; text visible per UI rules (automation checks first 80 chars).

---

### TC-007 — Special characters visible in name and description

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-007: special characters render as plain text in list`

**Steps**

1. Create program with `&`, em dash, quotes, and markup-like description text.

**Expected result**

- Plain text in list.

---

### TC-008 — Filter list by program name (if filter control exists)

**Priority:** Medium | **Type:** Positive  
**Automation:** **Not automated** — no search/filter control on current UI.

**Steps**

1. Filter by **Web Development** with two programs present.

**Expected result**

- Matching program shown; other hidden until filter cleared.

---

### TC-009 — Filter with no matches shows empty results state

**Priority:** Medium | **Type:** Negative  
**Automation:** **Not automated** — no filter UI.

**Steps**

1. Filter by **NoMatchXYZ123**.

**Expected result**

- No rows; “no results” message distinct from global empty catalog (TC-002).

---

### TC-010 — Many programs — pagination or scroll

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated** — needs 50+ seeded programs.

**Steps**

1. Open **Programs** with large catalog; paginate or scroll.

**Expected result**

- All programs reachable; name/description per row; acceptable performance.

---

### TC-011 — Empty description displays gracefully

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Create **No Description Program 2026** with empty **Description**; view list.

**Expected result**

- Program listed; empty description shown as blank, em dash, or “—”—not error.

---

### Supplementary — Programs page shows list controls and new program action

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-010: programs page shows list controls and new program action`  
**Note:** Playwright test ID **TC-010**; this is **not** plan TC-010 (pagination).

**Steps**

1. Navigate to **Programs**.

**Expected result**

- Heading **Programs**; subtitle *Manage academic programs and semesters*; **Program** column; **+ New Program**; table visible.
