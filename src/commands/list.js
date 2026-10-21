const { listTickets } = require('../services/ticketService');

// "#1  open         high    Login bug  [bug, auth]"
function formatLine(ticket) {
  return [
    `#${ticket.id}`,
    ticket.status.padEnd('in_progress'.length),
    ticket.priority.padEnd('medium'.length),
    ticket.title,
    ticket.tags.length > 0 ? `[${ticket.tags.join(', ')}]` : '',
  ]
    .join('  ')
    .trimEnd();
}

module.exports = {
  options: {
    status: { type: 'string' },
    priority: { type: 'string' },
    tags: { type: 'string' },
  },

  execute({ values }, { store, print }) {
    const tickets = listTickets(store.load(), values);
    if (tickets.length === 0) {
      print('No tickets found.');
      return;
    }
    for (const ticket of tickets) print(formatLine(ticket));
  },
};
