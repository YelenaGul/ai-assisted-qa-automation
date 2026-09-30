# Automated Test Cases: Program Name Validation (DS-3)

**Application:** Didaxis Studio  
**Automation:** `tests/ds3-program-validation.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- User logged in; tests run on **New Program** create flow.
- Validation assertions use the **New Program** dialog and programs table row counts.

---

### TC-001 — Program name with special characters is created

**Priority:** High  
**Type:** Positive

**Steps**

1. Create program `Informatique & IA - Niveau 2-{timestamp}` with French description.

**Expected result**

- Program listed once.

**Gherkin**

```gherkin
Scenario: Accept program name with special characters
  When I create a program with special characters in the name
  Then the program is created successfully
```

---

### TC-002 — Hyphenated alphanumeric program name is accepted

**Priority:** Medium  
**Type:** Positive

**Steps**

1. Create `Web-Dev 2026-{timestamp}` with description `Part-time cohort`.

**Expected result**

- Program appears in list.

---

### TC-003 — Whitespace-only program name is not submitted

**Priority:** High  
**Type:** Negative

**Steps**

1. Open create form; enter `   ` as name; fill description.
2. Try **Create**.

**Expected result**

- **Create** disabled **or** dialog remains open with name field visible.

---

### TC-004 — Duplicate program name on create is blocked or shows error

**Priority:** High  
**Type:** Negative

**Steps**

1. Create program with unique base name.
2. Attempt second create with same name.

**Expected result**

- Only one row for that name **or** inline error / open dialog indicates block.

---

### TC-005 — Empty program name does not submit

**Priority:** High  
**Type:** Negative

**Steps**

1. Open create form; leave name empty; fill description.

**Expected result**

- **Create** is disabled.

---

### TC-006 — Duplicate attempt leaves only one program with that name

**Priority:** High  
**Type:** Negative

**Steps**

1. Create canonical program.
2. Retry create with identical name.

**Expected result**

- Exactly one table row matches the name.

---

### TC-007 — Case variant duplicate check

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Create `Web Development 2026-{timestamp}`.
2. Attempt create with `web` substituted in the prefix segment.

**Expected result**

- Behavior matches product rules (reject with open dialog, or allow second row); total rows ≤ 2.

---

### TC-008 — Leading and trailing spaces trimmed or rejected as duplicate

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Create program **N**.
2. Attempt create with ` N ` (padded).

**Expected result**

- Only one logical program **N** in the list (trim/reject).
