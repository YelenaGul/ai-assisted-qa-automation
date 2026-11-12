# Suite reliability eval report

_Generated: 2026-11-12T14:59:18.948Z_  
_Window: last **10** measurable CI runs (requested N=10)._  
_Source: `gh` CI logs + PR history (+ `ci-artifacts/` when present). Cursor has **no** built-in telemetry for these metrics._

## Flake rate

| Number | **0.0%** flaky outcomes among passed+flaky in measured runs (0 flaky / 42 passed+flaky across 1 runs) |
|--------|------|
| How measured | Parsed `N flaky` / `N passed` lines from `gh run view <id> --log` for the last suite workflows (E2E/Smoke/Sanity/Regression/Test Generation). HTML reports alone are not authoritative without a json reporter. |
| What it tells us | How often the suite only goes green because CI retries (up to 2) masked a first-attempt failure. |

### Sampled runs

| Run | Workflow | Conclusion | Flaky | Passed | Link |
|-----|----------|------------|-------|--------|------|
| 43099950693 | Playwright CI | success | n/a | 10 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/43099950693) |
| 43079559575 | Playwright CI | failure | n/a | 44 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/43079559575) |
| 43069663442 | Playwright CI | success | n/a | 14 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/43069663442) |
| 43061894994 | Playwright CI | success | n/a | 10 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/43061894994) |
| 43061887082 | Playwright CI | success | n/a | 14 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/43061887082) |
| 43031825407 | Playwright CI | failure | n/a | — | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/43031825407) |
| 42900605942 | Sanity | failure | n/a | — | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42900605942) |
| 42871515210 | Playwright CI | success | 0 | 42 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42871515210) |
| 42869661450 | E2E Tests | failure | n/a | 43 | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42869661450) |
| 42839410876 | E2E Tests | failure | n/a | — | [run](https://github.com/YelenaGul/ai-assisted-qa-automation/actions/runs/42839410876) |

## Heal success rate

| Number | **33.3% (2/6)** clean heals; attempts=6, clean=2 |
|--------|------|
| Masked-regression count | **0** (must be **0**) |
| How measured | PR history: titles matching Heal/locator drift; “clean” = merged heal with no admission of softened/removed expects; masked = body admits weakened/removed expects (must stay 0). Latest `ci-artifacts/heal-output.txt` note: ** none (no old→new locator; no repair PR). |
| What it tells us | Whether self-heal fixes real drift without papering over product bugs or softening assertions. |

- [#20](https://github.com/YelenaGul/ai-assisted-qa-automation/pull/20) fix(test): heal ProgramsPage heading locator (open)
- [#19](https://github.com/YelenaGul/ai-assisted-qa-automation/pull/19) fix(test): heal NewProgramModal dialog locator (open)
- [#18](https://github.com/YelenaGul/ai-assisted-qa-automation/pull/18) fix(test): heal ProgramsPage newProgramButton locator (open)
- [#17](https://github.com/YelenaGul/ai-assisted-qa-automation/pull/17) Heal: Programs page locator drift (Programs / New Program) (merged 2026-11-11T17:35:34Z)
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

- backlog-output.txt: ask~0, guess~0
- heal-output.txt: ask~0, guess~0
- PR #7: guessed/skipped live recon
- PR #6: guessed/skipped live recon
- PR #5: guessed/skipped live recon
- PR #4: guessed/skipped live recon
- PR #3: guessed/skipped live recon
- PR #1: guessed/skipped live recon

## Top reliability risk

Generated specs rarely clear the first-PR generation gate (green + conforming + maps-to-AC).

## Next action

Block generation PRs until scoped `npx playwright test` is green in CI on the first PR and live-app recon is recorded in the PR body.

---

### Regen instructions

```bash
node scripts/generate-eval-report.mjs --n 10
# or
npm run eval:report
```

Regenerate **after every** `.github/workflows/test-generation.yml` run and **after every** local orchestrator / agent backlog or heal session (see `.cursor/rules/qa-orchestrator.mdc`).
