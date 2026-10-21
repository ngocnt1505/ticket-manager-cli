const { test } = require('node:test');
const assert = require('node:assert/strict');

const { createTicket } = require('../../src/services/ticketService');
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
