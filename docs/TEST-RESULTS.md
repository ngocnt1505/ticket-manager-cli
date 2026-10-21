# Kết quả kiểm tra – Ticket Manager CLI

Tài liệu này ghi lại kết quả chạy thật để người đọc **kiểm chứng được mà không cần tự chạy lại**. Lệnh để tái hiện có ghi ở từng mục.

| | |
|---|---|
| Ngày chạy | 2026-10-21 |
| Commit được kiểm tra | `c2290a0` (test: cover invalid status on create and the update tags message) – commit cuối cùng có thay đổi code/test |
| Node.js | v24.11.1 |
| Hệ điều hành | Windows 11 |

## 1. Tóm tắt

| Hạng mục | Kết quả |
|---|---|
| Toàn bộ test (`npm test`) | **86 / 86 pass**, 0 fail – khoảng 3–4 giây |
| Unit test (`npm run test:unit`) | 70 / 70 pass |
| Integration test (`npm run test:integration`) | 16 / 16 pass |
| Coverage (`npm run coverage`) | **100 %** dòng · **100 %** nhánh · **100 %** hàm |
| Mutation testing (10 lỗi cố ý, mục 4) | **10 / 10 bị bắt** (lần chạy đầu 9/10 – lỗ hổng đã được lấp, mục 5) |
| Clone sạch từ GitHub, làm theo README (mục 6) | Chạy đúng; `tickets.json` được `.gitignore` bỏ qua |

## 2. Output đầy đủ của `npm test`

