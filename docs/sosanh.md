# So sánh: kế hoạch của bạn và cách Claude đã làm

Tài liệu đối chiếu từng mục trong kế hoạch 7 giai đoạn (ảnh chụp) với những gì đã có trong repo, tính đến commit `7ddd323`.

**Ký hiệu**

- ✅ **Giống:** làm đúng như kế hoạch.
- 🟡 **Khác cách:** có làm, nhưng khác hình thức, tên gọi hoặc thứ tự.
- ❌ **Chưa làm.**

> Ảnh đầu tiên bắt đầu từ mục "Sửa `package.json`", nên các mục phía trên của Giai đoạn 1 (nếu có) không được so sánh ở đây.

---

## Tóm tắt nhanh

| Giai đoạn | Mức khớp | Điểm lệch chính |
|---|---|---|
| 1. Khởi tạo | 🟡 | Không có test giả `1 + 1 = 2`; **chưa có GitHub, chưa push**; nhánh đang là `master` chứ không phải `main` |
| 2. Chốt thiết kế | 🟡 | Nội dung đủ, nhưng nằm trong `history.md` thay vì `DECISIONS.md` / `TEST-LIST.md`; **chưa hỏi mentor**, Claude tự chốt |
| 3. Quy tắc vòng TDD | 🟡 | Chỉ vòng đầu (title) là "một test một vòng"; các vòng sau gom nhóm. Tên commit `test(red)` thay vì `test(models)`. Không có checkbox, không có `AI-LOG.md` |
| 4. Xây từ trong ra ngoài | 🟡 | Thứ tự models → **storage → services** → CLI (kế hoạch: services trước storage). Không có `serializeTickets`. Tên `get` thay vì `show`, mã lỗi `TICKET_NOT_FOUND` thay vì `NOT_FOUND` |
| 5. Tài liệu | ✅ | Đủ các mục yêu cầu |
| 6. Kiểm tra trước khi nộp | 🟡 | Coverage và mutation đã làm. **Chưa có `TEST-RESULTS.md`**, chưa clone sạch để thử README |
| 7. Nộp và bảo vệ | ❌ | Chưa push, chưa gửi mail. **Chưa có "chỗ bạn tự sửa code do AI gợi ý"** |

---

## Giai đoạn 1. Khởi tạo dự án

| Mục trong kế hoạch | Trạng thái | Đã làm thực tế |
|---|---|---|
| `package.json`: `bin` + script `test`, `test:unit`, `test:integration`, `coverage`, `engines >= 22` | ✅ | Giống, và có thêm `test:e2e`. `bin` ghi là `bin/tickets.js` (không có `./`); hai cách viết tương đương |
| `.gitignore` gồm `node_modules/`, `coverage/`, `tickets.json` | ✅ | Giống, có thêm `*.tmp` (file tạm khi ghi). Thêm file `.gitattributes` để chuẩn hóa xuống dòng trên Windows |
| Test giả `1 + 1 = 2` để chắc môi trường chạy, rồi xóa | ❌ | Không làm. Môi trường được kiểm tra bằng chính test đầu tiên (đỏ vì thiếu module, nghĩa là runner đã chạy). Không có commit nào chứng minh bước này |
| Tạo repo GitHub (hỏi mentor: repo mới hay dùng chung repo tuần 1) | ❌ | **Chưa có remote nào.** Câu hỏi cho mentor vẫn còn bỏ ngỏ |
| Commit `chore: init project structure`, `git branch -M main`, push | 🟡 / ❌ | Commit đầu là `chore: project skeleton, Week 1 docs and Week 2 test list`; commit này **gộp cả bước khởi tạo lẫn test list** (Giai đoạn 2). Nhánh vẫn là `master`. Chưa push |

---

## Giai đoạn 2. Chốt thiết kế trước khi code

