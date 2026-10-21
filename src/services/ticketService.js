const {
  buildTicket,
  validateStatus,
  validatePriority,
  normalizeTags,
} = require('../models/ticket');
const { NotFoundError } = require('../errors');

// Services are pure functions over the list of tickets: they never touch files
// and never modify the list they receive. The CLI loads, calls a service, then saves.

function createTicket(tickets, input, now) {
  const id = Math.max(0, ...tickets.map((ticket) => ticket.id)) + 1;
  const ticket = buildTicket(input, { id, now });
  return { tickets: [...tickets, ticket], ticket };
}

function listTickets(tickets, filters) {
  // Validate filters up front: a typo must be an error, not an empty result.
  const status = filters.status === undefined ? undefined : validateStatus(filters.status);
  const priority =
    filters.priority === undefined ? undefined : validatePriority(filters.priority);
  const tags = normalizeTags(filters.tags);

  return tickets
    .filter((ticket) => status === undefined || ticket.status === status)
    .filter((ticket) => priority === undefined || ticket.priority === priority)
    .filter((ticket) => tags.every((tag) => ticket.tags.includes(tag)))
    .sort((a, b) => a.id - b.id);
}

function findTicket(tickets, id) {
  const ticket = tickets.find((candidate) => candidate.id === id);
  if (!ticket) throw new NotFoundError('NOT_FOUND', `Ticket #${id} not found`);
  return ticket;
}

function updateTicket(tickets, id, changes, now) {}

module.exports = { createTicket, listTickets, findTicket, updateTicket };
