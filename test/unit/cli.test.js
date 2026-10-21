const { test } = require('node:test');
const assert = require('node:assert/strict');

const { run } = require('../../src/cli');

const NOW = new Date('2026-10-21T08:00:00.000Z');

// Runs the CLI in memory: fake stdout/stderr, and a store that keeps tickets in an array
// and counts saves (so a test can check that nothing was written).
function cli(initial = []) {
  const store = {
    tickets: initial,
    saves: 0,
    load() {
      return structuredClone(this.tickets);
    },
    save(tickets) {
      this.saves += 1;
      this.tickets = structuredClone(tickets);
    },
  };
  const exec = (...argv) => {
    const out = [];
    const err = [];
    const code = run(argv, {
      store,
      now: () => NOW,
      stdout: (line) => out.push(line),
      stderr: (line) => err.push(line),
    });
    return { code, stdout: out.join('\n'), stderr: err.join('\n') };
  };
  return { exec, store };
}

test('C1: create prints the new id on stdout, saves the ticket and exits 0', () => {
  const { exec, store } = cli();
  const r = exec('create', '--title', 'Fix login', '--priority', 'high', '--tags', 'bug,ui');
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'Created ticket #1: Fix login');
  assert.equal(r.stderr, '');
  assert.equal(store.tickets.length, 1);
  assert.equal(store.tickets[0].priority, 'high');
  assert.deepEqual(store.tickets[0].tags, ['bug', 'ui']);
});

test('C2: create without --title explains it on stderr, exits 2 and saves nothing', () => {
  const { exec, store } = cli();
  const r = exec('create');
  assert.equal(r.code, 2);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /--title/);
  assert.equal(store.saves, 0);
});

test('C3: list with no tickets prints a friendly message and exits 0', () => {
  const { exec } = cli();
  const r = exec('list');
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'No tickets found.');
});

test('C4: list prints one line per ticket with id, status, priority, title and tags', () => {
  const { exec } = cli();
  exec('create', '--title', 'Login bug', '--priority', 'high', '--tags', 'bug,auth');
  exec('create', '--title', 'Docs');
  const r = exec('list');
  assert.equal(r.code, 0);
  const lines = r.stdout.split('\n');
  assert.equal(lines.length, 2);
  assert.match(lines[0], /^#1\s+open\s+high\s+Login bug\s+\[bug, auth\]$/);
  assert.match(lines[1], /^#2\s+open\s+medium\s+Docs$/);
});

test('C5: show prints every field of the ticket', () => {
  const { exec } = cli();
  exec('create', '--title', 'Sửa lỗi', '--description', 'Chi tiết', '--priority', 'high', '--tags', 'bug,ui');
  const r = exec('show', '1');
  assert.equal(r.code, 0);
  assert.equal(
    r.stdout,
    [
      'Ticket #1',
      '  Title:       Sửa lỗi',
      '  Status:      open',
      '  Priority:    high',
      '  Tags:        bug, ui',
      '  Description: Chi tiết',
      '  Created:     2026-10-21T08:00:00.000Z',
      '  Updated:     2026-10-21T08:00:00.000Z',
    ].join('\n'),
  );
});

test('C9: an unknown ticket exits 1 with the error on stderr only', () => {
  const { exec } = cli();
  const r = exec('show', '99');
  assert.equal(r.code, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /Ticket #99 not found/);
});

test('C10: a malformed id exits 2; 1 and 42 are accepted as ids', () => {
  const { exec } = cli();
  for (const bad of ['abc', '0', '-1', '1.5', '12abc', '1e2']) {
    const r = exec('show', bad);
    assert.equal(r.code, 2, `id ${bad}`);
    assert.equal(r.stdout, '', `id ${bad}`);
  }
  exec('create', '--title', 'One');
  assert.equal(exec('show', '1').code, 0);
  assert.equal(exec('show', '42').code, 1, '42 is a valid id that simply does not exist');
});

test('C6: update changes the ticket, confirms the change and exits 0', () => {
  const { exec, store } = cli();
  exec('create', '--title', 'Fix login');
  const r = exec('update', '1', '--status', 'done');
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'Updated ticket #1 (status: done)');
  assert.equal(store.tickets[0].status, 'done');
});

test('C7: update without any option exits 2, names the options and saves nothing', () => {
  const { exec, store } = cli();
  exec('create', '--title', 'Fix login');
  const savesBefore = store.saves;
  const r = exec('update', '1');
  assert.equal(r.code, 2);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /--status/);
  assert.equal(store.saves, savesBefore);
});

test('C8: invalid values exit 2 with a helpful message and save nothing', () => {
  const { exec, store } = cli();
  exec('create', '--title', 'Fix login');
  const savesBefore = store.saves;
  const cases = [
    [['update', '1', '--status', 'closed'], /open, in_progress, done/],
    [['create', '--title', 'x', '--priority', 'urgent'], /low, medium, high/],
    [['create', '--title', 'a'.repeat(101)], /100/],
    [['list', '--status', 'closed'], /open, in_progress, done/],
  ];
  for (const [argv, message] of cases) {
    const r = exec(...argv);
    assert.equal(r.code, 2, argv.join(' '));
    assert.equal(r.stdout, '', argv.join(' '));
    assert.match(r.stderr, message, argv.join(' '));
  }
  assert.equal(store.saves, savesBefore);
});
