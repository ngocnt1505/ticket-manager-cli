const { StorageError } = require('../errors');

// Pure text <-> tickets conversion; reading and writing the file live elsewhere.

function parseTickets(text, filePath) {
  if (text.trim() === '') return [];
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new StorageError(
      'CORRUPTED_FILE',
      `Ticket file ${filePath} is not valid JSON (${err.message}). Fix or remove it and try again.`,
    );
  }
  if (!Array.isArray(data)) {
    throw new StorageError(
      'CORRUPTED_FILE',
      `Ticket file ${filePath} must contain a JSON array of tickets. Fix or remove it and try again.`,
    );
  }
  // Only ids are checked: the whole program relies on them (next id, find, update).
  const seen = new Set();
  for (const ticket of data) {
    const id = ticket?.id;
    if (!Number.isInteger(id) || id < 1 || seen.has(id)) {
      throw new StorageError(
        'CORRUPTED_FILE',
        `Ticket file ${filePath} has a ticket without a unique positive id. Fix or remove it and try again.`,
      );
    }
    seen.add(id);
  }
  return data;
}

function serializeTickets(tickets) {
  return `${JSON.stringify(tickets, null, 2)}\n`;
}

module.exports = { parseTickets, serializeTickets };
