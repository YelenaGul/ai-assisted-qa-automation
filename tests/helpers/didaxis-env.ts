export function requireEnv(
  name: 'DIDAXIS_URL' | 'DIDAXIS_EMAIL' | 'DIDAXIS_PASSWORD',
): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set in .env (see .env-example).`);
  }
  return value;
}

export function didaxisBaseUrl(): string {
  return requireEnv('DIDAXIS_URL').replace(/\/$/, '');
}
