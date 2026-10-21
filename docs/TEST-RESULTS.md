# Kết quả kiểm tra – Ticket Manager CLI

Tài liệu này ghi lại kết quả chạy thật để người đọc **kiểm chứng được mà không cần tự chạy lại**. Lệnh để tái hiện có ghi ở từng mục.

| | |
|---|---|
| Ngày chạy | 2026-10-21 |
| Commit được kiểm tra | `87aa755` (docs: add README with installation, configuration and usage) |
| Node.js | v24.11.1 |
| Hệ điều hành | Windows 11 |

## 1. Tóm tắt

| Hạng mục | Kết quả |
|---|---|
| Toàn bộ test (`npm test`) | **84 / 84 pass**, 0 fail – khoảng 3,7 giây |
| Unit test (`npm run test:unit`) | 68 / 68 pass |
| Integration test (`npm run test:integration`) | 16 / 16 pass |
| Coverage (`npm run coverage`) | **100 %** dòng · **99,31 %** nhánh · **100 %** hàm |
| Mutation testing (10 lỗi cố ý, mục 4) | **9 / 10 bị bắt**; 1 lộ ra lỗ hổng trong bộ test (mục 5) |
| Clone sạch từ GitHub, làm theo README (mục 6) | Chạy đúng; `tickets.json` được `.gitignore` bỏ qua |

## 2. Output đầy đủ của `npm test`

