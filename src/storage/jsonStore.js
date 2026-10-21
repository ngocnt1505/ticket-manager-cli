const fs = require('node:fs');

const { StorageError } = require('../errors');

// parseTickets / serializeTickets are pure (text <-> tickets); load / save touch the disk.

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

function load(filePath) {
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  return parseTickets(text, filePath);
}

// Atomic write: write a temporary file next to the real one, then rename it over.
// If anything fails, the previous file is still complete.
function save(filePath, tickets) {
  const tmpPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tmpPath, serializeTickets(tickets));
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    throw new StorageError(
      'SAVE_FAILED',
      `Cannot save tickets to ${filePath} (${err.code}).`,
    );
  }
}

module.exports = { parseTickets, serializeTickets, load, save };
