# Kết quả kiểm tra – Knowledge Base CLI (`kb`, tuần 3)

Tài liệu này ghi lại kết quả chạy thật để người đọc **kiểm chứng được mà không cần tự chạy lại**. Lệnh để tái hiện có ghi ở từng mục. Quá trình làm từng bước: [history.md](history.md); quyết định thiết kế: [DECISIONS.md](DECISIONS.md).

| | |
|---|---|
| Ngày chạy | 2026-10-27 |
| Commit được kiểm tra | `fc3ba74` (feat(kb): add the kb command with client selection by environment) – commit cuối cùng có thay đổi code/test |
| Node.js | v24.11.1 |
| Hệ điều hành | Windows 11 |

## 1. Tóm tắt

| Hạng mục | Kết quả |
|---|---|
| Toàn bộ test (`npm test`) | **162 / 162 pass**, exit 0 – tickets (node:test) 86 + kb (Jest) 76 |
| Test `kb` (`npm run test:kb`) | **76 / 76 pass**, 6 file – khoảng 3–9 giây (gồm 1 lần build trong e2e) |
| Kiểm tra kiểu (`npm run typecheck`) | OK, không lỗi |
| Coverage `kb` (`npx jest --coverage`) | **99,7 %** dòng · **85 %** nhánh · **99 %** hàm (mục 3) |
| Mutation testing (40 lỗi cố ý, mục 4) | **39 / 40 bị bắt**; 1 là đột biến tương đương (không đổi hành vi). Lần chạy đầu có 2 lỗ hổng – đã lấp (mục 5) |
| Chạy thật bằng `kb` (PowerShell) – mock và HTTP (mục 6) | Đúng; 4 lệnh mẫu trong `tasks.md` chạy được |
| Clone sạch, `npm install`, `npm test` (mục 7) | Chạy đúng; `npm install` tự build `dist/` |
| Acceptance Criteria (mục 8) | 4 / 4 – riêng AC 4 dùng server tham chiếu vì **không được cấp URL KB thật** |

## 2. Output đầy đủ của `npx jest --verbose`

