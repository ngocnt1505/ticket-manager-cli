# Ticket Manager CLI

A small command-line tool to create, list, show and update tickets stored in a local JSON file.
Built test-first (TDD) as the Week 2 assignment of the AI Training course.

Nguyễn Thúy Ngọc · AI Training, Week 2

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
- No other dependencies: the tool and its tests only use Node's built-in modules (`node:test`, `node:util`, `node:fs`).

## Installation

```bash
git clone https://github.com/ngocnt1505/ticket-manager-cli.git
cd ticket-manager-cli
npm link
```

`npm link` installs the `tickets` command on your PATH (on Windows it creates `tickets.cmd` and `tickets.ps1`).
To remove it later: `npm unlink -g ticket-manager-cli`.

Without installing, you can run the same commands from the project folder with `node bin/tickets.js …`.

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

## Running the tests

```bash
npm test                  # all tests
npm run test:unit         # model, services, storage parsing, commands with fake output (no disk access)
npm run test:integration  # real files in a temporary folder, and the real program started as a process
npm run coverage          # all tests + coverage report
```

Current result: **84 tests pass** (68 unit, 16 integration); coverage 100 % of lines, 99 % of branches.
Tests never touch your own `tickets.json`: every test that needs a file uses its own temporary folder and deletes it afterwards.

| Level | File | What it checks |
|---|---|---|
| Unit | `test/unit/ticket.model.test.js` | validation of every field, defaults, creating and updating one ticket |
| Unit | `test/unit/ticket.service.test.js` | next id, filters, not found, the given list is never modified |
| Unit | `test/unit/jsonStore.test.js` | turning file text into tickets and back; corrupted content |
| Unit | `test/unit/cli.test.js` | every command's output and exit code, with fake stdout/stderr and an in-memory store |
| Integration | `test/integration/jsonStore.test.js` | reading and writing real files: missing file, atomic save, failed writes |
| Integration | `test/integration/cli.test.js` | the real `bin/tickets.js` started with `spawnSync` |

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
```

Dependencies go one way: commands → services → models; only `bin/tickets.js` and `src/storage/` touch the outside world.

## Documentation

| File | Contents |
|---|---|
| [docs/DECISIONS.md](docs/DECISIONS.md) | Design decisions made before coding (fields, rules, file format, exit codes, architecture) |
| [docs/TEST-LIST.md](docs/TEST-LIST.md) | The test list used for TDD, with every scenario checked off |
| [docs/history.md](docs/history.md) | Step-by-step development log (Vietnamese): each Red → Green → Refactor cycle with real test output and mutation checks |
| [docs/overvieww2.md](docs/overvieww2.md) | Week 2 assignment |
| [Week 1 report](https://github.com/ngocnt1505/ai-training-week1/blob/main/Report.md) | Week 1 research report on TDD (Vietnamese), kept in the [Week 1 repository](https://github.com/ngocnt1505/ai-training-week1); the docs refer to it as "Report §…" |

The git history shows the TDD cycle: each `test(…)` commit with a failing test comes before the `feat(…)` commit that makes it pass, followed by `refactor(…)` commits where needed.

## Known limitations

- **One command at a time.** Two commands writing at the same moment (for example two terminals running `create`) can overwrite each other's change; there is no file locking.
- **PowerShell and commas.** In PowerShell, `--tags bug,ui` without quotes is turned into the single tag `"bug ui"` before it reaches the program, because PowerShell reads `bug,ui` as an array. Always quote the list: `--tags "bug,ui"`.
- **Title length** is counted in UTF-16 code units (`String.length`), so an emoji counts as 2 characters.
- **No delete command**, and no way to edit `id` or `createdAt` (by design).
- **Symbolic links:** if `TICKETS_FILE` is a symbolic link, saving replaces the link with a regular file. Not tested (creating symlinks on the development machine needs administrator rights).
- **Power loss:** the save is atomic against errors (temporary file + rename), but the data is not forced to disk (`fsync`), so a power cut right after a save may lose that last change.
