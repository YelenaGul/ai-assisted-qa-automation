---
name: explore-and-generate
description: >-
  ALWAYS apply this skill when the user says "find what we're not testing",
  "explore <page> for untested flows", or "expand coverage". Use it to find
  untested user flows and produce one Gherkin test plan when no ticket exists.
  Do NOT use it when a ticket already exists (that's jira-ticket-analyzer; this
  is for when there's no ticket).
---

# Explore and generate

Read-only exploration. Do not edit application source, tests, or config. Do not write the Playwright spec. Output a plan for the test-writer to implement, and stop until the human accepts it.

If the user names a Jira ticket (a key such as DS-1), stop. That work belongs to jira-ticket-analyzer.

## Steps

1. **Map covered flows by reading `tests/`.** List the user flows the existing specs already exercise (page, action, outcome). Ignore helpers that do not assert a flow.

2. **Crawl the target via the Playwright MCP and read the a11y tree, not pixels.** Open the page the user named (or the app's main flows if they did not). Use accessibility snapshots (roles, names, states). Do not use screenshots as the source of truth.

3. **Enumerate real user flows the UI supports.** From the a11y tree, list flows a user can actually complete: entry point, action, observable result. Skip controls that are not reachable.

4. **Diff to find the coverage gap.** Compare step 3 to step 1. Keep only flows with no matching spec.

5. **Pick the highest-value uncovered flow with a reason, one per run.** Choose a single flow. State why it outranks the others (user-facing risk, frequency, or data loss). Leave the rest unplanned.

6. **Output a Gherkin test plan (positive path + one edge case, every Then assertable) for the test-writer to implement.** Two scenarios only. Each `Then` names an observable UI fact (visible text, role, state, URL, or count). No "works correctly" or "is successful".

## Plan shape

```gherkin
Feature: <flow name>

  # Chosen because: <one sentence>

  Scenario: <positive path>
    Given <starting state the UI actually has>
    When <the user action>
    Then <observable outcome>

  Scenario: <one edge case>
    Given <starting state>
    When <the edge action>
    Then <observable outcome>
```

Hand this plan to the human. Do not implement it in this run.
