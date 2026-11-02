---
name: playwright-test-config
description: >-
  Playwright runner settings and time determinism for Didaxis tests. Apply when
  editing playwright.config.ts, debugging local vs CI drift, or writing specs
  that assert relative dates/times (use page.clock.install).
---

# Playwright test config & frozen time

Canonical config: **`playwright.config.ts`** at repo root.

## Runner stability (do not regress)

| Setting | Value | Why |
|---------|--------|-----|
| `fullyParallel` | `true` | File-level parallelism |
| `retries` | `process.env.CI ? 2 : 0` | Local fails loudly; CI allows up to **2** retries (never raise above 2) |
| `workers` | **Do not set `workers: 1`** | Avoid serializing the whole suite on CI unless Playwright default is explicitly changed for a documented reason |
| `use.baseURL` | `process.env.DIDAXIS_URL` | Same target as `.env` |
| `use.trace` | `'on-first-retry'` | Traces on CI/local retry only |
| `use.locale` | `PLAYWRIGHT_LOCALE` or **`en-US`** | Pinned formatting |
| `use.timezoneId` | `PLAYWRIGHT_TIMEZONE` or **`America/New_York`** | Pinned timezone (confirm with team if product standard differs) |

## Auth projects (keep intact)

- **`setup`** project runs `tests/auth.setup.ts`.
- Didaxis specs use **`chromium-<userId>`** with `dependencies: ['setup']` and
  `storageState` from `authStoragePath(userId)` — do not remove when editing config.

## Relative timestamps — `page.clock.install()`

When a spec asserts **relative** UI copy (`today`, `2 hours ago`, locale-formatted
dates), freeze browser time for that test. Prefer clock over `Date.now()` in
assertions. Import `test` / `expect` from `fixtures/didaxis.fixture`; use POMs
for navigation.

```typescript
import { test, expect } from '../fixtures/didaxis.fixture';
import { ProgramsPage } from '../pages/ProgramsPage';

test('example: relative timestamp under frozen clock', { tag: ['@example-clock'] }, async ({ page }) => {
  // Fixed instant — must match playwright.config locale/timezone (en-US, America/New_York).
  await page.clock.install({ time: new Date('2026-11-02T18:00:00-05:00') });

  const programs = new ProgramsPage(page);
  await programs.goto();
  await expect(programs.heading).toBeVisible();

  // After an action whose UI shows time relative to "now", assert the exact string
  // observed on the live app — do not invent copy.
  // await expect(programs.someRelativeTimeLabel).toHaveText('…');

  await page.clock.runFor(3_600_000); // advance 1h if the UI updates relative labels on tick
  // await expect(…).toHaveText('1 hour ago');
});
```

- Call **`page.clock.install()`** before navigation when the page reads `Date` on load.
- Use **`page.clock.runFor(ms)`** or **`page.clock.setFixedTime()`** to advance time; then web-first `expect`.
- One tag per test when adding real coverage (not `@example-clock`).
- Do not change unrelated assertion meaning when adding clock setup.

## When agents edit config

- Preserve `setup` + `storageState` + `didaxisTestMatch` projects.
- Never increase `retries` above **2**.
- Never add `workers: 1` for “stability” without human approval.
