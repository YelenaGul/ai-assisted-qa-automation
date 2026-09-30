# Test Cases: Program Name Validation (DS-3)

**Application:** Didaxis Studio  
**Full test plan:** [DS-3_output.md](./DS-3_output.md)  
**Playwright:** `tests/ds3-program-validation.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- Logged in; **New Program** create flow unless noted.
- Assertions use **New Program** dialog and programs table row counts.

## Automation coverage summary

| Plan TC | Title (short) | Status | Playwright test |
|---------|---------------|--------|-----------------|
| TC-001 | Special characters in name | **Automated** | TC-001 |
| TC-002 | Hyphen and digits accepted | **Automated** | TC-002 |
| TC-003 | Whitespace-only not submitted | **Automated** | TC-003 |
| TC-004 | Duplicate shows error / blocked | **Automated** | TC-004 |
| TC-005 | Empty name cannot create | **Automated** | TC-005 |
| TC-006 | Duplicate not created when error | **Automated** | TC-006 |
| TC-007 | Case-insensitive duplicate (if rule) | **Automated** | TC-007 |
| TC-008 | Leading/trailing spaces duplicate | **Automated** | TC-008 |
| TC-009 | Name at max length valid | **Not automated** | — |
| TC-010 | Name over max rejected | **Not automated** | — |
| TC-011 | Duplicate prevention on edit rename | **Not automated** | — |
| TC-012 | Unicode / accented name | **Not automated** | — |

**Counts:** 12 plan cases — 8 automated; 4 not automated.

---

### TC-001 — Program name with special characters is created

**Priority:** High | **Type:** Positive  
**Automation:** **Automated** — `TC-001: program name with special characters is created`

**Steps**

1. Create `Informatique & IA - Niveau 2-{timestamp}` with description.

**Expected result**

- Listed once.

---

### TC-002 — Valid name with hyphen and digits is accepted

**Priority:** Medium | **Type:** Positive  
**Automation:** **Automated** — `TC-002: hyphenated alphanumeric program name is accepted`

**Steps**

1. Create `Web-Dev 2026-{timestamp}`.

**Expected result**

- Appears in list.

---

### TC-003 — Whitespace-only program name is not submitted

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-003: whitespace-only program name is not submitted`

**Steps**

1. Enter `   ` as name; fill description; try **Create**.

**Expected result**

- **Create** disabled or dialog remains open.

---

### TC-004 — Duplicate program name on create shows error

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-004: duplicate program name on create shows error`

**Steps**

1. Create base name; attempt second create with same name.

**Expected result**

- One row **or** inline error / open dialog.

---

### TC-005 — Empty program name cannot create duplicate of empty

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-005: empty program name does not submit`

**Steps**

1. Leave name empty; fill description.

**Expected result**

- **Create** disabled.

---

### TC-006 — Duplicate not created when error is shown

**Priority:** High | **Type:** Negative  
**Automation:** **Automated** — `TC-006: duplicate error leaves only one program with that name`

**Steps**

1. Create canonical program; retry identical name.

**Expected result**

- Exactly one row for that name.

---

### TC-007 — Case-insensitive duplicate (if product rule)

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-007: duplicate check is case-sensitive or rejects case variant`

**Steps**

1. Create `Web Development 2026-{timestamp}`; attempt case-variant name.

**Expected result**

- Reject or allow per product; row count ≤ 2.

---

### TC-008 — Leading/trailing spaces make name unique or duplicate

**Priority:** Medium | **Type:** Edge  
**Automation:** **Automated** — `TC-008: leading and trailing spaces are trimmed or rejected as duplicate`

**Steps**

1. Create **N**; attempt create with ` N `.

**Expected result**

- Only one logical **N** in list.

---

### TC-009 — Program name at max length is valid

**Priority:** Medium | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Create with unique 255-character name.

**Expected result**

- Created successfully.

---

### TC-010 — Program name over max length is rejected

**Priority:** Medium | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Enter 256-character name; attempt **Create**.

**Expected result**

- Not submitted; validation or disabled **Create**.

---

### TC-011 — Duplicate prevention on edit rename

**Priority:** Medium | **Type:** Negative  
**Automation:** **Not automated** — edit flow; see DS-2 TC-006 for partial overlap.

**Steps**

1. Edit **Data Science 2026**; rename to **Web Development 2026**; **Save**.

**Expected result**

- Duplicate error; original name unchanged.

---

### TC-012 — Unicode and accented characters in name

**Priority:** Low | **Type:** Edge  
**Automation:** **Not automated**

**Steps**

1. Create **Programme Été 2026 — Montréal**.

**Expected result**

- Created and displayed correctly.