```
PASS test/kb/mockClient.test.ts
  MockKBClient – search
    √ K1: finds a document by a word in its title, ignoring case (21 ms)
    √ K2: reports where it matched – title before tag before content (2 ms)
    √ K3: orders results by match type, then by id (32 ms)
    √ K4: returns at most topK results (1 ms)
    √ K5: can be limited to one node (1 ms)
    √ K6: returns an empty list when nothing matches (1 ms)
    √ K7: results never include the document content (1 ms)
    √ K8: an empty query or a topK that is not a positive whole number is invalid (2 ms)
  MockKBClient – list
    √ K9: without a node, lists every document sorted by id, without content (1 ms)
    √ K10: lists a node and everything inside it, but not a node that only shares a prefix (1 ms)
    √ K11: returns at most limit documents
    √ K12: a node path not starting with "/" or a bad limit is invalid (1 ms)
  MockKBClient – retrieve
    √ K13: returns the full document, with its content (1 ms)
    √ K14: an unknown id fails with NOT_FOUND and names the id
  MockKBClient – add
    √ K15: adds a document with the next id and normalised tags; it can then be retrieved and listed
    √ K16: a missing title or content, or a bad node path, is invalid and adds nothing (6 ms)
PASS test/kb/cli.test.ts
  kb search
    √ C1: prints one line per result – id, title, node, tags and where it matched (61 ms)
    √ C2: --top-k and --node narrow the results (3 ms)
    √ C3: says so when nothing matches (8 ms)
    √ C4: --top-k that is not a positive whole number is a usage error (exit 2) (12 ms)
    √ C5: a missing query is a usage error (exit 2) (1 ms)
  kb list
    √ C6: lists documents, narrowed by --node and --limit (7 ms)
    √ C7: a node path without "/" or a bad --limit is a usage error (exit 2) (6 ms)
  kb retrieve
    √ C8: prints the document details, then its content (2 ms)
    √ C9: an unknown id is a data error (exit 1) (1 ms)
  kb add
    √ C10: adds the file as a document, titled by its first "# heading" (2 ms)
    √ C11: --title wins over the heading; with neither, the file name is the title (3 ms)
    √ C12: a file that cannot be read is a data error (exit 1) and adds nothing (1 ms)
    √ C13: a missing --path or a node path without "/" is a usage error (exit 2) and adds nothing (2 ms)
  kb (program)
    √ C14: an unknown command or no command is a usage error (exit 2) (5 ms)
    √ C15: --help prints usage to stdout and exits 0 (3 ms)
    √ C16: an unexpected error is reported in one line, without a stack trace (exit 1)
PASS test/kb/environment.test.ts
  clientFromEnv – KB_CLIENT, KB_API_URL, KB_DEBUG
    √ E1: without KB_CLIENT, the mock client is used (17 ms)
    √ E2: KB_CLIENT=mock is read ignoring case and spaces (1 ms)
    √ E3: KB_CLIENT=http uses the HTTP client with KB_API_URL (133 ms)
    √ E4: without KB_API_URL, the HTTP client calls http://localhost:3000 (18 ms)
    √ E5: debug lines are written only when KB_DEBUG=1 (15 ms)
    √ E6: an unknown KB_CLIENT is a usage error (21 ms)
PASS test/kb/server.test.ts
  KB server – success
    √ S1: POST /search → 200 { results: [{ id, title, nodePath, tags, matchType }] } (164 ms)
    √ S2: POST /search passes filters.nodePath to the client (16 ms)
    √ S3: POST /list → 200 { documents: [...] }, without content (10 ms)
    √ S4: POST /retrieve → 200 { document } with content (9 ms)
    √ S5: POST /add → 201 { document } with the new id; it can then be retrieved (17 ms)
  KB server – errors: { error: { code, message } }
    √ S6: invalid input from the client rules → 400 INVALID_INPUT (9 ms)
    √ S7: a body that is not a JSON object, or a field of the wrong type → 400 INVALID_INPUT (33 ms)
    √ S8: an unknown document → 404 NOT_FOUND (8 ms)
    √ S9: an unknown endpoint or a method other than POST → 404 NOT_FOUND (9 ms)
    √ S10: an unexpected failure → 500 INTERNAL, without leaking details (6 ms)
PASS test/kb/httpClient.test.ts
  HTTPKBClient – search
    √ K1: finds a document by a word in its title, ignoring case (154 ms)
    √ K2: reports where it matched – title before tag before content (15 ms)
    √ K3: orders results by match type, then by id (27 ms)
    √ K4: returns at most topK results (10 ms)
    √ K5: can be limited to one node (9 ms)
    √ K6: returns an empty list when nothing matches (7 ms)
    √ K7: results never include the document content (9 ms)
    √ K8: an empty query or a topK that is not a positive whole number is invalid (22 ms)
  HTTPKBClient – list
    √ K9: without a node, lists every document sorted by id, without content (7 ms)
    √ K10: lists a node and everything inside it, but not a node that only shares a prefix (10 ms)
    √ K11: returns at most limit documents (7 ms)
    √ K12: a node path not starting with "/" or a bad limit is invalid (11 ms)
  HTTPKBClient – retrieve
    √ K13: returns the full document, with its content (5 ms)
    √ K14: an unknown id fails with NOT_FOUND and names the id (5 ms)
  HTTPKBClient – add
    √ K15: adds a document with the next id and normalised tags; it can then be retrieved and listed (8 ms)
    √ K16: a missing title or content, or a bad node path, is invalid and adds nothing (14 ms)
  HTTPKBClient – talking to the server
    √ H1: a server that cannot be reached → KBConnectionError naming the URL (7 ms)
    √ H2: a server error (5xx) → KBApiError with the status and the server message (5 ms)
    √ H3: a response that is not JSON, or not the expected shape → KBApiError BAD_RESPONSE (12 ms)
    √ H4: a base URL ending in "/" works too (7 ms)
    √ H5: debug logs one line per request and per response (25 ms)
    √ H6: debug also logs a connection failure (6 ms)
PASS test/kb/e2e.test.ts
  kb command (end-to-end)
    √ X1: by default it uses the mock client (124 ms)
    √ X2: KB_CLIENT=http talks to the KB server at KB_API_URL – add a real file, then find it (306 ms)
    √ X3: when the KB server is down, it says so (exit 1) (116 ms)
    √ X4: KB_DEBUG=1 writes each request and response to stderr (121 ms)
    √ X5: an unknown KB_CLIENT is a usage error (exit 2) (71 ms)
    √ X6: exit codes reach the shell – usage error 2, --help 0 (157 ms)
Test Suites: 6 passed, 6 total
Tests:       76 passed, 76 total
Snapshots:   0 total
Time:        9.013 s
Ran all test suites.
```

