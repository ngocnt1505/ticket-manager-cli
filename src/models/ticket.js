const { ValidationError } = require('../errors');

function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new ValidationError('INVALID_TITLE', 'Title must be text');
  }
  const clean = title.trim();
  if (!clean) throw new ValidationError('EMPTY_TITLE', 'Title is required');
  if (clean.length > 100) {
    throw new ValidationError('TITLE_TOO_LONG', 'Title must be at most 100 characters');
  }
  return clean;
}

module.exports = { validateTitle };
