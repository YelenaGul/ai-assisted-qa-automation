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
They catch many WCAG issues; complement them with **keyboard** tests axe cannot
perform.

Reference implementation target: **`tests/programs.a11y.spec.ts`** (extend to
match this skill when implementing — legacy informative scans in repo predate
the strict policy below).

## Programs page — required coverage

Add or maintain **two tests** in `tests/programs.a11y.spec.ts` (or sibling
`*.a11y.spec.ts` for other routes). **One Playwright tag per test** (single
string), e.g. `{ tag: ['@programs-a11y-axe'] }` and
`{ tag: ['@programs-a11y-keyboard'] }`.

Navigate with **`ProgramsPage`** / **`NewProgramModal`** only — **no inline
locators** in the spec (see [pom-conventions](../pom-conventions/SKILL.md)).

### 1. WCAG axe scan (strict)

1. `ProgramsPage.goto()`; stabilize with web-first `expect` (e.g.
   `programs.heading` visible).
2. Run:

```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
expect(results.violations).toEqual([]);
```

3. **Scoping** — Prefer full page after load. Use `.include(...)` /
   `.exclude(...)` only when a **third-party widget** adds known noise **outside**
   the surface under test; **comment why** in the spec. Derive include selectors
   from POM helpers such as `NewProgramModal.axeIncludeSelector()` (CSS is for
   axe only, not for test actions).

4. **Violations** — If `violations` is non-empty: **report** ids, impact, and
   affected nodes to the human/coordinator and **stop**. Do **not** use
   `.disableRules()` to make the test green. File or link an app bug; fix the
   product, then re-run.

Use `test.setTimeout(90_000)` on slow full-page scans if needed.

### 2. Keyboard — open New Program (axe cannot verify this)

1. `ProgramsPage.goto()`; assert page ready via POM-backed `expect`.
2. **Tab** from the document until the **primary control** on the programs page
   has focus — use the POM locator (e.g. `programs.newProgramButton`):
   `await expect(programs.newProgramButton).toBeFocused()` after each `Tab` or
   in a bounded loop with a clear failure message.
3. `await page.keyboard.press('Enter')`.
4. `await expect(programs.newProgramModal.dialog).toBeVisible()`.

Use **role-based** locators exposed on the POM throughout; never
`page.locator('.…')` in the spec. If tab order is unstable, add a focused
helper on **`ProgramsPage`** in `pages/` (coordinator/human) — do not bypass
the POM from the spec.

## Shared conventions

| Topic | Rule |
|-------|------|
| **Imports** | `AxeBuilder` from `@axe-core/playwright`; `test` / `expect` from `fixtures/didaxis.fixture` |
| **File naming** | `tests/<feature>.a11y.spec.ts` — matched by `didaxisTestMatch` in `playwright.config.ts` |
| **Tags** | Exactly **one** tag string per test |
| **Assertions in POMs** | None — keyboard and axe expectations live in the spec |
| **Data** | Read-only a11y tests need no `trackProgram`; creating data still follows [api-cleanup](../api-cleanup/SKILL.md) |
| **Rule disables** | **Forbidden** for strict gating tests — never `.disableRules()` to pass with known violations |

## Informative scans (legacy / optional)

`reportAxeInformative` in `tests/helpers/axe-informative.ts` may attach findings
without failing. Use only when the human explicitly wants a **non-gating** audit.
Do not add new `.disableRules()` waivers; migrate gating coverage to strict
`expect(results.violations).toEqual([])` + app fixes.

## Adding coverage for another surface

1. Ensure a POM exists for the page or component.
2. Create `tests/<feature>.a11y.spec.ts` with one strict axe test + keyboard
   flows axe cannot cover (when applicable).
3. Reach UI state via POM; run axe with `withTags(['wcag2a', 'wcag2aa'])`.
4. On violations: report and stop — fix app or file bug.

## Debugging

- **Non-empty `violations`** — Inspect `results.violations` in trace (`id`, `impact`, `nodes`).
- **Keyboard** — Confirm tab order on the live page (Browser MCP / headed run); align POM primary control with product design.
- **Scoped include** — Dialog must be open and named; missing `aria-label` / `aria-labelledby` throws from `axeIncludeSelector()`.

## Output

- Updated `tests/*.a11y.spec.ts`
- Optional POM `axeIncludeSelector()` or keyboard helpers on `pages/`
- Violation report for humans when scan fails — not silent waivers

## Reference

Historical waivers and run commands: [reference.md](reference.md)
