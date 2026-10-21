# Test list – Ticket Manager CLI

Danh sách kịch bản cần test, viết **trước khi code** (Canon TDD, Report tuần 1 §2.2). Mỗi vòng TDD chuyển **đúng một dòng** thành test: Red → Green → Refactor → đánh dấu `[x]`.

**Quy tắc:**

- Nghĩ ra trường hợp mới trong lúc làm → **thêm vào mục "Phát sinh"** ở cuối, không làm ngay.
- Mã ở đầu dòng (`M1`, `S3`…) dùng để nhắc trong commit message và `history.md`.
- Mọi luật lấy từ [`DECISIONS.md`](DECISIONS.md); nguồn gốc từ Bảng 6 tuần 1 ghi là *(W1)*, phần mới của tuần 2 ghi là *(mới)*.
- Cấp độ: **U** = unit (không đụng file), **I** = integration (file thật trong thư mục tạm / chạy CLI thật).

---

## 1. Models – validation (U)

### Title

- [x] **M1** Title hợp lệ được trim: `'  Fix login  '` → `'Fix login'` *(W1)*
- [x] **M2** Title rỗng hoặc toàn khoảng trắng (`''`, `'   '`, `'\t\n'`) → lỗi `EMPTY_TITLE` *(W1)*
- [x] **M3** Title đúng 100 ký tự → hợp lệ *(W1, biên)*
- [x] **M4** Title 101 ký tự → lỗi `TITLE_TOO_LONG` *(W1, biên)*
- [x] **M5** Độ dài tính **sau khi trim**: 100 ký tự + khoảng trắng hai đầu → hợp lệ *(W1)*
- [x] **M6** Title không phải chuỗi (`undefined`, `null`, `42`, `{}`, `['x']`) → lỗi `INVALID_TITLE`, không phải `TypeError` *(W1)*

### Status và priority

- [x] **M7** Status nhận `open`, `in_progress`, `done` *(W1)*
- [x] **M8** Status sai (`closed`, `OPEN`, `''`) → lỗi `INVALID_STATUS`, thông báo liệt kê giá trị hợp lệ *(W1)*
- [x] **M9** Priority nhận `low`, `medium`, `high` *(mới)*
- [x] **M10** Priority sai (`urgent`, `High`, `''`) → lỗi `INVALID_PRIORITY` *(mới)*

### Description

- [x] **M11** Không có description → `''` *(mới)*
- [x] **M12** Description được trim *(mới)*
- [x] **M13** Description 1000 ký tự hợp lệ, 1001 ký tự → lỗi `DESCRIPTION_TOO_LONG` *(mới, biên)*
- [x] **M14** Description không phải chuỗi (`null`, `7`) → lỗi `INVALID_DESCRIPTION` *(mới)*

### Tags

- [x] **M15** Tách chuỗi theo dấu phẩy và trim: `'bug, ui'` → `['bug', 'ui']` *(mới)*
- [x] **M16** Bỏ tag rỗng: `'bug,,ui,'` → `['bug', 'ui']` *(mới)*
- [x] **M17** Chuyển chữ thường và bỏ trùng: `'Bug,bug,UI'` → `['bug', 'ui']` *(mới)*
- [x] **M18** Không có tags hoặc chỉ toàn dấu phẩy/khoảng trắng → `[]` *(mới)*
- [x] **M19** Giữ tiếng Việt: `'Giao diện'` → `['giao diện']` *(mới)*
- [x] **M20** Tag 30 ký tự hợp lệ, 31 ký tự → lỗi `INVALID_TAG` *(mới, biên)*

### Tạo và cập nhật một ticket (hàm thuần)

- [x] **M21** Tạo ticket chỉ với title → điền mặc định: `status = open`, `priority = medium`, `description = ''`, `tags = []`; gắn `id`, `createdAt = updatedAt = now` *(W1)*
- [x] **M22** Tạo ticket với đủ trường → dùng đúng giá trị đã validate *(mới)*
- [x] **M23** Cập nhật chỉ đổi trường được yêu cầu và làm mới `updatedAt`; `id`, `createdAt` giữ nguyên *(W1)*
- [x] **M24** Cập nhật không sửa object ticket gốc (trả về object mới) *(mới)*
- [x] **M25** Một giá trị sai → từ chối **cả** lần cập nhật, ticket không bị đổi một nửa *(W1)*
- [x] **M26** Không cho sửa `id`, `createdAt`, `updatedAt` hoặc trường lạ → lỗi *(W1)*
- [x] **M27** Cập nhật mà không có trường nào → lỗi `NO_CHANGES` *(mới)*