```
> ticket-manager-cli@1.0.0 test
> node --test "test/**/*.test.js"

✔ C11: create with title, priority and tags exits 0 and writes the ticket to the file (292.9938ms)
✔ C12: list --status open --tags bug shows only the matching tickets (699.5333ms)
✔ C13: show 1 exits 0; show 99 exits 1 with the error on stderr only (407.6035ms)
✔ C14: update 1 --status done exits 0 and updates the file (335.9152ms)
✔ C15: unknown command, missing argument or malformed id exit 2 without a stack trace (961.0574ms)
✔ C16: a corrupted file exits 1 with a clear message, no stack trace, and is not overwritten (519.9561ms)
✔ C17: without TICKETS_FILE the data goes to tickets.json in the current folder (154.2209ms)
✔ C18: TICKETS_FILE in a missing folder exits 1 and does not create the folder (106.9012ms)
✔ D7: loading a file that does not exist gives no tickets and creates nothing (11.4346ms)
✔ D8: what save writes, load reads back (26.1678ms)
✔ D9: loading a corrupted file fails with CORRUPTED_FILE and leaves it byte for byte (23.3013ms)
✔ D10: when writing fails, save reports SAVE_FAILED and the old file stays byte for byte (19.3108ms)
✔ D11: save into a missing folder fails with SAVE_FAILED and does not create the folder (6.3432ms)
✔ D12: save leaves no temporary file behind (8.0301ms)
✔ P4: a path that cannot be read (a folder) fails with READ_FAILED and names it (2.0212ms)
✔ P5: when the final rename fails, save removes its temporary file (8.9289ms)
✔ C1: create prints the new id on stdout, saves the ticket and exits 0 (7.8987ms)
✔ C2: create without --title explains it on stderr, exits 2 and saves nothing (0.9338ms)
✔ C3: list with no tickets prints a friendly message and exits 0 (0.5119ms)
✔ C4: list prints one line per ticket with id, status, priority, title and tags (1.436ms)
✔ C5: show prints every field of the ticket (2.7309ms)
✔ C9: an unknown ticket exits 1 with the error on stderr only (0.7222ms)
✔ C10: a malformed id exits 2; 1 and 42 are accepted as ids (1.2596ms)
✔ C6: update changes the ticket, confirms the change and exits 0 (1.2314ms)
✔ C7: update without any option exits 2, names the options and saves nothing (0.6197ms)
✔ C8: invalid values exit 2 with a helpful message and save nothing (1.1468ms)
✔ P6a: names of built-in object properties are unknown commands, not crashes (0.473ms)
✔ P6b: an unexpected error exits 1 with a short message and no stack trace (5.9697ms)
✔ D1: parseTickets returns the tickets stored in a JSON array (6.3921ms)
✔ D2: an empty or whitespace-only file means no tickets (0.3503ms)
✔ D3: cut-off JSON fails with CORRUPTED_FILE and names the file (5.5895ms)
✔ D4: valid JSON that is not an array fails with CORRUPTED_FILE (0.9811ms)
✔ D5: serializeTickets writes JSON indented by 2 spaces, ending with a newline (0.5615ms)
✔ D6: Vietnamese text and emoji survive serialize then parse (2.1915ms)
✔ P3: entries without a unique positive integer id fail with CORRUPTED_FILE (0.7766ms)
✔ M1: trims a valid title (3.6503ms)
✔ M2: rejects an empty or whitespace-only title with EMPTY_TITLE (1.5859ms)
✔ M3: accepts a title of exactly 100 characters (0.2408ms)
✔ M5: measures the length after trimming (0.2543ms)
✔ M4: rejects a title of 101 characters with TITLE_TOO_LONG (0.7509ms)
✔ M6: rejects a non-string title with INVALID_TITLE (0.6939ms)
✔ M7: accepts open, in_progress and done as status (0.6245ms)
✔ M8: rejects other status values with INVALID_STATUS and lists the allowed ones (0.9234ms)
✔ M9: accepts low, medium and high as priority (4.8647ms)
✔ M10: rejects other priority values with INVALID_PRIORITY (3.3361ms)
✔ M11: a missing description becomes an empty string (1.6167ms)
✔ M12: trims the description (0.2482ms)
✔ M13: accepts 1000 characters and rejects 1001 with DESCRIPTION_TOO_LONG (0.559ms)
✔ M14: rejects a non-string description with INVALID_DESCRIPTION (0.7064ms)
✔ M15: splits tags on commas and trims each one (3.716ms)
✔ M16: drops empty tags (0.445ms)
✔ M17: lowercases tags and removes duplicates, keeping first-seen order (0.4957ms)
✔ M18: missing or blank tags become an empty list (0.2606ms)
✔ M19: keeps Vietnamese tags (5.0757ms)
✔ M20: accepts a 30-character tag and rejects 31 with INVALID_TAG (1.9755ms)
✔ P1: rejects non-string tags with INVALID_TAG (0.4621ms)
✔ M21: a ticket with only a title gets defaults, the given id and timestamps (1.5665ms)
✔ M22: a ticket with every field uses the validated values (0.4202ms)
✔ M23: an update changes only the given field and refreshes updatedAt (0.3957ms)
✔ M24: an update returns a new ticket and leaves the original untouched (0.3412ms)
✔ M25: one invalid value rejects the whole update (no half update) (0.2815ms)
✔ M26: id, createdAt, updatedAt and unknown fields cannot be updated (0.3829ms)
✔ M27: an update without any field fails with NO_CHANGES (0.1974ms)
✔ S1: the first ticket gets id 1 and is returned with a new list containing it (10.8559ms)
✔ S2: a new id is the highest existing id plus one, even with gaps (0.4235ms)
✔ S3: creating twice in a row on the returned list gives ids 1 and 2 (0.3936ms)
✔ S4: invalid input throws and leaves the given list unchanged (1.1894ms)
✔ P2: creating a ticket returns a new list and leaves the given list unchanged (0.4919ms)
✔ S5: listing with no tickets gives an empty list (0.2836ms)
✔ S6: results are sorted by id without reordering the given list (1.2872ms)
✔ S7: filters by status (0.3788ms)
✔ S8: filters by priority (0.6173ms)
✔ S9: filters by one tag (3.1202ms)
✔ S10: with several tags a ticket must have all of them (AND) (1.1029ms)
✔ S11: tag filters ignore upper/lower case (0.4461ms)
✔ S12: status, priority and tags filters are combined with AND (0.2829ms)
✔ S13: an invalid filter value is an error, not an empty result (0.3924ms)
✔ S14: finds a ticket by id (0.2555ms)
✔ S15: an unknown id fails with NOT_FOUND and names the id (0.5463ms)
✔ S16: changing the status saves it with a new updatedAt and keeps createdAt (0.4254ms)
✔ S17: --tags replaces all previous tags (1.5071ms)
✔ S18: other tickets and the given list stay unchanged (0.4608ms)
✔ S19: an unknown id fails with NOT_FOUND and leaves the given list unchanged (0.3987ms)
✔ S20: an invalid value fails and leaves the given list unchanged (0.8852ms)
ℹ tests 84
ℹ suites 0
ℹ pass 84
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3728.8378
```

