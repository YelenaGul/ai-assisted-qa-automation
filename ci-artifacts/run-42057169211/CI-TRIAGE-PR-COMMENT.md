## CI failure triage — Playwright E2E

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42057169211  
**Commit:** `e0e4bcf5105ceaf4b9bfbab6ffeffc8109e15fbe` (`main`, workflow_dispatch)  
**Artifact:** playwright-report upload succeeded with no report (Playwright never started). Local: `ci-artifacts/run-42057169211/`

**Result:** job `generate` failed · 0 Playwright tests run

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 0 | — |
| **Test issue** | 0 | — |
| **Infra / env** | 1 | Add missing Actions secrets, then re-run the workflow |

**Didaxis application source:** not in this repo. This failure is before any Didaxis call.

---

### Root cause (primary)

**Location:** `.github/workflows/test-generation.yml` step “Work the In Progress backlog” (`CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}`, line 41).  
**Cause:** Repository Actions secret `CURSOR_API_KEY` is not set. The installed `agent` CLI exits immediately because it has no API key. GitHub printed the variable as blank (unset secrets are not masked). Set secrets on the same step printed as `***` (`DIDAXIS_*`, `GITHUB_TOKEN`).

**Expected:** `agent -p` authenticates and works the In Progress backlog.  
**Actual:** `Error: Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable.` Exit code 1, about one second after the step started (2026-11-05T15:40:07Z–15:40:08Z).

`gh secret list` on `YelenaGul/ai-assisted-qa-automation` shows only `DIDAXIS_API_TOKEN`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`, and `DIDAXIS_URL`. `ATLASSIAN_API_TOKEN` is also missing and would block Jira access after auth is fixed.

Earlier steps succeeded: checkout, `npm ci`, `npx playwright install --with-deps chromium`, Install Cursor CLI.

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| — | — | Playwright did not run |

---

### Suggested fix (infra — no auto-merge)

1. In GitHub → Settings → Secrets and variables → Actions, add `CURSOR_API_KEY` (Cursor API key for the CLI).
2. Add `ATLASSIAN_API_TOKEN` as well, so the agent can read DS tickets after it authenticates.
3. Re-run [workflow 42057169211](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42057169211) via workflow_dispatch. Do not commit either token.
