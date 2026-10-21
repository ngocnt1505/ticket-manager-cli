const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateTitle } = require('../../src/models/ticket');

test('M1: trims a valid title', () => {
  assert.equal(validateTitle('   Fix login   '), 'Fix login');
});

test('M2: rejects an empty or whitespace-only title with EMPTY_TITLE', () => {
  for (const blank of ['', '   ', '\t\n']) {
    assert.throws(() => validateTitle(blank), {
      name: 'ValidationError',
      code: 'EMPTY_TITLE',
    });
  }
});

test('M3: accepts a title of exactly 100 characters', () => {
  const title = 'a'.repeat(100);
  assert.equal(validateTitle(title), title);
});

test('M5: measures the length after trimming', () => {
  const title = 'a'.repeat(100);
  assert.equal(validateTitle(`  ${title}  `), title);
});

test('M4: rejects a title of 101 characters with TITLE_TOO_LONG', () => {
  assert.throws(() => validateTitle('a'.repeat(101)), {
    name: 'ValidationError',
    code: 'TITLE_TOO_LONG',
  });
});
