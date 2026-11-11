# Yelena AI testing course

Playwright end-to-end tests for Didaxis, with Cursor agents/skills for ticket → Gherkin → specs, triage, and self-heal.

## Install

```bash
npm ci
npx playwright install chromium
```

Copy env placeholders and fill in real values locally (never commit `.env`):

```bash
cp .env.example .env
```

On Windows PowerShell: `Copy-Item .env.example .env`

Required for running tests: `DIDAXIS_URL`, `DIDAXIS_EMAIL`, `DIDAXIS_PASSWORD`, `DIDAXIS_API_TOKEN`.  
Optional permission-probe accounts: `DIDAXIS_ALT_EMAIL`, `DIDAXIS_ALT_PASSWORD`.  
Agent/CI-only vars (`CURSOR_API_KEY`, Atlassian `*`) are documented in `.env.example` — not needed for `npx playwright test` alone.

## Run tests

```bash
npx playwright test
# or
npm test
```

Useful variants:

```bash
npm run test:headed
npm run test:ui
npm run test:report
```

### Tagged slice

Exactly one tag per test: `@smoke` · `@sanity` · `@regression` · `@api` · `@e2e` · `@destructive` (never on `describe`).

```bash
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:api
npm run test:e2e
npm run test:destructive   # --workers=1; shared/global state only
```

Or: `npx playwright test --grep @smoke` / `--grep "TC-002"`.

### CI triggers

Single workflow: `.github/workflows/test-generation.yml` (Actions name **Playwright CI**).

| Job | When | Command |
|-----|------|---------|
| `smoke` | Every pull request | `npm run test:smoke` |
| `sanity` | Every push | `npm run test:sanity` |
| `regression` | Manual run → suite **regression** | `npx playwright test` (full suite) |
| `generate` | Weekday schedule (06:00 UTC) or manual run → suite **test-generation** | Cursor backlog + CI self-heal |

### Reliability eval

After Test Generation (CI) or any local orchestrator/agent run:

```bash
npm run eval:report
```

Updates `eval-report.md` (flake / heal / generation-gate / ask-vs-guess) from CI logs + PR history — Cursor has no built-in telemetry for these.

## Agent / skill setup (brief)

| Path | Role |
|------|------|
| `.cursor/rules/` | Always-on policy (`constitution.mdc`, `qa-orchestrator.mdc`) + scoped Playwright conventions |
| `.cursor/skills/` | Workflows: `jira-ticket-to-gherkin`, `explore-and-generate`, `pom-conventions`, `api-cleanup`, `self-heal`, `ci-failure-triage`, … |
| `.cursor/agents/` | Subagents: `test-writer`, `triage`, `bug-reporter` |
| `.cursor/hooks/` | Post-edit WON'T gates (e.g. no `waitForTimeout`, no weakened `expect`) |

Headless backlog + CI self-heal: `.github/workflows/test-generation.yml` (needs `CURSOR_API_KEY` / Atlassian secrets). Local Jira/browser MCP tokens go in Cursor settings (or gitignored `.cursor/mcp.json`), not in `.env.example`.

Human approval is required before merging PRs or creating Jira bugs.
