# Nhật ký dự án – Week 2: Ticket Manager CLI (TDD)

Nguyễn Thúy Ngọc · AI Training, Week 2

File này ghi lại **từng bước** của dự án theo thứ tự thời gian. Người thực hiện là Ngọc; Claude (Claude Code) đóng vai **người hướng dẫn**: giao từng bước, giải thích, review kết quả. Mỗi mục gồm:

- **What** – đã làm gì;
- **Why** – vì sao làm vậy (lý do kỹ thuật, liên hệ nghiên cứu Week 1);
- **How** – làm cụ thể như thế nào (lệnh, file, output chạy thật);
- **Kết quả / Ghi chú** – trạng thái sau bước, quyết định còn treo, góp ý review.

Cuối dự án, nội dung ở đây sẽ được tổng hợp thành báo cáo Week 2.

---

## Bước 0 – Khởi động lại dự án theo kế hoạch 7 giai đoạn

**Thời gian:** 2026-10-21

### What

- Repo được đưa về trạng thái ban đầu: chỉ có `docs/` (tài liệu Week 1, đề bài Week 2) và `package.json` mặc định; lịch sử git được khởi tạo lại, **chưa có commit nào**.
- Dự án sẽ được làm lại từ đầu theo kế hoạch 7 giai đoạn của Ngọc (khởi tạo → chốt thiết kế → quy tắc TDD → xây từ trong ra ngoài → tài liệu → kiểm tra → nộp).

### Why

Trước đó Claude đã tự làm trọn dự án trong một lượt (xem `docs/sosanh.md`). Kết quả chạy được nhưng **không chứng minh được người học kiểm soát AI** – trọng tâm của khóa học ("You are the architect – You design, AI helps implement"). Làm lại để:

- tự viết test, tự chạy, tự commit từng bước Red → Green → Refactor;
- tự chốt (hoặc hỏi mentor) các quyết định thiết kế;
- ghi rõ ai làm từng bước (dòng **Người làm**), để cuối dự án tổng kết được: AI làm gì, Ngọc quyết định gì, sửa gì, từ chối gì.

### How

Claude không viết code thay; mỗi bước Claude giao việc, Ngọc thực hiện, Claude review và ghi log tại đây.

### Kết quả

Sẵn sàng bắt đầu **Giai đoạn 1 – Khởi tạo dự án**.

---

## Bước 1 – Giai đoạn 1: sửa `package.json` (thêm `bin` và script test)

**Thời gian:** 2026-10-21 · **Người làm:** Claude (theo yêu cầu của Ngọc) · **Commit:** chưa

### What

Sửa `package.json`:

- `name`: `week2_cli` → `ticket-manager-cli`;
- thêm `bin`: `{ "tickets": "./bin/tickets.js" }`;
- thay script `test` mặc định (`echo "Error: no test specified" && exit 1`) bằng 4 script: `test`, `test:unit`, `test:integration`, `coverage`;
- thêm `engines`: `{ "node": ">=22" }`.

Giữ nguyên các trường kế hoạch không nhắc tới (`version`, `description`, `main`, `keywords`, `author`, `license`, `type: commonjs`).

### Why

| Thay đổi | Lý do |
|---|---|
| `bin` | Khai báo cho npm: lệnh `tickets` chạy file `bin/tickets.js`. Khi `npm link` (hoặc cài global), npm tạo lệnh `tickets` trên PATH – trên Windows là `tickets.cmd` / `tickets.ps1`. File chưa cần tồn tại lúc này |
| `node --test` | Test runner có sẵn của Node.js, không cài thư viện ngoài – quyết định từ Week 1 (Report §4.3) |
| Tách `test:unit` / `test:integration` | Chạy riêng từng tầng của kim tự tháp test: unit chạy nhanh khi đang code, integration chạy khi đụng tới file/CLI |
| `coverage` | Dùng ở Giai đoạn 6 để tìm dòng code chưa được test |
| Pattern đặt trong `\"...\"` | Để **Node** tự mở rộng `**` (glob), không để shell làm. Trên Windows, `cmd.exe` không hiểu glob; trên bash, `**` không đệ quy nếu chưa bật `globstar`. Đặt trong nháy thì mọi shell đều truyền nguyên chuỗi cho Node |
| `node >= 22` | `node --test` chỉ hỗ trợ glob pattern từ Node 21 trở đi; 22 là bản LTS gần nhất. Máy đang dùng Node 24.11.1 |

### How

Sửa file, kiểm tra JSON hợp lệ, chạy `npm test`:

```
> ticket-manager-cli@1.0.0 test
> node --test "test/**/*.test.js"

ℹ tests 0
ℹ pass 0
ℹ fail 0
exit=0
```

### Kết quả / Ghi chú

- `package.json` hợp lệ, script chạy được.
- ⚠️ **0 test mà vẫn exit 0 ("xanh").** Nghĩa là nếu sau này pattern gõ sai hoặc file test đặt sai thư mục, `npm test` vẫn báo thành công mà không chạy test nào – đúng kiểu "xanh giả" ở Week 1 (Report §5.3). Đây chính là lý do bước tiếp theo trong kế hoạch là **viết test giả `1 + 1 = 2`**: thấy `tests 1, pass 1` mới chắc pattern tìm đúng file.
- `main: "index.js"` trỏ tới file không tồn tại; không ảnh hưởng CLI (CLI dùng `bin`). Có thể xóa hoặc đổi sau khi có `src/cli.js`.
- Bước này do AI làm → đưa vào mục *Tổng kết làm việc với AI* cuối dự án.

---

## Bước 2 – Giai đoạn 1: tạo `.gitignore` và chạy test giả `1 + 1 = 2`

**Thời gian:** 2026-10-21 · **Người làm:** Claude (theo yêu cầu của Ngọc) · **Commit:** chưa

### What

1. Tạo `.gitignore` gồm `node_modules/`, `coverage/`, `tickets.json`.
2. Viết test giả `test/smoke.test.js` (`1 + 1 = 2`), chạy `npm test` thấy xanh; cố ý sửa thành `1 + 1 = 3` để thấy đỏ; sau đó **xóa** test giả.

### Why

| Việc | Lý do |
|---|---|
| Bỏ qua `tickets.json` | Đây là **dữ liệu thật** của người dùng khi chạy thử CLI (đường dẫn mặc định). Đẩy lên repo thì lộ dữ liệu cá nhân, và mỗi lần chạy thử lại tạo thay đổi rác trong `git status` |
| Bỏ qua `coverage/` | Kết quả sinh ra từ `npm run coverage`, tạo lại được bất cứ lúc nào |
| Bỏ qua `node_modules/` | Thư viện cài bằng `npm install`; hiện chưa có, nhưng là quy ước chuẩn cho mọi dự án Node |
| Test giả | Ở Bước 1, `npm test` với **0 test vẫn exit 0** → không phân biệt được "test đúng" với "không tìm thấy test nào". Test giả chứng minh pattern `test/**/*.test.js` tìm đúng file và runner chạy được |
| Cố ý làm test đỏ | Chỉ thấy xanh thì chưa đủ (bài học Week 1, Report §5.3): phải chắc assertion sai thì runner **báo đỏ và trả exit code ≠ 0**, vì script và CI dựa vào exit code |