Các test K1–K16 nằm trong **một** file (`test/kb/contract.ts`) và chạy hai lần: với `MockKBClient` và với `HTTPKBClient` qua HTTP thật – nên hai client chắc chắn cư xử giống nhau.

## 3. Coverage – `npx jest --coverage`

```
-----------------|---------|----------|---------|---------|------------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|------------------------
All files        |   98.58 |    85.15 |   99.11 |   99.67 |
  cli.ts         |   98.07 |    89.47 |     100 |     100 | 36,76
  environment.ts |     100 |      100 |     100 |     100 |
  errors.ts      |     100 |      100 |     100 |     100 |
  httpClient.ts  |   96.15 |    72.22 |     100 |     100 | 26,70-71,74-80,102,115
  mockClient.ts  |     100 |    91.17 |     100 |     100 | 45,87,101
  server.ts      |   96.82 |    89.65 |     100 |   98.03 | 104
  contract.ts    |     100 |       50 |     100 |     100 | 74
  httpServers.ts |     100 |      100 |    87.5 |     100 |
-----------------|---------|----------|---------|---------|------------------------
```

- **Phần lớn nhánh chưa chạy là nhánh phòng thủ** cho server "lạ". Ví dụ: server trả 5xx mà không có `error.code` (`httpClient.ts` 74–80), `fetch` ném lỗi không có `cause` (115), giá trị không phải `Error` bị ném ra (`cli.ts` 36). Server tham chiếu không bao giờ làm vậy nên không có test – ghi nhận là giới hạn, không phải lỗi đã biết.
- **`main.ts` và `startServer.ts` không có trong bảng** vì chúng chạy trong process riêng (Jest chỉ đo process của nó). `main.ts` được kiểm tra bằng e2e X1–X6; `startServer.ts` bằng chạy thật (mục 6).
- `contract.ts`, `httpServers.ts` là code của test, nằm trong bảng vì cùng thư mục `test/kb`.

## 4. Mutation testing – cố ý làm hỏng code

Cách làm: sửa một chỗ trong code → chạy test → test phải **đỏ** → trả code cũ (kiểm tra bằng `cmp`). Chi tiết từng đột biến ở bước Green tương ứng trong [history.md](history.md).

| Phần | Bước | Số đột biến | Bị bắt | Ví dụ |
|---|---|---|---|---|
| `MockKBClient` | Bước 2 | 6 | 6 | `/temp` khớp nhầm `/templates` → K10; dùng chung mảng dữ liệu mẫu → K16 |
| CLI (`cli.ts`) | Bước 4 | 7 | 7 | không bọc lỗi đọc file → C12; `--help` trả exit 2 → C15 |
| Server tham chiếu | Bước 6 | 8 | 7 (+1 tương đương) | lỗi 500 lộ chi tiết → S10; `/add` trả 200 → S5 |
| `HTTPKBClient` | Bước 8 | 11 | 11 | 400 không thành `KBValidationError` → K8, K12, K16 (bộ test chung bắt) |
| `environment.ts` + `main.ts` | Bước 10 | 8 | 8 | bỏ qua `KB_API_URL` → E3, X2…; đọc file bằng `latin1` → X2 |
| **Tổng** | | **40** | **39 + 1 tương đương** | |

**Đột biến tương đương** (server, M7): bỏ kiểm tra "`topK` phải là số" ở server. Kết quả vẫn là 400, vì client mock phía sau cũng từ chối (`Number.isInteger("2")` là `false`) → không test nào phân biệt được. Vẫn giữ kiểm tra ở server vì thông báo rõ hơn và không phụ thuộc client.

