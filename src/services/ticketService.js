const { buildTicket } = require('../models/ticket');

// Services are pure functions over the list of tickets: they never touch files
// and never modify the list they receive. The CLI loads, calls a service, then saves.

function createTicket(tickets, input, now) {
  const id = Math.max(0, ...tickets.map((ticket) => ticket.id)) + 1;
  const ticket = buildTicket(input, { id, now });
  return { tickets: [...tickets, ticket], ticket };
}

module.exports = { createTicket };
