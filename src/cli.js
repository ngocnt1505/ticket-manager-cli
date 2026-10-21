const { parseArgs } = require('node:util');

const { UsageError } = require('./errors');

const COMMANDS = {
  create: require('./commands/create'),
  list: require('./commands/list'),
  show: require('./commands/show'),
};

// Runs one command and returns the exit code. Everything outside the program
// (output, clock, ticket storage) comes in through `io`, so tests can fake it.
function run(argv, io) {
  const [name, ...args] = argv;
  const command = COMMANDS[name];
  try {
    const { values } = parseArgs({ args, options: command.options, allowPositionals: true });
    command.execute(values, { store: io.store, now: io.now(), print: io.stdout });
    return 0;
  } catch (err) {
    if (err instanceof UsageError) {
      io.stderr(`Error: ${err.message}`);
      return 2;
    }
    throw err;
  }
}

module.exports = { run };
