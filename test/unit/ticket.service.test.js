const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createTicket, listTickets } = require('../../src/services/ticketService');
const { buildTicket } = require('../../src/models/ticket');

const NOW = new Date('2026-10-21T08:00:00.000Z');

test('S1: the first ticket gets id 1 and is returned with a new list containing it', () => {
  const expected = buildTicket({ title: 'First' }, { id: 1, now: NOW });
  assert.deepEqual(createTicket([], { title: 'First' }, NOW), {
    tickets: [expected],
    ticket: expected,
  });
});

test('S2: a new id is the highest existing id plus one, even with gaps', () => {
  const existing = [{ id: 2 }, { id: 9 }, { id: 4 }];
  assert.equal(createTicket(existing, { title: 'Next' }, NOW)?.ticket.id, 10);
});

test('S3: creating twice in a row on the returned list gives ids 1 and 2', () => {
  const first = createTicket([], { title: 'One' }, NOW);
  const second = createTicket(first?.tickets, { title: 'Two' }, NOW);
  assert.deepEqual(second?.tickets.map((ticket) => ticket.id), [1, 2]);
});

test('S4: invalid input throws and leaves the given list unchanged', () => {
  const existing = [buildTicket({ title: 'Keep me' }, { id: 1, now: NOW })];
  const snapshot = structuredClone(existing);
  assert.throws(() => createTicket(existing, { title: '   ' }, NOW), {
    name: 'ValidationError',
    code: 'EMPTY_TITLE',
  });
  assert.deepEqual(existing, snapshot);
});

test('P2: creating a ticket returns a new list and leaves the given list unchanged', () => {
  const existing = [buildTicket({ title: 'Keep me' }, { id: 1, now: NOW })];
  const snapshot = structuredClone(existing);
  const result = createTicket(existing, { title: 'New' }, NOW);
  // Precondition: a ticket really was added to the returned list.
  assert.equal(result.tickets.length, 2);
  assert.notEqual(result.tickets, existing);
  assert.deepEqual(existing, snapshot);
});

// Four tickets covering every status, priority and tag combination the filters need.
function seed() {
  let tickets = [];
  for (const input of [
    { title: 'Login bug', status: 'open', priority: 'high', tags: 'bug,auth' },
    { title: 'Dark mode', status: 'in_progress', priority: 'low', tags: 'ui' },
    { title: 'Crash on save', status: 'open', priority: 'high', tags: 'bug' },
    { title: 'Docs', status: 'done', priority: 'medium' },
  ]) {
    tickets = createTicket(tickets, input, NOW).tickets;
  }
  return tickets;
}

const ids = (tickets) => tickets?.map((ticket) => ticket.id);

test('S5: listing with no tickets gives an empty list', () => {
  assert.deepEqual(listTickets([], {}), []);
});

test('S6: results are sorted by id without reordering the given list', () => {
  const [t1, t2, t3] = seed();
  const shuffled = [t3, t1, t2];
  assert.deepEqual(ids(listTickets(shuffled, {})), [1, 2, 3]);
  assert.deepEqual(ids(shuffled), [3, 1, 2]);
});

test('S7: filters by status', () => {
  assert.deepEqual(ids(listTickets(seed(), { status: 'open' })), [1, 3]);
});

test('S8: filters by priority', () => {
  assert.deepEqual(ids(listTickets(seed(), { priority: 'low' })), [2]);
});

test('S9: filters by one tag', () => {
  assert.deepEqual(ids(listTickets(seed(), { tags: 'bug' })), [1, 3]);
});

test('S10: with several tags a ticket must have all of them (AND)', () => {
  assert.deepEqual(ids(listTickets(seed(), { tags: 'bug,auth' })), [1]);
});

test('S11: tag filters ignore upper/lower case', () => {
  assert.deepEqual(ids(listTickets(seed(), { tags: 'BUG' })), [1, 3]);
});

test('S12: status, priority and tags filters are combined with AND', () => {
  const tickets = seed();
  assert.deepEqual(ids(listTickets(tickets, { status: 'open', priority: 'high', tags: 'auth' })), [1]);
  assert.deepEqual(ids(listTickets(tickets, { status: 'done', priority: 'high' })), []);
});

test('S13: an invalid filter value is an error, not an empty result', () => {
  assert.throws(() => listTickets(seed(), { status: 'closed' }), {
    name: 'ValidationError',
    code: 'INVALID_STATUS',
  });
  assert.throws(() => listTickets(seed(), { priority: 'urgent' }), {
    name: 'ValidationError',
    code: 'INVALID_PRIORITY',
  });
});
