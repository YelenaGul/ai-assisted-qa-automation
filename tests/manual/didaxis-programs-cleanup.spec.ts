/**
 * Manual Didaxis catalog cleanup (NOT run by `npm test` — see playwright.config testIgnore).
 *
 * PowerShell examples:
 *   $env:MANUAL_DIDAXIS_CLEANUP="1"; $env:DELETE_COUNT="100"; npx playwright test tests/manual/didaxis-programs-cleanup.spec.ts
 *   $env:MANUAL_DIDAXIS_CLEANUP="1"; $env:DELETE_ALL="1"; npx playwright test tests/manual/didaxis-programs-cleanup.spec.ts
 *
 * Requires DIDAXIS_EMAIL / DIDAXIS_PASSWORD in `.env` (or a valid DIDAXIS_API_TOKEN).
 */
import { test, expect } from '@playwright/test';
import {
  deleteProgramIds,
  fetchDidaxisAccessToken,
  listProgramIds,
} from '../helpers/didaxis-api';

test.describe.configure({ mode: 'serial' });
test.setTimeout(600_000);

test.beforeEach(() => {
  test.skip(
    process.env.MANUAL_DIDAXIS_CLEANUP !== '1',
    'Set MANUAL_DIDAXIS_CLEANUP=1 to run this maintenance test.',
  );
  test.skip(
    process.env.DELETE_ALL !== '1' && !process.env.DELETE_COUNT?.trim(),
    'Set DELETE_ALL=1 or DELETE_COUNT=<positive number> (e.g. 100, 300, 1000).',
  );
});

test('GET /api/programs, collect ids, DELETE first N or all', async ({ request }) => {
  let accessToken = await fetchDidaxisAccessToken(request);
  const programIds: string[] = await listProgramIds(request, accessToken);
  console.log(`GET /api/programs returned ${programIds.length} id(s).`);

  const deleteAll = process.env.DELETE_ALL === '1';
  let idsToDelete: string[];

  if (deleteAll) {
    idsToDelete = [...programIds];
    console.log(`DELETE_ALL=1 — will delete all ${idsToDelete.length} program(s).`);
  } else {
    const count = Number.parseInt(process.env.DELETE_COUNT!.trim(), 10);
    expect(Number.isFinite(count) && count > 0).toBeTruthy();
    idsToDelete = programIds.slice(0, count);
    console.log(
      `DELETE_COUNT=${count} — will delete ${idsToDelete.length} of ${programIds.length} program(s) (first in API list order).`,
    );
  }

  if (idsToDelete.length === 0) {
    console.log('No programs to delete.');
    return;
  }

  const batchSize = 50;
  let deleted = 0;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const chunk = idsToDelete.slice(i, i + batchSize);
    const result = await deleteProgramIds(request, chunk, accessToken);
    accessToken = result.accessToken;
    deleted += result.deleted;
    console.log(`Deleted ${deleted}/${idsToDelete.length}...`);
  }

  console.log(`Done. Deleted ${deleted} program(s).`);
  expect(deleted).toBe(idsToDelete.length);
});
