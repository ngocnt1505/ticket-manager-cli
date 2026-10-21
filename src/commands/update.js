const { updateTicket } = require('../services/ticketService');
const { UsageError } = require('../errors');
const { parseId } = require('./parseId');
const { TICKET_OPTIONS } = require('./ticketOptions');

function formatValue(value) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '(none)';
  return value;
}

module.exports = {
  options: TICKET_OPTIONS,

  execute({ values, positionals }, { store, now, print }) {
    const id = parseId(positionals[0]);
    const fields = Object.keys(values);
    if (fields.length === 0) {
      const flags = Object.keys(TICKET_OPTIONS).map((name) => `--${name}`);
      throw new UsageError('NO_CHANGES', `Nothing to update. Use at least one of ${flags.join(', ')}.`);
    }
    const { tickets, ticket } = updateTicket(store.load(), id, values, now);
    store.save(tickets);
    const changes = fields.map((field) => `${field}: ${formatValue(ticket[field])}`);
    print(`Updated ticket #${id} (${changes.join(', ')})`);
  },
};
