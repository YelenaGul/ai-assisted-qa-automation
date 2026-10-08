---
name: jira-ticket-to-gherkin
description: Turns a Jira ticket's acceptance criteria into structured, reviewable Gherkin test scenarios. Use this skill whenever the user references a Jira ticket (DS-1, DS-2, etc.) and asks for test cases, a test plan, scenarios, or wants to plan testing for a ticket — even if they don't say the word "Gherkin".
---

# Jira Ticket to Gherkin

Generate reviewable test scenarios from a Jira ticket. The Gherkin output is a human-readable checkpoint — the QA reviews it before any Playwright code gets written.

## Keywords

Jira ticket, DS-1, test cases, test plan, scenarios, acceptance criteria, Gherkin, feature file, plan testing, QA scenarios

## Steps

### 1. Load the Jira ticket

1. Call `getAccessibleAtlassianResources` once; reuse the returned `cloudId`.
2. Parse the ticket key from the user message (e.g. `DS-2`, `PROJ-123`).
3. Call `getJiraIssue` with that `cloudId` and issue key. Request fields needed for testing: `summary`, `description`, and any custom field that holds acceptance criteria (use `view: evidence` or `full` if ACs are not in the plain description).
4. Extract:
   - **Title** — issue summary
   - **Description** — full narrative context
   - **Acceptance criteria** — numbered/bulleted ACs from description, dedicated AC field, or checklist; treat each distinct AC as a separate requirement to cover

If the ticket cannot be fetched, stop and report the error; do not invent ACs.

### 2. Generate the feature file

Build one Gherkin `.feature` file:

- **One Feature**, named after the ticket (use ticket key + summary, e.g. `Feature: DS-2 Edit existing program details`).
- **Cover every acceptance criterion** with at least one Scenario.
- **Negative scenarios** — what should NOT happen (invalid input, unauthorized action, failed save, wrong UI state).
- **Edge-case scenarios** — boundaries, empty inputs, duplicates, special characters, max length, single-item lists, etc.
- **Given / When / Then** — Given sets the starting state, When is the action under test, Then is the observable expected outcome. Use `And` / `But` only to chain steps in the same phase.
- **Group scenarios** with comments: `# Happy paths`, `# Negative`, `# Edge cases`.
- **Use real, specific values** from the ticket — never placeholders like `<name>` or `example.com` unless the ticket itself uses them.
- End the file with a comment block listing **ambiguities or gaps** in the ticket's acceptance criteria so QA can resolve them before automation.

### 3. Save output

- Create `features/` at the project root if it does not exist.
- Save as `features/<ticket-key>.feature` (e.g. `features/DS-2.feature`).
- Tell the user where the file was saved and summarize scenario counts by group.

Do **not** write Playwright tests in this step unless the user explicitly asks after reviewing the feature file.

## Feature file template

```gherkin
# Generated from Jira <TICKET-KEY>: <summary>
# Review before automating.

Feature: <TICKET-KEY> <short title from ticket>

  # Happy paths

  Scenario: <observable outcome for AC n>
    Given <starting state from ticket>
    When <action under test>
    Then <expected observable result>

  # Negative

  Scenario: <what must not happen>
    Given <starting state>
    When <invalid or forbidden action>
    Then <expected failure or unchanged state>

  # Edge cases

  Scenario: <boundary or unusual input>
    Given <starting state>
    When <edge action>
    Then <expected outcome>

# ---
# Ambiguities / gaps (resolve before automation):
# - <missing precondition, role, or field label>
# - <contradiction or untestable AC>
```

## Quality checklist

Before finishing:

- [ ] Every AC from Jira has ≥1 scenario mapping (note in ambiguities if an AC is untestable as written)
- [ ] Scenario titles describe the **outcome**, not the implementation
- [ ] Steps are executable by a human tester without reading code
- [ ] No duplicate scenarios that only differ by wording
- [ ] Ambiguities block lists open questions, not guesses disguised as tests
