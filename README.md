# Ticket Manager & Knowledge Base CLI

Two small command-line tools, built test-first (TDD) for the AI Training course:

- **`tickets`** (Week 2): create, list, show and update tickets stored in a local JSON file.
- **`kb`** (Week 3): search, list, read and add documents in a Knowledge Base, either an in-memory mock or a KB API server over HTTP. See [Knowledge Base CLI](#knowledge-base-cli-kb).

Nguyễn Thúy Ngọc · AI Training, Weeks 2–3

```console
$ tickets create --title "Fix login" --priority high --tags "bug,auth"
Created ticket #1: Fix login

$ tickets list
#1  open         high    Fix login  [bug, auth]

$ tickets update 1 --status done
Updated ticket #1 (status: done)
```

## Requirements

- Node.js **22 or newer** (developed and tested with Node.js 24.11 on Windows 11).
- `tickets` uses only Node's built-in modules (`node:test`, `node:util`, `node:fs`).
- `kb` is written in TypeScript and uses [Commander](https://github.com/tj/commander.js) 14 to read the command line and Node's built-in `fetch` and `node:http`. TypeScript, Jest and ts-jest are development dependencies.

## Installation

```bash
git clone https://github.com/ngocnt1505/ticket-manager-cli.git
cd ticket-manager-cli
npm install   # also builds the TypeScript code of `kb` into dist/ (the "prepare" script)
npm link
```

`npm link` installs the `tickets` and `kb` commands on your PATH (on Windows it creates `.cmd` and `.ps1` files).
To remove them later: `npm unlink -g ticket-manager-cli`.

Without installing, you can run the same commands from the project folder with `node bin/tickets.js …` and, after `npm run build`, `node bin/kb.js …`.

## Configuration

| Setting | Default | Meaning |
|---|---|---|
| `TICKETS_FILE` environment variable | `tickets.json` in the **current folder** | Path of the JSON file that stores the tickets. A relative path is resolved from the current folder. |

```bash
# bash
export TICKETS_FILE="$HOME/tickets.json"
```

```powershell
# PowerShell
$env:TICKETS_FILE = "$HOME\tickets.json"
```

- The file is created by the first `tickets create`. A missing or empty file simply means "no tickets yet".
- The **folder must already exist**. The tool never creates folders, so a typo in `TICKETS_FILE` is reported instead of silently storing your tickets somewhere else.
- The file is plain, indented JSON (an array of tickets) and can be read by hand.

## Usage

```
tickets <command> [options]
```

### Ticket fields

| Field | Allowed values | Default |
|---|---|---|
| `title` | required text, 1–100 characters (spaces at both ends are removed) | – |
| `description` | text, up to 1000 characters | empty |
| `status` | `open`, `in_progress`, `done` (lowercase) | `open` |
| `priority` | `low`, `medium`, `high` (lowercase) | `medium` |
| `tags` | comma-separated list, each tag up to 30 characters; stored in lowercase, duplicates and empty tags removed | none |
| `id`, `createdAt`, `updatedAt` | set by the tool; cannot be edited | – |

### `tickets create`

```
tickets create --title <text> [--description <text>] [--status <status>] [--priority <priority>] [--tags <a,b>]
```

```console
$ tickets create --title "Fix login" --description "500 error after submit" --priority high --tags "bug,auth"
Created ticket #1: Fix login
```

A new ticket gets the next id: the highest existing id + 1.

### `tickets list`

```
tickets list [--status <status>] [--priority <priority>] [--tags <a,b>]
```

```console
$ tickets list
#1  open         high    Fix login  [bug, auth]
#2  in_progress  low     Dark mode  [ui]

$ tickets list --status open
#1  open         high    Fix login  [bug, auth]

$ tickets list --status done
No tickets found.
```

- Tickets are sorted by id.
- Filters are combined with **AND**. With several tags, a ticket must have **all** of them: `--tags "bug,auth"` shows only tickets tagged both `bug` and `auth`. Tag filters ignore upper/lower case.
- An invalid filter value (for example `--status closed`) is an error, not an empty list.

### `tickets show <id>`

```console
$ tickets show 1
Ticket #1
  Title:       Fix login
  Status:      open
  Priority:    high
  Tags:        bug, auth
  Description: 500 error after submit
  Created:     2026-10-21T13:04:54.813Z
  Updated:     2026-10-21T13:04:54.813Z
```

### `tickets update <id>`

```
tickets update <id> [--title <text>] [--description <text>] [--status <status>] [--priority <priority>] [--tags <a,b>]
```

```console
$ tickets update 2 --status in_progress --priority low
Updated ticket #2 (status: in_progress, priority: low)

$ tickets update 1 --tags "ui,bug"
Updated ticket #1 (tags: ui, bug)

$ tickets update 1 --tags=
Updated ticket #1 (tags: (none))
```

- At least one option is required.
- `--tags` **replaces** all previous tags; `--tags=` removes them all.
- If any value is invalid, nothing is changed.

### Errors and exit codes

Errors are printed on **stderr** as one line starting with `Error:` (stdout stays empty), never with a stack trace, so the tool is safe to use in scripts.

| Exit code | Meaning | Examples |
|---|---|---|
| `0` | Success | |
| `1` | Problem with the stored data | `Error: Ticket #99 not found` · corrupted JSON file · file cannot be read or written |
| `2` | Wrong command line or invalid value | unknown command or option · missing or malformed id (`abc`, `0`, `1.5`) · `--priority urgent` · title longer than 100 characters · `update` without any option |

```console
$ tickets show 99
Error: Ticket #99 not found                                           (exit code 1)

$ tickets show abc
Error: Invalid ticket id "abc". Use a positive whole number, for example 1.   (exit code 2)

$ tickets create --title "x" --priority urgent
Error: Invalid priority "urgent". Allowed values: low, medium, high   (exit code 2)
```

If the JSON file is corrupted, every command stops with exit code 1, names the file, and **never overwrites it**. Fix or remove the file, then try again.

## Knowledge Base CLI (`kb`)

Look up email templates, team info and guides in a Knowledge Base (KB) from the terminal, and add new documents.
The same commands work with an in-memory **mock** KB (development, tests) or a **KB API server over HTTP** (production), chosen with an environment variable.

```console
$ kb search "response" --top-k 3
doc-001  Customer Response Template  /templates/email  [template, email]  (match: title)

$ kb list --node /team
doc-002  DevOps Team Members  /team/devops  [team, devops]

$ kb add --file new-template.md --path /templates/sms --tags sms
Added doc-004: SMS Appointment Reminder (/templates/sms)
```

### Architecture

```
  user: kb search / list / retrieve / add
                    │
                    ▼
  src/kb/cli.ts ─ Commander reads options, prints results, turns errors into exit codes
                    │ calls
                    ▼
  KBClient interface (src/kb/client.ts): search · list · retrieve · add
          ┌─────────┴──────────────────┐
          ▼                            ▼
  MockKBClient                  HTTPKBClient ── POST + JSON ──▶  KB API server
  in memory, 3 sample docs      (fetch)                           real server, or the reference server
  src/kb/mockClient.ts          src/kb/httpClient.ts              src/kb/server.ts (npm run kb-server)

  src/kb/environment.ts picks the client from KB_CLIENT; src/kb/main.ts connects it all to argv, env, console, files.
```

Why each piece exists:

| Piece | Why |
|---|---|
| `KBClient` interface | The commands do not know where documents come from, so the client can be swapped without touching them. |
| `MockKBClient` | Works with no server at all. Holds the business rules: search order, nodes, adding documents. |
| `HTTPKBClient` | The same interface over HTTP. It passes **the same 16 contract tests** as the mock, so both behave the same. |
| Reference KB server | No production KB URL was provided, so this server implements the API contract below. It reuses the mock's rules, so the two cannot drift apart. |
| `environment.ts`, `main.ts` | The only places that read environment variables and touch the process. Everything else is tested in memory. |

Data flow: command line → Commander checks the options → client call (in memory or HTTP) → result lines on **stdout**; on error, one line on **stderr** and an exit code.

### Setup

**Development: mock client (default).** Nothing to configure:

```bash
kb list
kb retrieve doc-002
```

The mock's data lives in memory, so a document added with `kb add` is gone when the command ends. Use a server to keep data between commands.

**Production: HTTP client.** Point `kb` at a KB API server that follows the [API contract](#api-contract):

```powershell
# Terminal 1: start a KB server. To use a real KB API instead, skip this and use its URL below.
npm run kb-server                          # http://localhost:3000, Ctrl+C to stop

# Terminal 2 (PowerShell)
$env:KB_CLIENT  = "http"
$env:KB_API_URL = "http://localhost:3000"  # URL of the KB API
kb add --file new-template.md --path /templates/sms --tags sms
kb search sms
```

```bash
# Terminal 2 (bash)
export KB_CLIENT=http KB_API_URL=http://localhost:3000
kb search sms
```

| Environment variable | Default | Meaning |
|---|---|---|
| `KB_CLIENT` | `mock` | `mock` or `http` (case-insensitive). Anything else is an error (exit code 2). |
| `KB_API_URL` | `http://localhost:3000` | Address of the KB API, used when `KB_CLIENT=http` |
| `KB_DEBUG` | off | `1` prints every request and response on stderr, to debug integration problems |
| `KB_PORT` | `3000` | Port of the reference server (`npm run kb-server`) |

```console
$ KB_CLIENT=http KB_DEBUG=1 kb retrieve doc-999
[kb] → POST http://localhost:3000/retrieve {"docId":"doc-999"}
[kb] ← 404 {"error":{"code":"NOT_FOUND","message":"document doc-999 not found"}}
Error: document doc-999 not found
```

### Commands

Every command has `--help`, for example `kb search --help`.

| Command | What it does |
|---|---|
| `kb search <query> [--top-k <n>] [--node <path>]` | Finds documents whose title, tags or content contain the query (case-insensitive). Title matches come first, then tags, then content; ties are sorted by id. Shows at most `--top-k` results (default 10), optionally only inside `--node`. |
| `kb list [--node <path>] [--limit <n>]` | Lists documents sorted by id. `--node /templates` also includes `/templates/email`, but not `/temp`. Shows at most `--limit` documents (default 10). |
| `kb retrieve <docId>` | Shows one document with its full content. |
| `kb add --file <file.md> --path <nodePath> [--tags <a,b>] [--title <text>]` | Adds a markdown file (UTF-8) as a new document with the next id (`doc-004`, …). The title is `--title`, else the file's first `# heading`, else the file name. Tags are trimmed, lower-cased and de-duplicated. |

`--top-k` and `--limit` must be positive whole numbers, and node paths must start with `/`. In PowerShell, quote tag lists: `--tags "sms,reminder"`.

```console
$ kb retrieve doc-002
ID:    doc-002
Title: DevOps Team Members
Path:  /team/devops
Tags:  team, devops

# DevOps Team Members
…
```

When nothing matches, `search` and `list` print `No documents found.` (exit code 0).

**Exit codes:** the same convention as `tickets`. Errors are one `Error: …` line on stderr, never with a stack trace.

| Exit code | Meaning | Examples |
|---|---|---|
| `0` | Success | |
| `1` | Problem with the data or the outside world | `document doc-999 not found` · `cannot read file "x.md"` · `cannot connect to KB server at … (ECONNREFUSED)` · server error 5xx or unusable response |
| `2` | Wrong command line or invalid value | unknown command · missing query · `--top-k 0` · node path without `/` · unknown `KB_CLIENT` · the server answered 400 |

### API contract

This is what `HTTPKBClient` sends and what a KB server must answer. Every endpoint is `POST` with a JSON body and a JSON response. The full rules are in [docs2/DECISIONS.md §4](docs2/DECISIONS.md).

| Endpoint | Request body | Success response |
|---|---|---|
| `POST /search` | `{ "query": "response", "topK": 5, "filters": { "nodePath": "/templates" } }` (`topK`, `filters` optional) | `200 { "results": [ { "id", "title", "nodePath", "tags", "matchType" } ] }` |
| `POST /list` | `{ "nodePath": "/templates/email", "limit": 10 }` (both optional) | `200 { "documents": [ { "id", "title", "nodePath", "tags" } ] }` |
| `POST /retrieve` | `{ "docId": "doc-001" }` | `200 { "document": { "id", "title", "content", "nodePath", "tags" } }` |
| `POST /add` | `{ "title", "content", "nodePath", "tags" }` (`tags` optional) | `201 { "document": { …, "id": "doc-004" } }` |

Errors are `{ "error": { "code", "message" } }`:

| Status | `code` | When | `kb` exit code |
|---|---|---|---|
| 400 | `INVALID_INPUT` | missing field or wrong type, empty query, `topK` not a positive whole number, node path without `/` | 2 |
| 404 | `NOT_FOUND` | unknown document id, unknown endpoint, method other than `POST` | 1 |
| 500 | `INTERNAL` | server failure (the message never contains internal details) | 1 |

```console
$ curl -X POST http://localhost:3000/search -H "Content-Type: application/json" -d '{"query":"response","topK":5}'
{"results":[{"id":"doc-001","title":"Customer Response Template","nodePath":"/templates/email","tags":["template","email"],"matchType":"title"}]}
```

## Running the tests

```bash
npm test                  # all tests: tickets (node:test) then kb (Jest)
npm run test:unit         # tickets: model, services, storage parsing, commands with fake output (no disk access)
npm run test:integration  # tickets: real files in a temporary folder, and the real program started as a process
npm run test:kb           # kb: all Jest tests
npm run typecheck         # kb: TypeScript type check (Jest only transpiles, for speed)
npm run coverage          # all tests + coverage reports
```

Current result: **162 tests pass**.

- `tickets`: 86 tests (70 unit, 16 integration). Coverage is 100 % of lines and branches.
- `kb`: 76 tests. Coverage is 99.7 % of lines and 85 % of branches.
- Details, with the deliberate-bug (mutation) checks: [docs2/TEST-RESULTS.md](docs2/TEST-RESULTS.md).

Tests never touch your own `tickets.json`: every test that needs a file uses its own temporary folder and deletes it afterwards. The `kb` tests start their KB servers on random free ports and close them afterwards.

| Level | File | What it checks |
|---|---|---|
| Unit | `test/unit/ticket.model.test.js` | validation of every field, defaults, creating and updating one ticket |
| Unit | `test/unit/ticket.service.test.js` | next id, filters, not found, the given list is never modified |
| Unit | `test/unit/jsonStore.test.js` | turning file text into tickets and back; corrupted content |
| Unit | `test/unit/cli.test.js` | every command's output and exit code, with fake stdout/stderr and an in-memory store |
| Integration | `test/integration/jsonStore.test.js` | reading and writing real files: missing file, atomic save, failed writes |
| Integration | `test/integration/cli.test.js` | the real `bin/tickets.js` started with `spawnSync` |

| `kb` test file | Tests | What it checks |
|---|---|---|
| `test/kb/contract.ts` | (shared) | the 16 rules every `KBClient` must follow (search order, nodes, limits, add, errors) |
| `test/kb/mockClient.test.ts` | 16 | the contract, run against `MockKBClient` |
| `test/kb/httpClient.test.ts` | 22 | the same contract over real HTTP against the reference server; connection refused, 5xx, non-JSON response, debug log |
| `test/kb/server.test.ts` | 10 | the reference server: every endpoint, status code and error body of the API contract |
| `test/kb/cli.test.ts` | 16 | every command's output and exit code, with fake output and the mock client |
| `test/kb/environment.test.ts` | 6 | choosing the client with `KB_CLIENT`, `KB_API_URL`, `KB_DEBUG` |
| `test/kb/e2e.test.ts` | 6 | the real `bin/kb.js` started as a process, in mock and HTTP mode |

## Project structure

```
bin/tickets.js                  entry point: connects the CLI to argv, console, clock and the JSON file
src/cli.js                      picks the command, parses options, turns errors into exit codes
src/commands/                   create, list, show, update: read options, call a service, print the result
src/services/ticketService.js   pure functions on the list of tickets: create, list (filters), find, update
src/models/ticket.js            pure validation rules and building / updating a single ticket
src/storage/jsonStore.js        parse / serialize the JSON text, load and atomically save the file
src/errors.js                   error classes, each with a stable `code`
test/unit/, test/integration/   tests (see above); test/helpers/ has the temporary-folder helper
docs/                           design decisions, test list, development log, Week 1 research

bin/kb.js                       entry point of `kb`: runs the compiled dist/kb/main.js
src/kb/main.ts                  connects the kb CLI to argv, environment, console and files
src/kb/cli.ts                   Commander commands, output format, errors → exit codes
src/kb/environment.ts           picks MockKBClient or HTTPKBClient from KB_CLIENT / KB_API_URL / KB_DEBUG
src/kb/client.ts, domain.ts     the KBClient interface and the domain types (Document, SearchResult, KBQuery…)
src/kb/mockClient.ts            in-memory client with the sample documents and the business rules
src/kb/httpClient.ts            HTTP client (fetch): JSON requests, HTTP errors → KB errors, debug log
src/kb/server.ts, startServer.ts reference KB API server (node:http) and its start script
src/kb/errors.ts                KB error classes, each with a stable `code`
test/kb/                        kb tests (see above)
docs2/                          Week 3 brief, decisions, development log, test results
```

Dependencies go one way. For `tickets`: commands → services → models; only `bin/tickets.js` and `src/storage/` touch the outside world. For `kb`: cli → `KBClient` ← mock / HTTP client; only `main.ts`, `environment.ts` and `startServer.ts` touch the outside world.

## Documentation

| File | Contents |
|---|---|
| [docs/DECISIONS.md](docs/DECISIONS.md) | Design decisions made before coding (fields, rules, file format, exit codes, architecture) |
| [docs/TEST-LIST.md](docs/TEST-LIST.md) | The test list used for TDD, with every scenario checked off |
| [docs/history.md](docs/history.md) | Step-by-step development log (Vietnamese): each Red → Green → Refactor cycle with real test output and mutation checks |
| [docs/overvieww2.md](docs/overvieww2.md) | Week 2 assignment |
| [docs2/overview.md](docs2/overview.md), [architecture.md](docs2/architecture.md), [tasks.md](docs2/tasks.md) | Week 3 assignment (Knowledge Base CLI) |
| [docs2/DECISIONS.md](docs2/DECISIONS.md) | Week 3 design decisions: data model, search/list/add rules, API contract, environment variables, exit codes |
| [docs2/TEST-RESULTS.md](docs2/TEST-RESULTS.md) | Week 3 test results, mutation checks, real runs, and the acceptance-criteria check |
| [docs2/history.md](docs2/history.md) | Week 3 step-by-step development log (Vietnamese) |
| [Week 1 report](https://github.com/ngocnt1505/ai-training-week1/blob/main/Report.md) | Week 1 research report on TDD (Vietnamese), kept in the [Week 1 repository](https://github.com/ngocnt1505/ai-training-week1); the docs refer to it as "Report §…" |

The git history shows the TDD cycle: each `test(…)` commit with a failing test comes before the `feat(…)` commit that makes it pass, followed by `refactor(…)` commits where needed.

## Known limitations

`kb`:

- **No production KB server was provided.** The HTTP client has been tested and run against the reference server, which follows the API contract above. A real KB API must follow the same contract; if its responses have a different shape, `kb` stops with `KB server sent an unexpected response` (exit code 1) instead of showing wrong data. Run with `KB_DEBUG=1` to see exactly what was sent and received.
- **Data is kept in memory.** The mock's data lasts for one command, and the reference server's data lasts until it stops.
- **Simple matching.** Search looks for the query as a piece of text: `team` also matches `teams`. There is no ranking by relevance beyond title → tag → content.
- **No request timeout.** If a server accepts the connection but never answers, `kb` waits until you press Ctrl+C.
- **Git Bash on Windows changes paths.** `kb list --node /team` reaches the program as `C:/Program Files/Git/team` and fails with `node path must start with "/"`. Run `export MSYS_NO_PATHCONV=1` first, or use PowerShell or cmd, where this does not happen.

`tickets`:

- **One command at a time.** Two commands writing at the same moment (for example two terminals running `create`) can overwrite each other's change; there is no file locking.
- **PowerShell and commas.** In PowerShell, `--tags bug,ui` without quotes is turned into the single tag `"bug ui"` before it reaches the program, because PowerShell reads `bug,ui` as an array. Always quote the list: `--tags "bug,ui"`.
- **Title length** is counted in UTF-16 code units (`String.length`), so an emoji counts as 2 characters.
- **No delete command**, and no way to edit `id` or `createdAt` (by design).
- **Symbolic links:** if `TICKETS_FILE` is a symbolic link, saving replaces the link with a regular file. Not tested (creating symlinks on the development machine needs administrator rights).
- **Power loss:** the save is atomic against errors (temporary file + rename), but the data is not forced to disk (`fsync`), so a power cut right after a save may lose that last change.
