// Entry point of `kb`: connects the CLI to the real world (process args, console, files, environment).
import { readFile } from 'node:fs/promises';

import { run } from './cli';
import { clientFromEnv } from './environment';

const stdout = (text: string) => process.stdout.write(`${text}\n`);
const stderr = (text: string) => process.stderr.write(`${text}\n`);

async function main(): Promise<number> {
  let client;
  try {
    client = clientFromEnv(process.env, stderr);
  } catch (err) {
    // Only a wrong KB_CLIENT gets here: a usage error.
    stderr(`Error: ${(err as Error).message}`);
    return 2;
  }
  return run(process.argv.slice(2), { client, stdout, stderr, readFile: (path) => readFile(path, 'utf8') });
}

main().then((code) => {
  process.exitCode = code;
});
