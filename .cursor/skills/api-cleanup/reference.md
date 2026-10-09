# Didaxis API auth for cleanup

`DIDAXIS_API_TOKEN` is the JWT **`access_token`** (no `Bearer ` prefix in `.env`). It is not a permanent API key; it expires in about **15 minutes**.

## Prefer: login in fixture or helper (no UI)

Use env credentials already required for UI tests:

```http
POST {DIDAXIS_URL}/api/auth/login
Content-Type: application/json

{"email":"<DIDAXIS_EMAIL>","password":"<DIDAXIS_PASSWORD>"}
```

Response: `data.access_token` → set on the request context as:

```http
Authorization: Bearer <access_token>
```

Implement token fetch in `fixtures/cleanup.fixture.ts` (or `tests/helpers/didaxis.ts`) so DELETE cleanup does not depend on a stale `.env` JWT. Cache the token for the worker/fixture scope and refresh on **401** from DELETE.

## Fallback: capture from UI session (Playwright MCP or test)

When documenting or debugging token shape:

1. Log in at `{DIDAXIS_URL}/login` with `DIDAXIS_EMAIL` / `DIDAXIS_PASSWORD`.
2. Inspect network: filter `/api/`, open an authenticated call (e.g. `GET /api/programs`).
3. Copy the `authorization` request header value after `Bearer `.

Or read `data.access_token` from the **`POST /api/auth/login`** response body.

Do not commit tokens. Do not paste live JWTs into specs or skills.

## DELETE cleanup request

```http
DELETE {DIDAXIS_URL}/api/programs/{uuid}
Authorization: Bearer <access_token>
```

Only delete UUIDs registered via `trackProgram(uuid)` in the same test run.