## 3. Coverage – `npm run coverage`

```
-------------------------------------------------------------------
file               | line % | branch % | funcs % | uncovered lines
-------------------------------------------------------------------
bin                |        |          |         | 
 tickets.js        | 100.00 |   100.00 |  100.00 | 
src                |        |          |         | 
 cli.js            | 100.00 |   100.00 |  100.00 | 
 commands          |        |          |         | 
  create.js        | 100.00 |   100.00 |  100.00 | 
  list.js          | 100.00 |   100.00 |  100.00 | 
  parseId.js       | 100.00 |   100.00 |  100.00 | 
  show.js          | 100.00 |   100.00 |  100.00 | 
  ticketOptions.js | 100.00 |   100.00 |  100.00 | 
  update.js        | 100.00 |    87.50 |  100.00 | 
 errors.js         | 100.00 |   100.00 |  100.00 | 
 models            |        |          |         | 
  ticket.js        | 100.00 |   100.00 |  100.00 | 
 services          |        |          |         | 
  ticketService.js | 100.00 |   100.00 |  100.00 | 
 storage           |        |          |         | 
  jsonStore.js     | 100.00 |   100.00 |  100.00 | 
-------------------------------------------------------------------
all files          | 100.00 |    99.31 |  100.00 | 
-------------------------------------------------------------------
```

Nhánh duy nhất chưa được chạy: `src/commands/update.js` (87,5 % nhánh) – hàm `formatValue` in giá trị kiểu **mảng** (tags) trong dòng xác nhận `Updated ticket #1 (tags: …)`. Chưa có test nào chạy `update --tags` qua tầng CLI; hành vi đã được kiểm tra bằng tay khi viết README (`Updated ticket #1 (tags: ui, bug)`, `Updated ticket #1 (tags: (none))`). Xem mục 5.

## 4. Mutation testing – cố ý làm hỏng code

Mỗi dòng: sửa đúng **một** chỗ trong code, chạy `npm test`, ghi lại test nào đỏ, rồi khôi phục code (sau cùng: 84/84 xanh, `git status` sạch). Mỗi tầng ít nhất một lỗi.

| # | Lỗi cố ý | File | Test bắt được |
|---|---|---|---|
| 1 | Title: > thành >= (chặn oan 100 ký tự) | `src/models/ticket.js` | M3, M5 |
| 2 | Bỏ validate status khi tạo ticket | `src/models/ticket.js` | **không bị bắt** |
| 3 | Lọc tags: every (AND) thành some (OR) | `src/services/ticketService.js` | C4, S6, S7, S8, S10 |
| 4 | Id mới = số lượng + 1 | `src/services/ticketService.js` | S2 |
| 5 | Ghi thẳng vào file thật (bỏ ghi nguyên tử) | `src/storage/jsonStore.js` | D10 |
| 6 | Bỏ kiểm tra file không phải mảng | `src/storage/jsonStore.js` | D4 |
| 7 | ValidationError trả exit 1 thay vì 2 | `src/cli.js` | C8 |
| 8 | Id cho phép số 0 (regex /^\d+$/) | `src/commands/parseId.js` | C10 |
| 9 | update quên lưu (store.save) | `src/commands/update.js` | C6, C14 |
| 10 | Bỏ qua TICKETS_FILE | `bin/tickets.js` | C18 |

Trong quá trình phát triển, sau hầu hết các bước Green đều có chạy mutation; kết quả từng lần ghi trong `docs/history.md`. Những lần mutation **không bị bắt** đã dẫn tới mục Phát sinh P2 (test thiếu), bổ sung assertion cho D10 (test thiếu) và một lần rút gọn code thừa (Bước 48).

## 5. Lỗ hổng phát hiện ở bước kiểm tra cuối

| # | Phát hiện | Bằng chứng | Trạng thái |
|---|---|---|---|
| 1 | **Không có test cho `create` với status sai.** Mutation #2 (bỏ `validateStatus` trong `buildTicket`) không làm test nào đỏ. Status sai mới chỉ được test ở `update` (C8) và `list` (C8, S13); ở `create` chỉ có priority sai (M22). | Code thật vẫn đúng: `tickets create --title x --status closed` → `Error: Invalid status "closed". Allowed values: open, in_progress, done` (exit 2), không tạo file. | Chờ quyết định |
| 2 | **Dòng xác nhận của `update` với tags chưa có test tự động** – nhánh duy nhất coverage chưa chạy (mục 3). | Kiểm tra bằng tay khi viết README. | Chờ quyết định |

