import { createServer, type RequestListener, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { KBClient } from '../../src/kb/client';
import { createKBServer } from '../../src/kb/server';

/** Servers started by a test; call `stopServers` in afterEach. */
const running: Server[] = [];

async function listen(server: Server): Promise<string> {
  running.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

/** Starts the reference KB server on a random free port and returns its URL. */
export function startKBServer(client?: KBClient): Promise<string> {
  return listen(createKBServer(client));
}

/** Starts a server that answers every request with `handler` – for responses the real server never sends. */
export function startFakeServer(handler: RequestListener): Promise<string> {
  return listen(createServer(handler));
}

/** A URL where nothing is listening: start a server, note its port, close it. */
export async function unusedUrl(): Promise<string> {
  const url = await startFakeServer(() => {});
  await stopServers();
  return url;
}

export async function stopServers(): Promise<void> {
  for (const server of running.splice(0)) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
