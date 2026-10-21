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
