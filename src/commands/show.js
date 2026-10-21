const { findTicket } = require('../services/ticketService');
const { parseId } = require('./parseId');

function formatDetails(ticket) {
  return [
    `Ticket #${ticket.id}`,
    `  Title:       ${ticket.title}`,
    `  Status:      ${ticket.status}`,
    `  Priority:    ${ticket.priority}`,
    `  Tags:        ${ticket.tags.length > 0 ? ticket.tags.join(', ') : '(none)'}`,
    `  Description: ${ticket.description || '(none)'}`,
    `  Created:     ${ticket.createdAt}`,
    `  Updated:     ${ticket.updatedAt}`,
  ];
}

module.exports = {
  options: {},

  execute({ positionals }, { store, print }) {
    const ticket = findTicket(store.load(), parseId(positionals[0]));
    for (const line of formatDetails(ticket)) print(line);
  },
};
