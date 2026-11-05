## CI failure triage — Playwright E2E

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42069483213  
**Commit:** `e0e4bcf5105ceaf4b9bfbab6ffeffc8109e15fbe` (`main`, workflow_dispatch)  
**Artifact:** playwright-report upload succeeded with no report (Playwright never started). Local: `ci-artifacts/run-42069483213/`

**Result:** job `generate` failed · 0 Playwright tests run

Prior run [42057169211](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42057169211) failed the same way before these secrets existed.

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 0 | — |
| **Test issue** | 0 | — |
| **Infra / env** | 1 | Point the workflow at the secret that exists, then re-run |

**Didaxis application source:** not in this repo. This failure is before any Didaxis call.

---

### Root cause (primary)

**Location:** `.github/workflows/test-generation.yml` line 41, `CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}`.  
**Cause:** The workflow reads a repository secret named `CURSOR_API_KEY`. That name is not in Actions secrets. The key was saved as `CURSOR_API_TOKEN` (updated 2026-11-05T16:52:57Z). GitHub therefore injected an empty `CURSOR_API_KEY`, and `agent` exited before the backlog prompt ran.

**Expected:** `CURSOR_API_KEY` is set and `agent -p` starts the backlog run.  
**Actual:** Log shows `CURSOR_API_KEY:` blank and `ATLASSIAN_API_TOKEN: ***`. Error: `Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable.` Exit code 1 at 2026-11-05T17:02:29Z.

`gh secret list` names: `ATLASSIAN_API_TOKEN`, `ATLASSIAN_EMAIL`, `ATLASSIAN_PASSWORD`, `CURSOR_API_TOKEN`, plus the four `DIDAXIS_*` secrets. There is no `CURSOR_API_KEY`.

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| — | — | Playwright did not run |

---

### Suggested fix (infra — no auto-merge)

Keep the environment variable name `CURSOR_API_KEY` (that is what the CLI reads). Change the secret reference to the name that exists:

```yaml
CURSOR_API_KEY: ${{ secrets.CURSOR_API_TOKEN }}
```

Alternatively, recreate the Actions secret under the name `CURSOR_API_KEY` and leave the workflow as it is. Then re-run the workflow. Do not commit the token.
