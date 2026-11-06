## CI failure triage — Test Generation (backlog)

**Run:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42085042972  
**Commit:** `92a7a478a6b51f7c5fed60a00307af4c70d7dc0f` (`main`, workflow_dispatch)  
**Artifact:** https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42085042972/artifacts/13444345633

**Result:** workflow **success** · 4 tickets implemented on branches · 0 pull requests · 0 `tests-generated` labels

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | 0 | Agent noted live UI behavior inside `test.fail` cases; no Jira bug filed |
| **Test issue** | 1 | DS-263 card locator fixed on the branch before the green re-run |
| **Infra / env** | 1 | Allow GitHub Actions to create pull requests, then open the four PRs |

**Didaxis application source:** not in this repo. Specs live on the `test/DS-*` branches below.

---

### Root cause (primary)

**Location:** repository Actions permission for `GITHUB_TOKEN`, not `.github/workflows/test-generation.yml` (that file already grants `contents: write` and `pull-requests: write`)  
**Cause:** The agent finished the queue and pushed branches. Creating a pull request with the default `GITHUB_TOKEN` was rejected: `GitHub Actions is not permitted to create or approve pull requests`. That is the repo setting under Settings → Actions → General → Workflow permissions. Because no PR exists, the agent did not add `tests-generated`, so the next run will select the same tickets again.

**Expected:** One open PR per ticket, then the `tests-generated` label.  
**Actual:** Branches exist; `gh pr list` still ends at PR #9 from Nov 4.

---

### Branches (verified on the remote)

| Ticket | Branch | Spec |
|--------|--------|------|
| DS-261 | `test/DS-261-delete-api-error` | `tests/ds4-delete-api-error-ds261.spec.ts` |
| DS-262 | `test/DS-262-delete-double-click` | `tests/ds4-delete-double-click-ds262.spec.ts` |
| DS-263 | `test/DS-263-selected-row-actions` | `tests/ds4-selected-row-actions-ds263.spec.ts` |
| DS-275 | `test/DS-275-delete-confirmation` (`85c7299`) | `tests/ds4-delete-confirmation-ds275.spec.ts` |

Compare links from the job log:

- https://github.com/YelenaGul/ai-assisted-qa-automation/pull/new/test/DS-261-delete-api-error
- https://github.com/YelenaGul/ai-assisted-qa-automation/pull/new/test/DS-262-delete-double-click
- https://github.com/YelenaGul/ai-assisted-qa-automation/pull/new/test/DS-263-selected-row-actions
- https://github.com/YelenaGul/ai-assisted-qa-automation/pull/new/test/DS-275-delete-confirmation

---

### Suggested fix (human — no auto-merge)

1. In the repo: Settings → Actions → General → Workflow permissions → enable **Allow GitHub Actions to create and approve pull requests**.
2. Open the four pull requests from the branches above (or re-dispatch after the setting is on).
3. After each PR exists, add the `tests-generated` label on that DS ticket so the next backlog run skips it.

**Jira:** none filed by this run.
