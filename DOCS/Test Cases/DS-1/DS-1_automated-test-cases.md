# Automated Test Cases: Create Program (DS-1)

**Application:** Didaxis Studio — `https://test.didaxis.studio`  
**Automation:** `tests/ds1-create-program.spec.ts`  
**Helpers:** `tests/helpers/didaxis.ts`

## Common preconditions

- Environment variables `DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD` are set (see `.env-example`).
- User is logged in before each test (`beforeEach` → Sign In on `/login`).
- Program names use a unique suffix (`{prefix}-{timestamp}`) to avoid collisions on the shared tenant.

---

### TC-001 — Program creation form shows Program Name and Description

**Priority:** High  
**Type:** Positive

**Steps**

1. Navigate to **Programs** (`/programs`).
2. Click **+ New Program**.

**Expected result**

- **New Program** dialog is visible.
- **Program Name** and **Description** fields are visible.
- **Create** button is visible.

**Gherkin**

```gherkin
Scenario: Open program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with Program Name and Description
  And I see the Create button
```

---

### TC-002 — Created program appears in the list and modal closes

**Priority:** High  
**Type:** Positive

**Steps**

1. Open **+ New Program**.
2. Enter a unique program name (e.g. `Web Development 2026-{timestamp}`).
3. Enter description `Full-stack web development program`.
4. Click **Create**.

**Expected result**

- Dialog closes.
- Program appears exactly once in the programs table.

**Gherkin**

```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name and Description
  And I click Create
  Then the modal closes
  And the program list shows the new program name
```

---

### TC-003 — Create is disabled when Program Name is empty

**Priority:** High  
**Type:** Negative

**Steps**

1. Open **+ New Program**.
2. Clear **Program Name**.
3. Enter any text in **Description**.

**Expected result**

- **Create** is disabled.

**Gherkin**

```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

### TC-004 — Program can be created with empty Description

**Priority:** Medium  
**Type:** Positive

**Steps**

1. Open **+ New Program**.
2. Enter a unique program name; leave **Description** empty.
3. Click **Create**.

**Expected result**

- Dialog closes; program is listed.

---

### TC-005 — Program name with special characters is accepted

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Create a program with name containing `&`, `(`, `)`, `—` (e.g. `Pay & Learn (50%) — QA-{timestamp}`).

**Expected result**

- Program appears in the list with the full name preserved.

---

### TC-006 — Long program name is accepted and visible

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Create a program whose name includes ~100 repeated characters plus a timestamp.

**Expected result**

- Program is created and visible in the list.

---

### TC-007 — Duplicate program titles can exist as separate list entries

**Priority:** Medium  
**Type:** Edge

**Steps**

1. Create a program with a unique name.
2. Open **+ New Program** again with the **same** name and a different description.
3. Click **Create**.

**Expected result**

- Two table rows display the same program name (current product behavior on test tenant).

---

### TC-008 — Whitespace-only Program Name does not create a program

**Priority:** High  
**Type:** Negative

**Steps**

1. Open **+ New Program**.
2. Enter only spaces in **Program Name**.

**Expected result**

- **Create** is disabled, **or** submit does not add a visible program row for whitespace-only name.

**Gherkin**

```gherkin
Scenario: Whitespace-only name is not accepted
  Given I am on the program creation form
  When I enter "   " as the program name
  Then the form is not submitted with a new visible program
```
