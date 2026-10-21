const { test } = require('node:test');
const assert = require('node:assert/strict');

const { parseTickets, serializeTickets } = require('../../src/storage/jsonStore');

const corrupted = { name: 'StorageError', code: 'CORRUPTED_FILE' };

test('D1: parseTickets returns the tickets stored in a JSON array', () => {
  const text = '[{"id":1,"title":"A"},{"id":2,"title":"B"}]';
  assert.deepEqual(parseTickets(text, 'tickets.json'), [
    { id: 1, title: 'A' },
    { id: 2, title: 'B' },
  ]);
});

test('D2: an empty or whitespace-only file means no tickets', () => {
  for (const blank of ['', '  \n\t']) {
    assert.deepEqual(parseTickets(blank, 'tickets.json'), []);
  }
});

test('D3: cut-off JSON fails with CORRUPTED_FILE and names the file', () => {
  assert.throws(
    () => parseTickets('[{"id":1,', 'data/tickets.json'),
    (err) => {
      assert.equal(err.name, 'StorageError');
      assert.equal(err.code, 'CORRUPTED_FILE');
      assert.match(err.message, /data\/tickets\.json/);
      return true;
    },
  );
});

test('D4: valid JSON that is not an array fails with CORRUPTED_FILE', () => {
  for (const text of ['{}', 'null', '42', '"tickets"']) {
    assert.throws(() => parseTickets(text, 'tickets.json'), corrupted);
  }
});

test('D5: serializeTickets writes JSON indented by 2 spaces, ending with a newline', () => {
  assert.equal(serializeTickets([{ id: 1, tags: ['a'] }]), '[\n  {\n    "id": 1,\n    "tags": [\n      "a"\n    ]\n  }\n]\n');
});

test('D6: Vietnamese text and emoji survive serialize then parse', () => {
  const tickets = [{ id: 1, title: 'Sửa lỗi đăng nhập 😀', tags: ['giao diện'] }];
  const text = serializeTickets(tickets);
  assert.match(text ?? '', /Sửa lỗi đăng nhập 😀/);
  assert.deepEqual(parseTickets(text ?? '', 'tickets.json'), tickets);
});

test('P3: entries without a unique positive integer id fail with CORRUPTED_FILE', () => {
  for (const text of ['[1]', '[null]', '[{"title":"no id"}]', '[{"id":"1"}]', '[{"id":0}]', '[{"id":1},{"id":1}]']) {
    assert.throws(() => parseTickets(text, 'tickets.json'), corrupted, text);
  }
});
