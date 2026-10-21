const { updateTicket } = require('../services/ticketService');
const { UsageError } = require('../errors');
const { parseId } = require('./parseId');

const options = {
  title: { type: 'string' },
  description: { type: 'string' },
  status: { type: 'string' },
  priority: { type: 'string' },
  tags: { type: 'string' },
};

function formatValue(value) {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '(none)';
  return value;
}

module.exports = {
  options,

  execute({ values, positionals }, { store, now, print }) {
    const id = parseId(positionals[0]);
    const fields = Object.keys(values);
    if (fields.length === 0) {
      const flags = Object.keys(options).map((name) => `--${name}`);
      throw new UsageError('NO_CHANGES', `Nothing to update. Use at least one of ${flags.join(', ')}.`);
    }
    const { tickets, ticket } = updateTicket(store.load(), id, values, now);
    store.save(tickets);
    const changes = fields.map((field) => `${field}: ${formatValue(ticket[field])}`);
    print(`Updated ticket #${id} (${changes.join(', ')})`);
  },
};
