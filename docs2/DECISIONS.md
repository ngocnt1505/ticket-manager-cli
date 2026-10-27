# Quyết định thiết kế – Week 3: KB CLI

Chốt trước khi viết code. Test và code phải khớp với tài liệu này; muốn đổi thì sửa ở đây trước.

**Nguồn:** **Đề** = có trong `docs2/` (ghi file + dòng) · **Ngọc** = Ngọc chọn · **Thiết kế** = Claude thiết kế dựa trên đề vì đề không nói rõ, Ngọc đồng ý tự thiết kế (2026-10-27).

---

## 1. Phạm vi và công nghệ

| Quyết định | Nguồn |
|---|---|
| Lệnh mới là **chương trình riêng `kb`** (`kb search`, `kb list`, `kb retrieve`, `kb add`); lệnh `tickets` tuần 2 giữ nguyên | Đề (`tasks.md` ví dụ lệnh) + Ngọc |
| Làm tiếp trong repo tuần 2; bản nộp tuần 2 giữ bằng tag `week2-submission` (commit `7041f78`) | Ngọc |
| Phần KB viết bằng **TypeScript + Commander.js + Jest**; phần `tickets` tuần 2 giữ JavaScript + `node:test` | Đề (`architecture.md` – Technology Stack) + Ngọc |
| HTTP dùng `fetch` có sẵn trong Node (không cài axios) | Đề cho phép "fetch or axios" |
| TDD gọn: mỗi nhóm tính năng một commit `test(kb)` đỏ → một commit `feat(kb)` xanh, `refactor(kb)` khi cần | Ngọc |

## 2. Dữ liệu

```ts
interface Document {            // Đề – architecture.md
  id: string;                   // "doc-001"
  title: string;
  content: string;              // markdown
  nodePath: string;             // "/templates/email"
  tags: string[];
}

interface SearchResult {        // Đề – tasks.md: (document, matchType)
  document: DocumentSummary;    // Document không có content
  matchType: 'title' | 'tag' | 'content';
}

interface KBQuery {             // Đề – tasks.md: (query, filters, topK)
  query: string;
  filters?: { nodePath?: string };
  topK?: number;
}
```

**Dữ liệu mẫu của mock (3 tài liệu – Đề: "2–3 docs, 1 email template + 1 team doc"):**

| id | title | nodePath | tags |
|---|---|---|---|
| `doc-001` | Customer Response Template | `/templates/email` | template, email |
| `doc-002` | DevOps Team Members | `/team/devops` | team, devops |
| `doc-003` | Getting Started Guide | `/docs/guides` | guide, onboarding |

## 3. Luật nghiệp vụ (mock và HTTP phải giống hệt nhau) – Thiết kế

| Thao tác | Luật |
|---|---|
| **search** | Tìm `query` (không phân biệt hoa thường) trong tiêu đề → tag → nội dung; `matchType` là chỗ khớp **đầu tiên** theo thứ tự đó. Sắp xếp: khớp tiêu đề trước, rồi tag, rồi nội dung; cùng loại thì theo id. Lấy tối đa `topK` (mặc định **10**, Ngọc). `query` rỗng → lỗi |
| **list** | Tài liệu có `nodePath` **bằng** node hoặc **nằm bên trong** node (`/templates` gồm cả `/templates/email`). Không có node → tất cả. Sắp theo id, tối đa `limit` (mặc định **10**, Ngọc) |
| **retrieve** | Theo id; không có → lỗi `NOT_FOUND` |
| **add** | Bắt buộc `title`, `content`, `nodePath` (bắt đầu bằng `/`); tags chuẩn hóa như tuần 2 (trim, chữ thường, bỏ trùng). id mới = số lớn nhất + 1, dạng `doc-004` |
| `topK`, `limit` | Số nguyên dương; sai → lỗi |

## 4. API contract (HTTP) – Thiết kế, mở rộng từ `architecture.md`

Mọi endpoint: `POST`, body và response là JSON (`Content-Type: application/json`). Request giữ **đúng** như `architecture.md`; response và lỗi do đề chưa ghi nên thiết kế thêm.

