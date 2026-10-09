import type { APIRequestContext, APIResponse, Page } from '@playwright/test';
import { didaxisBaseUrl, requireEnv } from './didaxis-env';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertProgramUuid(id: string): string {
  if (!UUID_RE.test(id)) {
    throw new Error(`Invalid program UUID: ${id}`);
  }
  return id;
}

export function isProgramCreatePost(response: APIResponse): boolean {
  if (response.request().method() !== 'POST' || !response.ok()) {
    return false;
  }
  try {
    const path = new URL(response.url()).pathname;
    return /\/api\/programs\/?$/.test(path);
  } catch {
    return false;
  }
}

export function waitForProgramCreateResponse(page: Page) {
  return page.waitForResponse(isProgramCreatePost);
}

export async function programIdFromCreateResponse(
  response: APIResponse,
): Promise<string> {
  const body = (await response.json()) as { data?: { id?: string } };
  const id = body.data?.id;
  if (!id) {
    throw new Error('Create program response missing data.id');
  }
  return assertProgramUuid(id);
}

export async function fetchDidaxisAccessToken(
  request: APIRequestContext,
): Promise<string> {
  return loginAccessToken(request);
}

async function loginAccessToken(request: APIRequestContext): Promise<string> {
  const email = requireEnv('DIDAXIS_EMAIL');
  const password = requireEnv('DIDAXIS_PASSWORD');
  const response = await request.post(`${didaxisBaseUrl()}/api/auth/login`, {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(
      `Didaxis login failed: ${response.status()} ${await response.text()}`,
    );
  }
  const body = (await response.json()) as { data?: { access_token?: string } };
  const token = body.data?.access_token;
  if (!token) {
    throw new Error('Didaxis login response missing data.access_token');
  }
  return token;
}

async function resolveAccessToken(
  request: APIRequestContext,
): Promise<string> {
  const fromEnv = process.env.DIDAXIS_API_TOKEN?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return loginAccessToken(request);
}

export async function listProgramIds(
  request: APIRequestContext,
  accessToken?: string,
): Promise<string[]> {
  const fetchList = async (token: string) =>
    request.get(`${didaxisBaseUrl()}/api/programs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

  let token = accessToken ?? (await resolveAccessToken(request));
  let response = await fetchList(token);

  if (response.status() === 401) {
    token = await loginAccessToken(request);
    response = await fetchList(token);
  }

  if (!response.ok()) {
    throw new Error(
      `GET /api/programs failed: ${response.status()} ${await response.text()}`,
    );
  }

  const body = (await response.json()) as { data?: Array<{ id?: string }> };
  const programIds: string[] = [];
  for (const row of body.data ?? []) {
    if (row.id) {
      programIds.push(assertProgramUuid(row.id));
    }
  }
  return programIds;
}

export async function deleteProgramById(
  request: APIRequestContext,
  programId: string,
): Promise<void> {
  const id = assertProgramUuid(programId);
  const url = `${didaxisBaseUrl()}/api/programs/${id}`;

  const attemptDelete = async (token: string) =>
    request.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

  let token = await resolveAccessToken(request);
  let response = await attemptDelete(token);

  if (response.status() === 401) {
    token = await loginAccessToken(request);
    response = await attemptDelete(token);
  }

  if (response.status() === 404) {
    return;
  }

  if (!response.ok()) {
    throw new Error(
      `DELETE /api/programs/${id} failed: ${response.status()} ${await response.text()}`,
    );
  }
}

/** Bulk DELETE with one shared token (refreshes on 401). Prefer for manual cleanup. */
export async function deleteProgramIds(
  request: APIRequestContext,
  programIds: string[],
  accessToken: string,
): Promise<{ deleted: number; accessToken: string }> {
  let token = accessToken;
  let deleted = 0;

  for (const programId of programIds) {
    const id = assertProgramUuid(programId);
    const url = `${didaxisBaseUrl()}/api/programs/${id}`;

    const attemptDelete = async () =>
      request.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

    let response = await attemptDelete();

    if (response.status() === 401) {
      token = await loginAccessToken(request);
      response = await attemptDelete();
    }

    if (response.status() === 404) {
      deleted += 1;
      continue;
    }

    if (!response.ok()) {
      throw new Error(
        `DELETE /api/programs/${id} failed: ${response.status()} ${await response.text()}`,
      );
    }

    deleted += 1;
  }

  return { deleted, accessToken: token };
}
