---
name: jira-ticket-to-gherkin
description: >-
  Turns a Jira ticket's acceptance criteria into structured, reviewable Gherkin
  test scenarios, then validates them against the live Didaxis app (browser MCP,
  or agent-browser / Playwright CLI if MCP is unavailable).
  Use whenever the user references a Jira ticket (DS-1, DS-2, etc.) and asks for
  test cases, a test plan, scenarios, or wants to plan testing for a ticket — even
  if they don't say the word "Gherkin".
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
- **Edge-case scenarios** — boundaries, empty inputs, duplicates, special characters, max length, single-item lists, **API/network failures on programs** (503 save, empty list, malformed JSON, 401/403/404/5xx when relevant), etc.
- **Given / When / Then** — Given sets the starting state, When is the action under test, Then is the observable expected outcome. Use `And` / `But` only to chain steps in the same phase.
- **Group scenarios** with comments: `# Happy paths`, `# Negative`, `# Edge cases`.
- **Use real, specific values** from the ticket — never placeholders like `<name>` or `example.com` unless the ticket itself uses them.
- End the file with a comment block listing **ambiguities or gaps** in the ticket's acceptance criteria so QA can resolve them before automation.

### 3. Validate against the live app (required)

Do **not** treat the first Gherkin draft as final until you have walked the real UI.

1. **Base URL** — `DIDAXIS_URL` from `.env` (same target Playwright uses).
2. **Explore the UI** — use the first option that works (same evidence either way: roles, labels, flows, messages):

   | Priority | Tool | How |
   |----------|------|-----|
   | 1 | **Browser MCP** (`cursor-ide-browser`) | `browser_navigate` → `browser_lock` → `browser_snapshot` / interact → `browser_unlock` |
   | 2 | **agent-browser CLI** | `npx agent-browser open <url>` → `snapshot` (a11y tree + refs) → `click` / `find role …` — run `agent-browser skills get` or `npx skills add vercel-labs/agent-browser` if commands are unfamiliar; reuse `playwright/.auth/` via `state load` / `--state` when possible |
   | 3 | **Playwright CLI** | `npx playwright codegen <url>` for locator discovery; or `npx playwright test --headed` on a minimal exploratory spec; load `storageState` from `playwright/.auth/` after `npx playwright test --project=setup` |

   If none of the above is available, stop and ask the human to enable browser MCP or install `agent-browser` — do not ship Gherkin-only plans for UI tickets.

3. **Auth** — sign in via the login page (credentials from `.env`; never paste secrets into chat). If login is blocked (captcha, SSO), stop and ask the human to complete auth, then continue.
4. **For each scenario group**, confirm:
   - Navigation path and starting state match reality
   - Control names usable for automation: roles, accessible names, labels (not guessed from Jira copy)
   - Success and failure outcomes (messages, disabled buttons, list updates) match what you see
   - For **network/API edge cases** on programs, note observed error and empty-state copy in the feature file (or “no visible message”) for test-writer — see `.cursor/skills/programs-network-edge-cases/SKILL.md`
   - ACs that are impossible or different on test env → record under ambiguities, do not fake steps
5. **Revise** `features/<ticket-key>.feature`: fix wrong labels/steps, add scenarios the app exposes but Jira omitted, tighten `Then` clauses to observable UI facts.
6. **Optional note** at the top of the feature file (comment): `# UI verified on <date> against <host>` and bullet any locator hints for test-writer (role + name only).

Skip live UI exploration only when the ticket is explicitly non-UI (API-only, docs) — say so in ambiguities. Record which tool you used in the UI verification summary.

### 4. Save output

- Create `features/` at the project root if it does not exist.
- Save as `features/<ticket-key>.feature` (e.g. `features/DS-2.feature`).
- Tell the user where the file was saved, scenario counts by group, and a short **UI verification summary** (what you exercised, what differed from Jira).

Do **not** write Playwright tests in this skill unless the user explicitly asks after reviewing the feature file.

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
- [ ] **Live app explored** for UI tickets; Gherkin updated from what you saw (or skip reason documented)
- [ ] Scenario titles describe the **outcome**, not the implementation
- [ ] Steps use **real** control labels/names from the app where the UI is involved
- [ ] Steps are executable by a human tester without reading code
- [ ] No duplicate scenarios that only differ by wording
- [ ] Ambiguities block lists open questions, not guesses disguised as tests
