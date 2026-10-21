const { UsageError } = require('../errors');

// Digits only, no leading zero: rejects "0", "-1", "1.5", "1e2", "12abc", "abc".
const ID_PATTERN = /^[1-9]\d*$/;

function parseId(text) {
  if (typeof text !== 'string' || !ID_PATTERN.test(text)) {
    throw new UsageError(
      'INVALID_ID',
      `Invalid ticket id "${text ?? ''}". Use a positive whole number, for example 1.`,
    );
  }
  return Number(text);
}

module.exports = { parseId };