---

## 2. Services – hàm thuần trên mảng (U, chưa đụng file)

Service nhận mảng tickets và trả về mảng **mới**; "không lưu" ở đây nghĩa là **mảng đầu vào không bị đổi và không có mảng mới nào được trả về** (xem `DECISIONS.md` §9).

### create

- [x] **S1** Ticket đầu tiên có id 1; kết quả gồm ticket mới và mảng mới chứa nó *(W1)*
- [x] **S2** Id mới = id lớn nhất + 1, kể cả khi có lỗ hổng (`[2, 9, 4]` → `10`) *(W1)*
- [x] **S3** Tạo liên tiếp trên mảng vừa trả về → id 1, 2 (id tính từ dữ liệu, không có bộ đếm riêng → vẫn đúng sau khi chạy lại chương trình) *(W1)*
- [x] **S4** Input sai → báo lỗi, mảng đầu vào không đổi *(W1)*

### list

- [x] **S5** Chưa có ticket → danh sách rỗng *(W1)*
- [x] **S6** Kết quả sắp xếp theo id tăng dần *(W1)*
- [x] **S7** Lọc theo status *(mới)*
- [x] **S8** Lọc theo priority *(mới)*
- [x] **S9** Lọc theo một tag *(mới)*
- [x] **S10** Lọc nhiều tag: ticket phải có **tất cả** tag (AND) *(mới)*
- [x] **S11** Lọc tag không phân biệt hoa thường (`--tags BUG` tìm được `bug`) *(mới)*
- [x] **S12** Kết hợp status + priority + tags theo AND *(mới)*
- [x] **S13** Giá trị lọc sai (`status: 'closed'`) → lỗi, **không** trả về danh sách rỗng *(W1)*

### show

- [x] **S14** Tìm thấy ticket theo id *(W1)*
- [x] **S15** Id không tồn tại → lỗi `NOT_FOUND`, thông báo có id *(W1)*

### update

- [x] **S16** Đổi status → lưu lại, `updatedAt` mới, `createdAt` giữ nguyên *(W1)*
- [x] **S17** `--tags` thay thế toàn bộ tag cũ *(mới)*
- [x] **S18** Các ticket khác không bị ảnh hưởng *(mới)*
- [x] **S19** Id không tồn tại → lỗi `NOT_FOUND`, mảng đầu vào không đổi *(W1)*
- [x] **S20** Giá trị sai → lỗi, mảng đầu vào không đổi *(W1)*

---

## 3. Storage – file JSON

### Hàm thuần (U)

- [x] **D1** `parseTickets`: mảng JSON hợp lệ → mảng ticket *(W1)*
- [x] **D2** `parseTickets`: chuỗi rỗng hoặc chỉ khoảng trắng → `[]` *(mới)*
- [x] **D3** `parseTickets`: JSON cắt ngang (`'[{"id":1,'`) → lỗi `CORRUPTED_FILE`, thông báo có đường dẫn file *(W1)*
- [x] **D4** `parseTickets`: JSON hợp lệ nhưng không phải mảng (`{}`, `null`, `42`) → `CORRUPTED_FILE` *(W1)*
- [x] **D5** `serializeTickets`: ra JSON thụt lề 2 dấu cách, kết thúc bằng xuống dòng *(mới)*
- [x] **D6** `serializeTickets` → `parseTickets` giữ nguyên tiếng Việt có dấu và emoji *(W1)*

### Đọc/ghi file thật (I)

- [x] **D7** `load`: file chưa tồn tại → `[]`, và **không** tự tạo file *(W1)*
- [x] **D8** `save` rồi `load` → đúng dữ liệu đã ghi *(W1)*
- [x] **D9** `load`: file hỏng → lỗi `CORRUPTED_FILE`, file giữ nguyên **từng byte** *(W1)*
- [x] **D10** `save`: ghi thất bại → lỗi `SAVE_FAILED`, file gốc giữ nguyên từng byte *(W1)*
- [x] **D11** `save`: thư mục cha không tồn tại → lỗi `SAVE_FAILED`, **không** tự tạo thư mục *(mới, theo DECISIONS §7)*
- [x] **D12** `save` xong không để lại file tạm *(mới)*

