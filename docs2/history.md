# Nhật ký dự án – Week 3: Tích hợp CLI với Knowledge Base API

Nguyễn Thúy Ngọc · AI Training, Week 3

File này ghi lại **từng bước** của bài tuần 3 theo thứ tự thời gian, cùng cách làm như tuần 2 (`docs/history.md`). Ngọc là người thực hiện và commit; Claude (Claude Code) hướng dẫn, giải thích, viết code khi được yêu cầu và review. Mỗi mục gồm:

- **What** – đã làm gì;
- **Why** – vì sao làm vậy;
- **How** – làm cụ thể như thế nào (lệnh, file, output chạy thật);
- **Kết quả / Ghi chú** – trạng thái sau bước, quyết định còn treo.

---

## Bước 0 – Khởi động tuần 3: tag bản tuần 2, cài TypeScript + Jest + Commander

**Thời gian:** 2026-10-27 · **Người làm:** Ngọc gắn tag và commit tài liệu; Claude cài đặt và cấu hình (theo yêu cầu) · **Commit:** `56ca9fc`

### What

1. Ngọc gắn tag `week2-submission` vào commit `7041f78` (đã push lên GitHub) và commit `ffc89a1 docs: add week 3 brief, decisions and log`.
2. Cài công cụ cho phần KB (theo `DECISIONS.md` §1): `commander` (dependency); `typescript`, `jest`, `ts-jest`, `@types/jest`, `@types/node` (devDependencies).
3. Cấu hình: `tsconfig.json`, `tsconfig.build.json`, `jest.config.js`, script trong `package.json`, thêm `dist/` vào `.gitignore`.
4. Chạy một test giả để kiểm tra môi trường, rồi xóa.

### Why

- **Tag `week2-submission`**: repo tiếp tục có code tuần 3, nhưng bản đã nộp tuần 2 vẫn xem lại được nguyên vẹn tại `…/tree/week2-submission`.
- **Hai bộ test chạy song song**: phần `tickets` tuần 2 giữ `node:test` (đã được chấm pass, không viết lại); phần KB dùng Jest theo đề. `npm test` chạy cả hai.
- **Commander 14 thay vì 15:** `npm install commander` cài bản mới nhất 15.0.0, nhưng bản này **chỉ hỗ trợ ESM** (`"type": "module"`, cần Node ≥ 22.12). Jest có cơ chế nạp module riêng và thường lỗi với thư viện chỉ ESM; sát deadline nên chọn bản an toàn: **14.0.3** (CommonJS, Node ≥ 20).
- **Jest + ts-jest** chạy file `.ts` trực tiếp trong test; **`tsc`** biên dịch `src/kb` ra `dist/` để chạy chương trình `kb` (bước sau).

### How

| File | Nội dung chính |
|---|---|
| `tsconfig.json` | `strict`, `module: commonjs`, `target: ES2022`, gồm `src/kb/**/*.ts` và `test/kb/**/*.ts` (dùng cho `npm run typecheck`) |
| `tsconfig.build.json` | Chỉ biên dịch `src/kb` → `dist/` (`npm run build`) |
| `jest.config.js` | `preset: 'ts-jest'`, chỉ tìm test trong `test/kb/` (để Jest không chạy nhầm test `node:test` của tuần 2) |
| `package.json` | `test` = `test:tickets` (node:test, 86 test tuần 2) **và** `test:kb` (Jest); thêm `build`, `typecheck`; `coverage` chạy cả hai |

**Test giả** `test/kb/smoke.test.ts` – kiểm tra cùng lúc: TypeScript biên dịch được, Commander nạp được trong Jest, phép so sánh hoạt động:

| Lần chạy | Kết quả |
|---|---|
| `npm test` | tickets: `tests 86 · pass 86` · kb: `Tests: 1 passed` · exit 0 |
| Cố ý sửa thành `1 + 1 = 3` | `Expected: 3 · Received: 2 · Tests: 1 failed` · **exit 1** |
| `npx tsc --noEmit` | OK |
| Sau khi xóa test giả | Jest báo `No tests found` · **exit 1** |

### Kết quả / Ghi chú

- Khác tuần 2: `node --test` với **0 test** vẫn exit 0 ("xanh giả"), còn **Jest với 0 test thì exit 1**. Giữ hành vi này (không bật `--passWithNoTests`) để không bao giờ có "xanh" khi không có test nào chạy. Hệ quả: `npm test` sẽ đỏ cho tới khi có test KB đầu tiên ở bước sau.
- Lần chạy Jest đầu tiên mất khoảng 14 giây (ts-jest biên dịch lần đầu); các lần sau nhanh hơn nhờ cache.
- Commit đề xuất: `chore: set up TypeScript, Jest and Commander for the kb CLI`.

> **Cập nhật Bước 0:** Ngọc commit và push `56ca9fc chore: set up TypeScript, Jest and Commander for the kb CLI`.

---

## Bước 1 – Vòng 1 (`KBClient` + `MockKBClient`): bước Red – bộ test chung cho mọi client

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** `412b3af`, `0e77b9a`

### What

| File | Nội dung |
|---|---|
| `src/kb/domain.ts` | Kiểu dữ liệu: `Document`, `DocumentSummary` (không có `content`), `SearchResult { document, matchType }`, `KBQuery { query, filters, topK }`, `ListQuery`, `NewDocument` |
| `src/kb/client.ts` | Interface `KBClient`: `search`, `list`, `retrieve`, `add` (đều trả `Promise` vì client HTTP phải chờ mạng) |
| `src/kb/mockClient.ts` | Stub `MockKBClient`: 4 hàm chưa làm gì |
| `test/kb/contract.ts` | **Bộ test chung** `describeKBClient(name, makeClient)` – 16 test K1–K16 |
| `test/kb/mockClient.test.ts` | Chạy bộ test chung với `MockKBClient` |

Kèm theo: tăng tốc Jest (xem How).

### Why

