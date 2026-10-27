import type { KBClient } from './client';

/** Everything outside the program comes in through `io`, so tests can fake it (same idea as week 2). */
export interface KBCliIO {
  client: KBClient;
  stdout(text: string): void;
  stderr(text: string): void;
  readFile(path: string): Promise<string>;
}

// Stub: no behaviour yet (Red step).
export async function run(_argv: string[], _io: KBCliIO): Promise<number> {
  return 0;
}
