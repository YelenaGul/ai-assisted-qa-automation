# Prompt Template "Test Plan" from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the Cancel program form without saving feature.

## Acceptance Criteria

Scenario: Cancel create program discards input
  Given I am on the program creation form
  And I entered Program Name "Draft Program"
  When I click Cancel
  Then the modal closes
  And "Draft Program" does not appear in the program list

Scenario: Cancel edit discards changes
  Given I am editing "Web Development 2026"
  When I change the Name to "Should Not Save"
  And I click Cancel
  Then the modal closes
  And the program list still shows "Web Development 2026"

Scenario: Close modal with X discards unsaved changes
  Given I am on the program creation form with unsaved input
  When I click the close (X) control
  Then the modal closes without creating a program

## Requirements for the test plan

- All test cases must be in Gherkin

- Cover every AC with at least one test case

- Add edge cases the ACs don't mention

  (boundary values, empty inputs, special characters, duplicates, max-length)

- Add negative test cases (what should NOT happen)

- Structure each test case as:

  - ID (TC-001, TC-002, etc.)

  - Title (expected behavior, not action)

  - Preconditions

  - Steps (numbered)

  - Expected result

  - Priority (High / Medium / Low)

- Group by: Positive flows, Negative flows, Edge cases

## Output

- Structured test plan in Markdown

- Use real field names and values, not placeholders

- At the end: list any ambiguities or gaps in the ACs
