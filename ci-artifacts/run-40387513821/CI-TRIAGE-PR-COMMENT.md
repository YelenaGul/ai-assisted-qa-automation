## CI failure triage — Playwright E2E

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/40387513821  
**Commit:** `6f182715787d2ad988c490629d3c524d001842b1` (`main`, push)  
**Artifact:** playwright-report (local: `ci-artifacts/run-40387513821/playwright-report/`)

**Result:** 0 failed · 64 passed · 12 skipped (~2.1m)

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 0 failing | 8 scenarios **deferred** via `test.fixme` (see below) |
| **Test issue** | 0 | — |
| **Infra / env** | 0 | — |

**Status:** CI is **green**. No new failures to patch. Skips are intentional until product fixes land.

**Didaxis application source:** not in this repo. Boundary: `POST /api/programs` (`tests/helpers/didaxis-api.ts`).

---

### Root cause (why CI was red before, now green)

**Location:** `tests/ds1-create-program.spec.ts`, `tests/ds3-program-validation.spec.ts`, `tests/programs.spec.ts` — `test.fixme` on validation cases.

**Cause:** Commit on this run marks known **product** gaps (duplicate name, length limits) as `test.fixme` linked to Jira instead of asserting rejection. Playwright no longer fails when the API still returns 2xx + program id for invalid payloads.

**Expected (AC / DS-3):** Reject invalid creates; no new program id.

**Actual (test.didaxis.studio):** Still accepts many invalid payloads — unchanged product behavior. Tests are skipped, not fixed in the app.

**Prior failed run:** [40242383541](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/40242383541) (8 failed, same validation tests). Triage: `ci-artifacts/run-40242383541/CI-TRIAGE-PR-COMMENT.md`.

---

### Skipped tests (deferred — not CI defects)

| Spec | Test / area | Jira |
|------|-------------|------|
| `tests/ds1-create-program.spec.ts` | TC-007 duplicate on create | DS-249 |
| `tests/ds3-program-validation.spec.ts` | TC-004, TC-006, TC-007, TC-008 | DS-249 |
| `tests/ds3-program-validation.spec.ts` | TC-010 name over max | DS-191 |
| `tests/ds3-program-validation.spec.ts` | description over 500 chars | DS-250 |
| `tests/programs.spec.ts` | TC-007 duplicate on create | DS-249 |

Other skips (manual cleanup, list edge cases, conditional auth setup) are unrelated to DS-249/191/250.

**POM / helpers:** `pages/ProgramsPage.ts`, `tests/helpers/program-validation.ts`, `tests/helpers/didaxis-api.ts`.

---

### Proposed patch (test issues only — do not merge without review)

_None — no failing tests on this run._

---

### Suggested fix (product — no auto-merge)

1. Implement server-side validation for DS-3 rules on program create (duplicates, case/padding policy, max name/description length).
2. When Jira **DS-249**, **DS-191**, **DS-250** are done, remove `test.fixme` and re-run CI; expect 64+8 passing with 0 deferred validation skips.

**Jira:** [DS-249](https://legionqaschool.atlassian.net/browse/DS-249), [DS-191](https://legionqaschool.atlassian.net/browse/DS-191), [DS-250](https://legionqaschool.atlassian.net/browse/DS-250) (parent [DS-3](https://legionqaschool.atlassian.net/browse/DS-3))