### How

**Kiểm tra `.gitignore` bằng tình huống thật:** tạo `tickets.json` giả rồi xem git:

```
$ git status --short --ignored
?? .gitignore
?? docs/
?? package.json
!! tickets.json                     ← "!!" = bị bỏ qua

$ git check-ignore -v tickets.json
.gitignore:3:tickets.json  tickets.json   ← bị bỏ qua bởi dòng 3
```

Sau đó xóa `tickets.json` giả.

**Test giả** (`test/smoke.test.js`):

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('environment works: 1 + 1 = 2', () => {
  assert.equal(1 + 1, 2);
});
```

| Lần chạy | Kết quả |
|---|---|
| `1 + 1 = 2` | `✔ … ℹ tests 1 · pass 1 · fail 0` · **exit 0** |
| Cố ý sửa thành `1 + 1 = 3` | `✖ … actual: 2 … ℹ tests 1 · pass 0 · fail 1` · **exit 1** |
| Sau khi xóa test giả | `ℹ tests 0` (trở lại trạng thái chưa có test) |

File test nằm ngay trong `test/` (không có thư mục con) vẫn được tìm thấy → `**` khớp cả **0** cấp thư mục.

### Kết quả / Ghi chú

- Môi trường test hoạt động đúng cả hai chiều: xanh khi đúng, đỏ + exit 1 khi sai.
- Repo hiện có: `.gitignore`, `docs/`, `package.json`. Chưa commit.
- Bước tiếp theo (kế hoạch): tạo repo GitHub, đổi nhánh sang `main`, **Ngọc tự commit** `chore: init project structure` và push. Cần hỏi mentor trước: repo mới hay dùng chung repo tuần 1.

---

## Bước 3 – Giai đoạn 1: commit đầu tiên và push lên GitHub

**Thời gian:** 2026-10-21 · **Người làm:** Ngọc · **Commit:** `9634fc8`

### What

- Tạo repo **mới** `ngocnt1505/ticket-manager-cli` trên GitHub (không dùng chung repo tuần 1).
- Commit đầu tiên gồm 9 file: `.gitignore`, `package.json`, `docs/` (tài liệu tuần 1, đề bài tuần 2, `history.md`, `sosanh.md`).
- Đổi nhánh `master` → `main`, push, nhánh `main` theo dõi `origin/main`.

### Why

- Repo riêng cho tuần 2: lịch sử commit TDD (Red → Green → Refactor) là bằng chứng chính của bài, tách khỏi repo tài liệu tuần 1 thì mentor đọc `git log` dễ hơn.
- Push sớm (khi mới có khung dự án) để mọi commit sau đều có trên GitHub, mentor theo dõi được tiến độ.

### How – các lỗi gặp phải và cách xử lý

Lần chạy đầu (dán nhiều lệnh cùng lúc trong PowerShell):

```
error: remote origin already exists.
error: src refspec main does not match any
```

| Lỗi | Nguyên nhân | Xử lý |
|---|---|---|
| `remote origin already exists` | `git remote add` đã được chạy một lần trước đó, URL đã đúng | Không cần làm gì |
| `src refspec main does not match any` | Mới `git add` (file ở trạng thái staged `A`) nhưng **chưa `git commit`**, và nhánh vẫn tên `master` → chưa có nhánh `main` nào để push | Chạy lần lượt `git commit` → `git branch -M main` → `git push -u origin main` |

Bài học: chạy **từng lệnh một** và đọc kết quả trước khi chạy lệnh tiếp – dán nhiều lệnh cùng lúc thì lệnh sau vẫn chạy dù lệnh trước lỗi.

### Kết quả / Ghi chú

```
9634fc8  init project structure
* main 9634fc8 [origin/main]
```

- ⚠️ Commit message thực tế là `" init project structure"` – **mất tiền tố `chore:`** và có khoảng trắng đầu dòng, chưa đúng quy ước đã đặt (`chore: init project structure`). Commit đã push; sửa thì cần `git commit --amend` + `git push --force-with-lease` (chấp nhận được vì repo một người làm và mới có 1 commit) – Ngọc quyết định.
- `docs/sosanh.md` được giữ trong repo.

---

## Bước 4 – Giai đoạn 2: chốt thiết kế, viết `docs/DECISIONS.md`

**Thời gian:** 2026-10-21 · **Người làm:** Ngọc chọn các quyết định còn mở; Claude soạn file · **Commit:** chưa

### What

Viết `docs/DECISIONS.md` gồm 8 mục: trường của ticket, giá trị hợp lệ và mặc định, quy tắc title, tags, phạm vi `update`, sinh id, file dữ liệu, lỗi và exit code. Mỗi quyết định có cột **Nguồn**: W1 (đã chốt ở báo cáo tuần 1), Ngọc (Ngọc chọn), hoặc *Đề xuất* (Claude đề xuất, chờ xác nhận).

### Why

- Quyết định phải có **trước** test: test là đặc tả, nên nếu chưa chốt "lọc tag theo AND hay OR" thì không viết được test cho `list --tags`.
- Bài học tuần 1 (Report A.1 tầng 4): AI tự giả định mô hình dữ liệu (thiếu `priority`) và giả định đó lan sang mọi câu trả lời sau. Ghi ra giấy để AI (và chính mình) không tự giả định nữa.
- Cột **Nguồn** để phân biệt rõ cái gì người học quyết định, cái gì AI đề xuất – bằng chứng cho phần "kiểm soát AI" khi bảo vệ.

### How

Claude đưa 4 câu hỏi cho các điểm còn mở, mỗi câu có 2–3 phương án kèm ưu/nhược điểm; Ngọc chọn:

| Câu hỏi | Phương án | Ngọc chọn |
|---|---|---|
| `list --tags bug,ui` hiện ticket nào? | Có tất cả (AND) / Có ít nhất một (OR) | **AND** |
| `update` sửa được trường nào? | Cả 5 trường / Chỉ status / Status + priority | **Cả 5 trường** |
| Tags có chuyển chữ thường khi lưu? | Có / Không | **Có** |
| `TICKETS_FILE` trỏ vào thư mục chưa tồn tại? | Báo lỗi, không tạo / Tự tạo thư mục | **Báo lỗi, không tạo** |

Các điểm W1 lấy lại từ `docs/Report.md`: title (100 ký tự theo `.length`, phải là chuỗi), exit code 0/1/2, id = max + 1, file chưa có = danh sách rỗng, JSON hỏng không ghi đè, ghi nguyên tử, `TICKETS_FILE`.

### Kết quả / Ghi chú

- Ngọc chọn đúng cả 4 phương án Claude đánh dấu *Recommended*. Khi tổng kết cần nói rõ là đã **đọc lý do và đồng ý**, hoặc nêu lý do riêng của mình nếu có.
- Còn **7 mục *Đề xuất*** chưa được xác nhận: chữ hoa trong status/priority bị từ chối, description ≤ 1000, tag ≤ 30, update không có trường nào → lỗi, `--tags` thay thế toàn bộ, JSON thụt lề 2, file rỗng = danh sách rỗng.
- Bước tiếp theo: Ngọc rà và xác nhận các mục Đề xuất → viết `docs/TEST-LIST.md` → commit `docs: add design decisions and test list`.

---

## Bước 5 – Giai đoạn 2: xác nhận các đề xuất và viết `docs/TEST-LIST.md`

**Thời gian:** 2026-10-21 · **Người làm:** Ngọc xác nhận quyết định; Claude soạn file · **Commit:** chưa (Ngọc sẽ commit `docs: add design decisions and test list`)

### What

1. Ngọc rà 7 mục *Đề xuất* trong `DECISIONS.md`: đồng ý 6 mục ngay; **không đồng ý ngay** mục "`--tags` khi update thay thế toàn bộ" → Claude đưa 3 phương án để so sánh → Ngọc chọn **thay thế**.
2. Cập nhật `DECISIONS.md`: mọi mục đề xuất đổi nguồn thành "Ngọc (xác nhận)"; mục `--tags` ghi rõ đã so sánh 3 cách.
3. Viết `docs/TEST-LIST.md`: **77 kịch bản**, chia 4 lớp theo thứ tự xây dựng (Models M1–M27 → Services S1–S20 → Storage D1–D12 → Commands C1–C18), mỗi dòng một ô `[ ]`.
4. Sửa một chỗ không thống nhất: mã lỗi không tìm thấy ticket thống nhất là `NOT_FOUND`.

### Why

- **Test list đứng trước vòng Red–Green–Refactor** (Canon TDD, Report §2.2): có danh sách mới chọn được test tiếp theo theo thứ tự đơn giản → phức tạp, và không viết test theo code đã có.
- **Mỗi dòng một ô `[ ]`** + mã ngắn (`M1`, `S3`…): mỗi vòng TDD ứng với đúng một dòng, đánh dấu `[x]` khi xong → nhìn file là biết tiến độ; mã dùng trong commit message để nối commit với kịch bản.
- **Thứ tự models → services → storage → CLI** (từ trong ra ngoài): lớp trong là hàm thuần, test nhanh và dễ; lớp ngoài dựa trên lớp trong đã được kiểm chứng.
- **Mục "Phát sinh"**: trường hợp nghĩ ra giữa chừng ghi lại trước, không làm ngay – tránh phình phạm vi và giữ mỗi vòng TDD nhỏ.

### How

**Phản biện mục `--tags`** – 3 phương án Claude đưa ra:

| Phương án | Ưu | Nhược |
|---|---|---|
| **Thay thế** (`--tags ui` → `['ui']`) | Giống cách `--status`, `--priority` hoạt động; 1 option; xóa hết bằng `--tags=` | Muốn thêm tag phải gõ lại cả tag cũ |
| Cộng thêm | Tiện khi gắn thêm nhãn | Không có cách xóa tag nếu không thêm option riêng |
| Tách `--add-tags` / `--remove-tags` | Linh hoạt nhất | Thêm 2 option và nhiều test, vượt yêu cầu đề bài |

→ Ngọc chọn **thay thế**.

**Nguồn của các kịch bản trong `TEST-LIST.md`:**

- *(W1)* – lấy lại từ Bảng 6 Report tuần 1: title, id tăng đúng, list rỗng / sắp xếp / lọc sai báo lỗi, show không tồn tại, update không đổi một nửa, file chưa có / hỏng / không phải mảng / ghi lỗi, tiếng Việt, exit code.
- *(mới)* – bổ sung cho tuần 2: priority, description, toàn bộ phần **tags** (M15–M20) và **lọc** (S7–S12), `--tags` thay thế (S17), `serializeTickets` (D5–D6), thư mục không tồn tại (D11, C18), `TICKETS_FILE` mặc định (C17).

| Lớp | Số kịch bản | Cấp độ |
|---|---|---|
| Models | 27 | Unit |
| Services | 20 | Unit |
| Storage | 12 | 6 unit + 6 integration |
| Commands | 18 | 10 với stdout/stderr giả + 8 chạy CLI thật |
| **Tổng** | **77** | |

### Kết quả / Ghi chú

- `DECISIONS.md`: không còn mục nào ở trạng thái "đề xuất". Còn treo: có hỏi mentor về lọc tag (AND) và phạm vi `update` (5 trường) hay không.
- Mục `--tags` là ví dụ cụ thể **không nhận nguyên đề xuất của AI**: Ngọc dừng lại ở mục này, yêu cầu xem các phương án rồi mới chọn → dùng làm ví dụ trong mục *Tổng kết làm việc với AI*.
- Bước tiếp theo: Ngọc rà `TEST-LIST.md`, rồi tự commit:
  `git add docs/DECISIONS.md docs/TEST-LIST.md docs/history.md` → `git commit -m "docs: add design decisions and test list"` → `git push`.

---

## Bước 6 – Giai đoạn 3, vòng TDD đầu tiên (M1): bước Red – gặp "xanh giả" do file chưa lưu

**Thời gian:** 2026-10-21 · **Người làm:** Ngọc · **Commit:** chưa

> Ghi chú bước trước: Ngọc đã commit và push `d3aed74 docs: add design decisions and test list`. Cả hai commit message hiện có đều bắt đầu bằng **một dấu cách** (`" docs: …"`, `" init …"`) – không ảnh hưởng chức năng, cần xem lại cách gõ message.

### What

Bắt đầu vòng TDD đầu tiên với kịch bản **M1** (trim title hợp lệ). Ngọc viết `test/unit/ticket.model.test.js` (dựa trên Mã 1 của Report tuần 1) và chạy `npm test`.

### Why

- Chọn **M1 trước M2** (dù ví dụ trong kế hoạch là "empty title"): Canon TDD đi từ trường hợp **đơn giản nhất** – M1 là happy path, chỉ cần 1 dòng code để xanh; các trường hợp lỗi (M2…) "kéo" thêm code ở các vòng sau.
- Bước Red phải **thấy đỏ** trước khi viết code: nếu test mới viết mà đã xanh thì hoặc test không kiểm tra gì, hoặc nó không được chạy.

### How

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validateTitle } = require('../../src/models/ticket');

test('M1: trims a valid title', () => {
  assert.equal(validateTitle('   Fix login   '), 'Fix login');
});
```

