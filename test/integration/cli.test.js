const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { tempDir } = require('../helpers/tempDir');

const BIN = path.join(__dirname, '..', '..', 'bin', 'tickets.js');
const STACK_TRACE = /\n\s+at\s/;

// Runs the real `tickets` program as a separate process, like a user or a script would.
function cli(t, { ticketsFile } = {}) {
  const dir = tempDir(t);
  const file = ticketsFile ?? path.join(dir, 'tickets.json');
  const env = { ...process.env, TICKETS_FILE: file };
  const run = (...args) => {
    const r = spawnSync(process.execPath, [BIN, ...args], { cwd: dir, env, encoding: 'utf8' });
    return { code: r.status, stdout: r.stdout, stderr: r.stderr };
  };
  const readTickets = () => JSON.parse(fs.readFileSync(file, 'utf8'));
  return { run, file, dir, env, readTickets };
}

test('C11: create with title, priority and tags exits 0 and writes the ticket to the file', (t) => {
  const { run, readTickets } = cli(t);
  const r = run('create', '--title', 'Sửa lỗi đăng nhập', '--priority', 'high', '--tags', 'bug,ui');
  assert.equal(r.code, 0);
  assert.equal(r.stdout, 'Created ticket #1: Sửa lỗi đăng nhập\n');
  assert.equal(r.stderr, '');
  const [ticket] = readTickets();
  assert.equal(ticket.priority, 'high');
  assert.deepEqual(ticket.tags, ['bug', 'ui']);
});

test('C12: list --status open --tags bug shows only the matching tickets', (t) => {
  const { run } = cli(t);
  run('create', '--title', 'Login bug', '--tags', 'bug');
  run('create', '--title', 'Dark mode', '--tags', 'ui');
  run('create', '--title', 'Old bug', '--status', 'done', '--tags', 'bug');
  const r = run('list', '--status', 'open', '--tags', 'bug');
  assert.equal(r.code, 0);
  assert.match(r.stdout, /^#1\s+open\s+medium\s+Login bug\s+\[bug\]\n$/);
});

test('C13: show 1 exits 0; show 99 exits 1 with the error on stderr only', (t) => {
  const { run } = cli(t);
  run('create', '--title', 'Fix login');
  const found = run('show', '1');
  assert.equal(found.code, 0);
  assert.match(found.stdout, /^Ticket #1\n/);
  const missing = run('show', '99');
  assert.equal(missing.code, 1);
  assert.equal(missing.stdout, '');
  assert.match(missing.stderr, /Ticket #99 not found/);
});

test('C14: update 1 --status done exits 0 and updates the file', (t) => {
  const { run, readTickets } = cli(t);
  run('create', '--title', 'Fix login');
  const r = run('update', '1', '--status', 'done');
  assert.equal(r.code, 0);
  assert.equal(readTickets()[0].status, 'done');
});

test('C15: unknown command, missing argument or malformed id exit 2 without a stack trace', (t) => {
  const { run } = cli(t);
  for (const args of [['delete', '1'], [], ['show'], ['show', 'abc'], ['list', '--colour', 'red']]) {
    const r = run(...args);
    const label = `tickets ${args.join(' ')}`;
    assert.equal(r.code, 2, label);
    assert.equal(r.stdout, '', label);
    assert.match(r.stderr, /^Error: /, label);
    assert.doesNotMatch(r.stderr, STACK_TRACE, label);
  }
});

test('C16: a corrupted file exits 1 with a clear message, no stack trace, and is not overwritten', (t) => {
  const { run, file } = cli(t);
  fs.writeFileSync(file, '[{"id": 1, "title": ');
  const before = fs.readFileSync(file);
  for (const args of [['list'], ['create', '--title', 'x'], ['update', '1', '--status', 'done']]) {
    const r = run(...args);
    const label = `tickets ${args.join(' ')}`;
    assert.equal(r.code, 1, label);
    assert.equal(r.stdout, '', label);
    assert.ok(r.stderr.includes(file), `${label}: names the file`);
    assert.doesNotMatch(r.stderr, STACK_TRACE, label);
  }
  assert.ok(before.equals(fs.readFileSync(file)));
});

test('C17: without TICKETS_FILE the data goes to tickets.json in the current folder', (t) => {
  const { dir, env } = cli(t);
  delete env.TICKETS_FILE;
  const r = spawnSync(process.execPath, [BIN, 'create', '--title', 'Default place'], {
    cwd: dir,
    env,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'tickets.json'), 'utf8'));
  assert.equal(saved[0].title, 'Default place');
});

test('C18: TICKETS_FILE in a missing folder exits 1 and does not create the folder', (t) => {
  const missing = path.join(tempDir(t), 'typo');
  const { run } = cli(t, { ticketsFile: path.join(missing, 'tickets.json') });
  const r = run('create', '--title', 'x');
  assert.equal(r.code, 1);
  assert.match(r.stderr, /Cannot save tickets/);
  assert.doesNotMatch(r.stderr, STACK_TRACE);
  assert.equal(fs.existsSync(missing), false);
});
