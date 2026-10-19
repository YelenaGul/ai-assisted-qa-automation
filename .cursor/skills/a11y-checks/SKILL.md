---
name: a11y-checks
description: >-
  Adds and maintains Playwright accessibility tests with @axe-core/playwright
  for Didaxis. Use when the user mentions a11y, accessibility, axe, WCAG,
  violations, or asks for accessibility coverage on a page, modal, or flow.
  Apply when generating or reviewing *.a11y.spec.ts files or AxeBuilder usage.
---

# Accessibility checks (axe + Playwright)

Automated a11y tests run **axe** in the browser via `@axe-core/playwright`.
They catch many WCAG issues; they do not replace keyboard-only or screen reader
testing.

Canonical example: `tests/programs.a11y.spec.ts`.

## When to use which scan

| Goal | Pattern |
|------|---------|
| Whole route after load | `new AxeBuilder({ page }).analyze()` after POM `goto` + stable `expect` |
| Dialog / panel only | `.include(await component.axeIncludeSelector())` — selector lives on the POM |
| Known third-party / tracked app defect | `.disableRules([...])` with an inline comment; prefer a Jira bug over silent waivers |

## Steps

1. **File naming** — Put a11y specs in `tests/<feature>.a11y.spec.ts`. They are
   picked up by `didaxisTestMatch` in `playwright.config.ts` (same as `programs.spec.ts`).

2. **Imports** — Use `AxeBuilder` from `@axe-core/playwright`. Import `test` and
   `expect` from `fixtures/didaxis.fixture` (authenticated Didaxis session). Follow
   [pom-conventions](../pom-conventions/SKILL.md): no inline locators in specs.

3. **Stabilize before scan** — Navigate and open UI through Page Objects. Assert the
   target is visible (e.g. `expect(programs.heading).toBeVisible()` or modal
   `dialog`) before `analyze()`. Use `test.setTimeout(90_000)` on full-page scans if
   the route is slow.

4. **Assertions** — Keep all `expect` in the spec, not in POMs:
   `await expect(results.violations).toEqual([])`.

5. **Scoping modals** — Axe needs a CSS selector, not a Playwright locator. Add an
   `axeIncludeSelector()` method on the component POM (see `pages/NewProgramModal.ts`):
   derive `[role=...][aria-labelledby=...]` or `[aria-label=...]` from the live DOM;
   throw if the dialog has no accessible name.

6. **Rule disables** — Only disable specific axe rule IDs when the violation is
   understood and tracked (comment why). Example in repo: Mantine close control and
   `button-name` on the New Program modal. Do not disable rules to make a failing
   test pass without documenting the defect.

7. **Data cleanup** — A11y tests that create programs still need
   [api-cleanup](../api-cleanup/SKILL.md). Read-only scans do not.

8. **Tags** — Tag stable regression scans with `{ tag: '@regression' }` when they
   belong in the regression suite.

## Adding coverage for a new surface

1. Ensure a POM exists for the page or component.
2. Create or extend `tests/<feature>.a11y.spec.ts`.
3. Reach the UI state under test via POM methods.
4. Run axe (full page or `.include(...)`).
5. If violations appear: fix the app when in scope; otherwise file a bug and use a
   scoped disable only for that rule + component until fixed.

## Debugging failures

- **Non-empty `violations`** — Log or inspect `results.violations` in the trace;
  each item has `id`, `impact`, `description`, and `nodes` with selectors.
- **Timeout** — Usually navigation or auth; confirm fixture and increase timeout
  only after the page is visibly ready.
- **Flaky include selector** — Dialog must be open and named; missing `aria-label` /
  `aria-labelledby` throws from `axeIncludeSelector()`.

## Output

- New or updated `tests/*.a11y.spec.ts`
- Optional POM helper `axeIncludeSelector()` on modals or regions being scoped
- No assertions inside `pages/`

## Reference

Known waived rules and rationale: [reference.md](reference.md)
