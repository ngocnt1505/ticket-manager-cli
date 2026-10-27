import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { startKBServer, stopServers, unusedUrl } from './httpServers';

/**
 * End-to-end: runs the real `kb` command (bin/kb.js → dist/) in a separate process,
 * like a user would, in both mock and http mode.
 */
const root = join(__dirname, '..', '..');
const bin = join(root, 'bin', 'kb.js');

// The child process must only see the KB_* variables a test gives it.
const baseEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('KB_')));

type Result = { code: number; stdout: string; stderr: string };

// Async (not spawnSync): the KB server of the http tests runs in this process and must keep answering.
function runNode(args: string[], env: Record<string, string> = {}): Promise<Result> {
  return new Promise((resolve) => {
    execFile(process.execPath, args, { cwd: root, env: { ...baseEnv, ...env } }, (err, stdout, stderr) => {
      const code = err ? (typeof err.code === 'number' ? err.code : -1) : 0;
      resolve({ code, stdout, stderr });
    });
  });
}

const kb = (args: string[], env?: Record<string, string>) => runNode([bin, ...args], env);

let tempDir: string;

beforeAll(async () => {
  const build = await runNode([require.resolve('typescript/bin/tsc'), '-p', join(root, 'tsconfig.build.json')]);
  if (build.code !== 0) throw new Error(`build failed:\n${build.stdout}${build.stderr}`);
  tempDir = await mkdtemp(join(tmpdir(), 'kb-e2e-'));
}, 60_000);

afterAll(() => rm(tempDir, { recursive: true, force: true }));
afterEach(stopServers);

describe('kb command (end-to-end)', () => {
  test('X1: by default it uses the mock client', async () => {
    expect(await kb(['list', '--limit', '1'])).toEqual({
      code: 0,
      stdout: 'doc-001  Customer Response Template  /templates/email  [template, email]\n',
      stderr: '',
    });
  });

  test('X2: KB_CLIENT=http talks to the KB server at KB_API_URL – add a real file, then find it', async () => {
    const env = { KB_CLIENT: 'http', KB_API_URL: await startKBServer() };
    const file = join(tempDir, 'sms.md');
    await writeFile(file, '# SMS Reminder\n\nYour appointment is tomorrow.\n');

    expect(await kb(['add', '--file', file, '--path', '/templates/sms', '--tags', 'sms'], env)).toEqual({
      code: 0,
      stdout: 'Added doc-004: SMS Reminder (/templates/sms)\n',
      stderr: '',
    });
    expect(await kb(['search', 'appointment'], env)).toEqual({
      code: 0,
      stdout: 'doc-004  SMS Reminder  /templates/sms  [sms]  (match: content)\n',
      stderr: '',
    });
  });

  test('X3: when the KB server is down, it says so (exit 1)', async () => {
    const url = await unusedUrl();
    expect(await kb(['list'], { KB_CLIENT: 'http', KB_API_URL: url })).toEqual({
      code: 1,
      stdout: '',
      stderr: `Error: cannot connect to KB server at ${url} (ECONNREFUSED)\n`,
    });
  });

  test('X4: KB_DEBUG=1 writes each request and response to stderr', async () => {
    const url = await startKBServer();
    const result = await kb(['retrieve', 'doc-001'], { KB_CLIENT: 'http', KB_API_URL: url, KB_DEBUG: '1' });
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^ID: {4}doc-001\n/);
    expect(result.stderr).toMatch(new RegExp(`^\\[kb\\] → POST ${url}/retrieve \\{"docId":"doc-001"\\}\\n\\[kb\\] ← 200 `));
  });

  test('X5: an unknown KB_CLIENT is a usage error (exit 2)', async () => {
    expect(await kb(['list'], { KB_CLIENT: 'sql' })).toEqual({
      code: 2,
      stdout: '',
      stderr: 'Error: KB_CLIENT must be "mock" or "http", got "sql"\n',
    });
  });

  test('X6: exit codes reach the shell – usage error 2, --help 0', async () => {
    const usage = await kb(['search']);
    expect([usage.code, usage.stderr]).toEqual([2, "Error: missing required argument 'query'\n"]);

    const help = await kb(['--help']);
    expect(help.code).toBe(0);
    expect(help.stdout).toContain('Usage: kb');
  });
});
