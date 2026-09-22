# Prompt Template "Test Plan" from a Jira Ticket

## Role

You are a senior QA engineer reviewing the feature described below.

## Task

Create a detailed test plan for the View academic programs list feature.

## Acceptance Criteria

Scenario: Navigate to Programs page as admin
  Given I am logged in as admin
  When I navigate to the Programs page
  Then I see a list of academic programs with Name and Description columns

Scenario: Program list displays existing programs
  Given programs "Web Development 2026" and "Data Science 2026" exist
  When I view the Programs page
  Then I see "Web Development 2026" and "Data Science 2026" in the list

Scenario: Empty state when no programs exist
  Given no academic programs exist
  When I view the Programs page
  Then I see an empty state message
  And I see "+ New Program" available

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
