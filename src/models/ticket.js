const { ValidationError } = require('../errors');

function validateTitle(title) {
  const clean = title.trim();
  if (!clean) throw new ValidationError('EMPTY_TITLE', 'Title is required');
  return clean;
}

module.exports = { validateTitle };
