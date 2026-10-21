const { createTicket } = require('../services/ticketService');
const { UsageError } = require('../errors');

module.exports = {
  options: {
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
    priority: { type: 'string' },
    tags: { type: 'string' },
  },

  execute({ values }, { store, now, print }) {
    if (values.title === undefined) {
      throw new UsageError('MISSING_TITLE', 'Missing required option --title');
    }
    const { tickets, ticket } = createTicket(store.load(), values, now);
    store.save(tickets);
    print(`Created ticket #${ticket.id}: ${ticket.title}`);
  },
};
