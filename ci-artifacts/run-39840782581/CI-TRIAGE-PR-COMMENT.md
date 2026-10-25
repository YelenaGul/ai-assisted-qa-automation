## CI failure triage — Playwright E2E

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/39840782581  
**Commit:** `c93284a72b051e86eb7db2b1419195bfe9fbae86` (`main`, push)  
**Artifact:** [playwright-report #12454473418](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/39840782581/artifacts/12454473418) (local: `ci-artifacts/run-39840782581/`)

**Result:** 8 failed · 64 passed · 4 skipped

No open pull request for this push. Paste this comment on the PR if one is opened for `c93284a`.

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 8 | Existing Jira: [DS-249](https://legionqaschool.atlassian.net/browse/DS-249), [DS-191](https://legionqaschool.atlassian.net/browse/DS-191), [DS-250](https://legionqaschool.atlassian.net/browse/DS-250) — relates to [DS-3](https://legionqaschool.atlassian.net/browse/DS-3). No new bugs. |
| **Test issue** | 0 final failures (1 helper timeout on earlier `ds1` attempts) | Proposed patch below (human review). It does not make `ds1` TC-007 pass. |
| **Infra / env** | 0 | Cleanup `DELETE` hit `ECONNRESET` once after a failure. It did not fail a test. |

**Didaxis application source:** not in this repo. Boundary is `POST /api/programs` in `tests/helpers/didaxis-api.ts`.

---

### Root cause (primary)

**Location:** `tests/helpers/didaxis-api.ts:15-24` (`isProgramCreatePost`) and `:31-39` (`programIdFromCreateResponse`), called from `pages/ProgramsPage.ts:54-63` (`submitNewProgramForm`).

**Cause:** A create is treated as success when `POST /api/programs` is HTTP OK and the body has `data.id`. Invalid creates still take that path, so the helpers throw because they received a program id:

- exact duplicate — `tests/helpers/program-validation.ts:37`
- case variant — `tests/ds3-program-validation.spec.ts:118`
- padded name — `tests/ds3-program-validation.spec.ts:148`
- name length 101 and description length 501 — `tests/helpers/program-validation.ts:58`

All three attempts failed the same way on the six `ds3` tests and on `programs.spec.ts` TC-007 (retries: 2).

**Expected:** DS-3 rejects an exact duplicate and shows a name-already-exists error. `features/DS-3.feature` also rejects a case variant, a padded duplicate after trim, and a 101-character name. Description max length in the tests is 500 (`DESCRIPTION_MAX_LENGTH` in `program-validation.ts`, Confluence Program Setup validation rules). `features/DS-1.feature` still notes that Jira has not settled 500 vs 2000.

**Actual:** Each invalid submit returned a program id. The modal was not left open with a validation error.

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| `tests/ds3-program-validation.spec.ts:72` | TC-004 duplicate on create shows error | Duplicate create returned a program id |
| `tests/ds3-program-validation.spec.ts:93` | TC-006 duplicate leaves only one row | Duplicate create returned a program id |
| `tests/ds3-program-validation.spec.ts:105` | TC-007 case variant | Case-variant duplicate should be rejected |
| `tests/ds3-program-validation.spec.ts:132` | TC-008 leading/trailing spaces | Padded duplicate should be rejected |
| `tests/ds3-program-validation.spec.ts:167` | TC-010 name over max length | Create should have been rejected by validation |
| `tests/ds3-program-validation.spec.ts:183` | description over 500 characters | Create should have been rejected by validation |
| `tests/programs.spec.ts:97` | TC-007 duplicate on create | Duplicate create returned a program id |
| `tests/ds1-create-program.spec.ts:81` | TC-007 duplicate on create | Retry #2: duplicate create returned a program id |

**POM / helpers:** `pages/ProgramsPage.ts`, `pages/NewProgramModal.ts`. The validation-error locator is not the failure. The create response is OK, so the modal closes and the error is never shown.

**Trace:**

```bash
npx playwright show-trace test-results/ds3-program-validation-TC--9d2bb-over-max-length-is-rejected-chromium-user-1-retry1/trace.zip
npx playwright show-trace test-results/programs-TC-007-duplicate-program-name-on-create-is-rejected-chromium-user-1-retry1/trace.zip
```

---

### Earlier attempts on `ds1` TC-007 (not the final result)

Attempts 0 and 1 died in `expectProgramListed` at `tests/helpers/didaxis.ts:92` before the duplicate check:

- Expected count `1`, received `0`, timeout `5000ms`
- Call site: `tests/ds1-create-program.spec.ts:89`

`programs.spec.ts:105` and `ds3` wait `60_000` for the same row, and those tests reached the duplicate assertion. Retry #2 of `ds1` also got past the list and then failed because the duplicate `POST` returned an id.

**Proposed patch (test issue only — do not merge without review):**

```ts
// tests/helpers/didaxis.ts — expectProgramListed
await expect(rows).toHaveCount(count, { timeout: 60_000 });
```

After this change, `ds1` TC-007 should fail the same way as retry #2 (app bug), not on the 5s list wait.

---

### Suggested fix (product — no auto-merge)

1. Reject a duplicate program name on `POST /api/programs` (400/409 and a visible error). Apply the same rule to case variants and to names that match after trim (`features/DS-3.feature`).
2. Reject `name.length > 100` on the API and in the New Program modal (DS-191 / DS-199).
3. Reject `description.length > 500` if Confluence Program Setup is the source of truth (DS-250). Confirm 500 vs 2000 before changing the product if that limit is still open.

---

### Jira

Open bugs already cover this run. None were created again.

- Duplicates, case variant, padded name, and `ds1` / `programs` TC-007: **[DS-249](https://legionqaschool.atlassian.net/browse/DS-249)** (To Do, relates to DS-3)
- Name over 100 characters: **[DS-191](https://legionqaschool.atlassian.net/browse/DS-191)** (To Do)
- Description over 500 characters: **[DS-250](https://legionqaschool.atlassian.net/browse/DS-250)** (To Do, filed from this run)
