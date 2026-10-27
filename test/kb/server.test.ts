import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

import type { KBClient } from '../../src/kb/client';
import { MockKBClient, SEED_DOCUMENTS } from '../../src/kb/mockClient';
import { createKBServer } from '../../src/kb/server';

/**
 * The reference KB server must follow the API contract in docs2/DECISIONS.md §4.
 * Tests talk to it over real HTTP on a random free port.
 */
let server: Server | undefined;

async function start(client?: KBClient): Promise<string> {
  server = createKBServer(client);
  await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

afterEach(async () => {
  server?.closeAllConnections();
  await new Promise((resolve) => server?.close(resolve) ?? resolve(undefined));
  server = undefined;
});

/** Sends a request; `body` is sent as given if it is a string, else as JSON. */
async function call(baseUrl: string, path: string, body?: unknown, method = 'POST') {
  const response = await fetch(baseUrl + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await response.text();
  return {
    status: response.status,
    contentType: response.headers.get('content-type'),
    json: text === '' ? undefined : JSON.parse(text),
  };
}

const doc1 = { id: 'doc-001', title: 'Customer Response Template', nodePath: '/templates/email', tags: ['template', 'email'] };
const doc2 = { id: 'doc-002', title: 'DevOps Team Members', nodePath: '/team/devops', tags: ['team', 'devops'] };

describe('KB server – success', () => {
  test('S1: POST /search → 200 { results: [{ id, title, nodePath, tags, matchType }] }', async () => {
    const url = await start();
    const res = await call(url, '/search', { query: 'team', topK: 2 });
    expect(res.status).toBe(200);
    expect(res.contentType).toMatch(/^application\/json/);
    expect(res.json).toEqual({
      results: [
        { ...doc2, matchType: 'title' },
        { ...doc1, matchType: 'content' },
      ],
    });
  });

  test('S2: POST /search passes filters.nodePath to the client', async () => {
    const url = await start();
    const res = await call(url, '/search', { query: 'team', filters: { nodePath: '/templates' } });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ results: [{ ...doc1, matchType: 'content' }] });
  });

  test('S3: POST /list → 200 { documents: [...] }, without content', async () => {
    const url = await start();
    const res = await call(url, '/list', { nodePath: '/templates', limit: 10 });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ documents: [doc1] });
  });

  test('S4: POST /retrieve → 200 { document } with content', async () => {
    const url = await start();
    const res = await call(url, '/retrieve', { docId: 'doc-002' });
    expect(res.status).toBe(200);
    expect(res.json).toEqual({ document: SEED_DOCUMENTS[1] });
  });

  test('S5: POST /add → 201 { document } with the new id; it can then be retrieved', async () => {
    const url = await start();
    const input = { title: 'SMS Reminder', content: 'Your appointment is tomorrow.', nodePath: '/templates/sms', tags: ['SMS'] };
    const res = await call(url, '/add', input);
    expect(res.status).toBe(201);
    expect(res.json).toEqual({ document: { ...input, id: 'doc-004', tags: ['sms'] } });
    expect((await call(url, '/retrieve', { docId: 'doc-004' })).json).toEqual(res.json);
  });
});

describe('KB server – errors: { error: { code, message } }', () => {
  test('S6: invalid input from the client rules → 400 INVALID_INPUT', async () => {
    const url = await start();
    const res = await call(url, '/search', { query: '   ' });
    expect(res.status).toBe(400);
    expect(res.contentType).toMatch(/^application\/json/);
    expect(res.json).toEqual({ error: { code: 'INVALID_INPUT', message: 'query must not be empty' } });
  });

  test('S7: a body that is not a JSON object, or a field of the wrong type → 400 INVALID_INPUT', async () => {
    const url = await start();
    for (const [path, body] of [
      ['/search', '{ not json'],
      ['/search', '[]'],
      ['/search', { query: 5 }],
      ['/search', { query: 'team', topK: '2' }],
      ['/list', { nodePath: 7 }],
      ['/retrieve', {}],
      ['/add', { title: 'T', content: 'C', nodePath: '/x', tags: 'sms' }],
    ] as const) {
      const res = await call(url, path, body);
      expect([path, body, res.status, res.json?.error?.code]).toEqual([path, body, 400, 'INVALID_INPUT']);
    }
  });

  test('S8: an unknown document → 404 NOT_FOUND', async () => {
    const url = await start();
    const res = await call(url, '/retrieve', { docId: 'doc-999' });
    expect(res.status).toBe(404);
    expect(res.json).toEqual({ error: { code: 'NOT_FOUND', message: 'document doc-999 not found' } });
  });

  test('S9: an unknown endpoint or a method other than POST → 404 NOT_FOUND', async () => {
    const url = await start();
    for (const [path, method] of [
      ['/delete', 'POST'],
      ['/search', 'GET'],
    ]) {
      const res = await call(url, path, undefined, method);
      expect([path, method, res.status, res.json?.error?.code]).toEqual([path, method, 404, 'NOT_FOUND']);
    }
  });

  test('S10: an unexpected failure → 500 INTERNAL, without leaking details', async () => {
    const broken = new MockKBClient();
    broken.list = async () => {
      throw new Error('disk on fire at C:\\secret\\path');
    };
    const url = await start(broken);
    const res = await call(url, '/list', {});
    expect(res.status).toBe(500);
    expect(res.json).toEqual({ error: { code: 'INTERNAL', message: 'internal server error' } });
  });
});