| Mục trong kế hoạch | Trạng thái | Đã làm thực tế |
|---|---|---|
| File `docs/DECISIONS.md` | 🟡 | Không có file riêng. Toàn bộ quyết định nằm ở **`history.md` Bước 1** |
| Các trường của ticket | ✅ | Đủ 8 trường như kế hoạch |
| Giá trị status/priority và mặc định `open` / `medium` | ✅ | Giống |
| Title: bắt buộc, trim, ≤ 100 ký tự theo `.length`, phải là chuỗi | ✅ | Giống |
| Tags: cách nhập `--tags bug,ui`, trim, bỏ trùng; lọc nhiều tag | 🟡 | Có làm, và **thêm chuyển chữ thường** (kế hoạch không nói). Cách lọc nhiều tag **Claude tự chọn "có tất cả" (AND)** |
| `update` sửa được trường nào | 🟡 | **Claude tự chọn: cả 5 trường** (title, description, status, priority, tags). Đề bài chỉ yêu cầu "update status" |
| Định dạng JSON, đường dẫn mặc định, `TICKETS_FILE` | ✅ | Mảng JSON, mặc định `./tickets.json`, ghi đè được bằng `TICKETS_FILE` |
| Thư mục chưa tồn tại (câu hỏi treo từ tuần 1) | ✅ | Chốt: **không tự tạo**, báo lỗi exit 1. Thêm một quyết định: file rỗng được coi là chưa có ticket nào |
| Exit code 0 / 1 / 2 | ✅ | Giống |
| **Hỏi mentor** về cách lọc nhiều tag và phạm vi `update` | ❌ | **Chưa hỏi.** Cả hai điểm đều do Claude tự quyết. Nếu mentor muốn khác (ví dụ lọc tag kiểu OR, hoặc update chỉ đổi status), code và test phải sửa |
| File `docs/TEST-LIST.md` có ô `[ ]` theo từng lớp | 🟡 | Test list (28 mục) là **một bảng trong `history.md` Bước 1**, không có ô `[ ]`, và không được đánh dấu dần trong lúc làm |
| Commit `docs: add design decisions and test list` | 🟡 | Gộp vào commit đầu tiên |

---

## Giai đoạn 3. Quy tắc cho mỗi vòng TDD

| Quy tắc trong kế hoạch | Trạng thái | Đã làm thực tế |
|---|---|---|
| Red: viết **một** test, đỏ đúng lý do (có stub), commit | 🟡 | **Chỉ 4 vòng đầu** (`validateTitle`) làm đúng "một test, một vòng". Từ vòng 5, mỗi vòng Red gom **một nhóm test** cho cùng một hành vi (ví dụ 14 test cho description/status/priority/tags). Stub luôn được thêm để đỏ đúng lý do |
| Green: code tối thiểu, chạy toàn bộ test, commit | ✅ | Giống. Mỗi Green là một commit riêng |
| Refactor (nếu cần), chạy lại, commit | ✅ | 2 commit refactor: đặt tên hằng số `MAX_TITLE_LENGTH`, gộp validate enum thành `oneOf` |
| Tên commit theo dạng `test(models): …`, `feat(models): …`, `refactor(models): …` | 🟡 | Đang dùng `test(red): …`, `feat(green): …`, `refactor: …`. Phần ngoặc là **pha TDD** chứ không phải **lớp** (models/services/…). Vẫn đọc được chuỗi Red → Green, nhưng không đúng quy ước bạn định |
| Đánh dấu `[x]` trong `TEST-LIST.md`; trường hợp mới thì thêm vào danh sách, **không làm ngay** | ❌ / 🟡 | Không có checkbox. Một số trường hợp mới được **làm ngay**, không ghi vào danh sách trước: id trùng, dọn file tạm khi rename lỗi, tham số thừa, `--tags=` |
| `docs/AI-LOG.md`: mỗi lần nhờ AI ghi một dòng (hỏi gì, nhận gì, sửa gì, từ chối gì) | ❌ | Không có file này. `history.md` ghi What/Why/How của Claude, **không phải nhật ký bạn tương tác với AI**. Xem thêm mục "Lưu ý quan trọng" ở cuối |

---

## Giai đoạn 4. Xây dựng theo thứ tự từ trong ra ngoài

**Thứ tự:** kế hoạch là models → services → storage → CLI. Thực tế là models → **storage → services** → CLI.

Kết quả cuối không khác. Service nhận repository qua tham số nên không phụ thuộc thứ tự viết. Tuy vậy, commit history không theo đúng thứ tự trong kế hoạch.

### 4.1 Models

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| Title: trim, rỗng, không phải chuỗi, 100/101 | ✅ | 4 vòng TDD riêng, kèm mutation `>` → `>=` |
| Status, priority: hợp lệ, sai, mặc định | ✅ | Giá trị mặc định được test trong `buildTicket` |
| Tags: tách chuỗi, trim, bỏ trùng, bỏ rỗng | ✅ | Thêm: chữ thường, giới hạn 30 ký tự, tiếng Việt |
| Description: không bắt buộc, giới hạn độ dài | ✅ | Giới hạn 1000 ký tự |
| *(không có trong kế hoạch)* | ➕ | `buildTicket`, `applyUpdate` (validate hết rồi mới đổi, không cho sửa `id`/`createdAt`) |

