import { clientFromEnv } from '../../src/kb/environment';
import { HTTPKBClient } from '../../src/kb/httpClient';
import { MockKBClient } from '../../src/kb/mockClient';
import { startKBServer, stopServers } from './httpServers';

afterEach(stopServers);

const quiet = () => {};

describe('clientFromEnv – KB_CLIENT, KB_API_URL, KB_DEBUG', () => {
  test('E1: without KB_CLIENT, the mock client is used', () => {
    expect(clientFromEnv({}, quiet)).toBeInstanceOf(MockKBClient);
  });

  test('E2: KB_CLIENT=mock is read ignoring case and spaces', () => {
    expect(clientFromEnv({ KB_CLIENT: ' Mock ' }, quiet)).toBeInstanceOf(MockKBClient);
  });

  test('E3: KB_CLIENT=http uses the HTTP client with KB_API_URL', async () => {
    const url = await startKBServer();
    const client = clientFromEnv({ KB_CLIENT: 'http', KB_API_URL: url }, quiet);
    expect(client).toBeInstanceOf(HTTPKBClient);
    expect((await client.list({})).map((doc) => doc.id)).toEqual(['doc-001', 'doc-002', 'doc-003']);
  });

  test('E4: without KB_API_URL, the HTTP client calls http://localhost:3000', async () => {
    const lines: string[] = [];
    const client = clientFromEnv({ KB_CLIENT: 'http', KB_DEBUG: '1' }, (line) => lines.push(line));
    expect(client).toBeInstanceOf(HTTPKBClient);
    await client.list({}).catch(() => {}); // a server may or may not run there; only the URL matters
    expect(lines[0]).toBe('[kb] → POST http://localhost:3000/list {}');
  }, 15_000);

  test('E5: debug lines are written only when KB_DEBUG=1', async () => {
    const url = await startKBServer();
    const on: string[] = [];
    const off: string[] = [];
    const debugOn = clientFromEnv({ KB_CLIENT: 'http', KB_API_URL: url, KB_DEBUG: '1' }, (line) => on.push(line));
    const debugOff = clientFromEnv({ KB_CLIENT: 'http', KB_API_URL: url }, (line) => off.push(line));
    expect(debugOn).toBeInstanceOf(HTTPKBClient);
    expect(debugOff).toBeInstanceOf(HTTPKBClient);
    await debugOn.list({});
    await debugOff.list({});
    expect(on).toEqual([`[kb] → POST ${url}/list {}`, expect.stringMatching(/^\[kb\] ← 200 /)]);
    expect(off).toEqual([]);
  });

  test('E6: an unknown KB_CLIENT is a usage error', () => {
    expect(() => clientFromEnv({ KB_CLIENT: 'sql' }, quiet)).toThrow(
      expect.objectContaining({
        name: 'KBValidationError',
        message: 'KB_CLIENT must be "mock" or "http", got "sql"',
      }),
    );
  });
});
