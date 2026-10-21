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
- có nhật ký AI thật (`AI-LOG.md`): hỏi gì, nhận gì, sửa gì, từ chối gì.

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
- Bước này do AI làm → nên ghi một dòng vào `docs/AI-LOG.md` khi tạo file đó.

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

- Ngọc chọn đúng cả 4 phương án Claude đánh dấu *Recommended*. Nên ghi vào `AI-LOG.md` là đã **đọc lý do và đồng ý**, hoặc ghi lý do riêng của mình nếu có.
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
- Mục `--tags` là ví dụ cụ thể **không nhận nguyên đề xuất của AI**: Ngọc dừng lại ở mục này, yêu cầu xem các phương án rồi mới chọn → nên ghi vào `AI-LOG.md`.
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
- Ghi vào `AI-LOG.md`: code Green do Claude viết; Ngọc cần đọc hiểu và giải thích được vì sao **chỉ** có `title.trim()`.
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
- Ghi `AI-LOG.md`: `ticket.js` vòng này do Claude sửa.