**Lần chạy 1 (Ngọc chạy) – XANH, sai kỳ vọng:**

```
✔ test\unit\ticket.model.test.js (49.9ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

Hai dấu hiệu bất thường:
1. Kỳ vọng là **đỏ** (`src/models/ticket` chưa tồn tại) nhưng lại xanh.
2. Dòng ✔ hiện **tên file**, không phải tên test `M1: trims a valid title`.

**Điều tra (Claude):** nội dung file trên đĩa đúng (264 byte), thư mục `src/` chưa có. Chạy lại:

```
Error: Cannot find module '../../src/models/ticket'
✖ test\unit\ticket.model.test.js
ℹ tests 1 · pass 0 · fail 1
```

**Nguyên nhân:** lúc Ngọc chạy, file **chưa được lưu** trong VS Code → trên đĩa là file rỗng. `node --test` chạy file rỗng, không thấy `test()` nào, nên tính **chính file đó** là 1 test và cho pass.

### Kết quả / Ghi chú

- ⚠️ **"Xanh giả" thật đầu tiên của dự án** – đúng hiện tượng Report tuần 1 §5.3 cảnh báo: thấy xanh mà không assertion nào được chạy. Bước Red đã bắt được nó **vì đã đoán trước kết quả phải đỏ**.
- Dấu hiệu nhận biết về sau: dòng ✔/✖ chỉ có **tên file** = file không có test nào được đăng ký (file rỗng, chưa lưu, hoặc quên gọi `test()`).
- Phòng tránh: bật **File → Auto Save** trong VS Code, hoặc luôn `Ctrl+S` trước khi chạy test.
- Hiện trạng: test đỏ vì `Cannot find module` – **chưa phải đỏ đúng lý do**. Việc tiếp theo: thêm stub `src/models/ticket.js`.

---

## Bước 7 – Vòng TDD M1: hoàn tất bước Red (stub → đỏ đúng lý do)

**Thời gian:** 2026-10-21 · **Người làm:** Ngọc · **Commit:** `63e3776` (chưa push)

### What

Thêm stub `src/models/ticket.js` (hàm `validateTitle` rỗng), chạy lại test, commit bước Red gồm test + stub.

### Why

Lỗi `Cannot find module` ở Bước 6 chỉ chứng minh "chưa có file", không chứng minh assertion hoạt động – một assertion viết sai cũng cho ra đúng lỗi đó (Report §2.3). Stub rỗng khiến test chạy tới assertion và đỏ **vì sai kết quả** → đỏ đúng lý do. Stub là một phần của bước Red vì nó chưa có hành vi gì.

### How

```js
// src/models/ticket.js
function validateTitle(title) {}

