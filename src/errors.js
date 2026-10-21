class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}

class NotFoundError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'NotFoundError';
    this.code = code;
  }
}

module.exports = { ValidationError, NotFoundError };