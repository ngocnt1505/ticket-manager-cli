# Nhật ký dự án – Week 3: Tích hợp CLI với Knowledge Base API

Nguyễn Thúy Ngọc · AI Training, Week 3

File này ghi lại **từng bước** của bài tuần 3 theo thứ tự thời gian, cùng cách làm như tuần 2 (`docs/history.md`). Ngọc là người thực hiện và commit; Claude (Claude Code) hướng dẫn, giải thích, viết code khi được yêu cầu và review. Mỗi mục gồm:

- **What** – đã làm gì;
- **Why** – vì sao làm vậy;
- **How** – làm cụ thể như thế nào (lệnh, file, output chạy thật);
- **Kết quả / Ghi chú** – trạng thái sau bước, quyết định còn treo.

---

## Bước 0 – Khởi động tuần 3: tag bản tuần 2, cài TypeScript + Jest + Commander

**Thời gian:** 2026-10-27 · **Người làm:** Ngọc gắn tag và commit tài liệu; Claude cài đặt và cấu hình (theo yêu cầu) · **Commit:** chưa

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
