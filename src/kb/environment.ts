import type { KBClient } from './client';
import { KBValidationError } from './errors';
import { HTTPKBClient } from './httpClient';
import { MockKBClient } from './mockClient';

export const DEFAULT_API_URL = 'http://localhost:3000';

type Env = Record<string, string | undefined>;

/**
 * Picks the KB client from environment variables (docs2/DECISIONS.md §6):
 * KB_CLIENT = mock (default) | http, KB_API_URL for http, KB_DEBUG=1 to log each request to `debugOut`.
 */
export function clientFromEnv(env: Env, debugOut: (line: string) => void): KBClient {
  const kind = (env.KB_CLIENT ?? 'mock').trim().toLowerCase();
  if (kind === 'mock') return new MockKBClient();
  if (kind === 'http') {
    return new HTTPKBClient({
      baseUrl: env.KB_API_URL ?? DEFAULT_API_URL,
      debug: env.KB_DEBUG === '1' ? debugOut : undefined,
    });
  }
  throw new KBValidationError(`KB_CLIENT must be "mock" or "http", got "${env.KB_CLIENT}"`);
}
