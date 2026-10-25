## CI failure triage — Playwright E2E

**Run:** <actions-run-url>  
**Commit:** `<sha>` (`<branch>`, <event>)  
**Artifact:** <playwright-report-artifact-link> (local: `ci-artifacts/run-<RUN_ID>/`)

**Result:** <N> failed · <N> passed · <N> skipped

---

### Summary

| Classification | Count | Action |
|----------------|-------|--------|
| **App bug** | | Jira: <keys> — link via jira-bug-reporter |
| **Test issue** | | Proposed patch below (human review) |
| **Infra / env** | | |

**Didaxis application source:** <in repo path | not in this repo — boundary at …>

---

### Root cause (primary)

**Location:** <file:line or service boundary>  
**Cause:** <mechanism — not symptom only>

**Expected:** …  
**Actual:** …

---

### Failed tests

| Spec | Test | Error |
|------|------|-------|
| | | |

**POM / helpers:** …

**Trace:** `npx playwright show-trace <path-from-log>`

---

### Proposed patch (test issues only — do not merge without review)

```ts
// file — one focused change
```

---

### Suggested fix (product — no auto-merge)

1. …

**Jira:** <BUG-123> …