```
> ticket-manager-cli@1.0.0 test
> node --test "test/**/*.test.js"

✔ C11: create with title, priority and tags exits 0 and writes the ticket to the file (169.4271ms)
✔ C12: list --status open --tags bug shows only the matching tickets (526.5657ms)
✔ C13: show 1 exits 0; show 99 exits 1 with the error on stderr only (472.2403ms)
✔ C14: update 1 --status done exits 0 and updates the file (205.5569ms)
✔ C15: unknown command, missing argument or malformed id exit 2 without a stack trace (641.9522ms)
✔ C16: a corrupted file exits 1 with a clear message, no stack trace, and is not overwritten (360.5653ms)
✔ C17: without TICKETS_FILE the data goes to tickets.json in the current folder (100.3239ms)
✔ C18: TICKETS_FILE in a missing folder exits 1 and does not create the folder (122.5215ms)
✔ D7: loading a file that does not exist gives no tickets and creates nothing (7.8977ms)
✔ D8: what save writes, load reads back (8.9741ms)
✔ D9: loading a corrupted file fails with CORRUPTED_FILE and leaves it byte for byte (9.1026ms)
✔ D10: when writing fails, save reports SAVE_FAILED and the old file stays byte for byte (9.029ms)
✔ D11: save into a missing folder fails with SAVE_FAILED and does not create the folder (2.4195ms)
✔ D12: save leaves no temporary file behind (5.7432ms)
✔ P4: a path that cannot be read (a folder) fails with READ_FAILED and names it (1.9089ms)
✔ P5: when the final rename fails, save removes its temporary file (4.9198ms)
✔ C1: create prints the new id on stdout, saves the ticket and exits 0 (7.0956ms)
✔ C2: create without --title explains it on stderr, exits 2 and saves nothing (0.7937ms)
✔ C3: list with no tickets prints a friendly message and exits 0 (0.449ms)
✔ C4: list prints one line per ticket with id, status, priority, title and tags (1.1959ms)
✔ C5: show prints every field of the ticket (0.9973ms)
✔ C9: an unknown ticket exits 1 with the error on stderr only (0.5306ms)
✔ C10: a malformed id exits 2; 1 and 42 are accepted as ids (0.9658ms)
✔ C6: update changes the ticket, confirms the change and exits 0 (0.8022ms)
✔ C7: update without any option exits 2, names the options and saves nothing (0.5755ms)
✔ C8: invalid values exit 2 with a helpful message and save nothing (1.4207ms)
✔ P6a: names of built-in object properties are unknown commands, not crashes (2.6246ms)
✔ P6b: an unexpected error exits 1 with a short message and no stack trace (0.7883ms)
✔ P8: update --tags confirms the stored tags, or (none) when they are removed (0.604ms)
✔ D1: parseTickets returns the tickets stored in a JSON array (4.1203ms)
✔ D2: an empty or whitespace-only file means no tickets (0.3409ms)
✔ D3: cut-off JSON fails with CORRUPTED_FILE and names the file (1.0875ms)
✔ D4: valid JSON that is not an array fails with CORRUPTED_FILE (0.462ms)
✔ D5: serializeTickets writes JSON indented by 2 spaces, ending with a newline (0.7363ms)
✔ D6: Vietnamese text and emoji survive serialize then parse (1.7531ms)
✔ P3: entries without a unique positive integer id fail with CORRUPTED_FILE (0.7468ms)
✔ M1: trims a valid title (6.0263ms)
✔ M2: rejects an empty or whitespace-only title with EMPTY_TITLE (1.4447ms)
✔ M3: accepts a title of exactly 100 characters (0.3497ms)
✔ M5: measures the length after trimming (0.229ms)
✔ M4: rejects a title of 101 characters with TITLE_TOO_LONG (0.2763ms)
✔ M6: rejects a non-string title with INVALID_TITLE (0.3832ms)
✔ M7: accepts open, in_progress and done as status (0.2749ms)
✔ M8: rejects other status values with INVALID_STATUS and lists the allowed ones (0.6408ms)
✔ M9: accepts low, medium and high as priority (0.3097ms)
✔ M10: rejects other priority values with INVALID_PRIORITY (0.5606ms)
✔ M11: a missing description becomes an empty string (0.3211ms)
✔ M12: trims the description (0.4169ms)
✔ M13: accepts 1000 characters and rejects 1001 with DESCRIPTION_TOO_LONG (0.1932ms)
✔ M14: rejects a non-string description with INVALID_DESCRIPTION (0.2527ms)
✔ M15: splits tags on commas and trims each one (1.4573ms)
✔ M16: drops empty tags (0.3045ms)
✔ M17: lowercases tags and removes duplicates, keeping first-seen order (0.2331ms)
✔ M18: missing or blank tags become an empty list (0.2048ms)
✔ M19: keeps Vietnamese tags (0.1728ms)
✔ M20: accepts a 30-character tag and rejects 31 with INVALID_TAG (0.4201ms)
✔ P1: rejects non-string tags with INVALID_TAG (0.3102ms)
✔ M21: a ticket with only a title gets defaults, the given id and timestamps (1.5621ms)
✔ M22: a ticket with every field uses the validated values (0.4192ms)
✔ M23: an update changes only the given field and refreshes updatedAt (0.3902ms)
✔ M24: an update returns a new ticket and leaves the original untouched (0.334ms)
✔ M25: one invalid value rejects the whole update (no half update) (0.29ms)
✔ M26: id, createdAt, updatedAt and unknown fields cannot be updated (0.389ms)
✔ M27: an update without any field fails with NO_CHANGES (0.2101ms)
✔ P7: building a ticket with an invalid status fails with INVALID_STATUS (0.2048ms)
✔ S1: the first ticket gets id 1 and is returned with a new list containing it (6.4597ms)
✔ S2: a new id is the highest existing id plus one, even with gaps (0.4812ms)
✔ S3: creating twice in a row on the returned list gives ids 1 and 2 (0.6631ms)
✔ S4: invalid input throws and leaves the given list unchanged (0.9798ms)
✔ P2: creating a ticket returns a new list and leaves the given list unchanged (0.3368ms)
✔ S5: listing with no tickets gives an empty list (0.6708ms)
✔ S6: results are sorted by id without reordering the given list (1.4667ms)
✔ S7: filters by status (0.3834ms)
✔ S8: filters by priority (0.6247ms)
✔ S9: filters by one tag (0.5844ms)
✔ S10: with several tags a ticket must have all of them (AND) (0.3649ms)
✔ S11: tag filters ignore upper/lower case (0.2775ms)
✔ S12: status, priority and tags filters are combined with AND (0.25ms)
✔ S13: an invalid filter value is an error, not an empty result (0.6619ms)
✔ S14: finds a ticket by id (0.4665ms)
✔ S15: an unknown id fails with NOT_FOUND and names the id (2.978ms)
✔ S16: changing the status saves it with a new updatedAt and keeps createdAt (0.8055ms)
✔ S17: --tags replaces all previous tags (1.6799ms)
✔ S18: other tickets and the given list stay unchanged (0.5101ms)
✔ S19: an unknown id fails with NOT_FOUND and leaves the given list unchanged (0.4058ms)
✔ S20: an invalid value fails and leaves the given list unchanged (0.324ms)
ℹ tests 86
ℹ suites 0
ℹ pass 86
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2778.6688
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
  update.js        | 100.00 |   100.00 |  100.00 | 
 errors.js         | 100.00 |   100.00 |  100.00 | 
 models            |        |          |         | 
  ticket.js        | 100.00 |   100.00 |  100.00 | 
 services          |        |          |         | 
  ticketService.js | 100.00 |   100.00 |  100.00 | 
 storage           |        |          |         | 
  jsonStore.js     | 100.00 |   100.00 |  100.00 | 
-------------------------------------------------------------------
all files          | 100.00 |   100.00 |  100.00 | 
-------------------------------------------------------------------
```

