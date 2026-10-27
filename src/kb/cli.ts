import { basename, extname } from 'node:path';

import { Command, CommanderError, InvalidArgumentError } from 'commander';

import type { KBClient } from './client';
import type { Document, DocumentSummary } from './domain';
import { KBError, KBValidationError } from './errors';

/** Everything outside the program comes in through `io`, so tests can fake it (same idea as week 2). */
export interface KBCliIO {
  client: KBClient;
  stdout(text: string): void;
  stderr(text: string): void;
  readFile(path: string): Promise<string>;
}

// Runs one `kb` command and returns the exit code (docs2/DECISIONS.md §7).
export async function run(argv: string[], io: KBCliIO): Promise<number> {
  try {
    await buildProgram(io).parseAsync(argv, { from: 'user' });
    return 0;
  } catch (err) {
    // Commander has already printed its message; --help ends with exit code 0.
    if (err instanceof CommanderError) return err.exitCode === 0 ? 0 : 2;
    // Wrong value on the command line → 2.
    if (err instanceof KBValidationError) {
      io.stderr(`Error: ${err.message}`);
      return 2;
    }
    // Depends on the data or the outside world (missing document, unreadable file…) → 1.
    if (err instanceof KBError) {
      io.stderr(`Error: ${err.message}`);
      return 1;
    }
    // Anything else is a bug: report it briefly, never with a stack trace.
    io.stderr(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

function buildProgram(io: KBCliIO): Command {
  const { client } = io;
  // Settings first: commands added below inherit them.
  const program = new Command('kb')
    .description('Search and manage the Knowledge Base')
    .exitOverride()
    .configureOutput({
      writeOut: (text) => io.stdout(text.trimEnd()),
      writeErr: (text) => io.stderr(text.trimEnd()),
      outputError: (text, write) => write(text.replace(/^error: /, 'Error: ')),
    });

  program
    .command('search')
    .description('Find documents by title, tag or content')
    .argument('<query>', 'words to look for (case-insensitive)')
    .option('--top-k <n>', 'maximum number of results (default 10)', positiveInteger)
    .option('--node <path>', 'only search inside this node, e.g. /templates')
    .action(async (query: string, options: { topK?: number; node?: string }) => {
      const results = await client.search({
        query,
        topK: options.topK,
        filters: options.node === undefined ? undefined : { nodePath: options.node },
      });
      if (results.length === 0) return io.stdout('No documents found.');
      for (const { document, matchType } of results) io.stdout(`${summaryLine(document)}  (match: ${matchType})`);
    });

  program
    .command('list')
    .description('List documents, sorted by id')
    .option('--node <path>', 'only documents inside this node, e.g. /templates/email')
    .option('--limit <n>', 'maximum number of documents (default 10)', positiveInteger)
    .action(async (options: { node?: string; limit?: number }) => {
      const documents = await client.list({ nodePath: options.node, limit: options.limit });
      if (documents.length === 0) return io.stdout('No documents found.');
      for (const document of documents) io.stdout(summaryLine(document));
    });

  program
    .command('retrieve')
    .description('Show one document with its full content')
    .argument('<docId>', 'document id, e.g. doc-001')
    .action(async (docId: string) => {
      const document = await client.retrieve(docId);
      for (const line of detailLines(document)) io.stdout(line);
    });

  program
    .command('add')
    .description('Add a markdown file as a new document')
    .requiredOption('--file <file>', 'markdown file to add')
    .requiredOption('--path <nodePath>', 'node to add it to, e.g. /templates/sms')
    .option('--tags <tags>', 'comma-separated tags, e.g. sms,reminder')
    .option('--title <title>', 'title (default: the first "# heading", else the file name)')
    .action(async (options: { file: string; path: string; tags?: string; title?: string }) => {
      const content = await readDocumentFile(io, options.file);
      const document = await client.add({
        title: options.title ?? firstHeading(content) ?? basename(options.file, extname(options.file)),
        content,
        nodePath: options.path,
        tags: options.tags === undefined ? [] : options.tags.split(','),
      });
      io.stdout(`Added ${document.id}: ${document.title} (${document.nodePath})`);
    });

  return program;
}

function positiveInteger(value: string): number {
  if (!/^\d+$/.test(value) || Number(value) < 1) {
    throw new InvalidArgumentError('It must be a positive whole number.');
  }
  return Number(value);
}

async function readDocumentFile(io: KBCliIO, file: string): Promise<string> {
  try {
    return await io.readFile(file);
  } catch {
    throw new KBError(`cannot read file "${file}"`, 'FILE_UNREADABLE');
  }
}

function firstHeading(content: string): string | undefined {
  return /^#\s+(.+?)\s*$/m.exec(content)?.[1];
}

function summaryLine({ id, title, nodePath, tags }: DocumentSummary): string {
  return `${id}  ${title}  ${nodePath}  [${tags.join(', ')}]`;
}

function detailLines({ id, title, nodePath, tags, content }: Document): string[] {
  return [`ID:    ${id}`, `Title: ${title}`, `Path:  ${nodePath}`, `Tags:  ${tags.join(', ')}`, '', content];
}
