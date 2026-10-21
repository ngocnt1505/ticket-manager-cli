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

function validateStatus(status) {
  const allowed = ['open', 'in_progress', 'done'];
  if (!allowed.includes(status)) {
    throw new ValidationError(
      'INVALID_STATUS',
      `Invalid status "${status}". Allowed values: ${allowed.join(', ')}`,
    );
  }
  return status;
}

function validatePriority(priority) {
  const allowed = ['low', 'medium', 'high'];
  if (!allowed.includes(priority)) {
    throw new ValidationError(
      'INVALID_PRIORITY',
      `Invalid priority "${priority}". Allowed values: ${allowed.join(', ')}`,
    );
  }
  return priority;
}

module.exports = { validateTitle, validateStatus, validatePriority };
