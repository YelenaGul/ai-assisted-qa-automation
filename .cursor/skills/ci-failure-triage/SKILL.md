---
name: ci-failure-triage
description: >-
  Pulls failed GitHub Actions run logs and the playwright-report artifact
  via gh CLI, reads Playwright errors and traces, cross-references spec,
  POM, and app source in the repo, classifies real app bug vs test issue,
  and posts a structured diagnosis to the PR. Use when a CI run is red,
  when the user mentions CI failure triage or #CI Failure Triage, or
  whenever a build fails—even if triage is not explicitly requested.
---

# CI Failure Triage

Invoke **systematic-debugging** first (root cause before fixes). For product defects, invoke **jira-bug-reporter** after classification.

## Steps

1. Pull the failed run's logs + playwright-report artifact (Github MCP / GH CLI).
2. Read the playwright error: failing test, expected vs recieved, trace path.
3. Cross-reference: the spec, the POM, and the Didaxis source in the repo if exist.
4. Classify:real app bug (route to a jira bug-reporter) vs test issue (propose a patch for human review).
5. Report: post root cause, affected file, expected/actual, suggested fix, and eviedence (trace/screenshot + run id) as a PR comment.

## Rules

- Never merge a fix automatically - propose, a human approves.
- For real defect, reuse the bug reporter skill and link the story.
- The diagnosis must name the source location and cause, not just the symptom.

## Agent workflow (after the steps above)

1. **Identify the run** — Latest failed workflow on the branch, or the run id/URL the user gave. Confirm the failed job step (usually `npx playwright test`).
2. **Collect evidence** — Failed log tail, unique failing test titles, error messages, `test-results/` paths, trace zip paths. Unzip or open the playwright-report artifact when logs are thin.
3. **Investigate in repo** — Read the failing spec line, helpers, and POM (`pages/`). Search for Didaxis app source; if absent, state the API/UI boundary (e.g. `tests/helpers/didaxis-api.ts`).
4. **Classify each failure** — App bug (product violates AC/Confluence), test issue (wrong assertion, timeout, flake, env), or infra (secrets, install). Group failures that share one root cause.
5. **Deliver** — Post the PR comment from [pr-comment-template.md](pr-comment-template.md). If there is no open PR (e.g. failed push to `main`), write the same body to `ci-artifacts/run-<id>/CI-TRIAGE-PR-COMMENT.md` and tell the user where to paste it.

Commands and artifact paths: [reference.md](reference.md). Example output: [examples.md](examples.md).