- **Một bộ test, nhiều client:** đề yêu cầu mock và HTTP client *"follows the same behavior"*, *"Same behavior = easy to compare and test"*. Viết luật thành hàm `describeKBClient` thì ở vòng HTTP chỉ cần một dòng `describeKBClient('HTTPKBClient', …)` – nếu HTTP client cư xử khác mock, chính các test này sẽ đỏ (đúng gợi ý của đề: *"Mock vs real API behavior differs? → Add a failing test that shows the difference"*).
- **Test khớp từng luật trong `DECISIONS.md` §3**, dùng 3 tài liệu mẫu được chọn có chủ đích để mỗi luật có dữ liệu "khớp" và "không khớp":
  - K2 `email`: khớp **tag** ở doc-001, khớp **nội dung** ở doc-003 → kiểm tra `matchType` và thứ tự tag trước nội dung;
  - K3 `team`: khớp **tiêu đề** ở doc-002, **nội dung** ở doc-001 và doc-003 → thứ tự theo loại khớp rồi theo id;
  - K10 `/temp`: chung tiền tố với `/templates` nhưng **không** phải node cha → không được khớp nhầm.
- **Đã áp dụng bài học tuần 2** ngay khi viết test: K15 kiểm tra cả việc thêm thành công lẫn đọc lại được; K16 (lỗi) kiểm tra **không thêm gì** vào kho – điều kiện "không có gì thay đổi" kèm dữ liệu cụ thể để không xanh giả.
- Test so `name`/`code` của lỗi bằng chuỗi (`KBValidationError` / `INVALID_INPUT`, `KBNotFoundError` / `NOT_FOUND`) → chưa cần file lỗi; lớp lỗi sẽ được tạo ở bước Green.

### How

**Kết quả Red** (`npx jest`):

```
Tests: 16 failed, 16 total
```

Lý do đỏ của từng test đều là **assertion**, không có `TypeError`:

| Test | Lý do đỏ |
|---|---|
| K1–K6, K9–K11, K15 | `expect(received).toEqual(expected)` – stub trả `undefined` |
| K7 | `expect(received).not.toHaveProperty(path)` – không có kết quả để kiểm tra |
| K13 | `expect(received).toMatchObject(expected)` |
| K8, K12, K14, K16 | `expect(received).rejects.toMatchObject()` – stub không báo lỗi |

`npx tsc --noEmit`: OK (stub đúng kiểu với interface).

**Tăng tốc Jest:** lần chạy đầu mất **27 giây** – ts-jest vừa dịch vừa kiểm tra kiểu từng file, lại trong thư mục OneDrive. Bật `"isolatedModules": true` trong `tsconfig.json` → ts-jest chỉ **dịch** (không kiểm tra kiểu); việc kiểm tra kiểu đã có `npm run typecheck`. Đo lại: lần đầu 17 s, **các lần sau 6 s** (có cache). Kết quả test không đổi (16 đỏ).

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do.
- Commit đề xuất – **2 commit**, để thay đổi cấu hình không lẫn vào commit Red:
  1. `chore: speed up Jest by transpiling only` – `tsconfig.json`, `jest.config.js`;
  2. `test(kb): add failing contract tests for the KB client` – `src/kb`, `test/kb`, `docs2/history.md`.

> **Cập nhật Bước 1:** Ngọc commit `412b3af chore: speed up Jest by transpiling only` và `0e77b9a test(kb): add failing contract tests for the KB client`.

---

## Bước 2 – Vòng 1: bước Green – `MockKBClient` chạy thật

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết code (theo yêu cầu); Ngọc review và commit · **Commit:** `39adc9a`

### What

| File | Nội dung |
|---|---|
| `src/kb/errors.ts` | `KBError` (có `code`), `KBValidationError` (`INVALID_INPUT`), `KBNotFoundError` (`NOT_FOUND`) |
| `src/kb/mockClient.ts` | `SEED_DOCUMENTS` (3 tài liệu mẫu) + `MockKBClient` cài đủ 4 hàm theo `DECISIONS.md` §3 |
| `docs2/DECISIONS.md` | Bảng dữ liệu mẫu: doc-003 có tag `guide, onboarding` cho khớp với test |

**Không sửa test.**

### Why

