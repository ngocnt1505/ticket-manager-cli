import { run } from '../../src/kb/cli';
import type { KBClient } from '../../src/kb/client';
import { MockKBClient, SEED_DOCUMENTS } from '../../src/kb/mockClient';

/** Runs `kb` with a fresh mock client, fake files and captured output. */
function setup(files: Record<string, string> = {}, client: KBClient = new MockKBClient()) {
  const out: string[] = [];
  const err: string[] = [];
  const io = {
    client,
    stdout: (text: string) => out.push(text),
    stderr: (text: string) => err.push(text),
    readFile: async (path: string) => {
      if (Object.hasOwn(files, path)) return files[path];
      throw Object.assign(new Error(`ENOENT: no such file or directory, open '${path}'`), { code: 'ENOENT' });
    },
  };
  return { client, out, err, kb: (...argv: string[]) => run(argv, io) };
}

const ids = (docs: { id: string }[]) => docs.map((doc) => doc.id);

describe('kb search', () => {
  test('C1: prints one line per result – id, title, node, tags and where it matched', async () => {
    const { kb, out, err } = setup();
    expect(await kb('search', 'team')).toBe(0);
    expect(out).toEqual([
      'doc-002  DevOps Team Members  /team/devops  [team, devops]  (match: title)',
      'doc-001  Customer Response Template  /templates/email  [template, email]  (match: content)',
      'doc-003  Getting Started Guide  /docs/guides  [guide, onboarding]  (match: content)',
    ]);
    expect(err).toEqual([]);
  });

  test('C2: --top-k and --node narrow the results', async () => {
    const topK = setup();
    expect(await topK.kb('search', 'team', '--top-k', '1')).toBe(0);
    expect(topK.out).toEqual(['doc-002  DevOps Team Members  /team/devops  [team, devops]  (match: title)']);

    const node = setup();
    expect(await node.kb('search', 'team', '--node', '/docs')).toBe(0);
    expect(node.out).toEqual(['doc-003  Getting Started Guide  /docs/guides  [guide, onboarding]  (match: content)']);
  });

  test('C3: says so when nothing matches', async () => {
    const { kb, out } = setup();
    expect(await kb('search', 'no such words')).toBe(0);
    expect(out).toEqual(['No documents found.']);
  });

  test('C4: --top-k that is not a positive whole number is a usage error (exit 2)', async () => {
    for (const topK of ['0', '-1', '1.5', 'abc']) {
      const { kb, out, err } = setup();
      expect(await kb('search', 'team', '--top-k', topK)).toBe(2);
      expect(out).toEqual([]);
      expect(err).toEqual([expect.stringMatching(/^Error: .*top-k/)]);
    }
  });

  test('C5: a missing query is a usage error (exit 2)', async () => {
    const { kb, err } = setup();
    expect(await kb('search')).toBe(2);
    expect(err).toEqual([expect.stringMatching(/^Error: .*query/)]);
  });
});

describe('kb list', () => {
  test('C6: lists documents, narrowed by --node and --limit', async () => {
    const all = setup();
    expect(await all.kb('list')).toBe(0);
    expect(all.out).toEqual([
      'doc-001  Customer Response Template  /templates/email  [template, email]',
      'doc-002  DevOps Team Members  /team/devops  [team, devops]',
      'doc-003  Getting Started Guide  /docs/guides  [guide, onboarding]',
    ]);

    const some = setup();
    expect(await some.kb('list', '--node', '/team', '--limit', '1')).toBe(0);
    expect(some.out).toEqual(['doc-002  DevOps Team Members  /team/devops  [team, devops]']);
  });

  test('C7: a node path without "/" or a bad --limit is a usage error (exit 2)', async () => {
    const badNode = setup();
    expect(await badNode.kb('list', '--node', 'templates')).toBe(2);
    expect(badNode.err).toEqual(['Error: node path must start with "/": templates']);

    const badLimit = setup();
    expect(await badLimit.kb('list', '--limit', '0')).toBe(2);
    expect(badLimit.err).toEqual([expect.stringMatching(/^Error: .*limit/)]);
  });
});

describe('kb retrieve', () => {
  test('C8: prints the document details, then its content', async () => {
    const { kb, out } = setup();
    expect(await kb('retrieve', 'doc-002')).toBe(0);
    expect(out).toEqual([
      'ID:    doc-002',
      'Title: DevOps Team Members',
      'Path:  /team/devops',
      'Tags:  team, devops',
      '',
      SEED_DOCUMENTS[1].content,
    ]);
  });

  test('C9: an unknown id is a data error (exit 1)', async () => {
    const { kb, out, err } = setup();
    expect(await kb('retrieve', 'doc-999')).toBe(1);
    expect(out).toEqual([]);
    expect(err).toEqual(['Error: document doc-999 not found']);
  });
});

