# A11y checks — reference

## Dependencies

- `@axe-core/playwright` (see `package.json`)
- Playwright test project with Didaxis auth (e.g. `chromium-user-1`)

## Run

```bash
npx playwright test tests/programs.a11y.spec.ts --project=chromium-user-1
npx playwright test --grep @programs-a11y
```

Strict tests fail when axe reports WCAG 2 A/AA violations under
`.withTags(['wcag2a', 'wcag2aa'])`.

## Policy (current)

- **Gating tests:** `expect(results.violations).toEqual([])` — no `.disableRules()` to go green.
- **Violations:** Report to human / file Jira; fix the app, then re-run.
- **Scoping:** `.include()` / `.exclude()` only for noisy third-party regions, with an inline comment why.

## Legacy (repo may still contain until migrated)

| Item | Notes |
|------|--------|
| `@informative` + `reportAxeInformative` | Non-gating audits only; do not add new gating specs this way |
| `.disableRules(['button-name'])` on New Program modal | **Do not extend** — violates current policy; replace with app fix or scoped `.exclude()` of a named third-party node with comment |

When retiring a legacy waiver, remove the row and link the fixing Jira ticket.

## axe rule IDs (common)

Use violation `id` strings in bug reports (not for `.disableRules()` on gating tests):

- `button-name` — buttons without discernible text
- `color-contrast` — insufficient contrast
- `label` — form fields missing labels
- `aria-required-attr` — missing required ARIA attributes

Full list: [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
