// The editable ticket fields as command-line options, shared by `create` and `update`.
const TICKET_OPTIONS = {
  title: { type: 'string' },
  description: { type: 'string' },
  status: { type: 'string' },
  priority: { type: 'string' },
  tags: { type: 'string' },
};

module.exports = { TICKET_OPTIONS };
