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
