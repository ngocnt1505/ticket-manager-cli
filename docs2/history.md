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

**Thời gian:** 2026-10-27 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

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
