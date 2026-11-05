## CI failure triage — Playwright E2E

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/40242383541  
**Commit:** `a34ecdca6fc416a831317086cd85a3f1e10adaa5` (`main`, push)  
**Artifact:** [playwright-report #12618075452](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/40242383541/artifacts/12618075452) (local: `ci-artifacts/run-40242383541/`)

**Result:** 8 failed · 64 passed · 4 skipped

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 8 | Jira: [DS-249](https://legionqaschool.atlassian.net/browse/DS-249), [DS-191](https://legionqaschool.atlassian.net/browse/DS-191), [DS-250](https://legionqaschool.atlassian.net/browse/DS-250) — parent [DS-3](https://legionqaschool.atlassian.net/browse/DS-3) |
| **Test issue** | 0 | — |
| **Infra / env** | 0 | — |

**Didaxis application source:** not in this repo. Boundary: `POST /api/programs` (`tests/helpers/didaxis-api.ts`).

---

### Root cause (primary)

**Location:** Backend / API for program create (not Playwright locators).

**Mechanism:** `isProgramCreatePost()` (`didaxis-api.ts:15-24`) treats any OK `POST /api/programs` with `data.id` as success. `ProgramsPage.submitNewProgramForm()` (`pages/ProgramsPage.ts:54-63`) returns that id. Invalid payloads should not create a program; helpers then throw at `program-validation.ts:37` or `:58`, or in `ds3-program-validation.spec.ts` for case/padding checks.

**Expected:** DS-3 / `features/DS-3.feature` — reject duplicate names (exact, case variant, padded), name &gt; 100 chars, description &gt; 500 chars; show validation error, no new program id.

**Actual:** Create succeeds (2xx + program id); tests fail because rejection never happens.

Same failure pattern as run [39840782581](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/39840782581); product validation still not enforced on `test.didaxis.studio`.

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| `tests/ds1-create-program.spec.ts:81` | TC-007 duplicate on create | Duplicate create returned a program id |
| `tests/ds3-program-validation.spec.ts:72` | TC-004 | Duplicate create returned a program id |
| `tests/ds3-program-validation.spec.ts:93` | TC-006 | Duplicate create returned a program id |
| `tests/ds3-program-validation.spec.ts:105` | TC-007 case variant | Case-variant duplicate should be rejected |
| `tests/ds3-program-validation.spec.ts:132` | TC-008 padded name | Padded duplicate should be rejected |
| `tests/ds3-program-validation.spec.ts:167` | TC-010 name &gt; max | Create should have been rejected by validation |
| `tests/ds3-program-validation.spec.ts:183` | description &gt; 500 | Create should have been rejected by validation |
| `tests/programs.spec.ts:97` | TC-007 | Duplicate create returned a program id |

**POM / helpers:** `pages/ProgramsPage.ts`, `pages/NewProgramModal.ts`, `tests/helpers/program-validation.ts`.

**Trace (from CI log):**

```bash
npx playwright show-trace test-results/ds1-create-program-TC-007--0b948--name-on-create-is-rejected-chromium-user-1-retry1/trace.zip
npx playwright show-trace test-results/ds3-program-validation-TC--9d2bb-over-max-length-is-rejected-chromium-user-1-retry1/trace.zip
```

---

### Proposed patch (test issues only)

None for this run — failures indicate missing product validation, not incorrect test expectations.

---

### Suggested fix (product — no auto-merge)

1. Enforce unique program name on `POST /api/programs` (400/409 + user-visible error).
2. Reject `name.length > 100` and `description.length > 500` on API and in New Program modal.
3. Apply trim/case rules per Confluence Program Setup validation rules.

Until fixed: keep tests as-is or mark `test.fixme` with Jira keys if `main` must go green.

**Jira:** [DS-249](https://legionqaschool.atlassian.net/browse/DS-249) (duplicates / case / padding), [DS-191](https://legionqaschool.atlassian.net/browse/DS-191) (name length), [DS-250](https://legionqaschool.atlassian.net/browse/DS-250) (description length).
