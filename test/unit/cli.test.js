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
