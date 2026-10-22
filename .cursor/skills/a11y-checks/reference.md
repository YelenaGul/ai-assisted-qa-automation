# A11y checks — reference

## Dependencies

- `@axe-core/playwright` (see `package.json`)
- Playwright test project with Didaxis auth (e.g. `chromium-user-1`)

## Run

```bash
npx playwright test tests/programs.a11y.spec.ts --project=chromium-user-1
npx playwright test --grep @informative
```

Informative tests attach `*-summary.md` (and JSON when there are violations) to
the HTML report; they pass even when axe reports issues.

## Documented rule disables (test waivers)

| Rule ID | Where | Reason |
|---------|--------|--------|
| `button-name` | New Program modal scoped scan | Mantine dialog close control has no accessible name; waiver is scoped to the modal via `.include()`, not the full page. |

When adding a row here, link a Jira ticket if one exists.

## axe rule IDs (common)

Use the string `id` from violation output with `.disableRules(['id'])`:

- `button-name` — buttons without discernible text
- `color-contrast` — insufficient contrast
- `label` — form fields missing labels
- `aria-required-attr` — missing required ARIA attributes

Full list: [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