Mọi dòng, nhánh và hàm đều được test chạy tới. Lần kiểm tra đầu còn **một nhánh** chưa chạy (`src/commands/update.js`, 87,5 % nhánh – dòng xác nhận khi `update --tags`); đã thêm test P8 (mục 5).

## 4. Mutation testing – cố ý làm hỏng code

Mỗi dòng: sửa đúng **một** chỗ trong code, chạy `npm test`, ghi lại test nào đỏ, rồi khôi phục code (sau cùng: 86/86 xanh, `git status` sạch). Mỗi tầng ít nhất một lỗi. Kết quả dưới đây là lần chạy **sau** khi đã lấp lỗ hổng ở mục 5.

| # | Lỗi cố ý | File | Test bắt được |
|---|---|---|---|
| 1 | Title: > thành >= (chặn oan 100 ký tự) | `src/models/ticket.js` | M3, M5 |
| 2 | Bỏ validate status khi tạo ticket | `src/models/ticket.js` | P7 |
| 3 | Lọc tags: every (AND) thành some (OR) | `src/services/ticketService.js` | C4, S6, S7, S8, S10 |
| 4 | Id mới = số lượng + 1 | `src/services/ticketService.js` | S2 |
| 5 | Ghi thẳng vào file thật (bỏ ghi nguyên tử) | `src/storage/jsonStore.js` | D10 |
| 6 | Bỏ kiểm tra file không phải mảng | `src/storage/jsonStore.js` | D4 |
| 7 | ValidationError trả exit 1 thay vì 2 | `src/cli.js` | C8 |
| 8 | Id cho phép số 0 (regex /^\d+$/) | `src/commands/parseId.js` | C10 |
| 9 | update quên lưu (store.save) | `src/commands/update.js` | C6, C14 |
| 10 | Bỏ qua TICKETS_FILE | `bin/tickets.js` | C18 |

Trong quá trình phát triển, sau hầu hết các bước Green đều có chạy mutation; kết quả từng lần ghi trong `docs/history.md`. Những lần mutation **không bị bắt** đã dẫn tới mục Phát sinh P2 (test thiếu), bổ sung assertion cho D10 (test thiếu) và một lần rút gọn code thừa (Bước 48).

## 5. Lỗ hổng phát hiện ở bước kiểm tra – đã lấp

Lần kiểm tra đầu (commit `87aa755`, 84 test) tìm ra hai chỗ **thiếu test** (code vẫn đúng):

| # | Phát hiện | Cách phát hiện | Xử lý |
|---|---|---|---|
| P7 | Không có test cho `create` với status sai – status sai mới chỉ được thử ở `update` và `list` | Mutation #2 (bỏ `validateStatus` trong `buildTicket`) **không làm test nào đỏ** | Thêm test P7 → mutation #2 giờ bị bắt |
| P8 | Dòng xác nhận của `update --tags` chưa có test tự động | Coverage: nhánh duy nhất chưa chạy (`update.js`, 87,5 %) | Thêm test P8 → coverage nhánh 100 % |