module.exports = { validateTitle };
```

```
✖ M1: trims a valid title
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  actual: undefined
  expected: 'Fix login'
ℹ tests 1 · pass 0 · fail 1
```

So với Bước 6: dòng ✖ giờ hiện **tên test** (không còn là tên file) → test đã thực sự được đăng ký và chạy.

### Kết quả / Ghi chú

- ✅ Red đúng lý do. Commit chứa `test/unit/ticket.model.test.js`, `src/models/ticket.js`, `docs/history.md`.
- ⚠️ Commit message thực tế: `" test(models) : add failing test for strimming title"` – ba điểm lệch quy ước:
  1. dấu cách ở **đầu** message (lần thứ 3 lặp lại);
  2. dấu cách **trước dấu hai chấm** (`test(models) :`) – chuẩn Conventional Commits là `type(scope): subject`, nhiều công cụ đọc commit sẽ không nhận ra;
  3. lỗi chính tả `strimming` → `trimming`.
  Commit **chưa push** nên sửa an toàn bằng `git commit --amend`.

---

## Bước 8 – Vòng TDD M1: bước Green (code tối thiểu), bỏ qua Refactor

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết code (theo yêu cầu của Ngọc); Ngọc commit · **Commit:** chưa

### What

- Viết code tối thiểu cho `validateTitle` để M1 xanh.
- Đánh dấu `[x] M1` trong `docs/TEST-LIST.md`.
- Bỏ qua bước Refactor ở vòng này.

### Why

- **Code tối thiểu:** chỉ viết đủ cho test hiện có. Chưa có test nào yêu cầu từ chối title rỗng hay quá 100 ký tự, nên **cố ý chưa xử lý** – các test M2, M4, M6 sẽ "kéo" ra từng nhánh `if` ở các vòng sau. Viết trước những thứ chưa có test = code không được kiểm chứng.
- **Bỏ Refactor:** code mới có 1 dòng, chưa có trùng lặp hay "con số ma" để dọn. Kế hoạch ghi "Refactor (nếu cần)" – không cần thì không làm.
- **Đánh dấu `[x]` cùng commit với Green:** `[x]` nghĩa là "kịch bản đã có test xanh", nên đi chung commit với code làm test xanh để `git log` khớp với `TEST-LIST.md`.

### How

```js
function validateTitle(title) {
  return title.trim();
}

module.exports = { validateTitle };
```

```
✔ M1: trims a valid title
ℹ tests 1 · pass 1 · fail 0   (exit 0)
```

**Kiểm tra test có tác dụng (mutation thủ công):** cố ý bỏ `.trim()` (`return title;`) → `✖ M1 · fail 1`; khôi phục → `pass 1`. Test bắt được đúng lỗi nó cần bắt.

### Kết quả / Ghi chú

- ✅ M1 xanh. `TEST-LIST.md`: 1/77.
- Code Green do Claude viết; Ngọc cần đọc hiểu và giải thích được vì sao **chỉ** có `title.trim()`.
- Trục trặc nhỏ khi làm: lệnh đánh dấu `[x]` chạy trước khi code được ghi (lúc đó test còn đỏ); đã ghi code và chạy lại → xanh. Bài học: luôn chạy test **sau cùng** rồi mới đánh dấu.
- Còn chờ Ngọc: sửa message commit Red (`--amend`) và commit Green.

> **Cập nhật Bước 7–8:** Ngọc đã sửa message commit Red bằng `git commit --amend` và commit Green, push:
> `a636cbd test(models): add failing test for trimming title` → `de8f421 feat(models): trim title`.
> Message không còn dấu cách ở đầu và đúng dạng `type(scope): subject`. **Vòng TDD M1 hoàn tất.**

---

## Bước 9 – Vòng TDD M2 (title rỗng → `EMPTY_TITLE`): bước Red

**Thời gian:** 2026-10-21 · **Người làm:** Ngọc · **Commit:** chưa

### What

Thêm test M2 vào `test/unit/ticket.model.test.js`: title rỗng hoặc toàn khoảng trắng phải ném lỗi có `name: 'ValidationError'` và `code: 'EMPTY_TITLE'`.

### Why

- Vòng đầu tiên kiểm tra **lỗi** thay vì giá trị trả về. Theo `DECISIONS.md` §8, test kiểm tra `code` (hợp đồng ổn định, tầng CLI dựa vào để chọn exit code), không kiểm tra câu thông báo (có thể đổi bất cứ lúc nào).
- Thử **3 giá trị** `''`, `'   '`, `'\t\n'`: nếu chỉ thử `''` thì code `if (title === '')` cũng qua, nhưng chuỗi toàn khoảng trắng sẽ lọt.
- Test **không `require` file lỗi nào**, chỉ so `name` bằng chuỗi → test đỏ vì assertion chứ không vì thiếu module → **không cần stub** ở vòng này.

### How

```js
test('M2: rejects an empty or whitespace-only title with EMPTY_TITLE', () => {
  for (const blank of ['', '   ', '\t\n']) {
    assert.throws(() => validateTitle(blank), {
      name: 'ValidationError',
      code: 'EMPTY_TITLE',
    });
  }
});
```

```
✔ M1: trims a valid title
✖ M2: rejects an empty or whitespace-only title with EMPTY_TITLE
  AssertionError [ERR_ASSERTION]: Missing expected exception (ValidationError).
  actual: undefined
  expected: { name: 'ValidationError', code: 'EMPTY_TITLE' }