- **Chỉ viết đủ để test xanh:** chưa có lỗi kết nối hay lỗi API, vì những lỗi đó chỉ cần cho `HTTPKBClient` ở vòng 4.
- **Nội dung tài liệu mẫu được chọn theo test**, ví dụ doc-001 và doc-003 có chữ "team" trong nội dung (K3), còn doc-003 có chữ "email" trong nội dung (K2).
- **Mỗi client có bản sao dữ liệu riêng** (`documents.map(copy)`), nên `add` ở test này không làm bẩn test khác. Ở vòng 3, server tham chiếu sẽ dùng lại chính `MockKBClient` làm kho dữ liệu.
- **Tên lỗi lấy từ `new.target.name`**, nên lớp con tự có `name` đúng (`KBValidationError`…) mà không phải viết tay.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 16 passed, 16 total
```

**Kiểm tra đột biến** (cố tình làm hỏng code, xem test có đỏ không, rồi trả lại code cũ):

| # | Làm hỏng | Test đỏ |
|---|---|---|
| M1 | `list` bỏ ranh giới `/` (`startsWith(node)`) → `/temp` khớp nhầm `/templates` | K10 |
| M2 | Bỏ sắp xếp theo loại khớp, chỉ sắp theo id | K3, K4 |
| M3 | Không bỏ tag trùng | K15 |
| M4 | Không kiểm tra `title` rỗng | K16 |
| M5 | Cho phép `topK` không phải số nguyên (1.5) | K8 |
| M6 | Dùng chung mảng dữ liệu mẫu thay vì bản sao | K16 (doc-004 của K15 lọt sang) |

6/6 đột biến bị bắt. Trả code cũ → 16/16 xanh.

### Kết quả / Ghi chú

- ✅ Vòng 1 xanh. Chưa cần Refactor: code ngắn, mỗi luật là một hàm nhỏ.
- Commit đề xuất: `feat(kb): add an in-memory mock KB client`.

> **Cập nhật Bước 2:** Ngọc commit `39adc9a feat(kb): add an in-memory mock KB client`.

---

## Bước 3 – Vòng 2 (4 lệnh `kb`): bước Red

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** `b28a172`

### What

| File | Nội dung |
|---|---|
| `src/kb/cli.ts` | Interface `KBCliIO { client, stdout, stderr, readFile }` + stub `run(argv, io)` (luôn trả 0, không in gì) |
| `test/kb/cli.test.ts` | 16 test C1–C16 cho `kb search / list / retrieve / add`, lỗi và `--help` |
| `docs2/DECISIONS.md` | §7: thêm mẫu output của từng lệnh; bỏ `--tags` khỏi `kb search` (đề không yêu cầu lọc theo tag) |

### Why

- **Giống tuần 2:** `run(argv, io)` trả về exit code; mọi thứ bên ngoài (client, màn hình, đọc file) đi qua `io` → test chạy trong bộ nhớ, nhanh, không cần file thật hay server.
- Test dùng **`MockKBClient` thật** (đã xanh ở vòng 1) chứ không dùng client giả riêng → test CLI kiểm tra đúng cách lệnh nối với client.
- Mỗi luật exit code trong `DECISIONS.md` §7 có ít nhất một test:

| Exit | Test |
|---|---|
| 0 | C1–C3, C6, C8, C10, C11, C15 (`--help`) |
| 1 | C9 (id không có), C12 (file không đọc được), C16 (lỗi bất ngờ, một dòng, không stack trace) |
| 2 | C4 (`--top-k` 0 / -1 / 1.5 / abc), C5 (thiếu query), C7 (node sai, limit 0), C13 (thiếu `--path`, path sai), C14 (lệnh lạ, không có lệnh) |

- Các test lỗi kiểm tra cả **"không có gì thay đổi"** (C12, C13: vẫn chỉ có 3 tài liệu) và **stdout rỗng** (C4, C9).
- Trước khi viết test, đã thử nhanh Commander 14: `--top-k -1` được nhận là giá trị (không bị coi là option lạ); thiếu tham số, option bắt buộc, lệnh lạ đều ném `CommanderError` → bắt được để trả exit 2.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 16 failed, 16 passed, 32 total
```

16 test contract vẫn xanh; 16 test CLI đỏ, tất cả vì **assertion** (`toEqual`, `toBe`, `toMatch`) – stub trả 0 và không in gì.

Lúc đầu C11 đỏ vì `KBNotFoundError` (đọc `doc-004` khi chưa được thêm) – đúng hành vi còn thiếu nhưng thông báo khó hiểu. Đã thêm kiểm tra exit code và dòng `Added doc-004: …` trước → giờ C11 đỏ ở `toEqual`.

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do.
- Commit đề xuất: `test(kb): add failing tests for the kb commands`.

> **Cập nhật Bước 3:** Ngọc commit `b28a172 test(kb): add failing tests for the kb commands`.

---

## Bước 4 – Vòng 2: bước Green – 4 lệnh `kb` bằng Commander

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết code (theo yêu cầu); Ngọc review và commit · **Commit:** `05fd81f`

### What

`src/kb/cli.ts` – `run(argv, io)` dựng chương trình Commander với 4 lệnh `search`, `list`, `retrieve`, `add`, gọi `io.client` và in kết quả theo mẫu ở `DECISIONS.md` §7. **Không sửa test.**

### Why

- **Commander lo phần cú pháp:** đọc tham số, option bắt buộc, `--help` cho từng lệnh, báo lệnh lạ. Code của mình chỉ còn: gọi client và in kết quả.
- **`exitOverride()`:** Commander mặc định gọi `process.exit` → test sẽ dừng cả Jest. Bật `exitOverride` thì Commander **ném** `CommanderError`, `run` bắt và trả exit code (giống tuần 2: `run` không bao giờ tự thoát).
- **`configureOutput`:** Commander in qua `io.stdout` / `io.stderr` (không in thẳng ra màn hình) và đổi `error:` thành `Error:` cho giống quy ước tuần 2.
- **Chọn exit code theo loại lỗi** (một chỗ duy nhất, trong `run`):

| Lỗi | Exit |
|---|---|
| `CommanderError` (lệnh lạ, thiếu tham số, `--top-k` sai…) | 2 (riêng `--help` → 0) |
| `KBValidationError` (client từ chối: node path sai, limit 0…) | 2 |
| `KBError` khác (`KBNotFoundError`, file không đọc được) | 1 |
| Lỗi bất ngờ | 1, in `Unexpected error: …` một dòng |

- **`--top-k` / `--limit` được kiểm tra ngay ở CLI** (`positiveInteger`), không đợi client: nếu để `"abc"` thành `NaN` rồi gửi qua HTTP, JSON sẽ biến `NaN` thành `null` → server hiểu là "không có topK". Kiểm tra sớm thì mock và HTTP cho cùng một thông báo lỗi.
- **`--node` không kiểm tra ở CLI** mà để client báo (`KBValidationError`) → luật node path chỉ nằm ở một chỗ.
- File không đọc được → bọc thành `KBError('cannot read file "…"')` → exit 1, không lộ thông báo `ENOENT` của hệ điều hành.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 32 passed, 32 total
```

**Kiểm tra đột biến** (chạy `test/kb/cli.test.ts`, trả code cũ sau mỗi lần):

| # | Làm hỏng | Test đỏ |
|---|---|---|
| M1 | Mọi `CommanderError` → exit 2 (kể cả `--help`) | C15 |
| M2 | Bỏ nhánh `KBValidationError` (rơi xuống exit 1) | C7, C13 |
| M3 | `positiveInteger` không kiểm tra số nguyên | C4 |
| M4 | Không bọc lỗi đọc file | C12 |
| M5 | Không lấy tiêu đề từ dòng `# heading` | C10 |
| M6 | Không tách `--tags` theo dấu phẩy | C10 |
| M7 | Giữ nguyên `error:` của Commander | C4, C5, C7, C13, C14 |

