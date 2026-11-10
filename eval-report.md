# Suite reliability eval report

_Generated: 2026-11-10T17:54:00.337Z_  
_Window: last **10** measurable CI runs (requested N=10)._  
_Source: `gh` CI logs + PR history (+ `ci-artifacts/` when present). Cursor has **no** built-in telemetry for these metrics._

## Flake rate

| Number | **3.8%** flaky outcomes among passed+flaky in measured runs (5 flaky / 131 passed+flaky across 4 runs) |
|--------|------|
| How measured | Parsed `N flaky` / `N passed` lines from `gh run view <id> --log` for the last suite workflows (E2E/Smoke/Sanity/Regression/Test Generation). HTML reports alone are not authoritative without a json reporter. |
| What it tells us | How often the suite only goes green because CI retries (up to 2) masked a first-attempt failure. |

### Sampled runs

| Run | Workflow | Conclusion | Flaky | Passed | Link |
|-----|----------|------------|-------|--------|------|
| 42839410876 | E2E Tests | failure | n/a | — | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42839410876) |
| 42835976147 | E2E Tests | failure | 3 | 37 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42835976147) |
| 42834606890 | Test Generation | success | 0 | 40 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42834606890) |
| 42735810672 | E2E Tests | failure | n/a | 42 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42735810672) |
| 42735772937 | E2E Tests | failure | n/a | 45 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42735772937) |
| 42645279243 | Test Generation | success | 1 | 44 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42645279243) |
| 42380506341 | E2E Tests | failure | n/a | 40 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42380506341) |
| 42379935437 | Test Generation | success | 1 | 5 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42379935437) |
| 42307071317 | E2E Tests | failure | n/a | 45 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42307071317) |
| 42304287070 | Test Generation | success | n/a | — | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42304287070) |

## Heal success rate

| Number | **33.3% (1/3)** clean heals; attempts=3, clean=1 |
|--------|------|
| Masked-regression count | **0** (must be **0**) |
| How measured | PR history: titles matching Heal/locator drift; “clean” = merged heal with no admission of softened/removed expects; masked = body admits weakened/removed expects (must stay 0). Latest `ci-artifacts/heal-output.txt` note: none. |
| What it tells us | Whether self-heal fixes real drift without papering over product bugs or softening assertions. |

- [#17](https://github.com/YelenaGul/ai-assisted-qa-automation/pull/17) Heal: Programs page locator drift (Programs / New Program) (open)
- [#14](https://github.com/YelenaGul/ai-assisted-qa-automation/pull/14) Heal ProgramsPage locator drift after a11y rediscovery. (merged 2026-11-06T22:22:35Z)
- [#13](https://github.com/YelenaGul/ai-assisted-qa-automation/pull/13) Heal: ProgramsPage locator drift (New Program / Programs / URL) (open)

## Generation-gate pass rate

| Number | **0.0% (0/14)** first-PR passes (conservative) |
|--------|------|
| How measured | Generation PRs (DS-* coverage, excluding Heal): first-PR gate = PR body shows local/CI green **and** maps to AC/Gherkin **and** did not skip live recon/infra **and** eventually merged. Failures that only claim local green while CI stayed red do **not** count. |
| What it tells us | Whether `test-writer` output is trustworthy on the first PR without human rework. |

_Reviewed generation PRs: 14. Conservative first-PR gate passes: 0._

## Ask-vs-guess

| Number | **ask 0 · guess 6** |
|--------|------|
| How measured | Session review of `ci-artifacts/*.txt` (when present) plus PR bodies for skipped live recon / unset credentials (guess) vs explicit asks for a missing value. Not available from Cursor product telemetry. |
| What it tells us | Whether the agent stops for missing facts or invents them — inventing drives false-green plans and brittle specs. |

- PR #7: guessed/skipped live recon
- PR #6: guessed/skipped live recon
- PR #5: guessed/skipped live recon
- PR #4: guessed/skipped live recon
- PR #3: guessed/skipped live recon
- PR #1: guessed/skipped live recon

## Top reliability risk

Flaky tests are still clearing CI via retries, hiding real instability.

## Next action

Quarantine the top flaky tests from the last N runs, fix root cause (no retry-as-fix), re-measure.

---

### Regen instructions

```bash
node scripts/generate-eval-report.mjs --n 10
# or
npm run eval:report
```

Regenerate **after every** `.github/workflows/test-generation.yml` run and **after every** local orchestrator / agent backlog or heal session (see `.cursor/rules/qa-orchestrator.mdc`).