ℹ tests 2 · pass 1 · fail 1
```

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do: `''.trim()` trả về `''` và không ném lỗi → `Missing expected exception`.
- M1 vẫn xanh → thêm test mới không làm hỏng test cũ.

> **Cập nhật Bước 9:** Ngọc commit bước Red: `436a224 test(models): add failing test for empty title` (commit **trước** khi viết code Green).

---

## Bước 10 – Vòng TDD M2: bước Green (tạo `ValidationError`, từ chối title rỗng)

**Thời gian:** 2026-10-21 · **Người làm:** Ngọc tạo `src/errors.js`; Claude sửa `ticket.js` (theo yêu cầu) · **Commit:** chưa

### What

- `src/errors.js` (Ngọc tạo): lớp `ValidationError` kế thừa `Error`, có `name = 'ValidationError'` và `code` truyền vào khi tạo.
- `src/models/ticket.js` (Claude sửa): trim → kiểm tra rỗng → trả về.
- Đánh dấu `[x] M2` trong `TEST-LIST.md`.

### Why

- **Lớp lỗi riêng** thay vì `throw new Error(...)`: `name` giúp phân biệt lỗi do người dùng nhập sai với lỗi lập trình (`TypeError`…); `code` là mã cố định để test kiểm tra và để tầng CLI sau này chọn exit code 2.
- **Kiểm tra trên `clean` (sau trim), không phải `title`**: `'   '` khác rỗng nhưng sau trim là rỗng.
- **Chưa thêm giới hạn 100 ký tự**: chưa có test nào yêu cầu (M3, M4 ở vòng sau).

### How

```js
// src/errors.js
class ValidationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
}

module.exports = { ValidationError };
```

```js
// src/models/ticket.js
const { ValidationError } = require('../errors');

function validateTitle(title) {
  const clean = title.trim();
  if (!clean) throw new ValidationError('EMPTY_TITLE', 'Title is required');
  return clean;
}

module.exports = { validateTitle };
```

```
✔ M1: trims a valid title
✔ M2: rejects an empty or whitespace-only title with EMPTY_TITLE
ℹ tests 2 · pass 2 · fail 0   (exit 0)
```

**Mutation thủ công:** đổi `if (!clean)` thành `if (!title)` (kiểm tra chuỗi **chưa** trim) → `✖ M2 · fail 1`, vì `'   '` và `'\t\n'` không rỗng nên lọt qua. Khôi phục → `pass 2`. Chứng minh việc thử **3 giá trị** trong test M2 là cần thiết: nếu chỉ thử `''` thì mutation này không bị phát hiện.

### Kết quả / Ghi chú

- ✅ M2 xanh. `TEST-LIST.md`: 2/77.
- Refactor: chưa cần (hàm 3 dòng, chưa có trùng lặp).
- VS Code gợi ý *"File is a CommonJS module; it may be converted to an ES module"* – chỉ là gợi ý (Hint), không phải lỗi. Dự án đã chọn CommonJS (`"type": "commonjs"` trong `package.json`), giữ nguyên.
- `ticket.js` vòng này do Claude sửa.

> **Cập nhật Bước 10:** Ngọc commit Green và push: `8b2baa9 feat(models): reject empty title` (message lại có dấu cách ở đầu; đã push nên giữ nguyên, không sửa lịch sử). **Vòng TDD M2 hoàn tất.**

---

## Bước 11 – Vòng TDD M4 (title 101 ký tự → `TITLE_TOO_LONG`): bước Red

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết test (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

Thêm test M4: title dài 101 ký tự phải ném `ValidationError` với `code: 'TITLE_TOO_LONG'`.

### Why

- **Làm M4 trước M3** (dù M3 đứng trước trong `TEST-LIST.md`): test "đúng 100 ký tự hợp lệ" (M3) **không thể đỏ** khi code chưa có giới hạn nào → không có bước Red cho nó. M4 tạo ra giới hạn (Red → Green); sau đó M3 và M5 đóng vai **test canh biên**, sẽ được kiểm chứng bằng mutation.
- Dùng `'a'.repeat(101)` thay vì gõ tay: chắc chắn đúng 101 ký tự, người đọc test thấy ngay con số.
- Không cần `for` như M2 vì chỉ có một giá trị cần thử; không cần stub vì test so `name` bằng chuỗi.

### How

```js
test('M4: rejects a title of 101 characters with TITLE_TOO_LONG', () => {
  assert.throws(() => validateTitle('a'.repeat(101)), {
    name: 'ValidationError',
    code: 'TITLE_TOO_LONG',
  });
});
```

```
✔ M1: trims a valid title
✔ M2: rejects an empty or whitespace-only title with EMPTY_TITLE
✖ M4: rejects a title of 101 characters with TITLE_TOO_LONG
  AssertionError [ERR_ASSERTION]: Missing expected exception (ValidationError).
ℹ tests 3 · pass 2 · fail 1
```

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do: code chưa có giới hạn độ dài nên trả về title bình thường, không ném lỗi.
- M1, M2 vẫn xanh.
- Kèm theo: các dòng nhắc `AI-LOG.md` ở Bước 0, 1, 4, 5, 8, 10 được đổi thành "mục *Tổng kết làm việc với AI* cuối dự án", theo quyết định không dùng `AI-LOG.md`.

> **Cập nhật Bước 11:** Ngọc commit bước Red: `b7da95f test(models): add failing test for title longer than 100 characters`.

---

## Bước 12 – Vòng TDD M4: bước Green (giới hạn 100 ký tự)

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết code (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

Thêm kiểm tra độ dài vào `validateTitle`, đánh dấu `[x] M4` trong `TEST-LIST.md`.

### Why

- Đặt kiểm tra **sau** kiểm tra rỗng và đo trên `clean` (đã trim) → khớp `DECISIONS.md` §3: độ dài tính sau khi trim.
- Dùng `> 100`: 101 trở lên bị chặn, 100 được phép.
- Chưa đặt tên hằng số cho `100` – để dành cho bước Refactor sau khi có test canh biên M3.

### How

```js
const { ValidationError } = require('../errors');

