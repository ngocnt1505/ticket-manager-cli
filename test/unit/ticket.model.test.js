const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  validateTitle,
  validateStatus,
  validatePriority,
  validateDescription,
  normalizeTags,
  buildTicket,
  applyUpdate,
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

test('M11: a missing description becomes an empty string', () => {
  assert.equal(validateDescription(undefined), '');
});

test('M12: trims the description', () => {
  assert.equal(validateDescription('  Steps to reproduce  '), 'Steps to reproduce');
});

test('M13: accepts 1000 characters and rejects 1001 with DESCRIPTION_TOO_LONG', () => {
  const max = 'd'.repeat(1000);
  assert.equal(validateDescription(max), max);
  assert.throws(() => validateDescription('d'.repeat(1001)), {
    name: 'ValidationError',
    code: 'DESCRIPTION_TOO_LONG',
  });
});

test('M14: rejects a non-string description with INVALID_DESCRIPTION', () => {
  for (const bad of [null, 7, {}]) {
    assert.throws(() => validateDescription(bad), {
      name: 'ValidationError',
      code: 'INVALID_DESCRIPTION',
    });
  }
});

test('M15: splits tags on commas and trims each one', () => {
  assert.deepEqual(normalizeTags('bug, ui'), ['bug', 'ui']);
});

test('M16: drops empty tags', () => {
  assert.deepEqual(normalizeTags('bug,,ui,'), ['bug', 'ui']);
});

test('M17: lowercases tags and removes duplicates, keeping first-seen order', () => {
  assert.deepEqual(normalizeTags('Bug,bug,UI'), ['bug', 'ui']);
});

test('M18: missing or blank tags become an empty list', () => {
  for (const blank of [undefined, '', ' , ,']) {
    assert.deepEqual(normalizeTags(blank), []);
  }
});

test('M19: keeps Vietnamese tags', () => {
  assert.deepEqual(normalizeTags('Giao diện'), ['giao diện']);
});

test('M20: accepts a 30-character tag and rejects 31 with INVALID_TAG', () => {
  const max = 't'.repeat(30);
  assert.deepEqual(normalizeTags(max), [max]);
  assert.throws(() => normalizeTags('t'.repeat(31)), {
    name: 'ValidationError',
    code: 'INVALID_TAG',
  });
});

test('P1: rejects non-string tags with INVALID_TAG', () => {
  for (const bad of [null, 42, {}, ['bug']]) {
    assert.throws(() => normalizeTags(bad), {
      name: 'ValidationError',
      code: 'INVALID_TAG',
    });
  }
});

const NOW = new Date('2026-10-21T08:00:00.000Z');

test('M21: a ticket with only a title gets defaults, the given id and timestamps', () => {
  assert.deepEqual(buildTicket({ title: '  Fix login  ' }, { id: 1, now: NOW }), {
    id: 1,
    title: 'Fix login',
    description: '',
    status: 'open',
    priority: 'medium',
    tags: [],
    createdAt: '2026-10-21T08:00:00.000Z',
    updatedAt: '2026-10-21T08:00:00.000Z',
  });
});

test('M22: a ticket with every field uses the validated values', () => {
  const input = {
    title: 'Crash on save',
    description: ' Happens on Windows ',
    status: 'in_progress',
    priority: 'high',
    tags: 'Bug, UI',
  };
  const ticket = buildTicket(input, { id: 7, now: NOW });
  assert.equal(ticket.id, 7);
  assert.equal(ticket.description, 'Happens on Windows');
  assert.equal(ticket.status, 'in_progress');
  assert.equal(ticket.priority, 'high');
  assert.deepEqual(ticket.tags, ['bug', 'ui']);

  assert.throws(() => buildTicket({ ...input, priority: 'urgent' }, { id: 7, now: NOW }), {
    code: 'INVALID_PRIORITY',
  });
});

const LATER = new Date('2026-10-22T09:30:00.000Z');
const existingTicket = () =>
  buildTicket({ title: 'Fix login', tags: 'bug,auth' }, { id: 3, now: NOW });

test('M23: an update changes only the given field and refreshes updatedAt', () => {
  const ticket = existingTicket();
  assert.deepEqual(applyUpdate(ticket, { status: 'done' }, LATER), {
    ...ticket,
    status: 'done',
    updatedAt: '2026-10-22T09:30:00.000Z',
  });
});

test('M24: an update returns a new ticket and leaves the original untouched', () => {
  const ticket = existingTicket();
  const snapshot = structuredClone(ticket);
  const updated = applyUpdate(ticket, { status: 'done', tags: 'ui' }, LATER);
  // Precondition: the update really happened; otherwise "unchanged" proves nothing.
  assert.equal(updated?.status, 'done');
  assert.deepEqual(updated.tags, ['ui']);
  assert.deepEqual(ticket, snapshot);
});

test('M25: one invalid value rejects the whole update (no half update)', () => {
  const ticket = existingTicket();
  const snapshot = structuredClone(ticket);
  assert.throws(() => applyUpdate(ticket, { status: 'done', priority: 'urgent' }, LATER), {
    name: 'ValidationError',
    code: 'INVALID_PRIORITY',
  });
  assert.deepEqual(ticket, snapshot);
});

test('M26: id, createdAt, updatedAt and unknown fields cannot be updated', () => {
  for (const field of ['id', 'createdAt', 'updatedAt', 'owner']) {
    assert.throws(() => applyUpdate(existingTicket(), { [field]: 'x' }, LATER), {
      name: 'ValidationError',
      code: 'UNKNOWN_FIELD',
    });
  }
});

test('M27: an update without any field fails with NO_CHANGES', () => {
  assert.throws(() => applyUpdate(existingTicket(), {}, LATER), {
    name: 'ValidationError',
    code: 'NO_CHANGES',
  });
});

test('P7: building a ticket with an invalid status fails with INVALID_STATUS', () => {
  assert.throws(() => buildTicket({ title: 'x', status: 'closed' }, { id: 1, now: NOW }), {
    name: 'ValidationError',
    code: 'INVALID_STATUS',
  });
});