## 5. Lỗ hổng phát hiện ở bước kiểm tra – đã lấp

| # | Phát hiện | Cách lấp |
|---|---|---|
| 1 | **Server chấp nhận body là mảng `[]` mà không test nào đỏ** (Bước 6, M5): S7 chỉ gửi `[]` tới `/search`, nơi lỗi "thiếu `query`" đã cho 400 sẵn | Thêm trường hợp `[]` gửi tới `/list` vào S7 |
| 2 | **Đọc file bằng `latin1` thay vì `utf8` mà không test nào đỏ** (Bước 10, M8): file test chỉ có chữ ASCII | X2 dùng tiêu đề tiếng Việt `# Nhắc lịch hẹn` – lỗi thật với người dùng Việt Nam |
| 3 | **Git Bash đổi `/team` thành `C:/Program Files/Git/team`** – phát hiện khi chạy thử ví dụ của README | Ghi vào README (Known limitations) cách tránh: `export MSYS_NO_PATHCONV=1`, hoặc dùng PowerShell / cmd |
| 4 | **3 test đỏ sai lý do ở bước Red** (C11, H4, E5: `TypeError` / lỗi khác thay vì assertion) | Thêm assertion đứng trước (`toBe(0)` + kiểm tra output, `?.map`, `toBeInstanceOf`) để test đỏ ở assertion – sửa trước khi commit Red |

**Một lần chạy không tái hiện được** (Bước 6): ngay sau loạt đột biến của server, một lần `npx jest` báo `1 failed, 41 passed` (không lưu được tên test). Đã xác nhận code đã trả đúng, rồi chạy lại 9 lần liền; ở các bước sau toàn bộ bộ test còn chạy thêm hơn 10 lần: **luôn xanh**. Ghi lại để minh bạch.

## 6. Chạy thật

Sau `npm link`, trong PowerShell. Output đầy đủ ở [history.md](history.md) Bước 6 (`curl`) và Bước 10 (`kb`).

**Mock (mặc định) – các lệnh mẫu của `tasks.md`:**

```
PS> kb search "response" --top-k 3
doc-001  Customer Response Template  /templates/email  [template, email]  (match: title)
exit 0
PS> kb list --node /templates/email --limit 10
doc-001  Customer Response Template  /templates/email  [template, email]
exit 0
PS> kb retrieve doc-001
ID:    doc-001
Title: Customer Response Template
…
exit 0
PS> kb retrieve doc-999
Error: document doc-999 not found
exit 1
```

**HTTP – server tham chiếu (`node dist/kb/startServer.js`, cổng 3457), gồm lệnh mẫu `kb add` của `tasks.md`:**

```
PS> $env:KB_CLIENT="http"; $env:KB_API_URL="http://localhost:3457"
PS> kb add --file new-template.md --path /templates/sms --tags sms
Added doc-004: SMS Appointment Reminder (/templates/sms)
exit 0
PS> kb search appointment
doc-004  SMS Appointment Reminder  /templates/sms  [sms]  (match: title)
exit 0
PS> $env:KB_DEBUG="1"; kb retrieve doc-999
[kb] → POST http://localhost:3457/retrieve {"docId":"doc-999"}
[kb] ← 404 {"error":{"code":"NOT_FOUND","message":"document doc-999 not found"}}
Error: document doc-999 not found
exit 1
PS> $env:KB_API_URL="http://localhost:3999"; kb list
Error: cannot connect to KB server at http://localhost:3999 (ECONNREFUSED)
exit 1
```

**API bằng `curl`** (`npm run kb-server`, cổng 3456): 200 `/search`, 200 `/list`, 404 `/retrieve` doc-999, 201 `/add`, 400 query rỗng, 404 `GET /search` – đúng contract ([history.md](history.md) Bước 6).

## 7. Clone sạch và làm theo README

