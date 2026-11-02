---
name: pom-conventions
description: >-
  Page Object Model conventions for Playwright tests in this project.
  Apply whenever generating, refactoring, or reviewing any Playwright test
  that interacts with the Didaxis UI — even if the user doesn't say "POM".
  Tests should never contain inline locators.
---

# Page Object Model Conventions

All UI interactions go through Page Objects in `pages/`. Tests describe
intent; POMs handle mechanics.

Based on [pom-conventions](https://github.com/vskadorva/ai-assisted-qa-automation-2/blob/main/.cursor/skills/pom-conventions/SKILL.md).

## Steps

1. One Page Object class per page or distinct component.
   Examples: `LoginPage`, `ProgramsPage`, `NewProgramModal`.

2. Define locators as `readonly` properties in the constructor, in this
   priority order only:
   `getByRole` → `getByLabel` / `getByPlaceholder` → `getByText` →
   `getByTestId` (escape hatch only — comment why nothing higher worked).
   Never CSS selectors, XPath, or brittle text.

3. If a locator matches more than one element, disambiguate with
   `.filter({ hasText })` — do not use `.first()`.

4. Provide methods for user actions: `goto`, `clickX`, `fillY`, `submit`.
   Methods perform actions; they do not assert. **No `waitForTimeout` anywhere**
   in `pages/`, `tests/`, or `tests/helpers/` — use web-first
   `expect(locator).toBeVisible()` / `.toBeEnabled()` / `.toHaveText()` so
   Playwright retries until the UI is ready.

5. **No assertions inside Page Objects.** All `expect(...)` calls
   live in the test files, never in `pages/`. In specs and helpers, prefer
   auto-retrying web-first expects; never
   `expect(await locator.isVisible()).toBe(true)` and never branch on
   `await locator.isVisible()` for timing — use `expect(locator).…` (or a
   stricter locator) instead.

6. Compose POMs when a page contains distinct components — e.g.
   `ProgramsPage` holds a `NewProgramModal` instance.

7. Import POMs at the top of each spec; instantiate with `new XxxPage(page)`.

8. Didaxis specs import `test` / `expect` from `fixtures/didaxis.fixture`
   (auth + cleanup). When a POM action creates a program, return the UUID
   from the create API response so the test can call `trackProgram` — see
   [api-cleanup](../api-cleanup/SKILL.md).

## Anti-flake hardening

When fixing flake, change **locators and waits only** — keep each assertion’s
observable meaning the same.

| Replace | With | Flake removed |
|---------|------|----------------|
| CSS / XPath (`page.locator('.…')`, `xpath=…`) | `getByRole` → label/placeholder → text → `getByTestId` (+ comment if test id) | DOM/class churn, non-user-facing breakage |
| `waitForTimeout(ms)` | `expect(locator).toBeVisible()` / `.toBeEnabled()` / `.toHaveText()` | Fixed delays too short (flaky) or too long (slow) |
| `expect(await loc.isVisible()).toBe(true)` | `expect(loc).toBeVisible()` | Single snapshot before retry window |
| `.first()` on a broad locator | Narrow locator or `.filter({ hasText })` | Wrong row/button when multiple matches |

## Output

Page Object files in `pages/`. Tests in `tests/` that import them.

## Canonical examples in this repo

| File | Role |
|------|------|
| `pages/ProgramsPage.ts` | Page: navigation, list helpers, composed modal |
| `pages/NewProgramModal.ts` | Component: create dialog locators only |
| `tests/programs.spec.ts` | Spec: actions via POM, all `expect()` in tests |

Legacy helper locators in `tests/helpers/didaxis.ts` should move into
`pages/` when refactoring specs to POM — do not add new inline locators
to specs or helpers.