| Endpoint | Request (Đề) | Response thành công |
|---|---|---|
| `POST /search` | `{ "query": "response", "topK": 5 }` (+ `filters` tùy chọn) | `200 { "results": [ { "id", "title", "nodePath", "tags", "matchType" } ] }` – các trường `id`, `title`, `nodePath` như ví dụ trong đề |
| `POST /list` | `{ "nodePath": "/templates/email", "limit": 10 }` | `200 { "documents": [ { "id", "title", "nodePath", "tags" } ] }` |
| `POST /retrieve` | `{ "docId": "doc-001" }` | `200 { "document": { "id", "title", "content", "nodePath", "tags" } }` |
| `POST /add` | `{ "title", "content", "nodePath", "tags" }` | `201 { "document": { …, "id": "doc-004" } }` |

**Lỗi:** `{ "error": { "code": "...", "message": "..." } }`

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `INVALID_INPUT` | Thiếu / sai trường (query rỗng, topK âm, nodePath không bắt đầu bằng `/`…) |
| 404 | `NOT_FOUND` | `retrieve` id không tồn tại; endpoint lạ |
| 500 | `INTERNAL` | Lỗi phía server |

## 5. KB server – (không có URL server thật)

| Quyết định | Nguồn |
|---|---|
| Viết một **KB server tham chiếu** (`node:http`, chạy bằng `npm run kb-server`) cài đúng contract mục 4, dùng lại chính logic của mock client (dữ liệu trong bộ nhớ) | Thiết kế; đề cho phép: *"Access to KB API server (**mock or real**)"* (`tasks.md` dòng 13) |
| `HTTPKBClient` gọi bất kỳ server nào theo contract qua `KB_API_URL` → có server thật thì chỉ cần đổi biến môi trường | Thiết kế |
| Test HTTP client bằng **HTTP thật** tới server tham chiếu chạy trên cổng ngẫu nhiên trong test (không mock `fetch`) – giống tuần 2 dùng file thật thay vì mock `fs` | Thiết kế |
| Ghi rõ trong README: chưa được cấp URL KB server production; đã kiểm chứng với server tham chiếu | Trung thực về AC 4 |

## 6. Cấu hình

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| `KB_CLIENT` | `mock` | `mock` hoặc `http` – **đổi client** (Đề: "swappable via environment variable") |
| `KB_API_URL` | `http://localhost:3000` | Địa chỉ KB server khi `KB_CLIENT=http` |
| `KB_DEBUG` | (tắt) | `1` → in từng request/response ra stderr (Đề: "logging to debug integration issues") |

## 7. Lệnh và exit code (giữ quy ước tuần 2)

```
kb search <query> [--top-k <n>] [--node <path>]
kb list [--node <path>] [--limit <n>]
kb retrieve <docId>
kb add --file <file.md> --path <nodePath> [--tags <a,b>] [--title <text>]
```

- `kb add` đọc nội dung từ file; tiêu đề lấy từ `--title`, nếu không có thì lấy dòng `# Tiêu đề` đầu tiên trong file, nếu không có nữa thì lấy tên file.
- Mỗi lệnh có `--help` (Commander tạo sẵn).
- Output (Thiết kế):

```
$ kb search team --top-k 2
doc-002  DevOps Team Members  /team/devops  [team, devops]  (match: title)
doc-001  Customer Response Template  /templates/email  [template, email]  (match: content)

$ kb list --node /team
doc-002  DevOps Team Members  /team/devops  [team, devops]

$ kb retrieve doc-002
ID:    doc-002
Title: DevOps Team Members
Path:  /team/devops
Tags:  team, devops

<nội dung markdown>

$ kb add --file sms.md --path /templates/sms --tags sms
Added doc-004: SMS Reminder (/templates/sms)
```

  Không có kết quả → `No documents found.` (exit 0).

| Exit | Khi nào |
|---|---|
| `0` | Thành công |
| `1` | Lỗi dữ liệu / bên ngoài: tài liệu không tồn tại, không kết nối được KB server, server trả lỗi 5xx hoặc JSON hỏng, file `--file` không đọc được |
| `2` | Sai cách dùng: lệnh/option lạ, thiếu tham số, `--top-k` không phải số nguyên dương, `nodePath` sai dạng, server trả 400 |

Lỗi in một dòng `Error: …` ra stderr, không stack trace.
