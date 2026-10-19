export const DIDAXIS_USER_IDS = ['user-1', 'user-2', 'user-3'] as const;
export type DidaxisUserId = (typeof DIDAXIS_USER_IDS)[number];

export type DidaxisCredentials = {
  email: string;
  password: string;
};

function userNumber(id: DidaxisUserId): string {
  return id.replace('user-', '');
}

export function didaxisUserEnvKeys(id: DidaxisUserId): {
  email: string;
  password: string;
} {
  const n = userNumber(id);
  return {
    email: `DIDAXIS_USER_${n}_EMAIL`,
    password: `DIDAXIS_USER_${n}_PASSWORD`,
  };
}

export function isDidaxisUserConfigured(id: DidaxisUserId): boolean {
  const keys = didaxisUserEnvKeys(id);
  let email = process.env[keys.email]?.trim();
  let password = process.env[keys.password]?.trim();
  if (id === 'user-1' && (!email || !password)) {
    email = process.env.DIDAXIS_EMAIL?.trim();
    password = process.env.DIDAXIS_PASSWORD?.trim();
  }
  return Boolean(email && password);
}

export function getDidaxisUserCredentials(id: DidaxisUserId): DidaxisCredentials {
  const keys = didaxisUserEnvKeys(id);
  let email = process.env[keys.email]?.trim();
  let password = process.env[keys.password]?.trim();
  if (id === 'user-1' && (!email || !password)) {
    email = process.env.DIDAXIS_EMAIL?.trim();
    password = process.env.DIDAXIS_PASSWORD?.trim();
  }
  if (!email || !password) {
    throw new Error(
      `${keys.email} and ${keys.password} must be set in .env (user-1 may use DIDAXIS_EMAIL / DIDAXIS_PASSWORD).`,
    );
  }
  return { email, password };
}

export function listConfiguredDidaxisUsers(): DidaxisUserId[] {
  return DIDAXIS_USER_IDS.filter(isDidaxisUserConfigured);
}

export function authStoragePath(id: DidaxisUserId): string {
  return `playwright/.auth/${id}.json`;
}

export function didaxisUserIdFromProjectName(
  projectName: string,
): DidaxisUserId | undefined {
  const match = projectName.match(/^chromium-(user-[1-3])$/);
  return match?.[1] as DidaxisUserId | undefined;
}

export function didaxisCredentialsForProject(
  projectName: string,
): DidaxisCredentials | undefined {
  const userId = didaxisUserIdFromProjectName(projectName);
  if (!userId) {
    return undefined;
  }
  return getDidaxisUserCredentials(userId);
}
