# Trả lời Mentor Q&A – Week 2

Nguyễn Thúy Ngọc · Ticket Manager CLI · commit `b9dae64`

---

## 1. Một vòng Red → Green → Refactor

Ví dụ: luật cho **tiêu đề ticket** (bắt buộc, bỏ khoảng trắng hai đầu, tối đa 100 ký tự).

### Red – viết test trước, thấy nó đỏ

Commit `a636cbd`: viết test "tiêu đề `'   Fix login   '` phải thành `'Fix login'`", kèm một hàm rỗng.

```
✖ actual: undefined   expected: 'Fix login'
```

Test đỏ **đúng lý do**: hàm chưa làm gì nên trả về `undefined`.
Em thêm hàm rỗng vì nếu không có, test sẽ đỏ với lỗi "không tìm thấy file". Lỗi đó không chứng minh được test kiểm tra đúng điều cần kiểm tra.

### Green – viết code ít nhất để test xanh

Commit `de8f421`:

```js
function validateTitle(title) {
  return title.trim();
}
```

Chỉ một dòng. Em chưa kiểm tra tiêu đề rỗng hay quá dài, vì chưa có test nào yêu cầu.

### Các vòng sau – mỗi test mới "kéo" thêm một đoạn code

| Test mới (đỏ) | Code thêm vào (xanh) |
|---|---|
| Tiêu đề rỗng → lỗi `EMPTY_TITLE` | `if (!clean) throw …` |
| 101 ký tự → lỗi `TITLE_TOO_LONG` | `if (clean.length > 100) throw …` |
| Không phải chuỗi (`42`, `null`…) → lỗi `INVALID_TITLE` | `if (typeof title !== 'string') throw …` |

Em có thêm test "**đúng 100 ký tự vẫn hợp lệ**". Để kiểm tra test này có tác dụng, em cố ý sửa `>` thành `>=` trong code: nếu không có test này thì không test nào đỏ.

### Refactor – dọn code, test không đổi

Commit `7843165`: số `100` xuất hiện ở hai chỗ, nên em đặt tên cho nó là `MAX_TITLE_LENGTH`.
Commit này **không sửa file test nào**, và test vẫn 6/6 xanh, nghĩa là hành vi không đổi.

### Tự kiểm tra lại

Chạy test ở từng commit (ngày 2026-10-27):

| Commit | Bước | Kết quả |
|---|---|---|
| `a636cbd` | Red | 0 pass, 1 fail |
| `de8f421` | Green | 1 pass |
| `436a224` → `8b2baa9` | Red → Green (rỗng) | 1/1 fail → 2 pass |
| `b7da95f` → `cd8a061` | Red → Green (101 ký tự) | 2/1 fail → 3 pass |
| `0f3605c` → `92681e4` | Red → Green (không phải chuỗi) | 5/1 fail → 6 pass |
| `7843165` | Refactor | 6 pass |

**Điều em rút ra:** Red chứng minh test thật sự kiểm tra được lỗi; Green giữ code tối thiểu; Refactor chỉ an toàn khi đã có đủ test canh giữ.

---

## 2. Vì sao lưu bằng JSON

- Đề bài yêu cầu lưu bằng file JSON.
- Node có sẵn `JSON.parse` / `JSON.stringify`, nên **không cần cài thêm thư viện**.
- File dễ đọc, có thể mở ra xem hoặc sửa bằng tay.
- Phù hợp với CLI một người dùng, ít dữ liệu.

Nếu file JSON bị hỏng, chương trình **báo lỗi và không ghi đè** file, để người dùng còn sửa lại được.

---

## 3. Vì sao ghi qua file tạm (temporary file)

**Vấn đề:** nếu ghi thẳng vào `tickets.json`, máy sẽ **xóa trắng file trước rồi mới ghi**. Em đã chạy thử: file đang 43 byte, mở ra để ghi thì còn **0 byte**. Nếu chương trình dừng đúng lúc đó (lỗi, đầy đĩa, tắt máy), toàn bộ ticket cũ mất.

**Cách làm:**

1. Ghi dữ liệu mới vào file tạm `tickets.json.tmp`.
2. Ghi xong mới **đổi tên** file tạm thành `tickets.json`.

Lỗi xảy ra ở bước 1 thì file thật **vẫn nguyên**. Bước 2 diễn ra trong một thao tác, nên file luôn là bản cũ đầy đủ hoặc bản mới đầy đủ, không bao giờ là bản ghi dở.

**Test chứng minh:** test D10 cố ý làm bước ghi thất bại, rồi kiểm tra file cũ không bị đổi một byte nào. Khi em sửa code thành "ghi thẳng vào file thật", test D10 đỏ ngay.

**Chưa xử lý** (đã ghi trong README):

- Hai lệnh ghi cùng lúc có thể đè mất thay đổi của nhau, vì chưa có khóa file.
- Mất điện ngay sau khi lưu có thể mất thay đổi cuối.
- Nếu `TICKETS_FILE` là symlink thì symlink bị thay bằng file thường.

Nếu mở rộng bài, em sẽ viết test cho các trường hợp này trước, rồi mới sửa code.