function validateTitle(title) {
  const clean = title.trim();
  if (!clean) throw new ValidationError('EMPTY_TITLE', 'Title is required');
  if (clean.length > 100) {
    throw new ValidationError('TITLE_TOO_LONG', 'Title must be at most 100 characters');
  }
  return clean;
}
```

```
✔ M1 · ✔ M2 · ✔ M4
ℹ tests 3 · pass 3 · fail 0   (exit 0)
```

**Mutation thủ công – lộ ra lỗ hổng:** đổi `> 100` thành `>= 100` (chặn oan title đúng 100 ký tự) → **vẫn `pass 3`**. Bộ test hiện tại **không phát hiện** lỗi lệch biên này, vì chưa có test nào thử đúng 100 ký tự. Đã khôi phục code.

### Kết quả / Ghi chú

- ✅ M4 xanh. `TEST-LIST.md`: 3/77 (M1, M2, M4).
- ⚠️ Lỗ hổng biên `>` / `>=` là lý do cần **M3** ở vòng tiếp theo: M3 phải đỏ với bản mutation `>=` và xanh với code thật.

> **Cập nhật Bước 12:** Ngọc commit Green và push: `cd8a061 feat(models): reject titles longer than 100 characters`. **Vòng TDD M4 hoàn tất.**

---

## Bước 13 – M3 và M5: test canh biên (xanh ngay, chứng minh bằng mutation)

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết test (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

Thêm 2 test:

- **M3**: title đúng 100 ký tự → hợp lệ;
- **M5**: title 100 ký tự kèm khoảng trắng hai đầu → hợp lệ (độ dài đo **sau** trim).

Đánh dấu `[x] M3`, `[x] M5`.

### Why

- Hai test này **không thể đỏ** với code hiện tại (code đã đúng) → không có bước Red/Green như thường. Đây là **test canh biên** (characterization / guard test): chúng không "kéo" ra code mới, mà **khóa** hành vi đúng, để sau này sửa hay refactor sai thì bị phát hiện.
- Một test xanh ngay thì phải **chứng minh** được nó có tác dụng – nếu không, nó có thể là "xanh giả" (bài học Week 1). Cách chứng minh: cố ý làm hỏng code (mutation) và thấy test đỏ.
- Report tuần 1 (Ghi chú 1, §2.3): *"Test 'đúng 100 ký tự' và test '101 ký tự' cần đi cùng nhau. Thiếu một trong hai, sẽ có một kiểu sửa sai ở biên không bị phát hiện."* – Bước 12 đã thấy đúng điều này.

### How

```js
test('M3: accepts a title of exactly 100 characters', () => {
  const title = 'a'.repeat(100);
  assert.equal(validateTitle(title), title);
});

test('M5: measures the length after trimming', () => {
  const title = 'a'.repeat(100);
  assert.equal(validateTitle(`  ${title}  `), title);
});
```

| Lần chạy | Kết quả |
|---|---|
| Code thật (`clean.length > 100`) | ✔ 5/5 |
| **Mutation 1:** `>= 100` (chặn oan 100 ký tự) | ✖ **M3**, ✖ **M5** – `pass 3 · fail 2` |
| **Mutation 2:** `title.length > 100` (đo trước khi trim) | ✖ **M5** – `pass 4 · fail 1` |
| Khôi phục | ✔ 5/5 |

### Kết quả / Ghi chú

- ✅ Lỗ hổng `>` / `>=` ở Bước 12 đã được lấp: trước khi có M3, mutation `>=` vẫn `pass 3`; giờ bị bắt.
- Mỗi test bắt được một lỗi mà test khác không bắt: **M3** bắt lệch biên, **M5** bắt đo sai chỗ (trước trim). → Không test nào thừa.
- Commit đề xuất: `test(models): add boundary tests for title length` – dùng `test:` vì chỉ thêm test, không đổi code.
- `TEST-LIST.md`: 5/77.

> **Cập nhật Bước 13:** Ngọc commit `2bfcefa test(models): add boundary tests for title length`.

---

## Bước 14 – Vòng TDD M6 (title không phải chuỗi → `INVALID_TITLE`): bước Red

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết test (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

Thêm test M6: `validateTitle` nhận `undefined`, `null`, `42`, `{}`, `['x']` phải ném `ValidationError` với `code: 'INVALID_TITLE'`.

### Why

- Ở tầng CLI, người dùng gõ `tickets create` mà quên `--title` thì title là `undefined`. Nếu hàm ném `TypeError` (lỗi lập trình), CLI sẽ không phân biệt được với một bug thật → không chọn được exit code 2, và người dùng thấy thông báo khó hiểu.
- Đây đúng là tình huống Report tuần 1 Mã 2b: phiên bản cũ dùng `(title ?? '').trim()` thì `undefined`/`null` qua được nhưng `validateTitle(42)` vẫn ném `TypeError: title.trim is not a function`. Vì vậy test thử **5 kiểu** khác nhau, không chỉ `undefined`.

### How

```js
test('M6: rejects a non-string title with INVALID_TITLE', () => {
  for (const bad of [undefined, null, 42, {}, ['x']]) {
    assert.throws(() => validateTitle(bad), {
      name: 'ValidationError',
      code: 'INVALID_TITLE',
    });
  }
});
```

```
✖ M6: rejects a non-string title with INVALID_TITLE
  +   name: 'TypeError'
  -   name: 'ValidationError'
  actual: TypeError: Cannot read properties of undefined (reading 'trim')
ℹ tests 6 · pass 5 · fail 1
```

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do – và khác các vòng trước: hàm **có** ném lỗi nhưng **sai loại** (`TypeError` thay vì `ValidationError`). `assert.throws` với `{ name, code }` phân biệt được điều này; nếu chỉ viết `assert.throws(() => validateTitle(bad))` (assertion yếu, Report §6.2) thì test đã **xanh** với code hiện tại vì bất kỳ lỗi nào cũng thỏa.
- 5 test cũ vẫn xanh.

> **Cập nhật Bước 14:** Ngọc commit `0f3605c test(models): add failing test for non-string title`.

---

## Bước 15 – Vòng TDD M6: bước Green (kiểm tra kiểu trước khi trim)

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết code (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

Thêm kiểm tra `typeof title !== 'string'` ở **đầu** `validateTitle`; đánh dấu `[x] M6`. Nhóm Title (M1–M6) hoàn tất.

### Why

- Phải kiểm tra kiểu **trước** `title.trim()`: gọi `.trim()` trên `undefined`/`42` chính là chỗ sinh ra `TypeError`.
- Dùng `typeof … !== 'string'` thay vì `(title ?? '').trim()` (cách cũ của Week 1): `??` chỉ xử lý `undefined`/`null`; số, object, mảng vẫn ném `TypeError`.

### How

```js
const { ValidationError } = require('../errors');

function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new ValidationError('INVALID_TITLE', 'Title must be text');
  }
  const clean = title.trim();
  if (!clean) throw new ValidationError('EMPTY_TITLE', 'Title is required');
  if (clean.length > 100) {
    throw new ValidationError('TITLE_TOO_LONG', 'Title must be at most 100 characters');
  }
  return clean;
}
```

```
✔ M1 · ✔ M2 · ✔ M3 · ✔ M5 · ✔ M4 · ✔ M6
ℹ tests 6 · pass 6 · fail 0   (exit 0)
```

**Mutation thủ công – thay bằng đúng cách cũ của Week 1** `const clean = (title ?? '').trim();` → ✖ **M6** (`pass 5 · fail 1`), vì `42`, `{}`, `['x']` vẫn ném `TypeError`. Khôi phục → 6/6. Xác nhận lý do test M6 thử **5 kiểu** chứ không chỉ `undefined`.

### Kết quả / Ghi chú

- ✅ Nhóm **Title (M1–M6) hoàn tất**. `TEST-LIST.md`: 6/77.
- Bước tiếp theo: **Refactor đầu tiên** – số `100` xuất hiện 2 lần (điều kiện và câu thông báo), đặt tên thành hằng `MAX_TITLE_LENGTH`.

> **Cập nhật Bước 15:** Ngọc commit và push `92681e4 feat(models): reject non-string titles`. **Vòng TDD M6 hoàn tất.**

---

## Bước 16 – Refactor đầu tiên: đặt tên hằng `MAX_TITLE_LENGTH`

**Thời gian:** 2026-10-21 · **Người làm:** Claude (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

Trong `src/models/ticket.js`, thay số `100` (xuất hiện 2 lần: trong điều kiện và trong câu thông báo) bằng hằng `MAX_TITLE_LENGTH = 100`. **Không sửa test.**

### Why

- **"Con số ma" (magic number):** `100` nằm rải rác thì người đọc phải đoán ý nghĩa, và khi đổi giới hạn dễ sửa một chỗ mà quên chỗ kia (điều kiện là 200 nhưng thông báo vẫn nói 100). Đặt tên một lần → một nguồn duy nhất.
- **Vì sao bây giờ mới refactor:** trước khi có M3/M5 (canh biên), một refactor lỡ tay viết `>=` sẽ không bị phát hiện (Bước 12). Giờ đã có lưới an toàn đủ chặt → mới refactor.
- **Quy tắc Refactor:** chỉ đổi **cấu trúc**, không đổi **hành vi** → test giữ nguyên và phải xanh nguyên như trước. Commit riêng, không gộp với Green (Kent Beck, Report §6.5).
- **Vì sao test vẫn viết số `100` chứ không import `MAX_TITLE_LENGTH`:** test là đặc tả độc lập với code. Nếu test dùng chính hằng số của code, ai đó lỡ sửa `MAX_TITLE_LENGTH = 10` thì test vẫn xanh. Test viết thẳng `100` (đúng như `DECISIONS.md`) thì bắt được.

### How

```js
const { ValidationError } = require('../errors');

