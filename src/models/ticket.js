const { ValidationError } = require('../errors');

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_TAG_LENGTH = 30;
const STATUSES = ['open', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

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

// Checks that `value` is one of `allowed`; shared by every fixed-list field.
function oneOf(value, allowed, code, label) {
  if (!allowed.includes(value)) {
    throw new ValidationError(
      code,
      `Invalid ${label} "${value}". Allowed values: ${allowed.join(', ')}`,
    );
  }
  return value;
}

function validateStatus(status) {
  return oneOf(status, STATUSES, 'INVALID_STATUS', 'status');
}

function validatePriority(priority) {
  return oneOf(priority, PRIORITIES, 'INVALID_PRIORITY', 'priority');
}

function validateDescription(description) {
  if (description === undefined) return '';
  if (typeof description !== 'string') {
    throw new ValidationError('INVALID_DESCRIPTION', 'Description must be text');
  }
  const clean = description.trim();
  if (clean.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(
      'DESCRIPTION_TOO_LONG',
      `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`,
    );
  }
  return clean;
}

function normalizeTags(tags) {
  if (tags === undefined) return [];
  if (typeof tags !== 'string') {
    throw new ValidationError('INVALID_TAG', 'Tags must be text, separated by commas');
  }
  const clean = tags
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '');
  for (const tag of clean) {
    if (tag.length > MAX_TAG_LENGTH) {
      throw new ValidationError(
        'INVALID_TAG',
        `Tag "${tag}" must be at most ${MAX_TAG_LENGTH} characters`,
      );
    }
  }
  return [...new Set(clean)];
}

// `id` and `now` come from the caller: the model has no data to pick an id
// and never reads the clock, so it stays a pure, testable function.
function buildTicket(input, { id, now }) {
  const timestamp = now.toISOString();
  return {
    id,
    title: validateTitle(input.title),
    description: validateDescription(input.description),
    status: validateStatus(input.status ?? 'open'),
    priority: validatePriority(input.priority ?? 'medium'),
    tags: normalizeTags(input.tags),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

module.exports = {
  STATUSES,
  PRIORITIES,
  validateTitle,
  validateStatus,
  validatePriority,
  validateDescription,
  normalizeTags,
  buildTicket,
};
