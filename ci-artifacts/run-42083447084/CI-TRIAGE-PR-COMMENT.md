## CI failure triage — Test Generation (backlog)

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42083447084  
**Commit:** `994d223cae84f581f38edb4ab0bff1bf37bcc56e` (`main`, workflow_dispatch)  
**Artifact:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42083447084/artifacts/13441128019 (local: `ci-artifacts/run-42083447084/`)

**Result:** workflow **failure** · Playwright report: 1 passed · 2 skipped · 0 failed · no ticket PR

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 0 | — |
| **Test issue** | 0 | — |
| **Infra / env** | 1 | Re-dispatch. The Cursor agent was SIGTERM'd (exit 143) before it printed a result or opened a PR. |

**Didaxis application source:** not in this repo. Login for user-1 succeeded (`tests/auth.setup.ts`).

---

### Root cause (primary)

**Location:** `.github/workflows/test-generation.yml` step `Work the In Progress backlog` — process `agent -p --force --trust --output-format text`  
**Cause:** The agent process was killed with SIGTERM about 140s after the step started (`18:22:11Z` → `18:24:31Z`). GitHub records `Process completed with exit code 143`. The job timeout is 120 minutes, and the log has no runner-shutdown message, so this was not the Actions job limit. `--output-format text` buffers until exit, so the kill left an empty step log. Job cleanup then found an orphan `chrome-headless-shell`, which means a browser was still open when the agent died.

Jira credentials were present (`ATLASSIAN_EMAIL` and `ATLASSIAN_API_TOKEN` both masked in the env). Unlike the previous run, the agent got far enough to execute Playwright.

**Expected:** The agent finishes the queue, prints a summary, and exits 0 (with a PR per ticket, or an explicit empty/blocked queue).  
**Actual:** Exit 143. No new pull request. Latest PRs are still the Nov 4 DS tickets.

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| — | — | No failing assertion. The uploaded report is only the `setup` project. |

**What the report shows** (`report.json`, run duration ~2.2s, started `18:23:31Z`):

| Spec | Test | Result |
|------|------|--------|
| `tests/auth.setup.ts:30` | authenticate user-1 | passed (login left `/login`) |
| `tests/auth.setup.ts:30` | authenticate user-2 | skipped — `Didaxis user credentials not set in .env` |
| `tests/auth.setup.ts:30` | authenticate user-3 | skipped — same |

User-2 and user-3 skips match the workflow: only `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD` are injected, not the extra user slots. That did not fail the job.

The Password fill step title in this HTML report contains the live password. Do not commit `ci-artifacts/run-42083447084/`.

**Trace:** none attached.

---

### Proposed patch

No code change from this run. Re-dispatch Test Generation. If exit 143 repeats around two minutes, capture unbuffered agent logs before changing the workflow.

**Jira:** none — the agent process was terminated; Didaxis login for user-1 passed.