| | Lần đầu (`87aa755`) | Sau khi lấp (`c2290a0`) |
|---|---|---|
| Số test | 84 | 86 |
| Coverage nhánh | 99,31 % | 100 % |
| Mutation bị bắt | 9 / 10 | 10 / 10 |

## 6. Clone sạch và làm theo README

```
git clone https://github.com/ngocnt1505/ticket-manager-cli.git   → 61 commit, HEAD c2290a0
npm test                                                          → tests 86 · pass 86 · fail 0
node bin/tickets.js create --title "Fix login" --priority high --tags "bug,auth"
  Created ticket #1: Fix login
node bin/tickets.js list
  #1  open         high    Fix login  [bug, auth]
node bin/tickets.js update 1 --status done
  Updated ticket #1 (status: done)
node bin/tickets.js show 1
  Ticket #1 / Title: Fix login / Status: done …
node bin/tickets.js update 1 --tags "ui,bug"   → Updated ticket #1 (tags: ui, bug)
node bin/tickets.js update 1 --tags=          → Updated ticket #1 (tags: (none))
node bin/tickets.js show 99                   → Error: Ticket #99 not found                          (exit 1)
node bin/tickets.js show abc                  → Error: Invalid ticket id "abc". …                    (exit 2)
node bin/tickets.js create --title x --priority urgent → Error: Invalid priority "urgent". …         (exit 2)
(ghi '{oops' vào tickets.json) node bin/tickets.js list → Error: Ticket file …tickets.json is not valid JSON (…). Fix or remove it and try again.   (exit 1)
git status --short                   → trống (tickets.json bị .gitignore bỏ qua)
```

Bước `npm link` không chạy lại trên bản clone (để không ghi đè lệnh `tickets` đang link tới repo làm việc); `npm link` đã được kiểm tra riêng ở `docs/history.md` Bước 60.

## 7. Đối chiếu Acceptance Criteria (`docs/overvieww2.md`)

| # | Tiêu chí | Đạt | Bằng chứng |
|---|---|---|---|
| 1 | TDD workflow: failing test → implementation → passing test → refactor | ✅ | `git log`: 27 commit `test(…)` đứng trước 22 commit `feat(…)` và 1 `fix(…)`; 4 commit `refactor(…)`; mỗi vòng ghi lý do đỏ thật trong `history.md` |
| 2 | `tickets create`, `list`, `show <id>`, `update <id>` hoạt động | ✅ | Test C1–C18; chạy qua `npm link` (`history.md` Bước 60) và trên bản clone sạch (mục 6) |
| 3 | Unit test cho logic ticket và luật validation | ✅ | `test/unit/ticket.model.test.js` (M1–M27, P1, P7), `test/unit/ticket.service.test.js` (S1–S20, P2) |
| 4 | Integration test cho lưu trữ JSON và hành vi lệnh CLI | ✅ | `test/integration/jsonStore.test.js` (file thật: D7–D12, P4, P5), `test/integration/cli.test.js` (chương trình thật qua `spawnSync`: C11–C18) |
| 5 | Test lỗi: input sai, ticket không tồn tại, file JSON thiếu / hỏng | ✅ | Input sai: M2–M14, M20, P1, P7, C2, C7, C8, C10, C15 · Không tồn tại: S15, S19, C9, C13 · File thiếu: D7, C17 · File hỏng: D3, D4, D9, P3, C16 |
| 6 | Hướng dẫn cài đặt, cấu hình, sử dụng | ✅ | `README.md`; đã làm theo trên bản clone sạch (mục 6) |
| 7 | Trả lời được câu hỏi về TDD, loại test, kiểm chứng code do AI viết | ✅ | `docs/history.md` (mỗi quyết định có Why), `docs/DECISIONS.md`, mục 4–5 của tài liệu này |

## 8. Lịch sử commit

```
git log --format='%s' | đếm theo loại (61 commit, tính tới c2290a0)
  27 test      22 feat      6 docs      4 refactor      1 fix      1 (init project structure)
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
