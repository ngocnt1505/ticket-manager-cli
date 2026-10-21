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
