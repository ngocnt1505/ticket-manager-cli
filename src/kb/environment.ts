import type { KBClient } from './client';

export const DEFAULT_API_URL = 'http://localhost:3000';

type Env = Record<string, string | undefined>;

// Stub: no behaviour yet (Red step).
export function clientFromEnv(_env: Env, _debugOut: (line: string) => void): KBClient {
  return undefined as unknown as KBClient;
}
