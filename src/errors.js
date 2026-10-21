// Every expected failure carries a stable `code`; `name` tells the kind of failure
// (the CLI maps UsageError and ValidationError → exit 2, NotFoundError and StorageError → exit 1).
class TicketError extends Error {
  constructor(code, message) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

class ValidationError extends TicketError {}

class NotFoundError extends TicketError {}

class StorageError extends TicketError {}

// The command line itself is wrong (missing option, unknown command...).
class UsageError extends TicketError {}

module.exports = { TicketError, ValidationError, NotFoundError, StorageError, UsageError };
