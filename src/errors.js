// Every expected failure carries a stable `code`; `name` tells the kind of failure
// (the CLI will map ValidationError → exit 2, NotFoundError → exit 1).
class TicketError extends Error {
  constructor(code, message) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

class ValidationError extends TicketError {}

class NotFoundError extends TicketError {}

module.exports = { TicketError, ValidationError, NotFoundError };
