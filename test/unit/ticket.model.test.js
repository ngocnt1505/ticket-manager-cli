const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  validateTitle,
  validateStatus,
  validatePriority,
} = require('../../src/models/ticket');

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

test('M6: rejects a non-string title with INVALID_TITLE', () => {
  for (const bad of [undefined, null, 42, {}, ['x']]) {
    assert.throws(() => validateTitle(bad), {
      name: 'ValidationError',
      code: 'INVALID_TITLE',
    });
  }
});

test('M7: accepts open, in_progress and done as status', () => {
  for (const status of ['open', 'in_progress', 'done']) {
    assert.equal(validateStatus(status), status);
  }
});

test('M8: rejects other status values with INVALID_STATUS and lists the allowed ones', () => {
  for (const bad of ['closed', 'OPEN', '', undefined]) {
    assert.throws(
      () => validateStatus(bad),
      (err) => {
        assert.equal(err.name, 'ValidationError');
        assert.equal(err.code, 'INVALID_STATUS');
        assert.match(err.message, /open, in_progress, done/);
        return true;
      },
    );
  }
});

test('M9: accepts low, medium and high as priority', () => {
  for (const priority of ['low', 'medium', 'high']) {
    assert.equal(validatePriority(priority), priority);
  }
});

test('M10: rejects other priority values with INVALID_PRIORITY', () => {
  for (const bad of ['urgent', 'High', '', undefined]) {
    assert.throws(() => validatePriority(bad), {
      name: 'ValidationError',
      code: 'INVALID_PRIORITY',
    });
  }
});
