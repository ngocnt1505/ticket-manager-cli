#!/usr/bin/env node
// Entry point: connects the CLI to the real world (process args, console, clock, JSON file).
const path = require('node:path');

const { run } = require('../src/cli');
const { load, save } = require('../src/storage/jsonStore');

const filePath = path.resolve(process.env.TICKETS_FILE || 'tickets.json');

process.exitCode = run(process.argv.slice(2), {
  store: {
    load: () => load(filePath),
    save: (tickets) => save(filePath, tickets),
  },
  now: () => new Date(),
  stdout: (line) => process.stdout.write(`${line}\n`),
  stderr: (line) => process.stderr.write(`${line}\n`),
});