describe('kb add', () => {
  const sms = '# SMS Reminder\n\nYour appointment is tomorrow.\n';

  test('C10: adds the file as a document, titled by its first "# heading"', async () => {
    const { kb, out, client } = setup({ 'notes/sms.md': sms });
    expect(await kb('add', '--file', 'notes/sms.md', '--path', '/templates/sms', '--tags', 'SMS, reminder')).toBe(0);
    expect(out).toEqual(['Added doc-004: SMS Reminder (/templates/sms)']);
    expect(await client.retrieve('doc-004')).toEqual({
      id: 'doc-004',
      title: 'SMS Reminder',
      content: sms,
      nodePath: '/templates/sms',
      tags: ['sms', 'reminder'],
    });
  });

  test('C11: --title wins over the heading; with neither, the file name is the title', async () => {
    const titled = setup({ 'sms.md': sms });
    expect(await titled.kb('add', '--file', 'sms.md', '--path', '/templates/sms', '--title', 'Reminder SMS')).toBe(0);
    expect(titled.out).toEqual(['Added doc-004: Reminder SMS (/templates/sms)']);
    expect(await titled.client.retrieve('doc-004')).toMatchObject({ title: 'Reminder SMS', tags: [] });

    const untitled = setup({ 'scripts/call-script.md': 'Hello, this is the support team.' });
    expect(await untitled.kb('add', '--file', 'scripts/call-script.md', '--path', '/templates/call')).toBe(0);
    expect(untitled.out).toEqual(['Added doc-004: call-script (/templates/call)']);
    expect(await untitled.client.retrieve('doc-004')).toMatchObject({ title: 'call-script' });
  });

  test('C12: a file that cannot be read is a data error (exit 1) and adds nothing', async () => {
    const { kb, err, client } = setup();
    expect(await kb('add', '--file', 'missing.md', '--path', '/templates/sms')).toBe(1);
    expect(err).toEqual(['Error: cannot read file "missing.md"']);
    expect(ids(await client.list({}))).toEqual(['doc-001', 'doc-002', 'doc-003']);
  });

  test('C13: a missing --path or a node path without "/" is a usage error (exit 2) and adds nothing', async () => {
    const missing = setup({ 'sms.md': sms });
    expect(await missing.kb('add', '--file', 'sms.md')).toBe(2);
    expect(missing.err).toEqual([expect.stringMatching(/^Error: .*--path/)]);
    expect(ids(await missing.client.list({}))).toEqual(['doc-001', 'doc-002', 'doc-003']);

    const bad = setup({ 'sms.md': sms });
    expect(await bad.kb('add', '--file', 'sms.md', '--path', 'templates/sms')).toBe(2);
    expect(ids(await bad.client.list({}))).toEqual(['doc-001', 'doc-002', 'doc-003']);
  });
});

describe('kb (program)', () => {
  test('C14: an unknown command or no command is a usage error (exit 2)', async () => {
    const unknown = setup();
    expect(await unknown.kb('remove')).toBe(2);
    expect(unknown.err).toEqual([expect.stringMatching(/^Error: unknown command 'remove'/)]);

    const none = setup();
    expect(await none.kb()).toBe(2);
    expect(none.err.join('')).toContain('Usage: kb');
  });

  test('C15: --help prints usage to stdout and exits 0', async () => {
    const program = setup();
    expect(await program.kb('--help')).toBe(0);
    expect(program.out.join('')).toMatch(/Usage: kb[\s\S]*search[\s\S]*list[\s\S]*retrieve[\s\S]*add/);
    expect(program.err).toEqual([]);

    const search = setup();
    expect(await search.kb('search', '--help')).toBe(0);
    expect(search.out.join('')).toContain('--top-k');
  });

  test('C16: an unexpected error is reported in one line, without a stack trace (exit 1)', async () => {
    const broken = new MockKBClient();
    broken.retrieve = async () => {
      throw new Error('boom');
    };
    const { kb, err } = setup({}, broken);
    expect(await kb('retrieve', 'doc-001')).toBe(1);
    expect(err).toEqual(['Unexpected error: boom']);
  });
});