### 4.2 Services

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| `create`: id = max + 1, `createdAt`, mặc định | ✅ | Thêm: id vẫn đúng khi có lỗ hổng, và sau khi "khởi động lại" |
| `list`: rỗng, sắp xếp, lọc, kết hợp, lọc sai thì báo lỗi | ✅ | |
| `show`: tìm thấy / không tìm thấy → `NOT_FOUND` | 🟡 | Hàm tên là **`get`**, mã lỗi là **`TICKET_NOT_FOUND`** |
| `update`: `updatedAt`, giữ `createdAt`, không đổi một nửa, id không tồn tại | ✅ | Thêm: lỗi thì **không gọi `save`** |
| Logic "trên mảng, chưa đụng file" | 🟡 | Service nhận một **repository giả trong bộ nhớ** (`memoryRepository`), không nhận mảng trực tiếp. Vẫn không đụng file |

### 4.3 Storage

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| Unit test `parseTickets(text)`: rỗng, `{}`, `null`, JSON cắt ngang | ✅ | Thêm: id sai, id trùng |
| Unit test **`serializeTickets(data)`** | ❌ | **Không có hàm này.** `JSON.stringify` nằm luôn trong `save`. Tiếng Việt được test ở **integration** (ghi rồi đọc lại file thật), không phải unit |
| Integration `load` / `save` với file thật: chưa tồn tại, ghi-đọc, file hỏng không ghi đè, ghi lỗi giữ file gốc | ✅ | Thêm: file tạm sót lại, thư mục cha không tồn tại, dọn file tạm khi rename lỗi |
| Dùng lại `save` đã refine ở tuần 1, nhưng viết test trước | 🟡 | **Viết lại từ đầu** với thiết kế khác: tên file tạm cố định, xóa file tạm cũ, mở bằng `'wx'`. Không dùng `realpathSync` / `O_NOFOLLOW` của tuần 1, vì máy Windows này không tạo được symlink để test |

### 4.4 Commands (CLI)

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| `bin/tickets.js` có shebang, đọc `TICKETS_FILE`, gọi commands | 🟡 | `bin` chỉ có 3 dòng: gọi `run()`. **Việc đọc `TICKETS_FILE` nằm ở `src/cli.js`**, để test được mà không cần khởi động tiến trình |
| Unit test commands với stdout/stderr giả | 🟡 | Có (31 test trong `test/integration/cli.test.js`), nhưng được xếp vào **integration** vì chúng đọc ghi file thật trong thư mục tạm |
| Integration test chạy CLI thật bằng `spawnSync` | 🟡 | Có 5 test, nhưng được gọi là **E2E** (`test/e2e/`). Kế hoạch gọi là "integration" |
| `create --title … --priority high --tags bug,ui` | ✅ | |
| `list --status open --tags bug` | 🟡 | Tổ hợp này chỉ có ở test in-process; bản `spawnSync` dùng `list --priority high` |
| `show 1`, `show 99` | ✅ | |
| `update 1 --status done` | ✅ | |
| Lệnh không tồn tại, thiếu tham số, id sai → exit 2 | ✅ | |
| File JSON hỏng → exit 1, dễ hiểu, không stack trace | ✅ | |
| Chạy tay: `npm link` rồi `tickets create --title "Test"` | 🟡 | Dùng `npm install -g . --prefix <thư mục tạm>` (cùng cơ chế, không đụng máy global), **chưa chạy `npm link` thật** |

---

## Giai đoạn 5. Tài liệu

| Mục | Trạng thái |
|---|---|
| Giới thiệu ngắn | ✅ |
| Cài đặt (`git clone`, `npm link`) | ✅ (URL repo đang để `<repository-url>`, cần điền sau khi có GitHub) |
| Cấu hình (`TICKETS_FILE`, đường dẫn mặc định) | ✅ có ví dụ cho cả bash và PowerShell |
| Cách dùng từng lệnh, có output mẫu | ✅ |
| Chạy test (`npm test`, `npm run coverage`) | ✅ |
| Cấu trúc thư mục | ✅ |
| Link tới `docs/` | ✅ |
| Giới hạn đã biết (không chạy song song, …) | ✅ 3 giới hạn |

---

## Giai đoạn 6. Kiểm tra trước khi nộp

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| `npm test` xanh, **lưu output vào `docs/TEST-RESULTS.md`** (hoặc GitHub Actions) | 🟡 / ❌ | Xanh 100/100, nhưng **chưa có `TEST-RESULTS.md`**, chưa có GitHub Actions. Tuần 1 đã bị nhắc đúng điểm này |
| `npm run coverage`, xem dòng chưa test | ✅ | 98.65% → thêm 2 test → 100% dòng / 98.85% nhánh |
| Cố ý làm hỏng 3–5 chỗ, ghi kết quả | ✅ | 9 mutation, ghi trong `history.md`. Trong đó 1 mutation **không bị bắt** và đã dẫn tới thêm test. Chưa có file tổng hợp riêng |
| Clone repo ra thư mục mới, làm đúng README | ❌ | Chưa làm (cần có repo GitHub trước) |
| Đối chiếu 7 Acceptance Criteria | ✅ | `history.md` Bước 10 |
| `git log --oneline` thấy rõ `test:` → `feat:` → `refactor:` | 🟡 | Thấy rõ, nhưng tiền tố là `test(red)` / `feat(green)` |

