// Errors of the KB part. Each has a stable `code` so the CLI can pick an exit code
// and the HTTP server can pick a status (docs2/DECISIONS.md §4, §7).

export class KBError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** Bad input: empty query, topK not a positive whole number, node path without "/"… */
export class KBValidationError extends KBError {
  constructor(message: string) {
    super(message, 'INVALID_INPUT');
  }
}

export class KBNotFoundError extends KBError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}