const MAX_TITLE_LENGTH = 100;

function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new ValidationError('INVALID_TITLE', 'Title must be text');
  }
  const clean = title.trim();
  if (!clean) throw new ValidationError('EMPTY_TITLE', 'Title is required');
  if (clean.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(
      'TITLE_TOO_LONG',
      `Title must be at most ${MAX_TITLE_LENGTH} characters`,
    );
  }
  return clean;
}
```

Chứng minh hành vi không đổi:

| Kiểm tra | Kết quả |
|---|---|
| File test có bị sửa không (so checksum trước/sau) | `test/unit/ticket.model.test.js: OK` – không đổi |
| `npm test` | `tests 6 · pass 6 · fail 0` (exit 0) |
| Câu thông báo `TITLE_TOO_LONG` | `Title must be at most 100 characters` – giống hệt trước |

### Kết quả / Ghi chú

- ✅ Refactor đầu tiên của dự án. Hoàn tất **vòng 1** của Giai đoạn 4.1 (Title).
- Commit đề xuất: `refactor(models): extract title length limit`.
- Tiếp theo: **vòng 2** – status và priority (M7–M10).

> **Cập nhật Bước 16:** Ngọc commit và push `7843165 refactor(models): extract title length limit`. **Vòng 1 (Title, M1–M6) hoàn tất.**

---

## Bước 17 – Vòng 2 (status, priority – M7–M10): bước Red

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

- Thêm 4 test: M7 (status hợp lệ), M8 (status sai → `INVALID_STATUS`, thông báo liệt kê giá trị hợp lệ), M9 (priority hợp lệ), M10 (priority sai → `INVALID_PRIORITY`).
- Thêm **stub** rỗng `validateStatus`, `validatePriority` trong `src/models/ticket.js` và export chúng.

### Why

- **Gom 4 test vào một vòng** (theo kế hoạch 5 vòng đã chốt): status và priority có cùng quy tắc "giá trị phải thuộc một danh sách cố định", nên Red → Green một lần là đủ rõ.
- **Cần stub**: khác M2–M6, lần này test gọi **hàm chưa tồn tại**. Không có stub thì `validateStatus` là `undefined` → lỗi `validateStatus is not a function`, đỏ vì thiếu code chứ không vì assertion.
- **Giá trị thử trong M8/M10**:
  - `'OPEN'`, `'High'` – sai chữ hoa, phải bị từ chối (`DECISIONS.md` §2: không tự sửa);
  - `''`, `undefined` – rỗng/thiếu. Mặc định `open`/`medium` **không** phải việc của hàm validate mà của hàm tạo ticket (M21) – validate chỉ trả lời "giá trị này có hợp lệ không".
- **M8 kiểm tra thêm câu thông báo** (`/open, in_progress, done/`) – ngoại lệ có chủ ý so với quy tắc "chỉ kiểm tra `code`": `DECISIONS.md` §2 yêu cầu thông báo **liệt kê giá trị hợp lệ** để người dùng biết sửa thế nào; đó là hành vi, nên cần test. Chỉ khớp phần danh sách, không khớp cả câu.

### How

```js
// src/models/ticket.js – stub
function validateStatus(status) {}

function validatePriority(priority) {}

module.exports = { validateTitle, validateStatus, validatePriority };
```

```js
test('M7: accepts open, in_progress and done as status', () => {
  for (const status of ['open', 'in_progress', 'done']) {
    assert.equal(validateStatus(status), status);
  }
});

test('M8: rejects other status values with INVALID_STATUS and lists the allowed ones', () => {
  for (const bad of ['closed', 'OPEN', '', undefined]) {
    assert.throws(
      () => validateStatus(bad),
      (err) => {
        assert.equal(err.name, 'ValidationError');
        assert.equal(err.code, 'INVALID_STATUS');
        assert.match(err.message, /open, in_progress, done/);
        return true;
      },
    );
  }
});

// M9, M10: tương tự cho priority (low, medium, high / urgent, High, '', undefined)
```

```
✔ M1 … ✔ M6
✖ M7  AssertionError: actual: undefined, expected: 'open'
✖ M8  AssertionError: Missing expected exception.
✖ M9  AssertionError: actual: undefined, expected: 'low'
✖ M10 AssertionError: Missing expected exception.
ℹ tests 10 · pass 6 · fail 4
```

### Kết quả / Ghi chú

- ✅ Cả 4 test đỏ vì **AssertionError** (stub trả `undefined` / không ném lỗi) → đỏ đúng lý do. 6 test Title vẫn xanh.
- Commit đề xuất: `test(models): add failing tests for status and priority`.

> **Cập nhật Bước 17:** Ngọc commit `5ff8d79 test(models): add failing tests for status and priority`.

---

## Bước 18 – Vòng 2: bước Green (`validateStatus`, `validatePriority`)

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết code (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

Thay 2 stub bằng code thật; đánh dấu `[x]` M7–M10 trong `TEST-LIST.md`.

### Why

- Green viết **theo cách thẳng nhất**: mỗi hàm tự có danh sách giá trị và tự ném lỗi, dù hai hàm gần như giống hệt nhau. Gộp lại là việc của bước **Refactor** – không vừa làm xanh vừa thiết kế lại trong cùng một bước (Report §6.5).
- `allowed.includes(x)` so khớp **chính xác** → `'OPEN'`, `'High'` tự động bị từ chối, không cần code riêng.
- Câu thông báo đưa cả giá trị người dùng gõ (`"OPEN"`) và danh sách hợp lệ → người dùng biết ngay sai ở đâu, sửa thế nào.

### How

```js
function validateStatus(status) {
  const allowed = ['open', 'in_progress', 'done'];
  if (!allowed.includes(status)) {
    throw new ValidationError(
      'INVALID_STATUS',
      `Invalid status "${status}". Allowed values: ${allowed.join(', ')}`,
    );
  }
  return status;
}

