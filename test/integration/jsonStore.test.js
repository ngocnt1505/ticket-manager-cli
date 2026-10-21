const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { load, save } = require('../../src/storage/jsonStore');
const { tempDir } = require('../helpers/tempDir');

test('D7: loading a file that does not exist gives no tickets and creates nothing', (t) => {
  const file = path.join(tempDir(t), 'tickets.json');
  assert.deepEqual(load(file), []);
  assert.equal(fs.existsSync(file), false);
});

test('D8: what save writes, load reads back', (t) => {
  const file = path.join(tempDir(t), 'tickets.json');
  const tickets = [
    { id: 1, title: 'Sửa lỗi đăng nhập', tags: ['giao diện'] },
    { id: 2, title: 'Emoji 😀', tags: [] },
  ];
  save(file, tickets);
  assert.deepEqual(load(file), tickets);
});

test('D9: loading a corrupted file fails with CORRUPTED_FILE and leaves it byte for byte', (t) => {
  const file = path.join(tempDir(t), 'tickets.json');
  fs.writeFileSync(file, '[{"id":1,"title":"cut off');
  const before = fs.readFileSync(file);
  assert.throws(() => load(file), { name: 'StorageError', code: 'CORRUPTED_FILE' });
  assert.ok(before.equals(fs.readFileSync(file)));
});

test('D10: when writing fails, save reports SAVE_FAILED and the old file stays byte for byte', (t) => {
  const file = path.join(tempDir(t), 'tickets.json');
  fs.writeFileSync(file, '[{"id":1}]');
  // A folder where the temporary file should go makes the write fail for real (no mocks).
  fs.mkdirSync(`${file}.tmp`);
  const before = fs.readFileSync(file);
  assert.throws(() => save(file, [{ id: 1 }, { id: 2 }]), { name: 'StorageError', code: 'SAVE_FAILED' });
  assert.ok(before.equals(fs.readFileSync(file)));
});

test('D11: save into a missing folder fails with SAVE_FAILED and does not create the folder', (t) => {
  const missing = path.join(tempDir(t), 'typo');
  assert.throws(() => save(path.join(missing, 'tickets.json'), []), {
    name: 'StorageError',
    code: 'SAVE_FAILED',
  });
  assert.equal(fs.existsSync(missing), false);
});

test('D12: save leaves no temporary file behind', (t) => {
  const dir = tempDir(t);
  const file = path.join(dir, 'tickets.json');
  save(file, [{ id: 1 }]);
  save(file, [{ id: 1 }, { id: 2 }]);
  assert.deepEqual(fs.readdirSync(dir), ['tickets.json']);
});