Cả hai là **test thiếu**, không phải lỗi code.

## 6. Clone sạch và làm theo README

```
git clone https://github.com/ngocnt1505/ticket-manager-cli.git   → 58 commit, HEAD 87aa755
npm test                                                          → tests 84 · pass 84 · fail 0
node bin/tickets.js create --title "Fix login" --priority high --tags "bug,auth"
  Created ticket #1: Fix login
node bin/tickets.js list
  #1  open         high    Fix login  [bug, auth]
node bin/tickets.js update 1 --status done
  Updated ticket #1 (status: done)
node bin/tickets.js show 1
  Ticket #1 / Title: Fix login / Status: done …
node bin/tickets.js show 99
  Error: Ticket #99 not found        (exit 1)
git status --short                   → trống (tickets.json bị .gitignore bỏ qua)
```

Bước `npm link` không chạy lại trên bản clone (để không ghi đè lệnh `tickets` đang link tới repo làm việc); `npm link` đã được kiểm tra riêng ở `docs/history.md` Bước 60.

## 7. Đối chiếu Acceptance Criteria (`docs/overvieww2.md`)

| # | Tiêu chí | Đạt | Bằng chứng |
|---|---|---|---|
| 1 | TDD workflow: failing test → implementation → passing test → refactor | ✅ | `git log`: 26 commit `test(…)` đứng trước 22 commit `feat(…)` và 1 `fix(…)`; 4 commit `refactor(…)`; mỗi vòng ghi lý do đỏ thật trong `history.md` |
| 2 | `tickets create`, `list`, `show <id>`, `update <id>` hoạt động | ✅ | Test C1–C18; chạy qua `npm link` (`history.md` Bước 60) và trên bản clone sạch (mục 6) |
| 3 | Unit test cho logic ticket và luật validation | ✅ | `test/unit/ticket.model.test.js` (M1–M27, P1), `test/unit/ticket.service.test.js` (S1–S20, P2) |
| 4 | Integration test cho lưu trữ JSON và hành vi lệnh CLI | ✅ | `test/integration/jsonStore.test.js` (file thật: D7–D12, P4, P5), `test/integration/cli.test.js` (chương trình thật qua `spawnSync`: C11–C18) |
| 5 | Test lỗi: input sai, ticket không tồn tại, file JSON thiếu / hỏng | ✅ | Input sai: M2–M14, M20, P1, C2, C7, C8, C10, C15 · Không tồn tại: S15, S19, C9, C13 · File thiếu: D7, C17 · File hỏng: D3, D4, D9, P3, C16 |
| 6 | Hướng dẫn cài đặt, cấu hình, sử dụng | ✅ | `README.md`; đã làm theo trên bản clone sạch (mục 6) |
| 7 | Trả lời được câu hỏi về TDD, loại test, kiểm chứng code do AI viết | ✅ | `docs/history.md` (mỗi quyết định có Why), `docs/DECISIONS.md`, mục 4–5 của tài liệu này |

## 8. Lịch sử commit

```
git log --format='%s' | đếm theo loại
  26 test      22 feat      4 refactor      4 docs      1 fix      1 (init project structure)
```

Chuỗi TDD tiêu biểu – vòng Title (Giai đoạn 4.1):

```
a636cbd test(models): add failing test for trimming title
de8f421 feat(models): trim title
436a224 test(models): add failing test for empty title
8b2baa9  feat(models): reject empty title
b7da95f test(models): add failing test for title longer than 100 characters
cd8a061 feat(models): reject titles longer than 100 characters
2bfcefa test(models): add boundary tests for title length
0f3605c test(models): add failing test for non-string title
92681e4 feat(models): reject non-string titles
7843165 refactor(models): extract title length limit
```

Ghi chú trung thực: 3 commit có message bắt đầu bằng dấu cách (`9634fc8`, `d3aed74`, `8b2baa9`), và commit đầu tiên thiếu tiền tố `chore:`. Các commit này đã push nên được giữ nguyên, không viết lại lịch sử.