7/7 đột biến bị bắt. Ghi chú: lần chạy đầu, 3 đột biến (M3, M4, M5) không áp dụng được vì lệnh `sed` escape sai / làm hỏng cú pháp (Jest báo `0 total`) → chạy lại bằng script Node thay chuỗi chính xác (`MSYS_NO_PATHCONV=1` cho chuỗi bắt đầu bằng `/`).

### Kết quả / Ghi chú

- ✅ Vòng 2 xanh. Chưa cần Refactor: mỗi lệnh 5–10 dòng, phần định dạng output đã tách thành hàm nhỏ (`summaryLine`, `detailLines`).
- Lệnh `kb` chưa chạy được từ terminal (chưa có file bin) – làm ở vòng 5.
- Commit đề xuất: `feat(kb): add the kb search, list, retrieve and add commands`.

> **Cập nhật Bước 4:** Ngọc commit `05fd81f feat(kb): add the kb search, list, retrieve and add commands`.

---

## Bước 5 – Vòng 3 (KB server tham chiếu): bước Red

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** `c679a74`

### What

| File | Nội dung |
|---|---|
| `src/kb/server.ts` | Stub `createKBServer(client = new MockKBClient())` – trả về `http.Server` luôn trả 501 |
| `test/kb/server.test.ts` | 10 test S1–S10 cho API contract (`DECISIONS.md` §4), gọi bằng **HTTP thật** (`fetch`) |

### Why

- **Không có URL KB server thật** (`DECISIONS.md` §5) → tự viết server tham chiếu theo đúng contract. Vòng 4 sẽ chạy `HTTPKBClient` với server này.
- **Server không tự có luật nghiệp vụ:** nó nhận một `KBClient` (mặc định `MockKBClient`) và chỉ làm phần HTTP – đọc JSON, gọi client, trả status + JSON. Luật search/list/add chỉ nằm ở một chỗ (mock), nên mock và "server thật" không thể lệch nhau.
- **Test bằng HTTP thật trên cổng ngẫu nhiên** (`listen(0)`): kiểm tra đúng những gì client sẽ thấy (status, `Content-Type`, JSON), không phụ thuộc cổng 3000 có đang bị dùng hay không. Mỗi test một server mới → dữ liệu không lẫn giữa các test; `afterEach` đóng server để Jest thoát gọn.
- Mỗi dòng của contract có test:

| Contract | Test |
|---|---|
| `/search` 200 `{ results: [{ id, title, nodePath, tags, matchType }] }` | S1, S2 (có `filters`) |
| `/list` 200 `{ documents }` | S3 |
| `/retrieve` 200 `{ document }` | S4 |
| `/add` 201 `{ document }` | S5 |
| 400 `INVALID_INPUT` | S6 (luật của client), S7 (JSON hỏng, không phải object, sai kiểu trường) |
| 404 `NOT_FOUND` | S8 (id không có), S9 (endpoint lạ, method khác POST) |
| 500 `INTERNAL` | S10 – thông báo chung, **không lộ** chi tiết lỗi bên trong |

- S7 cần thiết vì server nhận dữ liệu từ bên ngoài: `{ "query": 5 }` không được làm server sập (500) mà phải là 400.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 10 failed, 32 passed, 42 total   (3,6 s, không treo)
```

10 test server đỏ, tất cả vì **assertion** (`toBe` / `toEqual` trên status – stub trả 501). 32 test cũ vẫn xanh.

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do.
- Commit đề xuất: `test(kb): add failing tests for the reference KB server`.

> **Cập nhật Bước 5:** Ngọc commit `c679a74 test(kb): add failing tests for the reference KB server`.

---

## Bước 6 – Vòng 3: bước Green – KB server tham chiếu chạy thật

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết code (theo yêu cầu); Ngọc review và commit · **Commit:** `fad805c`

### What

| File | Nội dung |
|---|---|
| `src/kb/server.ts` | `createKBServer(client)`: 4 route `POST /search`, `/list`, `/retrieve`, `/add`; đọc body JSON, kiểm tra kiểu từng trường, gọi client, trả status + JSON theo contract |
| `src/kb/startServer.ts` | Điểm chạy: `createKBServer().listen(KB_PORT ?? 3000)` |
| `package.json` | Script `"kb-server": "npm run build && node dist/kb/startServer.js"` |
| `docs2/DECISIONS.md` | §6: thêm biến `KB_PORT` |
| `test/kb/server.test.ts` | S7 thêm 1 trường hợp: `[]` gửi tới `/list` (xem phần kiểm tra đột biến) |

### Why

- **Mọi lỗi → status ở một chỗ** (hàm `handle`): `KBValidationError` → 400 `INVALID_INPUT`, `KBNotFoundError` → 404 `NOT_FOUND`, lỗi khác → 500 `INTERNAL` với thông báo chung (không lộ đường dẫn hay chi tiết bên trong).
- **Endpoint lạ dùng lại `KBNotFoundError`** → cũng ra 404, không cần nhánh riêng.
- **Kiểm tra kiểu trường ngay ở server** (`requiredString`, `optionalNumber`…): dữ liệu từ mạng có thể là bất cứ gì; `{ "query": 5 }` phải ra 400 chứ không được làm `.trim()` hỏng thành 500.
- **`Object.hasOwn(routes, path)`**: cùng bài học tuần 2 – `/toString` không được coi là endpoint.
- **`startServer.ts` tách riêng:** `server.ts` chỉ *tạo* server (test tự chọn cổng), còn việc *lắng nghe cổng 3000* nằm ở file chạy. Server cần build ra `dist/` trước vì Node không chạy trực tiếp TypeScript – script `kb-server` làm cả hai.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 42 passed, 42 total
```

**Kiểm tra đột biến** (`test/kb/server.test.ts`, trả code cũ sau mỗi lần):

| # | Làm hỏng | Test đỏ |
|---|---|---|
| M1 | Chấp nhận mọi method (không chỉ POST) | S9 |
| M2 | Lỗi 500 trả nguyên thông báo lỗi bên trong | S10 |
| M3 | `/add` trả 200 thay vì 201 | S5 |
| M4 | `/search` trả `{ document, matchType }` thay vì phẳng `{ id, …, matchType }` | S1, S2 |
| M5 | Không từ chối body là mảng | **Lần đầu: không đỏ** → sau khi thêm `['/list', '[]']` vào S7: S7 |
| M6 | Không kiểm tra kiểu chuỗi | S7 |
| M7 | Không kiểm tra kiểu số (`topK: "2"`) | **Không đỏ** – xem dưới |
| M8 | Không bắt lỗi JSON hỏng | S7 |

