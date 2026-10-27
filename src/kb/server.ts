import { createServer, type Server } from 'node:http';

import type { KBClient } from './client';
import { MockKBClient } from './mockClient';

// Stub: no behaviour yet (Red step).
export function createKBServer(_client: KBClient = new MockKBClient()): Server {
  return createServer((_request, response) => {
    response.statusCode = 501;
    response.end();
  });
}
