## CI failure triage — Test Generation (backlog)

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42081011614  
**Commit:** `994d223cae84f581f38edb4ab0bff1bf37bcc56e` (`main`, workflow_dispatch)  
**Artifact:** none — upload warned `No files were found with the provided path: playwright-report/`

**Result:** workflow **success** · 0 Playwright tests run · 0 specs, PRs, or `tests-generated` labels

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 0 | — |
| **Test issue** | 0 | — |
| **Infra / env** | 1 | Replace `ATLASSIAN_API_TOKEN` with a token for the account in `ATLASSIAN_EMAIL`, then re-dispatch |

**Didaxis application source:** not in this repo. Playwright never started. Didaxis secrets were present in the job env.

---

### Root cause (primary)

**Location:** Jira Cloud REST boundary — `GET https://legionqaschool.atlassian.net/rest/api/3/myself` with Basic auth (`ATLASSIAN_EMAIL`:`ATLASSIAN_API_TOKEN`)  
**Cause:** The workflow now injects both secrets (job log lists `ATLASSIAN_EMAIL: ***` and `ATLASSIAN_API_TOKEN: ***`). The agent reported **401 Unauthorized** on `/rest/api/3/myself`, so the email and token are not a valid pair for that site. Atlassian MCP still needs interactive OAuth, which Actions does not provide. The step then exited 0 with an empty queue.

**Expected:** `myself` returns 200 and the In Progress DS search runs.  
**Actual:** Agent message at 18:09:00Z: “Jira auth failed. 0 tickets processed.”

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| — | — | No Playwright run |

---

### Proposed patch

No workflow change. `ATLASSIAN_EMAIL` is already mapped on the backlog step.

### Suggested fix (human — no auto-merge)

1. Create a new API token while signed in as the account stored in `ATLASSIAN_EMAIL`, at https://id.atlassian.com/manage-profile/security/api-tokens.
2. Update the `ATLASSIAN_API_TOKEN` GitHub secret with that token. The email and the token must belong to the same Atlassian account, and that account must be able to read the DS project on `legionqaschool.atlassian.net`.
3. Re-dispatch Test Generation. A successful run loads tickets or reports an empty queue, and does not report 401 on `/myself`.

**Jira:** none — credential mismatch, not a Didaxis defect.
