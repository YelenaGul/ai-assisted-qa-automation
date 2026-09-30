# Test Cases: Create Program (DS-1)

**Application:** Didaxis Studio — `https://test.didaxis.studio`  
**Full test plan:** [DS-1_output.md](./DS-1_output.md)  
**Playwright:** `tests/ds1-create-program.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- `DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD` set (see `.env-example`).
- User logged in before each test (`beforeEach` → Sign In).
- Names use unique suffix `{prefix}-{timestamp}` on the shared tenant.

## Automation coverage summary

| Plan TC | Title (short) | Status | Playwright test |
|---------|---------------|--------|-----------------|
| TC-001 | Form shows required fields | **Automated** | TC-001 |
| TC-002 | New program in list after create | **Automated** | TC-002 |
| TC-003 | Create with empty Description | **Automated** | TC-004 *(spec ID)* |
| TC-004 | Create disabled when name empty | **Automated** | TC-003 *(spec ID)* |
| TC-005 | Modal/list unchanged when Create disabled | **Not automated** | — |
| TC-006 | Duplicate name rejected | **Partial** | TC-007 documents *allowed* duplicates on test tenant |
| TC-007 | Non-admin cannot create | **Not automated** | — |
| TC-008 | Name at max length (255) | **Partial** | TC-006 uses ~100 chars, not 255 |
| TC-009 | Name over max rejected | **Not automated** | — |
| TC-010 | Special chars in name and description | **Automated** | TC-005 *(spec ID)* |
| TC-011 | Whitespace-only name invalid | **Automated** | TC-008 *(spec ID)* |
| TC-012 | Leading/trailing spaces on name | **Not automated** | — |
| TC-013 | Description at max length | **Not automated** | — |
| TC-014 | Single-character name boundary | **Not automated** | — |

**Counts:** 14 plan cases — 8 automated in spec (some IDs differ from plan); 6 not automated; 2 partial / behavior differs from plan.

---

### TC-001 — Program creation form displays required fields

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-001: program creation form shows Program Name and Description`

**Steps**

1. Navigate to **Programs**; click **+ New Program**.

**Expected result**

- **New Program** dialog visible; **Program Name** and **Description** editable; **Create** visible.

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

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-002: created program appears in the list and modal closes`

**Steps**

1. Open **+ New Program**; enter unique name and description; click **Create**.

**Expected result**

- Modal closes; program appears in the list.

---

### TC-003 — Program can be created with Description left empty

**Priority:** Medium | **Type:** Positive  
**Automation:** **Automated** — `TC-004: program can be created with empty Description`

**Steps**

1. Open **+ New Program**; enter unique **Program Name**; leave **Description** empty; **Create**.

**Expected result**

- Program listed; no required-description error (unless product rules change).

---

### TC-004 — Create remains disabled when Program Name is empty

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-003: Create is disabled when Program Name is empty`

**Steps**

1. Open create form; leave **Program Name** empty; optionally fill **Description**.

**Expected result**

- **Create** disabled; no new program added.

---

### TC-005 — Modal stays open and list unchanged when Create is disabled

**Priority:** High | **Type:** Negative  
**Automation:** **Not automated** — no spec asserts list count unchanged with empty name before cancel.

**Steps**

1. Open form with empty **Program Name**; confirm **Create** disabled; close via **Cancel** without saving.

**Expected result**

- No new row from this session; user cannot submit via disabled **Create**.

---

### TC-006 — Duplicate program name is rejected

**Priority:** High | **Type:** Negative  
**Automation:** **Partial / behavior mismatch** — `TC-007: duplicate program titles can exist as separate list entries` (test tenant *allows* two rows with the same name).

**Steps**

1. Create **Web Development 2026** (or unique base); attempt second create with same name.

**Expected result (plan)**

- Not duplicated; error shown; modal behavior per product rules.

**Expected result (automation on test tenant)**

- Two rows may share the same name — documents current behavior.

---

### TC-007 — Non-admin user cannot create a program

**Priority:** Medium | **Type:** Negative  
**Automation:** **Not automated** — requires non-admin credentials / role model.

**Steps**

1. Log in as non-admin; open **Programs**; check **+ New Program** and submit path.

**Expected result**

- Create hidden, disabled, or forbidden; no new program.

---

### TC-008 — Program Name at maximum allowed length

**Priority:** Medium | **Type:** Edge  
**Automation:** **Partial** — `TC-006: long program name is accepted` (~100 characters, not 255).

**Steps**

1. Create with **Program Name** of exactly max length (plan: 255 chars).

**Expected result**

- Saves and appears in list.

---

### TC-009 — Program Name one character over maximum is rejected

**Priority:** Medium | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Enter 256-character name; attempt **Create**.

**Expected result**

- **Create** disabled or validation error; not saved.

---

### TC-010 — Special characters in Program Name and Description

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-005: program name with special characters is accepted and visible`

**Steps**

1. Create with name containing `&`, `(`, `)`, `—` and rich description text.

**Expected result**

- Plain text in list; no script execution.

---

### TC-011 — Whitespace-only Program Name keeps Create disabled

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-008: whitespace-only Program Name does not create a program`

**Steps**

1. Enter only spaces in **Program Name**; try **Create**.

**Expected result**

- **Create** disabled or no visible program row for whitespace-only name.

---

### TC-012 — Leading and trailing spaces in Program Name

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Create with name `  Mobile Apps 2026  `.

**Expected result**

- Trim or reject per rules; no ambiguous spacing duplicates.

---

### TC-013 — Description at maximum allowed length

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Create with 2000-character **Description** (confirm max in UI).

**Expected result**

- Saves; full text available on edit/view.

---

### TC-014 — Minimum valid Program Name (single character)

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Create with **Program Name** `X` and short description.

**Expected result**

- Accepted or rejected per documented min-length rule.