- **M5:** S7 chỉ gửi `[]` tới `/search`, mà ở đó thiếu `query` cũng ra 400 → test không phân biệt được. Gửi `[]` tới `/list` (không có trường bắt buộc) thì chỉ còn bước kiểm tra "phải là object" chặn được → thêm dòng đó vào S7. Đây là **bổ sung test**, không đổi kỳ vọng nào cũ.
- **M7 là đột biến tương đương** (không đổi hành vi): nếu server bỏ qua kiểm tra số, `"2"` vẫn tới client và client từ chối (`Number.isInteger("2")` là `false`) → vẫn 400. Giữ kiểm tra ở server vì thông báo rõ hơn (`"topK" must be a number`) và không phụ thuộc vào client.
- **Một lần chạy không tái hiện được:** ngay sau loạt đột biến, một lần `npx jest` báo `1 failed, 41 passed` (không lưu được tên test). Đã xác nhận file đã được trả đúng (`cmp`), rồi chạy lại **9 lần liên tiếp: đều 42/42**. Ghi lại để theo dõi; nếu gặp lại sẽ lưu output để tìm nguyên nhân.

**Chạy thật** (`KB_PORT=3456 npm run kb-server` rồi `curl`):

```
KB server listening on http://localhost:3456 (in-memory sample data, Ctrl+C to stop)

$ curl -X POST http://localhost:3456/search -d '{"query":"response","topK":5}'
{"results":[{"id":"doc-001","title":"Customer Response Template","nodePath":"/templates/email","tags":["template","email"],"matchType":"title"}]}  [HTTP 200]
$ curl -X POST http://localhost:3456/list -d '{"nodePath":"/templates/email","limit":10}'
{"documents":[{"id":"doc-001","title":"Customer Response Template","nodePath":"/templates/email","tags":["template","email"]}]}  [HTTP 200]
$ curl -X POST http://localhost:3456/retrieve -d '{"docId":"doc-999"}'
{"error":{"code":"NOT_FOUND","message":"document doc-999 not found"}}  [HTTP 404]
$ curl -X POST http://localhost:3456/add -d '{"title":"SMS Reminder","content":"See you tomorrow.","nodePath":"/templates/sms","tags":["SMS"]}'
{"document":{"id":"doc-004","title":"SMS Reminder","content":"See you tomorrow.","nodePath":"/templates/sms","tags":["sms"]}}  [HTTP 201]
$ curl -X POST http://localhost:3456/search -d '{"query":""}'
{"error":{"code":"INVALID_INPUT","message":"query must not be empty"}}  [HTTP 400]
$ curl http://localhost:3456/search  (GET)
{"error":{"code":"NOT_FOUND","message":"unknown endpoint GET /search"}}  [HTTP 404]
```

Ghi chú Windows: dừng `npm run kb-server` từ công cụ chạy nền chỉ dừng `npm`, tiến trình `node` con vẫn giữ cổng → phải dừng nó theo PID (`Get-NetTCPConnection -LocalPort 3456`). Khi chạy tay trong terminal, `Ctrl+C` dừng cả hai.

### Kết quả / Ghi chú

- ✅ Vòng 3 xanh; server chạy thật đúng contract.
- Commit đề xuất: `feat(kb): add a reference KB server for the API contract`.

> **Cập nhật Bước 6:** Ngọc commit `fad805c feat(kb): add a reference KB server for the API contract`.

---

## Bước 7 – Vòng 4 (`HTTPKBClient`): bước Red

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** `27aa633`

### What

| File | Nội dung |
|---|---|
| `src/kb/httpClient.ts` | `HTTPKBClientOptions { baseUrl, debug? }` + stub `HTTPKBClient` (4 hàm chưa làm gì) |
| `test/kb/httpServers.ts` | Helper cho test: `startKBServer` (server tham chiếu, cổng ngẫu nhiên), `startFakeServer` (server trả response tùy ý), `unusedUrl` (URL không có ai nghe), `stopServers` |
| `test/kb/httpClient.test.ts` | Bộ test chung K1–K16 chạy với `HTTPKBClient` + 6 test H1–H6 riêng cho HTTP |
| `docs2/DECISIONS.md` | §4: bảng "HTTP → lỗi nào → exit code nào" của `HTTPKBClient` |

### Why

- **Một dòng là có 16 test:** `describeKBClient('HTTPKBClient', …)` – đúng như kế hoạch ở vòng 1. Nếu HTTP client cư xử khác mock ở bất kỳ luật nào, test đó đỏ (đề: *"Mock vs real API behavior differs? → Add a failing test that shows the difference"*).
- **HTTP thật, không mock `fetch`:** client gửi request thật tới server tham chiếu → kiểm tra cả cách gửi (method, đường dẫn, JSON) lẫn cách đọc response.
- **Những gì server tham chiếu không bao giờ làm thì dùng server giả** (`startFakeServer`): trả HTML thay vì JSON, trả JSON sai cấu trúc – đúng những lỗi có thể gặp với một server thật khác.
- **Test riêng cho HTTP** – những thứ mock không có:

| Test | Tình huống | Kỳ vọng |
|---|---|---|
| H1 | Server không chạy | `KBConnectionError` `CONNECTION_FAILED`, message có URL |
| H2 | Server lỗi 500 | `KBApiError` `INTERNAL`, `status: 500` |
| H3 | Response không phải JSON / sai cấu trúc | `KBApiError` `BAD_RESPONSE` |
| H4 | `KB_API_URL` có `/` ở cuối | vẫn chạy (không thành `//list`) |
| H5 | `debug` | mỗi request/response một dòng `[kb] → …` / `[kb] ← …` (đề: *"logging to debug integration issues"*) |
| H6 | `debug` khi mất kết nối | có dòng `[kb] ✗ …` |

