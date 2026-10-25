# CI failure triage — example

Condensed from run `39840782581` (see `ci-artifacts/run-39840782581/CI-TRIAGE-PR-COMMENT.md` in the repo).

**Classification:** 7 app bugs (validation not enforced on `POST /api/programs`), 1 test issue (`expectProgramListed` 5s vs 60s).

**Primary cause:** `isProgramCreatePost` treats OK responses as success; duplicates and overlong fields still return a program id — not a Playwright or POM locator bug.

**Secondary cause:** `tests/helpers/didaxis.ts:92` default timeout too short for table refresh after create.

**Action:** Jira bugs for product validation; optional timeout patch proposed for human review; no auto-merge.
