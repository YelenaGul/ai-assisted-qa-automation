# CI failure triage — reference

## gh CLI (default)

Replace `<RUN_ID>` with the Actions run number (from the URL or `gh run list`).

```bash
gh run view <RUN_ID> --json conclusion,displayTitle,event,headBranch,url,jobs,headSha
gh run view <RUN_ID> --log-failed
gh run download <RUN_ID> -n playwright-report -D ci-artifacts/run-<RUN_ID>
```

Recent failures on the current branch:

```bash
gh run list --branch "$(git branch --show-current)" --limit 5
```

Find PR for the failing commit and post a comment:

```bash
gh pr list --head "$(git branch --show-current)" --json number,url
gh pr comment <PR_NUMBER> --body-file ci-artifacts/run-<RUN_ID>/CI-TRIAGE-PR-COMMENT.md
```

Requires `gh auth login` with access to the repository.

## Playwright report locally

After download, the artifact is usually `playwright-report/` inside the destination folder:

```bash
npx playwright show-report ci-artifacts/run-<RUN_ID>/playwright-report
```

Traces (from CI log paths):

```bash
npx playwright show-trace path/to/trace.zip
```

## Cross-reference map (this repo)

| Layer | Typical paths |
|-------|----------------|
| Spec | `tests/*.spec.ts`, `tests/ds*.spec.ts` |
| Helpers | `tests/helpers/didaxis.ts`, `program-validation.ts`, `didaxis-api.ts` |
| POM | `pages/ProgramsPage.ts`, `pages/NewProgramModal.ts` |
| Fixtures | `fixtures/didaxis.fixture.ts`, `fixtures/cleanup.fixture.ts` |
| App source | Usually **not** in this repo — cite API contract from helpers and Jira AC |

## Classification cues

| Signal | Likely class |
|--------|----------------|
| API returns 2xx + id when test expects 4xx/validation | App bug |
| Helper throws “should reject” after successful `POST` | App bug (confirm via `didaxis-api.ts`) |
| `toHaveCount` / timeout on list after create; longer timeout passes locally | Test issue (wait/sync) |
| All tests fail at login | Env / secrets |
| `npm ci` or `playwright install` step failed | Infra / workflow |