- `unusedUrl()`: mở server ở cổng ngẫu nhiên rồi đóng ngay → có một cổng chắc chắn không ai nghe, không đoán bừa cổng.
- Helper để ở file riêng; `server.test.ts` (vòng 3) vẫn dùng helper cũ của nó – có thể gộp ở bước Refactor sau, không làm trong bước Red.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 22 failed, 42 passed, 64 total
```

22 test mới đều đỏ vì **assertion** (`toEqual`, `rejects.toMatchObject`, `rejects.toThrow`…). Lúc đầu H4 đỏ vì `TypeError` (gọi `.map` trên `undefined`) → đổi thành `?.map` để đỏ ở `toEqual`.

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do.
- Commit đề xuất: `test(kb): add failing tests for the HTTP KB client`.

> **Cập nhật Bước 7:** Ngọc commit `27aa633 test(kb): add failing tests for the HTTP KB client`.

---

## Bước 8 – Vòng 4: bước Green – `HTTPKBClient` bằng `fetch`

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết code (theo yêu cầu); Ngọc review và commit · **Commit:** `7f58a8d`

### What

| File | Nội dung |
|---|---|
| `src/kb/errors.ts` | Thêm `KBConnectionError` (`CONNECTION_FAILED`) và `KBApiError` (code của server hoặc `BAD_RESPONSE`, kèm `status`) |
| `src/kb/httpClient.ts` | `HTTPKBClient`: 4 hàm gọi chung một hàm `post(path, body)`; `fetch` có sẵn trong Node 24, không cần thư viện |

**Không sửa test.**

### Why

- **Mọi kết quả HTTP được xử lý ở một chỗ** (`post`), theo bảng ở `DECISIONS.md` §4: không kết nối được → `KBConnectionError`; 400 → `KBValidationError`; 404 → `KBNotFoundError`; 5xx / status lạ → `KBApiError`; JSON hỏng → `KBApiError BAD_RESPONSE`. Nhờ vậy CLI (vòng 2) **không cần sửa gì**: lỗi mới đều là `KBError` → exit 1, còn 400 là `KBValidationError` → exit 2.
- **Không tin dữ liệu từ mạng:** kiểm tra cấu trúc response (`isSummary`, `documentFrom`) và chỉ giữ đúng các trường cần thiết → server khác có gửi thêm trường lạ cũng không lọt vào kết quả.
- **Thông báo lỗi kết nối có lý do thật:** `fetch` chỉ báo `fetch failed`; lý do hữu ích (`ECONNREFUSED`, `ENOTFOUND`) nằm trong `err.cause` → đưa vào message và dòng debug.
- **`debug` là một hàm truyền vào** (mặc định không làm gì) thay vì đọc thẳng `KB_DEBUG` → test kiểm tra được từng dòng log; việc đọc biến môi trường để ở vòng 5.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 64 passed, 64 total   (chạy 3 lần: đều 64/64, ~3,3 s)
```

**Kiểm tra đột biến** (`test/kb/httpClient.test.ts`, trả code cũ sau mỗi lần):

| # | Làm hỏng | Test đỏ |
|---|---|---|
| M1 | Không bỏ `/` cuối của `baseUrl` | H4 |
| M2 | Không đổi 400 thành `KBValidationError` | K8, K12, K16 |
| M3 | Không đổi 404 thành `KBNotFoundError` | K14 |
| M4 | Không gửi `filters` | K5 |
| M5 | Không kiểm tra response là JSON | H3 |
| M6 | Không kiểm tra cấu trúc `/list` | H3 |
| M7 | Bỏ dòng debug của request | H5, H6 |
| M8 | Bỏ dòng debug khi mất kết nối | H6 |
| M9 | Không bọc lỗi kết nối | H1 |
| M10 | Để lọt trường `matchType` vào `document` | K1 |
| M11 | Message 5xx thiếu status | H2 |

11/11 đột biến bị bắt. Riêng M2–M4, M10 là các test **chung** (K…) bắt được – đúng mục đích của bộ test chung: HTTP client cư xử khác mock là đỏ.

### Kết quả / Ghi chú

- ✅ Vòng 4 xanh: `HTTPKBClient` qua cùng 16 luật với mock + 6 test riêng cho HTTP.
- Commit đề xuất: `feat(kb): add an HTTP KB client using fetch`.

> **Cập nhật Bước 8:** Ngọc commit `7f58a8d feat(kb): add an HTTP KB client using fetch`.

---

## Bước 9 – Vòng 5 (chọn client qua biến môi trường + lệnh `kb` thật): bước Red

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** `6a2e22c`

### What

| File | Nội dung |
|---|---|
| `src/kb/environment.ts` | Stub `clientFromEnv(env, debugOut)` – sẽ chọn `MockKBClient` / `HTTPKBClient` theo `KB_CLIENT`, `KB_API_URL`, `KB_DEBUG` |
| `src/kb/main.ts` | Stub điểm chạy (chưa làm gì) |
| `bin/kb.js` | File lệnh `kb` (giống `bin/tickets.js` tuần 2): chỉ gọi `../dist/kb/main` đã build |
| `test/kb/environment.test.ts` | 6 test E1–E6 cho `clientFromEnv` |
| `test/kb/e2e.test.ts` | 6 test X1–X6 chạy **lệnh `kb` thật** trong process riêng (như người dùng gõ) |

### Why

- **Đề:** *"KBClient interface with Mock and HTTP implementations, swappable via environment variable"* → E1–E6 kiểm tra từng biến:

| Test | Biến | Kỳ vọng |
|---|---|---|
| E1, E2 | không có / `KB_CLIENT=" Mock "` | `MockKBClient` (đọc không phân biệt hoa thường, bỏ khoảng trắng) |
| E3 | `KB_CLIENT=http` + `KB_API_URL` | `HTTPKBClient` gọi đúng server đó |
| E4 | `KB_CLIENT=http`, không có `KB_API_URL` | gọi `http://localhost:3000` (mặc định ở `DECISIONS.md` §6) |
| E5 | `KB_DEBUG=1` / không có | có / không có dòng debug |
| E6 | `KB_CLIENT=sql` | `KBValidationError` → lỗi cách dùng |

