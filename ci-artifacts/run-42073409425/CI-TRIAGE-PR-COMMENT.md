## CI failure triage — Test Generation (backlog)

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42073409425  
**Commit:** `9fef8cae2bad6e703ef616fb661c8b4a1c3cd5c4` (`main`, workflow_dispatch)  
**Artifact:** none — upload warned `No files were found with the provided path: playwright-report/`

**Result:** workflow **success** · 0 Playwright tests run · 0 specs, PRs, or `tests-generated` labels

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 0 | — |
| **Test issue** | 0 | — |
| **Infra / env** | 1 | Pass `ATLASSIAN_EMAIL` into the backlog step, then re-dispatch |

**Didaxis application source:** not in this repo — boundary at Jira Cloud REST for the DS queue. Playwright never started.

---

### Root cause (primary)

**Location:** `.github/workflows/test-generation.yml` — step `Work the In Progress backlog` (`env` at lines 40–43)  
**Cause:** The agent could not authenticate to Jira, so it exited 0 without a queue. The step injects `ATLASSIAN_API_TOKEN` and does not inject `ATLASSIAN_EMAIL`. Jira Cloud basic auth needs both. The job log lists `ATLASSIAN_API_TOKEN` and omits `ATLASSIAN_EMAIL`. The agent also reported Atlassian MCP OAuth is unavailable in Actions and a browser login hit reCAPTCHA; those paths are not independently logged beyond that summary.

**Expected:** Load In Progress DS tickets without `tests-generated`, then write specs and open PRs.  
**Actual:** Agent message at 17:34:43Z: blocked before the queue. No `playwright-report/` artifact.

The repo secret `ATLASSIAN_EMAIL` exists now (GitHub “updated” 2026-11-05T17:53:13Z, after this run finished at 17:34:48Z). A re-dispatch still will not see it until the workflow maps the secret into the step.

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| — | — | No Playwright run |

**POM / helpers:** not reached

---

### Proposed patch (infra — do not merge without review)

```yaml
# .github/workflows/test-generation.yml — Work the In Progress backlog env
env:
  CURSOR_API_KEY: ${{ secrets.CURSOR_API_TOKEN }}
  ATLASSIAN_API_TOKEN: ${{ secrets.ATLASSIAN_API_TOKEN }}
  ATLASSIAN_EMAIL: ${{ secrets.ATLASSIAN_EMAIL }}
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### Suggested fix (product — no auto-merge)

1. Add `ATLASSIAN_EMAIL: ${{ secrets.ATLASSIAN_EMAIL }}` on the backlog step.
2. Re-dispatch **Test Generation**. Confirm the log loads DS tickets (or states an empty queue), not “blocked before the queue”.

**Jira:** none — this is workflow env, not a Didaxis defect.
