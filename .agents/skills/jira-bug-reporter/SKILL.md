---
name: jira-bug-reporter
description: Analyzes Playwright test failures, identifies root cause, and creates detailed Jira bug tickets. Use when a test fails and needs investigation and bug reporting.
---

# Jira Bug Reporter

Investigate a failed Playwright test and file a Jira Bug linked to the original ticket. Include repro steps, expected and actual results, the failing test path, and screenshot evidence.

File a Bug only for a product defect. If the assertion, test data, login, or environment is wrong, say so and stop. Do not create a ticket.

## Keywords

Playwright failure, test failed, bug, Jira bug, file a bug, root cause, screenshot evidence, steps to reproduce

## Steps

### 1. Find the failure

Use the user message, the terminal output, and `test-results/`. Record:

- Spec path, repo-relative (example: `tests/ds1-create-program.spec.ts`)
- Test title
- Error message and the stack line that failed
- Browser project (this repo uses `chromium`)

### 2. Resolve the original ticket

1. Prefer a ticket key the user named (`DS-1`).
2. Otherwise map `tests/dsN-*.spec.ts` to `DS-N` and confirm `features/DS-N.feature` exists.
3. If the key still cannot be determined, stop and ask. Do not guess a ticket.

### 3. Decide root cause

Read the failing spec, the matching scenario in `features/<ticket-key>.feature`, and `test-results/**/error-context.md` when it exists.

- **Product defect** — the app behavior disagrees with the scenario or the assertion that encodes it. Continue.
- **Test or environment** — wrong selector, bad test data, login failure, missing env. Report that and stop.

### 4. Collect a screenshot

`playwright.config.ts` does not set `screenshot`. `trace` is `on-first-retry` and local `retries` is `0`, so a normal run often has no image.

1. Use an existing `test-results/**/*.png` for this failure when one exists.
2. If none exists, re-run only that test. Do not edit `playwright.config.ts`:

```bash
npx playwright test tests/ds1-create-program.spec.ts -g "TC-001" --project=chromium --screenshot=only-on-failure
```

Replace the spec path and `-g` title with the failing test.

3. If `--screenshot` is rejected, reproduce the failing steps and save a png under `test-results/bug-evidence/`.
4. Do not file the bug with zero images.

### 5. Skip duplicates

Call `getAccessibleAtlassianResources` once and reuse the returned `cloudId`.

Search with `searchJiraIssuesUsingJql` for an open Bug in the same project already linked to the original ticket:

```text
project = DS AND issuetype = Bug AND statusCategory != Done AND issue in linkedIssues(DS-1)
```

Use the real project key and ticket key. If an open bug has a similar summary, do not create another issue. Add a comment with `addOrEditJiraIssueComment` describing the new failure, attach the new screenshot (step 8), and report that existing key.

### 6. Create the Bug

Call `createJiraIssue`:

- `cloudId` from step 5
- `projectKey` — prefix of the original key (`DS` from `DS-1`)
- `issueType`: `Bug`
- `summary` — the defect, not the test name
- `description` — markdown using the template below
- Do not copy credentials or any values from `.env`

### 7. Link it to the original ticket

Call `executeWrite` with `name` `createJiraIssueLink`. Pass `cloudId` as a top-level argument, not inside `inputs`.

```json
{
  "name": "createJiraIssueLink",
  "cloudId": "<cloudId>",
  "inputs": {
    "linkType": "Relates",
    "inwardIssue": "<new-bug-key>",
    "outwardIssue": "DS-1"
  }
}
```

`inwardIssue` is the new bug. `outwardIssue` is the original ticket. If `Relates` is rejected, call `executeRead` `listJiraIssueLinkTypes` and use that site's relates-style type name. Do not create the bug again.

### 8. Attach screenshots

For each png, call `executeWrite` `uploadAttachmentToJiraIssue` (`cloudId` top-level):

1. Phase 1 — `inputs`: `issueIdOrKey` (the bug key, or the existing bug from step 5) and `filePath` (absolute, or relative to where the command runs). The response includes `uploadCommand`.
2. Run `uploadCommand` in the shell. Keep the returned `fileId`.
3. Phase 2 — call again with `inputs`: `issueIdOrKey` and that `fileId`. This attaches the file. Do not run phase 2 twice for the same `fileId`.

### 9. Reply

Give the bug key, the Jira URL, the original ticket it relates to, and the attachment filenames. If step 5 updated an existing bug, say that instead of claiming a new issue.

## Description template

```markdown
## Steps to reproduce
1. ...

## Expected result
...

## Actual result
...

## Failed test
`tests/ds1-create-program.spec.ts` — `TC-001: ...`

## Evidence
- `test-failed-1.png` (attached)
```

Steps must be executable by a person without reading the spec. Expected result comes from the assertion or the matching Gherkin scenario. Actual result comes from the error and what the screenshot shows.

## Example

Failure: `tests/ds1-create-program.spec.ts` — `TC-002: created program appears in the list and modal closes`. The modal stays open and the list has no row. `features/DS-1.feature` expects the modal to close and the program to appear.

- **Summary:** New program stays out of the list and the modal does not close
- **Original ticket:** `DS-1`
- **Failed test line:** `` `tests/ds1-create-program.spec.ts` — `TC-002: created program appears in the list and modal closes` ``
- **Link:** Bug `Relates` to `DS-1`
- **Evidence:** the failure png attached to the bug

## Checklist

- [ ] Original ticket key is known
- [ ] Root cause is a product defect
- [ ] At least one screenshot is attached
- [ ] Description has steps, expected result, actual result, and the spec path
- [ ] No secrets from `.env`
- [ ] New bug is linked, or an existing open bug was updated instead