- **`clientFromEnv` nhận `env` làm tham số** (không đọc thẳng `process.env`) → test truyền object nhỏ, không phải sửa biến môi trường thật của Jest.
- **E2E (X1–X6)** kiểm tra phần unit test không thấy được: `bin/kb.js` chạy được, đọc **file thật**, biến môi trường thật, exit code thật tới shell, stdout/stderr thật. X2 thêm tài liệu qua lệnh này rồi tìm lại bằng lệnh khác → chứng minh hai lần gọi dùng **cùng một server**.
- **`execFile` (bất đồng bộ), không dùng `spawnSync`:** server tham chiếu chạy ngay trong process của Jest; `spawnSync` chặn process → server không trả lời được → lệnh `kb` treo.
- **E2E tự build trước (`beforeAll`)** → không bao giờ chạy nhầm bản `dist/` cũ. Process con chỉ nhận đúng biến `KB_*` mà test đưa (lọc hết `KB_*` của máy).
- **Lệnh `kb` là `bin/kb.js` gọi `dist/`:** Node không chạy trực tiếp TypeScript → code TS được build ra `dist/` (đã có trong `.gitignore`).

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 12 failed, 64 passed, 76 total   (~7 s, gồm cả lần build trong e2e)
```

12 test mới đều đỏ vì **assertion**: E1–E4 `toBeInstanceOf` (stub trả `undefined`), E6 `toThrow`; X1–X6 `toEqual`/`toMatch` (stub `main.ts` không in gì, exit 0). Lúc đầu E5 đỏ vì `TypeError` (gọi `.list` trên `undefined`) → thêm `toBeInstanceOf` trước để đỏ ở assertion.

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do.
- Commit đề xuất: `test(kb): add failing tests for client selection and the kb command`.

> **Cập nhật Bước 9:** Ngọc commit `6a2e22c test(kb): add failing tests for client selection and the kb command`.

---

## Bước 10 – Vòng 5: bước Green – lệnh `kb` chạy thật, đổi client bằng biến môi trường

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết code và chạy thử (theo yêu cầu); Ngọc review và commit · **Commit:** `fc3ba74`

### What

| File | Nội dung |
|---|---|
| `src/kb/environment.ts` | `clientFromEnv`: `KB_CLIENT` (mặc định `mock`) → `MockKBClient` / `HTTPKBClient(KB_API_URL ?? http://localhost:3000)`; `KB_DEBUG=1` → bật log; giá trị lạ → `KBValidationError` |
| `src/kb/main.ts` | Nối CLI với thế giới thật: `process.argv`, `process.env`, stdout/stderr, `fs.readFile(…, 'utf8')`; đặt `process.exitCode` |
| `package.json` | `bin.kb = ./bin/kb.js`; `"prepare": "npm run build"` (npm tự build khi `npm install` / `npm link`) |
| `test/kb/e2e.test.ts` | X2 dùng tiêu đề tiếng Việt `Nhắc lịch hẹn` (xem kiểm tra đột biến) |

### Why

- **`main.ts` mỏng, giống `bin/tickets.js` tuần 2:** mọi logic nằm ở `run` và `clientFromEnv` (đã có unit test); `main` chỉ nối dây.
- **`KB_CLIENT` sai → exit 2** (lỗi cách dùng), in một dòng `Error: …`, giống các lỗi dùng sai khác.
- **`process.exitCode` thay vì `process.exit()`:** để Node tự thoát sau khi in xong hết stdout/stderr (không bị cắt output khi chuyển qua pipe).
- **`prepare`:** người khác clone repo chỉ cần `npm install` là có `dist/` – không phải nhớ chạy `npm run build`.

### How

```
npx tsc --noEmit   → OK
npx jest           → Tests: 76 passed, 76 total
npm test           → tickets: tests 86, pass 86, fail 0 · kb: Tests 76 passed (exit 0)
```

**Kiểm tra đột biến** (`environment.test.ts` + `e2e.test.ts`; e2e tự build lại nên chạy đúng code bị sửa):

| # | Làm hỏng | Test đỏ |
|---|---|---|
| M1 | Mặc định `http` thay vì `mock` | E1, X1 |
| M2 | Không bỏ khoảng trắng / không chuyển chữ thường | E2 |
| M3 | Bỏ qua `KB_API_URL` | E3, E5, X2, X3, X4 |
| M4 | Luôn bật debug | E5, X2, X3 |
| M5 | Sai URL mặc định (3001) | E4 |
| M6 | `KB_CLIENT` sai → exit 1 | X5 |
| M7 | Không đặt `process.exitCode` | X3, X5, X6 |
| M8 | Đọc file bằng `latin1` thay vì `utf8` | **Lần đầu: không đỏ** → sau khi đổi X2 sang tiêu đề tiếng Việt: X2 |

- **M8:** file trong X2 chỉ có chữ ASCII → đọc bằng `latin1` hay `utf8` ra giống nhau → test không phát hiện. Với người dùng Việt Nam đây là lỗi thật (`Nhắc` sẽ thành `NhÄ\u0083c`). Đổi tiêu đề file trong X2 thành `# Nhắc lịch hẹn` → M8 đỏ. Đây là **bổ sung dữ liệu test**, không đổi hành vi được kiểm tra.
- Lần thay chuỗi đầu tiên cho X2 escape sai (`\n`) nên **không thay gì** – đã phát hiện vì script báo `no match` và M8 vẫn xanh; làm lại bằng công cụ Edit.

**Chạy thật** (`npm link`, PowerShell):

Mock (mặc định):

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
Path:  /templates/email
Tags:  template, email

# Customer Response Template
…
exit 0
PS> kb retrieve doc-999
Error: document doc-999 not found
exit 1
PS> kb search team --top-k 0
Error: option '--top-k <n>' argument '0' is invalid. It must be a positive whole number.
exit 2
```

HTTP (server tham chiếu ở cổng 3457):

```
PS> $env:KB_CLIENT="http"; $env:KB_API_URL="http://localhost:3457"
PS> kb add --file new-template.md --path /templates/sms --tags sms
Added doc-004: SMS Appointment Reminder (/templates/sms)
exit 0
PS> kb list --node /templates
doc-001  Customer Response Template  /templates/email  [template, email]
doc-004  SMS Appointment Reminder  /templates/sms  [sms]
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

Bốn lệnh mẫu trong `tasks.md` (`kb search "response" --top-k 3`, `kb list --node /templates/email --limit 10`, `kb retrieve doc-001`, `kb add --file new-template.md --path /templates/sms --tags sms`) đều chạy đúng.

### Kết quả / Ghi chú

- ✅ Vòng 5 xanh – xong toàn bộ phần code. Còn lại: README phần KB, `docs2/TEST-RESULTS.md`, đối chiếu AC.
- Ở chế độ mock, dữ liệu nằm trong bộ nhớ → `kb add` chỉ có tác dụng trong lần chạy đó; muốn giữ dữ liệu giữa các lệnh thì dùng `KB_CLIENT=http` với server (sẽ ghi rõ trong README).
- Commit đề xuất: `feat(kb): add the kb command with client selection by environment`.


> **Cập nhật Bước 10:** Ngọc commit `fc3ba74 feat(kb): add the kb command with client selection by environment`.

---

## Bước 11 – Tài liệu: README phần `kb`, TEST-RESULTS, đối chiếu AC

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết tài liệu và chạy kiểm chứng (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

| File | Nội dung |
|---|---|
| `README.md` | Đổi tên thành *Ticket Manager & Knowledge Base CLI*; thêm mục **Knowledge Base CLI (`kb`)**: sơ đồ kiến trúc (CLI → `KBClient` → Mock / HTTP → KB server) kèm lý do của từng phần, Setup (mock cho development, HTTP cho production), biến môi trường, 4 lệnh, exit code, **API contract** (request/response, lỗi, ví dụ `curl`). Cập nhật Requirements, Installation (`npm install` + `npm link`), Running the tests, Project structure, Documentation, Known limitations |
| `docs2/TEST-RESULTS.md` | Kết quả kiểm chứng được: output đầy đủ `jest --verbose`, coverage, 40 đột biến, lỗ hổng đã lấp, chạy thật, clone sạch, đối chiếu 4 AC và Deliverables của `tasks.md`, lịch sử commit |

### Why

- **Đề (Day 5):** *"Diagram: CLI → KB client interface → MockKBClient/HTTPKBClient"*, *"Document API contract"*, *"How to run with mock client (development) / HTTP client (production)"*, *"Environment variable configuration"* → mỗi yêu cầu có một mục trong README.
- **Tips của đề:** *"Why each piece exists (not just what)"*, *"Show data flow"*, *"Include API examples"* → bảng "Why each piece exists", dòng Data flow, ví dụ `curl` và `KB_DEBUG`.
- **Trung thực về AC 4:** ghi rõ là không được cấp URL KB thật, đã kiểm chứng với server tham chiếu, và một server thật cần gì (đúng contract) – ở README (Known limitations) và TEST-RESULTS (mục 8).
- **Giữ cách làm tuần 2** được mentor khen: bằng chứng chạy thật, tái hiện được.

### How

Mọi con số và ví dụ trong tài liệu đều được **chạy lại để lấy**, không viết theo trí nhớ:

| Kiểm chứng | Kết quả |
|---|---|
| `npx jest --coverage --verbose` | 76 pass; 99,67 % dòng, 85,15 % nhánh |
| `npm run test:unit` / `test:integration` | 70 / 16 → tickets 86 |
| Coverage tickets (`node --test --experimental-test-coverage`) | 100 % dòng, **100 % nhánh** |
| Ví dụ trong README: `kb list --node /team`, `kb search --help`, `KB_CLIENT=HTTP` khi server tắt | đúng như README |
| Clone sạch tại `fc3ba74` → `npm install` → `npm test` → `node bin/kb.js search …` | chưa có `dist/` → `npm install` tự build; 86 + 76 pass, exit 0; lệnh chạy đúng |

**Phát hiện khi kiểm chứng:**

1. **README cũ ghi sai số liệu tuần 2:** "84 tests (68 unit)" và "99 % of branches", thực tế là **86 tests (70 unit)** và **100 % nhánh** (README chưa được cập nhật sau các test bổ sung cuối tuần 2) → đã sửa.
2. **Git Bash đổi đường dẫn:** `node bin/kb.js list --node /team` trong Git Bash báo `Error: node path must start with "/": C:/Program Files/Git/team` – MSYS tự đổi tham số bắt đầu bằng `/` thành đường dẫn Windows (cùng lỗi đã gặp khi chạy đột biến). Với `MSYS_NO_PATHCONV=1` thì đúng; PowerShell/cmd không bị → ghi vào README (Known limitations).
3. **Sự cố khi ghi log:** lệnh `node -e "…"` dùng để nối đoạn log này vào `history.md` đặt văn bản có dấu backtick trong chuỗi ngoặc kép của bash → bash coi các đoạn trong backtick là lệnh và chạy chúng (các lệnh chỉ đọc hoặc lỗi ngay, không ghi/xóa gì), đồng thời ghi một đoạn log hỏng vào cuối file. Đã cắt file về đúng dòng cuối của Bước 10 (kiểm tra bằng `git diff --stat`: chỉ còn dòng mã commit của Bước 10), rồi viết lại đoạn này qua file tạm. Tương tự, heredoc để tạo `TEST-RESULTS.md` bị lỗi cú pháp → viết bằng công cụ Write, chèn output `jest --verbose` và `git log` thật bằng script (không gõ tay).

### Kết quả / Ghi chú

- ✅ Đủ 4 AC (AC 4 có giới hạn đã ghi rõ) và đủ Deliverables của `tasks.md` – bảng đối chiếu ở `TEST-RESULTS.md` mục 8.
- Commit đề xuất: `docs(kb): document the kb CLI, API contract and test results`.