```bash
git clone <repo> clean && cd clean     # tại fc3ba74 – chưa có dist/
npm install                            # "prepare" tự build TypeScript → dist/kb/*.js
npm test                               # tickets: tests 86, pass 86, fail 0 · kb: Tests 76 passed · exit 0
node bin/kb.js search "response" --top-k 3
# doc-001  Customer Response Template  /templates/email  [template, email]  (match: title)   exit 0
```

`dist/` nằm trong `.gitignore` → không commit code đã build; người clone luôn build từ mã nguồn.

## 8. Đối chiếu Acceptance Criteria (`docs2/overview.md`)

| AC | Kết quả | Bằng chứng |
|---|---|---|
| CLI can query external Knowledge Base API for real-world use cases (templates, documents, team info) | ✅ | `kb` gọi KB API qua HTTP (`KB_CLIENT=http`); dữ liệu mẫu gồm email template (doc-001), team info (doc-002), guide (doc-003). Test X2, X4; chạy thật mục 6 |
| Both mock and HTTP clients work correctly, swappable via environment variable | ✅ | Cùng 16 test contract K1–K16 pass với cả hai client; `KB_CLIENT` / `KB_API_URL` / `KB_DEBUG`: E1–E6, X1–X5 |
| All 4 commands (search, list, retrieve, add) functional end-to-end | ✅ | C1–C16 (từng lệnh, mọi exit code); e2e X1–X6 chạy `bin/kb.js` thật; 4 lệnh mẫu của `tasks.md` chạy thật (mục 6) |
| Integration with real KB API tested and documented | ✅ (có giới hạn) | **Không được cấp URL KB API thật** → viết server tham chiếu theo contract (đề cho phép: *"Access to KB API server (mock or real)"*, `tasks.md`). Client được test bằng **HTTP thật**, không mock `fetch`: 22 test httpClient, 10 test server, e2e. Tài liệu: README (Setup, API contract, Known limitations), `DECISIONS.md` §4–§6. Khi có server thật chỉ cần đổi `KB_API_URL` |

**Đối chiếu Deliverables của `tasks.md`:**

| Deliverable | Ở đâu |
|---|---|
| Domain entities TypeScript interfaces | `src/kb/domain.ts` (`Document`, `SearchResult`, `KBQuery`…) |
| MockKBClient with minimal data (2–3 docs) | `src/kb/mockClient.ts` – 3 tài liệu |
| All 4 CLI commands working with mock client | `src/kb/cli.ts`; C1–C16, X1 |
| HTTPKBClient implementation | `src/kb/httpClient.ts` |
| Integration tests (both clients) | `test/kb/contract.ts` chạy với cả hai client; `httpClient.test.ts`, `e2e.test.ts` |
| Setup guide for KB API connection | README → *Knowledge Base CLI → Setup* |
| Architecture diagram and API contract documentation | README → *Architecture*, *API contract*; `DECISIONS.md` §4 |
| Error handling and logging | `KBConnectionError` / `KBApiError` / 400 / 404 (H1–H3); `KB_DEBUG=1` (H5, H6, X4) |
| Help text for each command | Commander `--help` (C15, X6) |

## 9. Lịch sử commit (tuần 3)

Mỗi commit `test(kb)` (đỏ) đứng trước commit `feat(kb)` làm nó xanh:

```
fc3ba74 feat(kb): add the kb command with client selection by environment
6a2e22c test(kb): add failing tests for client selection and the kb command
7f58a8d feat(kb): add an HTTP KB client using fetch
27aa633 test(kb): add failing tests for the HTTP KB client
fad805c feat(kb): add a reference KB server for the API contract
c679a74 test(kb): add failing tests for the reference KB server
05fd81f feat(kb): add the kb search, list, retrieve and add commands
b28a172 test(kb): add failing tests for the kb commands
39adc9a feat(kb): add an in-memory mock KB client
0e77b9a test(kb): add failing contract tests for the KB client
412b3af chore: speed up Jest by transpiling only
56ca9fc chore: set up TypeScript, Jest and Commander for the kb CLI
ffc89a1 docs: add week 3 brief, decisions and log
```

Tag `week2-submission` đánh dấu bài nộp tuần 2, trước khi bắt đầu tuần 3.
