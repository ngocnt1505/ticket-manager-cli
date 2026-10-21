const { ValidationError } = require('../errors');

const MAX_TITLE_LENGTH = 100;

function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new ValidationError('INVALID_TITLE', 'Title must be text');
  }
  const clean = title.trim();
  if (!clean) throw new ValidationError('EMPTY_TITLE', 'Title is required');
  if (clean.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(
      'TITLE_TOO_LONG',
      `Title must be at most ${MAX_TITLE_LENGTH} characters`,
    );
  }
  return clean;
}

module.exports = { validateTitle };
