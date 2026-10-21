const { createTicket } = require('../services/ticketService');
const { UsageError } = require('../errors');
const { TICKET_OPTIONS } = require('./ticketOptions');

module.exports = {
  options: TICKET_OPTIONS,

  execute({ values }, { store, now, print }) {
    if (values.title === undefined) {
      throw new UsageError('MISSING_TITLE', 'Missing required option --title');
    }
    const { tickets, ticket } = createTicket(store.load(), values, now);
    store.save(tickets);
    print(`Created ticket #${ticket.id}: ${ticket.title}`);
  },
};
