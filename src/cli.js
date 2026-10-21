const { parseArgs } = require('node:util');

const { UsageError, NotFoundError } = require('./errors');

const COMMANDS = {
  create: require('./commands/create'),
  list: require('./commands/list'),
  show: require('./commands/show'),
  update: require('./commands/update'),
};

// Runs one command and returns the exit code. Everything outside the program
// (output, clock, ticket storage) comes in through `io`, so tests can fake it.
function run(argv, io) {
  const [name, ...args] = argv;
  const command = COMMANDS[name];
  try {
    const parsed = parseCommandLine(args, command.options);
    command.execute(parsed, { store: io.store, now: io.now(), print: io.stdout });
    return 0;
  } catch (err) {
    if (err instanceof UsageError) {
      io.stderr(`Error: ${err.message}`);
      return 2;
    }
    if (err instanceof NotFoundError) {
      io.stderr(`Error: ${err.message}`);
      return 1;
    }
    throw err;
  }
}

// util.parseArgs throws its own errors (e.g. "-1" looks like an unknown option);
// they mean the command line is wrong, so they become UsageErrors (exit 2).
function parseCommandLine(args, options) {
  try {
    return parseArgs({ args, options, allowPositionals: true });
  } catch (err) {
    throw new UsageError('INVALID_ARGUMENTS', err.message);
  }
}

module.exports = { run };