function validatePriority(priority) {
  const allowed = ['low', 'medium', 'high'];
  if (!allowed.includes(priority)) {
    throw new ValidationError(
      'INVALID_PRIORITY',
      `Invalid priority "${priority}". Allowed values: ${allowed.join(', ')}`,
    );
  }
  return priority;
}
```

```
ℹ tests 10 · pass 10 · fail 0   (exit 0)

INVALID_STATUS   | Invalid status "OPEN". Allowed values: open, in_progress, done
INVALID_PRIORITY | Invalid priority "urgent". Allowed values: low, medium, high
```

**Mutation thủ công:** bỏ `'in_progress'` khỏi danh sách status → ✖ M7 (giá trị hợp lệ bị từ chối), ✖ M8 (thông báo thiếu `in_progress`) – `pass 8 · fail 2`. Khôi phục → 10/10.

### Kết quả / Ghi chú

- ✅ M7–M10 xanh. `TEST-LIST.md`: 10/77.
- **Mùi code (code smell) để Refactor:** hai hàm trùng nhau gần như từng dòng, chỉ khác danh sách, mã lỗi và tên trường. Bước tiếp theo sẽ gộp thành một hàm dùng chung và đưa hai danh sách lên thành hằng số (để sau này `list --status` và trang help dùng lại được).
- Commit đề xuất: `feat(models): validate status and priority`.

> **Cập nhật Bước 18:** Ngọc commit và push `f4dddee feat(models): validate status and priority`.

---

## Bước 19 – Vòng 2: Refactor (gộp thành `oneOf`, hằng `STATUSES` / `PRIORITIES`)

**Thời gian:** 2026-10-21 · **Người làm:** Claude (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

- Tách phần chung của `validateStatus` và `validatePriority` thành hàm `oneOf(value, allowed, code, label)`.
- Đưa 2 danh sách lên đầu file thành hằng `STATUSES`, `PRIORITIES` và **export** chúng.
- Không sửa test.

### Why

- **Loại bỏ trùng lặp (DRY):** hai hàm giống nhau từng dòng, chỉ khác 3 thứ (danh sách, mã lỗi, tên trường). Sửa cách báo lỗi (ví dụ dịch thông báo) thì trước đây phải sửa 2 chỗ, dễ lệch nhau; giờ chỉ 1 chỗ.
- **Hằng số dùng lại được:** lớp ngoài sẽ cần danh sách này – service khi validate bộ lọc `list --status`, CLI khi in trang help (`Statuses: open, in_progress, done`). Export từ model → một nguồn duy nhất, đúng tinh thần "đổi một chỗ".
- **Giữ `validateStatus` / `validatePriority`** thay vì để nơi khác gọi thẳng `oneOf(...)`: tên hàm nói rõ ý định, test và code gọi không phải biết chi tiết bên trong.

### How

```js
const MAX_TITLE_LENGTH = 100;
const STATUSES = ['open', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

// Checks that `value` is one of `allowed`; shared by every fixed-list field.
function oneOf(value, allowed, code, label) {
  if (!allowed.includes(value)) {
    throw new ValidationError(
      code,
      `Invalid ${label} "${value}". Allowed values: ${allowed.join(', ')}`,
    );
  }
  return value;
}

function validateStatus(status) {
  return oneOf(status, STATUSES, 'INVALID_STATUS', 'status');
}

function validatePriority(priority) {
  return oneOf(priority, PRIORITIES, 'INVALID_PRIORITY', 'priority');
}
```

Chứng minh hành vi không đổi:

| Kiểm tra | Kết quả |
|---|---|
| File test có bị sửa không (checksum) | `OK` – không đổi |
| `npm test` | `tests 10 · pass 10 · fail 0` (exit 0) |
| Thông báo lỗi | `Invalid status "OPEN". Allowed values: open, in_progress, done` – giống hệt trước |

### Kết quả / Ghi chú

- ✅ Refactor thứ hai của dự án. **Vòng 2 (M7–M10) hoàn tất.**
- VS Code từng báo *"Could not find name 'STATUSES'"* – do xem file ở trạng thái **giữa hai lần sửa** (đã dùng hằng nhưng chưa khai báo). Sau khi thêm khai báo, test chạy đúng → không phải lỗi thật. Bài học: chỉ tin kết quả **chạy test** sau khi sửa xong, không tin cảnh báo trung gian.
- Commit đề xuất: `refactor(models): share enum validation for status and priority`.
- Tiếp theo: **vòng 3 – description (M11–M14)**.

> **Cập nhật Bước 19:** Ngọc commit và push `2aa9f24 refactor(models): share enum validation for status and priority`. **Vòng 2 (M7–M10) hoàn tất.**

---

## Bước 20 – Vòng 3 (description – M11–M14): bước Red

**Thời gian:** 2026-10-21 · **Người làm:** Claude viết test + stub (theo yêu cầu); Ngọc review và commit · **Commit:** chưa

### What

- Thêm 4 test: M11 (không có → `''`), M12 (trim), M13 (biên 1000 / 1001 → `DESCRIPTION_TOO_LONG`), M14 (không phải chuỗi → `INVALID_DESCRIPTION`).
- Thêm stub rỗng `validateDescription` và export.

### Why

- Description **không bắt buộc** (khác title): thiếu thì là `''` chứ không lỗi. Nhưng `null`, số, object là **dữ liệu sai kiểu** → lỗi, để phân biệt "không nhập" (`undefined`) với "nhập sai".
- **M13 gộp hai biên trong một test**: rút kinh nghiệm từ M3/M4 (Bước 12–13) – thiếu test "đúng 1000" thì lỗi `>=` lọt qua. Đặt cả 1000 (hợp lệ) và 1001 (lỗi) trong cùng test để không bao giờ tách rời.
- Dùng `'d'.repeat(…)` như title – chắc chắn đúng độ dài.

### How

```js
test('M11: a missing description becomes an empty string', () => {
  assert.equal(validateDescription(undefined), '');
});

test('M12: trims the description', () => {
  assert.equal(validateDescription('  Steps to reproduce  '), 'Steps to reproduce');
});

test('M13: accepts 1000 characters and rejects 1001 with DESCRIPTION_TOO_LONG', () => {
  const max = 'd'.repeat(1000);
  assert.equal(validateDescription(max), max);
  assert.throws(() => validateDescription('d'.repeat(1001)), {
    name: 'ValidationError',
    code: 'DESCRIPTION_TOO_LONG',
  });
});

test('M14: rejects a non-string description with INVALID_DESCRIPTION', () => {
  for (const bad of [null, 7, {}]) {
    assert.throws(() => validateDescription(bad), {
      name: 'ValidationError',
      code: 'INVALID_DESCRIPTION',
    });
  }
});
```

```
✖ M11 · ✖ M12 · ✖ M13 · ✖ M14   – đều AssertionError (stub trả undefined / không ném lỗi)
ℹ tests 14 · pass 10 · fail 4
```

### Kết quả / Ghi chú

- ✅ Đỏ đúng lý do; 10 test cũ vẫn xanh.
- Commit đề xuất: `test(models): add failing tests for description`.