---

## 4. Commands – CLI

### Lớp commands với stdout/stderr giả (U/I)

- [x] **C1** `create` thành công → in id mới ra stdout, exit 0 *(W1)*
- [x] **C2** `create` thiếu `--title` → stderr, stdout trống, exit 2, không ghi file *(W1)*
- [x] **C3** `list` rỗng → thông báo thân thiện (`No tickets found.`), exit 0 *(W1)*
- [x] **C4** `list` in mỗi ticket một dòng: id, status, priority, title, tags *(mới)*
- [x] **C5** `show` in đủ các trường *(W1)*
- [ ] **C6** `update` thành công → xác nhận thay đổi, exit 0 *(W1)*
- [ ] **C7** `update` không có option nào → exit 2 *(mới)*
- [ ] **C8** Lỗi validation (status/priority sai, title quá dài) → exit 2 *(W1)*
- [x] **C9** Không tìm thấy ticket → exit 1, lỗi ra stderr, stdout trống *(W1)*
- [x] **C10** Id sai định dạng (`abc`, `0`, `-1`, `1.5`, `12abc`, `1e2`) → exit 2; `1`, `42` hợp lệ *(W1)*

### Chạy CLI thật bằng `spawnSync` (I)

- [ ] **C11** `tickets create --title "..." --priority high --tags bug,ui` → exit 0, file có ticket *(W1)*
- [ ] **C12** `tickets list --status open --tags bug` → chỉ hiện ticket khớp *(mới)*
- [ ] **C13** `tickets show 1` → exit 0; `tickets show 99` → exit 1 *(W1)*
- [ ] **C14** `tickets update 1 --status done` → exit 0, file được cập nhật *(W1)*
- [ ] **C15** Lệnh không tồn tại, thiếu tham số, id sai định dạng → exit 2 *(W1)*
- [ ] **C16** File JSON hỏng → exit 1, thông báo dễ hiểu có đường dẫn, **không in stack trace**, file không bị ghi đè *(W1)*
- [ ] **C17** Không có `TICKETS_FILE` → dùng `tickets.json` trong thư mục hiện tại *(mới)*
- [ ] **C18** `TICKETS_FILE` trỏ vào thư mục chưa tồn tại → exit 1, không tạo thư mục *(mới)*

---

## Phát sinh

Trường hợp nghĩ ra trong lúc làm – thêm vào đây trước, làm sau.

- [x] **P1** Tags không phải chuỗi (`null`, `42`, `{}`, `['bug']`) → lỗi `INVALID_TAG` thay vì `TypeError`. *(nghĩ ra ở vòng 4; Ngọc quyết định **làm** – để mọi dữ liệu sai đều ra lỗi có `code`, nhất quán với title/description)*
- [x] **P2** `createTicket` thành công **không sửa mảng đầu vào** (trả mảng mới) – theo `DECISIONS.md` §9. *(phát hiện ở vòng 6 bằng mutation: đổi thành `tickets.push(ticket)` mà 32/32 vẫn xanh; Ngọc quyết định **làm ngay**)*
- [x] **P3** File là mảng nhưng **phần tử hỏng** (`[1]`, `[null]`, ticket thiếu `id`, `id` trùng) → `CORRUPTED_FILE` thay vì lỗi khó hiểu ở bước sau (ví dụ `create` sinh id `NaN`). *(nghĩ ra ở vòng 10; Ngọc quyết định **làm, chỉ kiểm tra `id`** – không kiểm tra các trường khác để tránh over-testing, Report §6.1)*
- [x] **P4** `load` đọc được file nhưng **lỗi khác "không tồn tại"** (ví dụ `TICKETS_FILE` trỏ vào một thư mục → `EISDIR`) → `StorageError` `READ_FAILED` có đường dẫn, thay vì lỗi thô của Node (CLI sẽ coi là bug). *(nghĩ ra ở vòng 11; Ngọc quyết định **làm**)*
- [x] **P5** `save`: file tạm đã ghi xong nhưng bước `rename` lỗi → **xóa file tạm**, không để rác `tickets.json.tmp`. *(nghĩ ra ở vòng 11; Ngọc quyết định **làm**)*
