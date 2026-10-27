import { HTTPKBClient } from '../../src/kb/httpClient';
import { MockKBClient } from '../../src/kb/mockClient';
import { describeKBClient } from './contract';
import { startFakeServer, startKBServer, stopServers, unusedUrl } from './httpServers';

afterEach(stopServers);

// Same 16 rules as the mock, over real HTTP to the reference server.
describeKBClient('HTTPKBClient', async () => new HTTPKBClient({ baseUrl: await startKBServer() }));

describe('HTTPKBClient – talking to the server', () => {
  test('H1: a server that cannot be reached → KBConnectionError naming the URL', async () => {
    const baseUrl = await unusedUrl();
    await expect(new HTTPKBClient({ baseUrl }).list({})).rejects.toMatchObject({
      name: 'KBConnectionError',
      code: 'CONNECTION_FAILED',
      message: expect.stringContaining(baseUrl),
    });
  });

  test('H2: a server error (5xx) → KBApiError with the status and the server message', async () => {
    const broken = new MockKBClient();
    broken.list = async () => {
      throw new Error('boom');
    };
    const client = new HTTPKBClient({ baseUrl: await startKBServer(broken) });
    await expect(client.list({})).rejects.toMatchObject({
      name: 'KBApiError',
      code: 'INTERNAL',
      status: 500,
      message: 'KB server error 500: internal server error',
    });
  });

  test('H3: a response that is not JSON, or not the expected shape → KBApiError BAD_RESPONSE', async () => {
    const notJson = await startFakeServer((_req, res) => res.end('<html>oops</html>'));
    await expect(new HTTPKBClient({ baseUrl: notJson }).list({})).rejects.toMatchObject({
      name: 'KBApiError',
      code: 'BAD_RESPONSE',
    });

    const wrongShape = await startFakeServer((_req, res) => res.end('{"items":[]}'));
    await expect(new HTTPKBClient({ baseUrl: wrongShape }).list({})).rejects.toMatchObject({
      name: 'KBApiError',
      code: 'BAD_RESPONSE',
    });
  });

  test('H4: a base URL ending in "/" works too', async () => {
    const client = new HTTPKBClient({ baseUrl: `${await startKBServer()}/` });
    expect((await client.list({ limit: 1 }))?.map((doc) => doc.id)).toEqual(['doc-001']);
  });

  test('H5: debug logs one line per request and per response', async () => {
    const lines: string[] = [];
    const baseUrl = await startKBServer();
    const client = new HTTPKBClient({ baseUrl, debug: (line) => lines.push(line) });

    await client.list({ limit: 1 });
    await expect(client.retrieve('doc-999')).rejects.toThrow();

    expect(lines).toEqual([
      `[kb] → POST ${baseUrl}/list {"limit":1}`,
      expect.stringMatching(/^\[kb\] ← 200 \{"documents":\[\{"id":"doc-001",/),
      `[kb] → POST ${baseUrl}/retrieve {"docId":"doc-999"}`,
      '[kb] ← 404 {"error":{"code":"NOT_FOUND","message":"document doc-999 not found"}}',
    ]);
  });

  test('H6: debug also logs a connection failure', async () => {
    const lines: string[] = [];
    const baseUrl = await unusedUrl();
    await expect(new HTTPKBClient({ baseUrl, debug: (line) => lines.push(line) }).list({})).rejects.toThrow();
    expect(lines).toEqual([`[kb] → POST ${baseUrl}/list {}`, expect.stringMatching(/^\[kb\] ✗ /)]);
  });
});
