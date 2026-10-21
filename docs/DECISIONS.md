# Quyết định thiết kế – Ticket Manager CLI

Chốt trước khi viết code (Giai đoạn 2). Mọi test và code phải khớp với tài liệu này; muốn đổi một quyết định thì sửa ở đây trước, ghi lý do, rồi mới sửa test.

**Nguồn** cho biết ai/đâu quyết định:

- **W1**: đã chốt trong báo cáo tuần 1 – [`Report.md` ở repo tuần 1](https://github.com/ngocnt1505/ai-training-week1/blob/main/Report.md); "Report §…" là số mục trong báo cáo đó.
- **Ngọc**: Ngọc chọn ngày 2026-10-21 (sau khi xem các phương án Claude đưa ra).
- **Ngọc (xác nhận)**: Claude đề xuất, Ngọc đã xem và xác nhận ngày 2026-10-21.

---

## 1. Các trường của ticket

| Trường | Kiểu | Ai đặt giá trị | Nguồn |
|---|---|---|---|
| `id` | số nguyên dương | chương trình (xem mục 6) | W1 |
| `title` | chuỗi | người dùng, bắt buộc | W1 |
| `description` | chuỗi | người dùng, không bắt buộc | đề bài |
| `status` | enum | người dùng, có mặc định | đề bài |
| `priority` | enum | người dùng, có mặc định | đề bài |
| `tags` | mảng chuỗi | người dùng, không bắt buộc | đề bài |
| `createdAt` | chuỗi ISO 8601 | chương trình, lúc tạo | W1 |
| `updatedAt` | chuỗi ISO 8601 | chương trình, lúc tạo và mỗi lần sửa | W1 |

## 2. Giá trị hợp lệ và mặc định

| Trường | Giá trị hợp lệ | Mặc định | Nguồn |
|---|---|---|---|
| `status` | `open` \| `in_progress` \| `done` | `open` | W1 + Ngọc |
| `priority` | `low` \| `medium` \| `high` | `medium` | Ngọc |
| `description` | chuỗi, trim | `''` (rỗng) | Ngọc |

- Giá trị phải viết **đúng chữ thường**: `OPEN`, `High` bị từ chối (không tự sửa). Thông báo lỗi liệt kê các giá trị hợp lệ. — Ngọc (xác nhận)
- Độ dài tối đa của `description`: **1000 ký tự**. — Ngọc (xác nhận)

## 3. Quy tắc cho `title`

| Quy tắc | Nguồn |
|---|---|
| Bắt buộc | W1 |
| Trim khoảng trắng hai đầu; rỗng hoặc toàn khoảng trắng sau khi trim → lỗi | W1 |
| Tối đa **100 ký tự**, đếm bằng `String.prototype.length` **sau khi trim** (emoji `😀` tính là 2) | W1 (Report §2.3, Ghi chú 2) |
| Không phải chuỗi (`undefined`, `null`, số, object, mảng) → lỗi validation, **không** để lộ `TypeError` | W1 (Report Mã 2b) |
| Biên: 100 ký tự hợp lệ, 101 ký tự lỗi | W1 |

## 4. Tags

| Quyết định | Nguồn |
|---|---|
| Nhập bằng một chuỗi cách nhau bởi dấu phẩy: `--tags bug,ui` | Ngọc |
| Chuẩn hóa: tách theo dấu phẩy → trim từng tag → bỏ tag rỗng → **chuyển chữ thường** → bỏ trùng (giữ thứ tự xuất hiện đầu tiên). Ví dụ `' bug, UI ,,bug'` → `['bug', 'ui']` | Ngọc |
| Lọc nhiều tag: **có tất cả (AND)** – `--tags bug,ui` chỉ hiện ticket có cả `bug` lẫn `ui` | Ngọc |
| Lọc không phân biệt hoa thường (hệ quả của việc lưu chữ thường) | Ngọc |
| Mỗi tag tối đa **30 ký tự** | Ngọc (xác nhận) |

**Lý do chọn AND:** thêm điều kiện thì kết quả thu hẹp lại; nhất quán với việc kết hợp `--status`, `--priority`, `--tags` cũng là AND.

## 5. Lệnh `update`

| Quyết định | Nguồn |
|---|---|
| Sửa được **5 trường**: `title`, `description`, `status`, `priority`, `tags` | Ngọc |
| **Không** sửa được `id`, `createdAt`, `updatedAt` | W1 |
| Mỗi lần update làm mới `updatedAt`, giữ nguyên `createdAt` | W1 |
| Không truyền trường nào → lỗi cách dùng | Ngọc (xác nhận) |
| Có một giá trị sai → **từ chối toàn bộ**, ticket và file giữ nguyên (không "đổi một nửa") | W1 (Report Bảng 6) |
| `--tags` thay thế **toàn bộ** tag cũ (không cộng thêm); xóa hết tag bằng `--tags=` | Ngọc – chọn sau khi so sánh 3 cách: thay thế / cộng thêm / tách `--add-tags` + `--remove-tags` |

## 6. Sinh `id`

| Quyết định | Nguồn |
|---|---|
| Ticket đầu tiên có `id = 1` | W1 |
| Ticket mới: `id` = id lớn nhất hiện có + 1 (vẫn đúng khi có lỗ hổng, ví dụ `[2, 9, 4]` → `10`) | W1 |
| Vẫn đúng sau khi chạy lại chương trình (id tính từ dữ liệu trong file, không lưu bộ đếm riêng) | W1 |

## 7. File dữ liệu

| Quyết định | Nguồn |
|---|---|
| Định dạng: **một mảng JSON** các ticket, UTF-8, thụt lề 2 dấu cách (đọc được bằng mắt) | W1 + Ngọc (xác nhận thụt lề) |
| Đường dẫn: biến môi trường `TICKETS_FILE`; không có thì dùng `tickets.json` trong **thư mục hiện tại** | W1 |
| File chưa tồn tại → coi là chưa có ticket nào (`list` in danh sách rỗng; `create` đầu tiên tạo file) | W1 |
| **Thư mục chưa tồn tại → báo lỗi (exit 1), không tự tạo thư mục** | Ngọc (trả lời câu treo từ W1, Report Bảng 10) |
| File rỗng hoặc chỉ có khoảng trắng → coi là chưa có ticket nào | Ngọc (xác nhận) |
| JSON hỏng hoặc không phải mảng (`{}`, `null`) → báo lỗi có đường dẫn file, **không bao giờ ghi đè** | W1 |
| Ghi nguyên tử: ghi ra file tạm cùng thư mục rồi `rename`; ghi lỗi thì file cũ giữ nguyên | W1 |

**Lý do không tự tạo thư mục:** nếu gõ nhầm `TICKETS_FILE`, tự tạo thư mục sẽ âm thầm lưu dữ liệu vào chỗ sai; báo lỗi thì người dùng phát hiện ngay.

## 8. Lỗi và exit code

| Exit | Ý nghĩa | Ví dụ | Nguồn |
|---|---|---|---|
| `0` | Thành công | | W1 |
| `1` | Lỗi nghiệp vụ / dữ liệu – phải đọc dữ liệu mới biết | ticket không tồn tại, file JSON hỏng, không đọc/ghi được file | W1 |
| `2` | Sai cách dùng / input không hợp lệ – nhìn lệnh là biết | lệnh lạ, option lạ, thiếu tham số, id sai định dạng, giá trị status/priority sai, title rỗng/quá dài | W1 |

- Thông báo lỗi ra **stderr**, stdout để trống; không in stack trace. — W1
- Mỗi lỗi có `code` cố định (ví dụ `EMPTY_TITLE`, `NOT_FOUND`); test kiểm tra `code`, không kiểm tra câu chữ. — W1 (Report Mã 3)
- Id hợp lệ: chỉ gồm chữ số, không bắt đầu bằng 0, lớn hơn 0. `abc`, `0`, `-1`, `1.5`, `12abc`, `1e2` → exit 2. — W1

## 9. Kiến trúc tầng service

| Quyết định | Nguồn |
|---|---|
| Service là **các hàm thuần trên mảng**: nhận mảng tickets, trả về **mảng mới** (không sửa mảng đầu vào), không đọc/ghi file | Ngọc (chọn giữa: hàm thuần trên mảng / service object + repository) |
| Tầng CLI làm việc với file: `load` → gọi service → `save` | Ngọc |
| Lỗi → service ném lỗi **trước khi** trả về mảng mới → CLI không tới bước `save` → file giữ nguyên | Ngọc |

```js
createTicket(tickets, input, now)        → { tickets, ticket }
listTickets(tickets, filters)            → tickets[]
findTicket(tickets, id)                  → ticket   (không thấy → NOT_FOUND)
updateTicket(tickets, id, changes, now)  → { tickets, ticket }
```

**Lý do:** đúng tinh thần "logic trên mảng" của kế hoạch và Report tuần 1 §4.1; unit test không cần bản giả nào; "lỗi thì không lưu" được bảo đảm bởi cấu trúc code chứ không phải bởi việc nhớ kiểm tra.

---

## Trạng thái

- [x] Toàn bộ mục đề xuất đã được Ngọc xác nhận (2026-10-21).
- [ ] Hỏi mentor nếu cần: cách lọc nhiều tag (đã chọn AND) và phạm vi `update` (đã chọn 5 trường).