---

## Giai đoạn 7. Nộp và chuẩn bị bảo vệ

| Mục | Trạng thái | Ghi chú |
|---|---|---|
| Push, mở tab ẩn danh kiểm tra | ❌ | |
| Gửi mail anh Thuận, CC anh Huy | ❌ | |
| Ôn: vì sao chia 4 lớp | ✅ | `history.md` Bước 1, 6, 7 và phần Hỏi–đáp |
| Ôn: vì sao chọn cách test storage như vậy | ✅ | Bước 5, Hỏi–đáp câu 5–6 |
| Ôn: một vòng TDD cụ thể trong commit history | ✅ | Bước 2: 4 vòng `validateTitle`, có hash commit |
| Ôn: **một chỗ đã sửa lại code do AI gợi ý** | ❌ | Xem mục dưới |

---

## Những thứ đã làm mà kế hoạch không có

- Script `test:e2e` và thư mục `test/e2e/`; file `.gitattributes`.
- Cây lớp lỗi (`ValidationError`, `UsageError`, `NotFoundError`, `StorageError`). Exit code được quyết định ở **một chỗ duy nhất**.
- Phát hiện và ghi lại **2 test "xanh giả"** ở bước Red (Bước 4 và 6).
- `--help` cho từng lệnh, thông báo lỗi kèm dòng `Usage:`.
- Phát hiện `--tags ""` không chạy trên PowerShell 5.1 → README dùng `--tags=`.
- Phần Hỏi–đáp 11 câu để ôn bảo vệ.

---

## Lưu ý quan trọng: vai trò của bạn và của AI

Kế hoạch của bạn giả định **bạn là người lái**: bạn viết từng test, nhờ AI ở một số chỗ, rồi ghi vào `AI-LOG.md` những gì đã **nhận, sửa, từ chối**. Thực tế, Claude đã làm **toàn bộ** trong một lượt: thiết kế, test, code, tài liệu. Hệ quả:

1. **Commit history có dòng `Co-Authored-By: Claude`** ở mọi commit. Mentor sẽ thấy ngay là AI viết. Đây là điều trung thực, không nên xóa.
2. **Chưa có bằng chứng bạn kiểm soát AI.** Đây là trọng tâm của khóa học: "you are the architect", review 5 câu hỏi, Iterative Refinement. Mục bảo vệ "một chỗ đã sửa lại code do AI gợi ý" hiện **chưa có câu trả lời thật**. Các lỗi được phát hiện trong `history.md` (xanh giả, mutation lọt, `--tags ""`) đều do **Claude tự phát hiện**, không phải bạn.
3. Những quyết định đáng lẽ phải hỏi mentor (lọc tag, phạm vi `update`) **đã được AI tự chốt**.

Việc bạn có thể làm để lấp khoảng trống này: **review lại code như review code của AI** theo Bảng 8 của Report tuần 1. Ghi những gì bạn đồng ý, không đồng ý hoặc yêu cầu sửa vào `AI-LOG.md`. Những chỗ bạn yêu cầu sửa sẽ là câu trả lời thật cho mục bảo vệ.

---

## Các hướng xử lý (để bạn quyết định)

| Việc | Lựa chọn |
|---|---|
| Tách tài liệu | Tách `history.md` Bước 1 ra `DECISIONS.md` và `TEST-LIST.md` (có ô `[x]`); tạo `AI-LOG.md` |
| Câu hỏi cho mentor | Hỏi: repo mới hay chung tuần 1; lọc tag AND hay OR; `update` đổi những trường nào. Nếu câu trả lời khác thì sửa theo TDD (test đỏ trước) |
| Tên commit | (a) **Giữ nguyên lịch sử** và giải thích quy ước `test(red)` / `feat(green)` trong README. (b) Viết lại lịch sử để thêm scope `models` / `services` …: làm được vì **chưa push**, nhưng là thao tác viết lại lịch sử, nên làm trước khi push hoặc không làm |
| Thiếu sót kỹ thuật so với kế hoạch | Thêm `serializeTickets` + unit test tiếng Việt (vòng TDD mới); thêm test `spawnSync` cho `list --status open --tags bug` |
| Kiểm tra trước khi nộp | Tạo `TEST-RESULTS.md` (output `npm test` + coverage + bảng mutation); thêm GitHub Actions (tùy chọn); đổi `master` → `main`; push; clone sạch và làm theo README; chạy `npm link` thật |
