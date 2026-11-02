---
name: programs-network-edge-cases
description: >-
  Deterministic Playwright edge-case tests for the Didaxis programs flow using
  page.route network mocking. Apply when adding or reviewing specs that assert
  error states, empty lists, malformed API payloads, or HTTP failure codes on
  /api/programs (and related save/list calls). Requires a live-app pass for
  real UI copy before assertions.
---

# Programs flow — network edge cases

Use **`page.route`** so list/save failures are deterministic without changing
app source. Interact only through **`ProgramsPage`** / **`NewProgramModal`**
(and existing helpers they wrap) — no inline clicks in specs.

Programs API surface in this repo (see `tests/helpers/didaxis-api.ts`):

| Call | Pattern | Typical use |
|------|---------|-------------|
| List | `GET …/api/programs` | Programs table / empty state |
| Create | `POST …/api/programs` | New Program → Create |
| Delete (cleanup) | `DELETE …/api/programs/:uuid` | Fixture teardown — **do not mock** in normal edge specs |

Match routes with the same host as `DIDAXIS_URL` / `didaxisBaseUrl()`.

## Before you write assertions (required)

1. **Open the real programs UI** with auth (Browser MCP → `cursor-ide-browser`, else **agent-browser** CLI, else headed Playwright + `storageState` from the `setup` project) — same priority as **jira-ticket-to-gherkin** step 3.
2. **Reproduce or simulate the failure path without mocking first** when feasible (e.g. disconnect, staging outage) so you see what the app actually renders.
3. Record **exact** accessible names / visible copy for error banners, toasts, dialogs, and empty-state text. **Do not invent strings** in specs or POM assertions.
4. If the app shows **no message** (blank table, silent failure, console only), document that in the test title or a comment and assert only stable facts (e.g. dialog still open, main landmark visible, no uncaught page error) — **do not guess** user-facing copy.

## Mocking rules

- **Never mock the endpoint the test is verifying.** Example: a test whose purpose is “create persists and appears in the list” must use a real `POST` response; only mock **surrounding** calls if needed.
- Mock **adjacent** traffic only (e.g. test “503 on save” mocks the **save** `POST`/`PATCH` the POM triggers, while leaving unrelated requests to pass through with `route.continue()`).
- Prefer **`route.fulfill()`** for fixed status/body; use **`route.continue()`** for everything else.
- Tests that never create a real program must **not** call `trackProgram` (nothing to delete). If a mock accidentally returns a UUID, still avoid persisting real data — prefer mocks that fail before commit.

## Canonical scenarios (implement one test each)

Use **one Playwright tag per test** (single string in `tag: ['@…']`), e.g. `@programs-503-save`, `@programs-empty-list`.

### (a) Save fails — `503 Service Unavailable`

- **Route:** `POST` (or the app’s save method) to `**/api/programs**` when the scenario is create; use `**/api/programs/*`** only when the scenario is edit/save-by-id — confirm method in DevTools on the real app first.
- **Fulfill:** `status: 503`, minimal JSON body if the client requires JSON.
- **Act:** POM — open form, fill, submit save/create.
- **Assert:** UI error state using copy captured from the live app (role + name). Web-first `expect`; no `waitForTimeout`.

### (b) Empty list — `200` with `{ data: [] }`

- **Route:** `GET **/api/programs`.
- **Fulfill:** `status: 200`, `contentType: 'application/json'`, body `{ "data": [] }` (adjust only if live API uses a different envelope — verify once on real API).
- **Act:** POM `goto()` programs page.
- **Assert:** Empty-state message from live app; if none exists, assert table has no data rows / zero program rows per observable UI.

### (c) Malformed list payload — `200` with bad JSON or shape

- **Route:** `GET **/api/programs`.
- **Fulfill:** either invalid JSON text, or `200` with `{}`, `{ "data": "not-an-array" }`, or rows missing `id`.
- **Act:** POM `goto()`.
- **Assert:** App does not crash — e.g. `programs` main landmark or heading still visible, no blank document; optional error UI if the app shows one (copy from live pass). Do not assert specific text unless observed.

### Other HTTP codes (add tests when the product should handle them)

Use the same live-copy rule. Suggested matrix — **skip** codes the app never surfaces; **file a bug** if production should handle them but UI is silent:

| Code | Typical route | What to observe on live app first |
|------|----------------|-----------------------------------|
| **401** | `GET` or `POST` `/api/programs` | Re-auth prompt, toast, or redirect |
| **403** | same | Forbidden message or empty guarded state |
| **404** | `GET/PUT/DELETE …/api/programs/:id` | Not found message vs generic error |
| **500** | save or list | Generic error vs crash |
| **501** / **502** | save or list | Same as other 5xx — record actual copy |
| **503** | save or list | See (a) |
| **429** | list or save | Rate-limit copy if any |
| **300** / **304** | rare for XHR JSON | Only add if DevTools shows redirects affecting UI |

## Spec shape

```typescript
test('programs list empty state when API returns no rows', { tag: ['@programs-empty-list'] }, async ({ page }) => {
  await page.route('**/api/programs', (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });
  const programs = new ProgramsPage(page);
  await programs.goto();
  // expect(...) — strings from live UI pass only
});
```

- Import `test` / `expect` from `fixtures/didaxis.fixture` unless the scenario must opt out of cleanup (no creates).
- Follow **pom-conventions** and **playwright-conventions** for locators and waits.

## Hand off

Report which routes were mocked, which endpoint was left real, the tag per test, and a one-line note if the app showed **no** user-visible message for a case.
