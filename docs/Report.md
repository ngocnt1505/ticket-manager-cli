# Test-Driven Development cho CLI tool khi làm việc cùng AI

**Nghiên cứu có kiểm soát bằng ba workflow: Layered Questioning, Solution Exploration và Iterative Refinement**

**Nguyễn Thúy Ngọc** · AI Training – Week 1 Homework · 13/10/2026

---

## Tóm tắt

Báo cáo trình bày kết quả nghiên cứu về Test-Driven Development (TDD) nhằm chuẩn bị xây dựng một Ticket Manager CLI với sự hỗ trợ của AI. Nội dung gồm:

1. Nguyên lý TDD và vòng lặp Red–Green–Refactor.
2. So sánh unit test, integration test và end-to-end test.
3. Danh sách kịch bản và ví dụ test cho CLI.
4. Vai trò của test trong việc kiểm chứng code do AI sinh ra.
5. Các sai lầm thường gặp khi viết test.

Nghiên cứu được thực hiện qua một cuộc trò chuyện thật với Claude (claude.ai), theo ba workflow trong tài liệu *AI Training – Mindset & Effective Usage*. Nhật ký được tóm tắt ở Phụ lục A và lưu đầy đủ dưới dạng ảnh chụp.

Kết quả chính: AI trả lời phần lớn chính xác. Tuy vậy, việc đặt câu hỏi tiếp và chạy lại code đã phát hiện:
- một khẳng định sai về kết quả chạy test;
- một sai sót kỹ thuật về Unicode;
- một kết luận đưa ra quá sớm;
- hai lỗi an toàn dữ liệu trong chính code do AI viết.

| Acceptance criteria | Vị trí trong báo cáo |
|---|---|
| TDD principles, testing levels, CLI test examples, AI validation | Mục 2–6 |
| Research process with AI is tracked (workflows, iterations) | Phụ lục A |
| Findings can be explained clearly | Mục 7, Phụ lục B |
| Questions on TDD, test types, AI validation can be answered | Phụ lục B |

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Nguyên lý của Test-Driven Development](#2-nguyên-lý-của-test-driven-development)
3. [Các cấp độ test](#3-các-cấp-độ-test)
4. [Test cho CLI tool: trường hợp Ticket Manager](#4-test-cho-cli-tool-trường-hợp-ticket-manager)
5. [Test như cơ chế kiểm chứng code do AI sinh ra](#5-test-như-cơ-chế-kiểm-chứng-code-do-ai-sinh-ra)
6. [Các sai lầm thường gặp](#6-các-sai-lầm-thường-gặp)
7. [Kết luận](#7-kết-luận)
- [Tài liệu tham khảo](#tài-liệu-tham-khảo)
- [Phụ lục A. Nhật ký quá trình làm việc với AI](#phụ-lục-a-nhật-ký-quá-trình-làm-việc-với-ai)
- [Phụ lục B. Câu hỏi và trả lời](#phụ-lục-b-câu-hỏi-và-trả-lời)

---

## 1. Giới thiệu

### 1.1 Bối cảnh và mục tiêu

AI có thể sinh code nhanh nhưng cũng có thể đưa ra giải pháp sai, thiếu trường hợp biên hoặc dựa trên thông tin không chính xác. Báo cáo này nghiên cứu TDD như một phương pháp giúp người phát triển giữ quyền kiểm soát chất lượng, phù hợp với nguyên tắc *"You are the architect – You design, AI helps implement"* [6].

### 1.2 Phương pháp nghiên cứu

- **Công cụ AI:** Claude (claude.ai), trong một cuộc trò chuyện ngày 13/10/2026.
- **Quy trình:** đi theo ba workflow (Bảng 1).
- **Review:** mỗi câu trả lời được đánh giá theo năm câu hỏi của tài liệu đào tạo (Bảng 8).
- **Kiểm chứng:** các khẳng định kỹ thuật được kiểm chứng bằng cách chạy lại code hoặc đối chiếu tài liệu gốc.
- **Ghi chú:** một phần việc chạy lại code và review ở Workflow 3 có sự hỗ trợ kiểm tra chéo của một phiên AI thứ hai; điều này được ghi rõ ở Phụ lục A.

**Bảng 1. Ba workflow áp dụng trong quá trình nghiên cứu**

| Workflow | Nội dung | Kết quả chính (Phụ lục A) |
|---|---|---|
| Layered Questioning | Học TDD qua bốn tầng: khái niệm, áp dụng vào Ticket CLI, ví dụ code, kiểm chứng | Test list cho Ticket CLI; hiểu "fail đúng lý do"; thấy coverage 100% vẫn có lỗi lọt |
| Solution Exploration | Chọn chiến lược test cho lớp lưu trữ file JSON | So sánh 9 phương án; chọn tách hàm thuần kết hợp file thật trong thư mục tạm |
| Iterative Refinement | Review, sửa và phản hồi code `save` do AI viết | Hai chỉnh sửa; AI review lại và phát hiện thêm hai lỗi an toàn liên quan đến symlink |

---

## 2. Nguyên lý của Test-Driven Development

### 2.1 Định nghĩa

TDD là phương pháp phát triển phần mềm trong đó người phát triển **viết một test mô tả hành vi mong muốn trước**, sau đó mới viết lượng code vừa đủ để test đó thành công. Phương pháp được Kent Beck phổ biến qua cuốn *Test-Driven Development: By Example* [1].

Điểm cốt lõi: test không phải sản phẩm phụ viết sau khi code hoàn tất, mà là **công cụ để suy nghĩ về yêu cầu** trước khi viết code.

### 2.2 Vòng lặp Red–Green–Refactor

TDD vận hành theo các vòng lặp ngắn gồm ba bước (Bảng 2).

**Bảng 2. Ba bước của vòng lặp TDD**

| Bước | Hành động | Câu hỏi kiểm tra |
|---|---|---|
| **Red** | Viết *một* test nhỏ cho hành vi chưa có; chạy và xác nhận test thất bại. | Test thất bại có đúng lý do mình mong đợi không? |
| **Green** | Viết code tối thiểu để test thành công. | Có viết thừa so với yêu cầu của test không? |
| **Refactor** | Cải thiện cấu trúc code; chạy lại toàn bộ test. | Code đã dễ đọc hơn chưa? Hành vi có thay đổi không? |

Trong mô tả mang tên *Canon TDD* [2], Kent Beck đặt một bước trước vòng lặp: **lập danh sách kịch bản cần test (test list)**. Quy trình đầy đủ gồm:

1. Viết test list.
2. Chuyển đúng một mục thành test chạy được.
3. Sửa code để test này và mọi test trước đó thành công; bổ sung mục mới vào danh sách nếu phát hiện.
4. Refactor nếu cần.
5. Lặp lại từ bước 2 cho đến khi danh sách rỗng.

Red–Green–Refactor là vòng lặp bên trong; test list nằm bên ngoài và giúp chọn thứ tự từ đơn giản đến phức tạp. Câu trả lời đầu tiên của AI trong nghiên cứu này đã bỏ qua bước này (Phụ lục A.1).

### 2.3 Ví dụ minh họa

Xét yêu cầu: *"Tiêu đề ticket là bắt buộc, tối đa 100 ký tự, bỏ khoảng trắng ở hai đầu."*

**Bước 0 – Test list.** Trước khi viết code, liệt kê bốn kịch bản:
- tiêu đề hợp lệ được trim;
- tiêu đề rỗng hoặc toàn khoảng trắng bị từ chối;
- tiêu đề 101 ký tự bị từ chối;
- tiêu đề đúng 100 ký tự hợp lệ (giá trị biên).

**Red.** Viết test cho kịch bản đầu tiên (Mã 1).

**Mã 1. Test đầu tiên (bước Red)**

```js
test('trims a valid title', () => {
  assert.equal(validateTitle('   Fix login   '), 'Fix login');
});
```

Lần chạy đầu thất bại vì hàm `validateTitle` chưa tồn tại. Kent Beck chấp nhận đây là một bước Red, tương tự code Java chưa biên dịch được trong sách của ông.

Tuy nhiên, lỗi này chỉ cho biết hàm chưa có, chưa chứng minh được assertion hoạt động: một assertion viết sai cũng cho ra đúng lỗi đó. Cách chặt chẽ hơn là thêm một hàm rỗng (stub), rồi chạy lại để thấy test thất bại vì `undefined` khác `'Fix login'`. Lúc đó test **fail đúng lý do**. Kết luận này được rút ra từ việc chất vấn AI ở Phụ lục A.1.

**Green.** Viết code tối thiểu: `return title.trim();`. Test thành công. Code chưa xử lý tiêu đề rỗng hay quá dài, và điều đó là có chủ đích vì chưa có test nào yêu cầu. Các kịch bản còn lại lần lượt "kéo" thêm code ra qua các vòng lặp tiếp theo.

**Refactor.** Sau vài vòng, code được tổ chức lại như Mã 2: hằng số `100` được đặt tên. Kiểm tra kiểu dữ liệu (`typeof title !== 'string'`) **không** phải refactor: đó là hành vi mới, nên được "kéo" ra bởi một test đỏ riêng (Mã 2b), ứng với mục "không phải chuỗi" trong test list (Bảng 6). Sau đó toàn bộ test vẫn thành công.

**Mã 2. Kết quả sau các vòng lặp và bước Refactor**

```js
const MAX_TITLE_LENGTH = 100;

function validateTitle(title) {
  if (typeof title !== 'string') {
    throw new ValidationError('Title must be a string');
  }
  const clean = title.trim();
  if (!clean) throw new ValidationError('Title is required');
  if (clean.length > MAX_TITLE_LENGTH) {
    throw new ValidationError(`Title must be at most ${MAX_TITLE_LENGTH} characters`);
  }
  return clean;
}
```

**Mã 2b. Test cho input không phải chuỗi**

```js
test('rejects non-string titles with a ValidationError', () => {
  for (const bad of [undefined, null, 42, {}, ['x']]) {
    assert.throws(() => validateTitle(bad), ValidationError);
  }
});
```

Phiên bản trước dùng `(title ?? '').trim()`: `undefined`/`null` được xử lý, nhưng `validateTitle(42)` ném `TypeError: title.trim is not a function`, tức là lỗi lập trình lộ ra thay vì lỗi validation. Test trong Mã 2b đỏ với phiên bản đó và xanh với Mã 2.

> *Ghi chú 1.* Test "đúng 100 ký tự" và test "101 ký tự" cần đi cùng nhau. Thiếu một trong hai, sẽ có một kiểu sửa sai ở biên (`>` thành `>=`, hoặc `100` thành `101`) không bị phát hiện.
>
> *Ghi chú 2 – "100 ký tự" nghĩa là gì.* Báo cáo chốt hợp đồng: giới hạn tính bằng `String.prototype.length` của tiêu đề **sau khi trim, không chuẩn hóa Unicode**, tức là đếm *UTF-16 code unit*, không phải số ký tự người dùng nhìn thấy. Hệ quả: emoji `😀` tính là 2; chữ `ế` dạng NFC tính là 1 nhưng dạng NFD tính là 3. Nếu muốn đếm theo ký tự hiển thị, phải đổi hợp đồng (ví dụ `[...title.normalize('NFC')].length` hoặc `Intl.Segmenter`) và bổ sung test biên tương ứng.

### 2.4 Lợi ích và giới hạn

**Bảng 3. Lợi ích và giới hạn của TDD**

| Lợi ích | Giới hạn |
|---|---|
| Buộc làm rõ yêu cầu trước khi viết code | Tốc độ ban đầu chậm hơn |
| Tạo lưới an toàn khi refactor | Test chất lượng kém vẫn để lọt lỗi |
| Thúc đẩy thiết kế tách lớp, dễ kiểm tra | Không thay thế được tư duy thiết kế |
| Test đóng vai trò tài liệu về hành vi | Test cũng là code, cần được bảo trì |

---

## 3. Các cấp độ test

### 3.1 So sánh unit, integration và end-to-end test

**Bảng 4. So sánh ba cấp độ test**

| | Unit | Integration | End-to-end (E2E) |
|---|---|---|---|
| **Phạm vi** | Một hàm hoặc module, tách biệt | Nhiều thành phần phối hợp | Toàn hệ thống, như người dùng thật |
| **Phụ thuộc ngoài** | Thường thay hoặc tránh phụ thuộc thật | Một phần thật (file, DB) | Gần như toàn bộ là thật |
| **Tốc độ** | Rất nhanh | Trung bình | Chậm |
| **Khi thất bại** | Chỉ ra đúng vị trí lỗi | Tương đối dễ khoanh vùng | Khó xác định lớp gây lỗi |
| **Số lượng nên có** | Nhiều nhất | Vừa phải | Ít nhất |
| **Ví dụ** | `parseTickets('{}')` báo lỗi | `save` rồi đọc lại file thật trong thư mục tạm | Chạy `ticket show 99`, kiểm tra exit code và stderr |

Bảng 4 mô tả cách dùng **phổ biến**, không phải định nghĩa tuyệt đối. Ranh giới giữa các cấp độ khác nhau theo từng nhóm: Vocke [4] nhắc đến tranh luận "solitary" và "sociable" unit test (unit test có thể dùng phụ thuộc thật nếu chúng nhanh và ổn định); còn E2E vẫn có thể thay dịch vụ bên ngoài (cổng thanh toán, API bên thứ ba) bằng bản giả. Trong báo cáo này, E2E nghĩa là chạy tiến trình `cli.js` thật với file dữ liệu thật trong thư mục tạm (Mã 5).

### 3.2 Kim tự tháp test

Mô hình kim tự tháp test được Mike Cohn đề xuất trong *Succeeding with Agile* [3] và được Ham Vocke phân tích chi tiết trong bài *The Practical Test Pyramid* [4]. Nguyên tắc chính:
- nhiều test nhỏ, nhanh ở đáy;
- rất ít test E2E ở đỉnh;
- trường hợp biên đã được kiểm tra ở tầng unit thì không lặp lại ở tầng trên.

Cấu trúc ngược lại được gọi là "ice-cream cone" và dẫn đến bộ test chậm, dễ vỡ, khó tìm lỗi.

```
            /\
           /E2E\          ít, chậm, chi phí cao
          /------\
         /Integra-\       vừa phải, tại điểm ghép nối
        /   tion   \
       /------------\
      /     Unit     \    nhiều, nhanh, chi phí thấp
     /________________\
```

*Hình 1. Kim tự tháp test (theo Cohn [3])*

---

## 4. Test cho CLI tool: trường hợp Ticket Manager

### 4.1 Phạm vi cần kiểm tra

Ticket Manager CLI có bốn lệnh `create`, `list`, `show`, `update`, lưu dữ liệu vào file JSON. Để phần lớn test là unit test, code được tách thành ba lớp:
- **logic:** làm việc với mảng, không đụng file;
- **lưu trữ:** đọc và ghi file, nhận đường dẫn qua tham số;
- **CLI:** phân tích lệnh, in kết quả.

**Bảng 5. Bốn nhóm hành vi cần kiểm tra trong CLI**

| Nhóm | Nội dung | Cấp độ phù hợp |
|---|---|---|
| Commands | Mỗi lệnh thực hiện đúng chức năng và in đúng output | Unit; E2E cho luồng chính |
| Validation | Input không hợp lệ bị từ chối với thông báo rõ ràng, không ghi dữ liệu rác | Unit |
| File storage | File chưa tồn tại, JSON hỏng, ghi thất bại giữa chừng; dữ liệu ghi và đọc lại khớp | Unit (hàm thuần) và integration (file thật) |
| Errors | Thông báo lỗi ra `stderr`, `stdout` trống, exit code đúng, không lộ stack trace | Unit; E2E |

Exit code đặc biệt quan trọng với CLI vì các script và hệ thống CI dựa vào nó để biết lệnh có thành công hay không. Báo cáo dùng quy ước:
- `0`: thành công;
- `1`: lỗi nghiệp vụ hoặc dữ liệu (không tìm thấy ticket, file hỏng);
- `2`: sai cách dùng (lệnh lạ, thiếu tham số, id sai định dạng).

AI đề xuất thêm một quy tắc dễ áp dụng: lỗi nào phát hiện được chỉ bằng cách nhìn tham số là lỗi cách dùng; lỗi nào phải đọc dữ liệu mới biết là lỗi nghiệp vụ.

### 4.2 Test list

Bảng 6 là test list được xây dựng qua Workflow 1, sau khi đã chọn lọc từ đề xuất của AI (Phụ lục A.1).

**Bảng 6. Test list cho Ticket Manager CLI**

| Phạm vi | Kịch bản |
|---|---|
| `create` | Ticket đầu tiên nhận id 1, trạng thái `open`. Tiêu đề rỗng, toàn khoảng trắng hoặc không phải chuỗi (`undefined`, `null`, số) bị từ chối, không có gì được ghi. Tiêu đề đúng 100 ký tự hợp lệ, 101 ký tự bị từ chối. Id mới bằng id lớn nhất cộng một; id vẫn tăng đúng sau khi chương trình chạy lại. |
| `list` | Danh sách rỗng in thông báo thân thiện. Kết quả sắp xếp theo id. Lọc theo trạng thái không hợp lệ bị báo lỗi thay vì trả về danh sách rỗng. |
| `show` | Id không tồn tại: lỗi ra `stderr`, exit code 1. Id sai định dạng (`abc`, `0`, `-1`, `1.5`, `12abc`, `1e2`): exit code 2. Không chặn quá tay: `1`, `42` vẫn hợp lệ. |
| `update` | Giá trị không hợp lệ bị từ chối và ticket không bị đổi một nửa. Không cho sửa `id`, `createdAt`. Ticket không tồn tại: báo lỗi, file giữ nguyên từng byte. |
| Lưu trữ | File chưa tồn tại được xem là danh sách rỗng. JSON hỏng hoặc không phải mảng (`{}`, `null`) bị báo lỗi, file không bị ghi đè. Tiếng Việt có dấu được lưu và đọc lại đúng. Ghi thất bại giữa chừng không làm mất dữ liệu cũ. |

### 4.3 Ví dụ test

Các ví dụ dùng test runner có sẵn của Node.js (`node:test`) [5].

Mã 3 là test đầu tiên AI viết ở Workflow 1, tầng 3. Test này đã được chạy lại và cho đúng ba kết quả mô tả trong chat: thiếu module, `Missing expected exception`, rồi thành công.

**Mã 3. Unit test: tiêu đề rỗng bị từ chối**

```js
test('create: tiêu đề rỗng thì báo lỗi EMPTY_TITLE', () => {
  assert.throws(
    () => createTicket([], { title: '' }),
    { code: 'EMPTY_TITLE' }
  );
});
```

Test kiểm tra mã lỗi `code` thay vì câu thông báo. Lý do AI đưa ra hợp lý: câu thông báo dành cho người đọc và có thể đổi bất cứ lúc nào, còn mã lỗi ổn định và là thứ tầng CLI dựa vào để chọn exit code.

**Mã 4. Integration test: ghi file tạm thất bại thì file gốc giữ nguyên**

```js
test('save: ghi file tạm thất bại thì file gốc giữ nguyên', (t) => {
  const dir = tempDir(t);                 // thư mục tạm riêng, tự xóa
  const file = path.join(dir, 'tickets.json');
  fs.writeFileSync(file, '[{"id":1}]');
  fs.mkdirSync(file + '.tmp');            // chặn đường ghi file tạm
  const before = fs.readFileSync(file);

  assert.throws(() => save(file, []), (err) => {
    assert.equal(err.code, 'SAVE_FAILED');
    assert.equal(err.cause.code, 'EISDIR');
    return true;
  });
  assert.ok(before.equals(fs.readFileSync(file)));
});
```

Test trong Mã 4 tạo lỗi ghi bằng tình huống thật (một thư mục trùng tên với file tạm) thay vì mock. Nếu `save` ghi thẳng vào file gốc thay vì ghi ra file tạm rồi đổi tên, nó sẽ không đi qua đường `.tmp` và không báo lỗi, nên test sẽ đỏ. Như vậy test bắt đúng lỗi thiết kế cần tránh.

**Mã 5. E2E test: chạy CLI như người dùng thật**

```js
const env = { ...process.env, TICKETS_FILE: tmpFile };
const run = (...args) =>
  spawnSync('node', ['cli.js', ...args], { env, encoding: 'utf8' });

test('show: ticket không tồn tại -> exit 1, lỗi ra stderr', () => {
  const r = run('show', '99');
  assert.equal(r.status, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /99/);
});
```

---

## 5. Test như cơ chế kiểm chứng code do AI sinh ra

### 5.1 Vấn đề

Code và câu trả lời do AI sinh ra thường gọn gàng và có vẻ thuyết phục. Trong nghiên cứu này, AI còn nhiều lần khẳng định "mình đã chạy thật". Những khẳng định như vậy không tự chứng minh được; người phát triển cần một cách kiểm chứng độc lập.

### 5.2 Test như một hợp đồng

Khi test được viết *trước* và tiêu chí đúng do người phát triển quyết định, test trở thành đặc tả mà code của AI phải thỏa mãn. Kết quả chạy test là phán đoán khách quan, không phụ thuộc vào việc code trông có hợp lý hay không.

### 5.3 Các trường hợp quan sát được

**Trường hợp 1: "xanh giả" vì test không bao giờ chạy.** Trong ví dụ FizzBuzz đầu tiên, AI định nghĩa các hàm `test_...` bằng Python thuần. Từ vòng 2, AI không gọi các hàm đó nhưng vẫn ghi "Chạy: fail". Khi bị chất vấn, AI thừa nhận rằng chạy file đó thực tế sẽ im lặng và trông như mọi thứ đều thành công. Bài học: bước Red có tác dụng phát hiện chính lỗi này. Nếu mong đợi đỏ mà không thấy gì, chắc chắn có vấn đề.

**Trường hợp 2: coverage 100% nhưng vẫn có lỗi lọt.** Ở tầng 4, AI chỉ ra rằng code `createTicket` lúc đó đạt 100% coverage, nhưng `createTicket([], {})` vẫn tạo ticket không có tiêu đề. Khẳng định này đã được chạy lại và xác nhận. Coverage chỉ cho biết dòng code đã được thực thi, không cho biết nếu dòng đó sai thì có test nào phát hiện.

**Trường hợp 3: lỗi an toàn trong code AI được phát hiện nhờ test.** Ở Workflow 3, hàm `save` do AI viết vượt qua 9/9 test ban đầu. Khi review vòng hai, AI phát hiện hai lỗi:
- nếu `tickets.json` là symlink thì bị thay bằng file thường;
- nếu file tạm là symlink thì `save` ghi đè lên một file khác.

Cả hai lỗi đã được tái hiện. AI viết test cho từng lỗi trước khi sửa; hai test mới đỏ với phiên bản cũ và xanh với phiên bản mới (12/12).

**Bảng 7. Các khẳng định quan trọng của AI và kết quả kiểm chứng**

| Khẳng định | Kết quả | Cách kiểm chứng |
|---|---|---|
| Các test FizzBuzz từ vòng 2 "chạy và fail" | Sai (AI thừa nhận) | Đọc code: hàm test không được gọi |
| Chữ "ế" ở dạng NFD có độ dài 2 | Sai, thực tế là 3 | Chạy thử `normalize('NFD')` rồi đo độ dài |
| "Dùng file thật, đừng mock fs" (trước khi so sánh) | Kết luận quá sớm (AI thừa nhận) | Yêu cầu so sánh công bằng |
| Ba bước Red, Red đúng lý do, Green "đã chạy thật" | Đúng | Dựng lại ba file và chạy |
| Coverage 100% nhưng tiêu đề `undefined` lọt qua | Đúng | Chạy coverage và gọi thử hàm |
| `mock.method` bị bỏ qua khi import kiểu destructuring | Đúng | Viết test nhỏ để thử |
| Hai lỗi symlink trong `save` | Đúng | Tái hiện trên phiên bản cũ |
| Mất điện ngay sau `rename` có thể để lại file rỗng | Chưa kiểm chứng | Ghi nhận, không dùng làm kết luận |

### 5.4 Quy trình đề xuất

1. Người phát triển lập test list từ yêu cầu; có thể hỏi AI về trường hợp còn thiếu nhưng tự chọn lọc danh sách cuối cùng.
2. Viết test cho một mục và xác nhận test thất bại đúng lý do.
3. Yêu cầu AI viết code, cung cấp đủ ngữ cảnh: ngôn ngữ, yêu cầu, test, các quyết định đã chốt.
4. Không tin câu "đã chạy thật"; tự chạy lại test.
5. Nếu test thất bại, đưa thông báo lỗi cụ thể cho AI hoặc tự sửa; khi đã xanh, refactor và chạy lại toàn bộ.
6. Đưa bản đã sửa cho AI review lần nữa; đánh giá từng gợi ý, chấp nhận hoặc từ chối có lý do.

---

## 6. Các sai lầm thường gặp

### 6.1 Over-testing

**Biểu hiện:** kiểm tra những phần không có logic, lặp lại cùng một trường hợp biên ở cả ba cấp độ, hoặc viết test chỉ để tăng coverage.

Trong nghiên cứu, AI liên tục đề xuất thêm trường hợp: 18 dạng id không hợp lệ, kiểm tra từng phần tử trong file, BOM, quyền truy cập file, file có comment. Tất cả đều đúng về kỹ thuật, nhưng không phải đều đáng viết ở giai đoạn này.

**Nguyên tắc chọn lọc:** mỗi test cần trả lời được câu hỏi *"nếu test này thất bại, người dùng gặp vấn đề gì?"*, và ưu tiên theo mức độ rủi ro.

### 6.2 Assertion yếu

**Biểu hiện:** test thành công nhưng hầu như không kiểm tra gì. Trong Mã 6, hai assertion đầu chấp nhận gần như mọi kết quả, kể cả một lỗi không liên quan.

**Nguyên tắc tránh:** kiểm tra giá trị cụ thể và tác dụng phụ (dữ liệu có bị ghi không, file có bị đổi không); thử cố ý làm sai code và quan sát test có thất bại không.

**Mã 6. Assertion yếu và assertion đủ mạnh**

```js
// weak: any error passes
assert.throws(() => createTicket([], { title: '' }));
// weak: only checks that something is returned
assert.ok(createTicket([], { title: 'x' }));

// strong: error code, and the original data is untouched
const tickets = [];
assert.throws(() => createTicket(tickets, { title: '' }), { code: 'EMPTY_TITLE' });
assert.equal(tickets.length, 0);
```

Cách kiểm tra độ mạnh hiệu quả nhất là **mutation testing**: cố ý làm hỏng code và mong đợi test đỏ. Trong Workflow 3, hai lần làm hỏng code `save` (bỏ bọc bước dọn dẹp; ghi thẳng vào file gốc) đều bị test phát hiện. Công cụ tự động cho JavaScript là Stryker, nhưng làm bằng tay vài lần giúp hiểu bản chất.

### 6.3 Kiểm tra chi tiết cài đặt

**Biểu hiện:** test gắn với *cách* code thực hiện thay vì *kết quả* quan sát được, nên thất bại khi refactor dù hành vi không đổi. Theo Vocke [4], nên kiểm tra qua giao diện công khai.

Nghiên cứu còn tìm thấy một rủi ro cụ thể hơn khi mock `fs`. Đã kiểm chứng rằng `mock.method(fs, 'readFileSync', ...)` không có tác dụng nếu code viết `const { readFileSync } = require('node:fs')`. Khi đó test không chỉ dễ vỡ mà còn âm thầm đọc ghi trên đĩa thật.

**Mã 7. Kiểm tra cài đặt và kiểm tra hành vi**

```js
// implementation detail: breaks when saving switches to temp file + rename
test('calls fs.writeFileSync once', () => {
  const spy = mock.method(fs, 'writeFileSync');
  save(file, []);
  assert.equal(spy.mock.calls.length, 1);
});

// behaviour: what is saved can be read back
test('save then load returns the same tickets', () => {
  save(file, [{ id: 1 }]);
  assert.deepEqual(load(file), [{ id: 1 }]);
});
```

### 6.4 Tin tưởng tuyệt đối vào output của AI

**Biểu hiện:**
- sao chép code mà không đọc;
- tin câu "đã chạy thật";
- chấp nhận kết luận trước khi xem các phương án;
- sửa test cho khớp code khi test thất bại.

Bảng 8 là năm câu hỏi review được dùng xuyên suốt Phụ lục A.

**Bảng 8. Năm câu hỏi review áp dụng cho câu trả lời của AI**

| Câu hỏi | Áp dụng |
|---|---|
| Understanding | Có giải thích được từng dòng code AI đề xuất không? |
| Alignment | Có khớp với yêu cầu và quyết định đã chốt không? (ví dụ: ngôn ngữ, các trường của ticket) |
| Assumptions | AI đang giả định gì mà mình chưa nói? |
| Risks | Trường hợp biên, dữ liệu hỏng, input không hợp lệ, mất dữ liệu |
| Verification | Chạy lại code, cố ý làm hỏng code, tra tài liệu gốc |

### 6.5 Các sai lầm khác

Kent Beck [2] liệt kê thêm:
- bỏ qua bước lập test list;
- viết test không có assertion để tăng coverage;
- xóa hoặc nới lỏng assertion để test thành công;
- sao chép giá trị code đang trả về làm giá trị mong đợi;
- vừa làm test thành công vừa refactor trong cùng một bước;
- trừu tượng hóa quá sớm.

---

## 7. Kết luận

Nghiên cứu rút ra năm kết luận chính:

1. TDD là phương pháp dùng test để làm rõ yêu cầu trước khi viết code. Test list đứng trước vòng Red–Green–Refactor, và mỗi bước Red nên fail đúng lý do.
2. Bộ test nên cân bằng theo kim tự tháp. Với lớp lưu trữ, tách phần xử lý chuỗi thành hàm thuần giúp phần lớn ca "file hỏng" trở thành unit test, chỉ còn một phần nhỏ cần file thật.
3. Với CLI tool, ngoài logic nghiệp vụ cần kiểm tra exit code, luồng `stdout`/`stderr` và an toàn của dữ liệu lưu trữ.
4. Khi làm việc với AI, câu trả lời phần lớn chính xác, nhưng các sai sót thật đều chỉ lộ ra khi đặt câu hỏi tiếp, chạy lại code, hoặc yêu cầu review thêm một vòng. Test là công cụ biến việc "tin rằng code đúng" thành "đã kiểm chứng trong các trường hợp xác định".
5. Coverage cao không chứng minh bộ test mạnh; mutation testing (cố ý làm hỏng code) là cách kiểm tra trực tiếp hơn.

---

## Tài liệu tham khảo

1. K. Beck. *Test-Driven Development: By Example*. Addison-Wesley, 2002.
2. K. Beck. "Canon TDD." *Test & Code* podcast, episode 212. <https://testandcode.com/episodes/212-canon-tdd-by-kent-beck/transcript>
3. M. Cohn. *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley, 2009.
4. H. Vocke. "The Practical Test Pyramid." martinfowler.com. <https://martinfowler.com/articles/practical-test-pyramid.html>
5. Node.js Documentation. "Test runner." <https://nodejs.org/api/test.html>
6. Tài liệu nội bộ. *AI Training – Mindset & Effective Usage*.

---

## Phụ lục A. Nhật ký quá trình làm việc với AI

Phụ lục này tóm tắt cuộc trò chuyện với Claude (claude.ai) ngày 13/10/2026; bản đầy đủ được lưu dưới dạng ảnh chụp màn hình kèm theo bài nộp. Mỗi lượt gồm:
- **Prompt:** câu hỏi gửi AI;
- **AI:** tóm tắt câu trả lời;
- **Review:** đánh giá theo Bảng 8;
- **Refine:** điều chỉnh của người nghiên cứu.

Ở một số lượt, việc chạy lại code để kiểm chứng có sự hỗ trợ của một phiên AI thứ hai; các lượt đó được ghi chú rõ.

**Phạm vi tái hiện.** Kho này không chứa code `createTicket`, `save` và bộ test sinh ra trong phiên chat. Vì vậy các con số 9/9, 10/10, 12/12 test và phép đo 34 ms là kết quả *được báo cáo*; bằng chứng là `chat_history.pdf`, không chạy lại được từ kho này.

### A.1 Workflow 1: Layered Questioning

#### Tầng 1 – Research

> **Prompt:** *Mình là thực tập sinh, chưa từng làm TDD. Giải thích Test-Driven Development là gì, Red – Green – Refactor nghĩa là gì. Dùng ví dụ đơn giản, không dùng framework phức tạp.*

> **AI:** Giải thích đúng TDD và vòng Red–Green–Refactor, minh họa bằng FizzBuzz qua bốn vòng (Python thuần, chỉ dùng `assert`), kết thúc bằng một bước refactor gộp các điều kiện.

> **Review:**
> - *Understanding:* ví dụ rõ, logic từng vòng đúng.
> - *Alignment:* không đề cập bước lập test list.
> - *Verification:* vòng 1 test fail vì `NameError` nhưng được đánh dấu là Red hợp lệ, cần hỏi lại. Từ vòng 2, các hàm `test_...` chỉ được định nghĩa mà không được gọi, nhưng AI vẫn ghi "Chạy: fail".

> **Prompt:** *Ba thắc mắc: (1) Kent Beck có mô tả bước lập danh sách test trước khi code không? (2) Fail vì NameError có tính là Red đúng nghĩa không? (3) Các hàm test từ vòng 2 không được gọi thì có thực sự chạy không?*

> **AI:**
> 1. Có: test list là bước đầu của Canon TDD; Red–Green–Refactor là vòng trong.
> 2. Beck chấp nhận, nhưng nên thêm stub để test fail vì `AssertionError`; đó mới là fail đúng lý do.
> 3. Thừa nhận sai: các test đó không chạy; đây chính là kiểu "xanh giả" mà TDD muốn tránh.
>
> Sau đó đưa lại file hoàn chỉnh có test list và gọi đủ các test.

> **Review:** Phần về Canon TDD khớp với transcript gốc [2]. Lỗi ở câu (3) là một khẳng định sai về kết quả chạy, được AI thừa nhận (Bảng 7). Điều học được ở câu (2) được đưa vào Mục 2.3.

#### Tầng 2 – Brief feature

> **Prompt:** *Mình sẽ build Ticket Manager CLI có 4 lệnh create, list, show, update; dữ liệu lưu trong file JSON. Trước khi code, nên test những hành vi nào? Chia theo nhóm.*

> **AI:** Nêu rõ các giả định (các trường của ticket, ba trạng thái), đề xuất tách ba lớp, và đưa test list theo sáu nhóm, gồm cả file hỏng, exit code và `stderr`. Bổ sung hai ca dễ bỏ sót: tiếng Việt có dấu, và id phải tiếp tục tăng sau khi chạy lại chương trình.

> **Review:**
> - *Alignment:* câu trả lời bao quát hơn mong đợi, không chỉ có happy path.
> - *Assumptions:* AI tự giả định dùng Python (`tempfile`, `ensure_ascii`) dù chưa được nói.
> - *Risks:* còn thiếu giới hạn độ dài tiêu đề, JSON hợp lệ nhưng không phải mảng, phân biệt exit code, các dạng id sai ngoài `abc`. Một số điểm AI để "tùy bạn chọn".

> **Prompt:** *Mình dùng Node.js chứ không phải Python. Còn thiếu: (1) giới hạn độ dài tiêu đề và giá trị biên; (2) JSON hợp lệ nhưng không phải mảng; (3) exit code cho lỗi cú pháp và lỗi nghiệp vụ; (4) các dạng id không hợp lệ khác.*

> **AI:** Chuyển sang Node.js và trả lời chi tiết cả bốn câu:
> - kỹ thuật giá trị biên và bẫy đếm ký tự trong JavaScript;
> - kiểm tra `Array.isArray`;
> - đề xuất bảng exit code 0/1/2/3 kèm một quy tắc phân loại;
> - danh sách 18 dạng id sai kèm hàm `parseId` dùng regex.

> **Review:**
> - *Verification:* chạy lại các ví dụ `parseInt`, `Number`, BOM, `parseArgs` với `-1` và hàm `parseId`: đều đúng. Riêng khẳng định "`"ế".length` bằng 2 ở dạng NFD" là sai. Chạy thử cho kết quả 3, vì chữ "ế" tách thành `e` và *hai* dấu.
> - *Risks:* đề xuất quá nhiều trường hợp so với phạm vi.

> **Refine:** Chọn lọc các trường hợp có rủi ro cao cho test list (Bảng 6). Giữ quy ước exit code ba mức 0/1/2 cho đơn giản; xếp lỗi file hỏng vào nhóm 1 thay vì tách riêng mã 3 như AI đề xuất.

#### Tầng 3 – Code example

> **Prompt:** *Viết một unit test đang fail cho trường hợp tạo ticket với tiêu đề rỗng, rồi viết code tối thiểu để pass. Dùng node:test.*

> **AI:**
> - Viết test kiểm tra `code: 'EMPTY_TITLE'` (Mã 3).
> - Mô tả ba bước: thiếu module, thêm stub để thấy `Missing expected exception`, rồi Green với `title === ''`.
> - Tự chỉ ra code còn "ngây thơ" có chủ ý (chuỗi toàn khoảng trắng vẫn lọt) và đưa test tiếp theo vào danh sách.
> - Khẳng định đã chạy thật cả ba bước.

> **Review:**
> - *Verification:* không thể biết AI có thực sự chạy hay không, nên đã dựng lại ba file và chạy (có hỗ trợ của phiên AI thứ hai). Kết quả khớp đúng ba bước.
> - *Understanding:* AI áp dụng đúng điều vừa học ở tầng 1 (fail đúng lý do). Assertion kiểm tra mã lỗi là đủ mạnh.

#### Tầng 4 – Validation

> **Prompt:** *Với danh sách test hiện tại, còn edge case nào về input sai, ticket không tồn tại và file JSON hỏng mà mình bỏ sót? Làm sao biết bộ test đã đủ mạnh?*

> **AI:**
> - Chỉ ra code hiện tại đạt 100% coverage nhưng `createTicket([], {})` vẫn tạo ticket không tiêu đề.
> - Liệt kê thêm: sai kiểu dữ liệu, ký tự zero-width, bẫy của `parseArgs`, ticket không tồn tại phải giữ nguyên file, ghi nguyên tử.
> - Giải thích mutation testing bằng tay, kèm bảng "sửa code thành… thì test nào phải đỏ".

> **Review:**
> - *Verification:* chạy lại xác nhận coverage 100% và lỗi `undefined` lọt qua; các khẳng định về `parseArgs` và `trim()` đúng.
> - *Alignment:* AI coi `--priority` là option lạ vì vẫn giữ giả định từ tầng 2 rằng ticket không có trường này. Giả định ban đầu ảnh hưởng đến các câu trả lời về sau.
> - *Risks:* danh sách rất dài, cần chọn lọc theo rủi ro.

### A.2 Workflow 2: Solution Exploration

Bài toán: chọn chiến lược test cho lớp lưu trữ file JSON.

#### Bước 1 – Trình bày vấn đề

> **Prompt:** *Ticket CLI có 3 lớp. Mình muốn test nhanh, không đụng file dữ liệu thật, nhưng vẫn chắc phần đọc/ghi đúng khi file hỏng. Cần cân nhắc những vấn đề gì? Xếp theo mức độ quan trọng.*

> **AI:**
> - Xếp tám vấn đề, đứng đầu là an toàn: lớp lưu trữ không có đường dẫn mặc định.
> - Đo được 100 lần tạo, ghi, đọc, xóa file tạm mất khoảng 34 ms.
> - Khuyến nghị ngay "dùng file thật, đừng mock fs".

> **Review:**
> - *Verification:* chạy lại phép đo cho kết quả tương tự (34,7 ms); `t.after` chạy cả khi test đỏ.
> - *Critical thinking:* AI đưa ra kết luận trước khi liệt kê và so sánh các phương án, đi tắt qua bước khám phá của workflow.

#### Bước 2 – Khám phá các phương án

> **Prompt:** *Bạn đã đưa ra kết luận ngay từ đầu. Mình muốn so sánh công bằng: liệt kê tất cả phương án test lớp lưu trữ, kèm ưu và nhược điểm thật sự. Chưa cần khuyến nghị.*

> **AI:**
> - Thừa nhận đã "nói quá tuyệt đối".
> - So sánh 9 phương án theo 6 tiêu chí (Bảng 9).
> - Kiểm chứng hai điều: `mock.method` bị bỏ qua khi import kiểu destructuring; `mock.module` cần cờ thử nghiệm trên Node 22.
> - Kết thúc bằng hai câu hỏi để chốt phương án.

**Bảng 9. Các phương án test lớp lưu trữ (tóm tắt)**

| Phương án | Đặc điểm chính |
|---|---|
| A. File thật trong thư mục tạm | Trung thực, bền khi refactor; khó tạo lỗi đĩa đầy, lỗi quyền |
| B. File mẫu (fixture) | Dễ thấy các ca hỏng; Git hoặc editor có thể âm thầm sửa file |
| C. Ổ RAM | Như A, chỉ chạy trên Linux |
| D. `mock.method` | Tạo được mọi lỗi; gắn với cách cài đặt, lọt qua khi destructuring |
| E. `mock.module` | Như D nhưng là tính năng thử nghiệm |
| F. Thư viện memfs, mock-fs | Phải cài thêm, vẫn là mô phỏng |
| G. Tiêm phụ thuộc | Tạo được mọi lỗi; thêm một tầng thiết kế |
| H. Tách hàm thuần `parseTickets` | Phần lớn ca file hỏng thành ca chuỗi hỏng; không phủ phần I/O |
| I. Bản giả + contract test | Hữu ích cho lớp khác; quá tay với 4 lệnh |

> **Review:**
> - *Verification:* tự viết test nhỏ để thử và xác nhận chuyện destructuring lọt qua mock. Đây là lý do cụ thể nhất để không chọn D.
> - Bảng điểm (Cao/Trung bình/Thấp) mang tính chủ quan, chỉ dùng để so sánh nhanh.

#### Bước 3 – Chọn với ngữ cảnh

> **Prompt:** *Mình làm TDD từ đầu nên sẵn sàng tách parseTickets. Không cần test đĩa đầy, nhưng muốn chắc ghi thất bại giữa chừng thì không mất dữ liệu cũ. Dự án nhỏ, một người làm, ưu tiên dễ hiểu, bền khi refactor, không cài thêm thư viện. Nên kết hợp phương án nào?*

> **AI:**
> - Chọn H + A: khoảng 15 unit test cho hàm thuần, khoảng 5 test file thật.
> - Tạo lỗi ghi bằng tình huống thật (Mã 4).
> - Lưu ý file tạm phải cùng thư mục với file gốc, và bước dọn dẹp trong `catch` có thể che mất lỗi gốc vì `rmSync` vẫn ném lỗi khi gặp thư mục.
> - Giữ G làm phương án dự phòng.

> **Review:**
> - *Verification:* chạy lại xác nhận lỗi `EISDIR`, file gốc giữ nguyên kể cả khi chạy bằng root, và `rmSync(..., { force: true })` vẫn ném `ERR_FS_EISDIR`.
> - *Alignment:* lựa chọn khớp với ưu tiên đã nêu.

#### Bước 4 – Tổng kết

> **AI:** Tổng kết đủ năm phần: vấn đề gốc, giải pháp H + A, lý do loại từng phương án, bảng rủi ro còn lại và cách giảm, cùng hai quyết định còn treo (định dạng file, ý nghĩa của file rỗng).

> **Review:** Nhất quán với các lượt trước. Riêng ý "mất điện ngay sau `rename` có thể để lại file rỗng, nên `fsync`" chưa tự kiểm chứng được; ghi nhận là thông tin tham khảo.

### A.3 Workflow 3: Iterative Refinement

#### Bước 1 – Gợi ý của AI

> **Prompt:** *Viết hàm save(filePath, tickets) bằng Node.js, ghi file JSON theo kiểu nguyên tử (ghi ra file tạm rồi rename), có xử lý lỗi.*

> **AI:**
> - Viết 9 test trước rồi mới viết hàm.
> - `save` kiểm tra đầu vào, ghi ra `tickets.json.tmp` cùng thư mục, gọi `fsync`, rồi `rename`.
> - Khi lỗi, chỉ dọn file tạm do chính nó tạo, và ném `SAVE_FAILED` giữ lỗi gốc trong `err.cause`.
> - Kể lại một lỗi tự sửa nhờ test: flag `'wx'` khiến file tạm sót lại chặn mọi lần lưu sau.
> - Tự làm hỏng code theo hai cách để chứng minh test bắt được lỗi.

#### Bước 2, 3 – Review và tóm tắt vấn đề

Chạy lại 9/9 test và hai lần làm hỏng code: kết quả khớp mô tả của AI (thực hiện với sự hỗ trợ kiểm tra chéo của phiên AI thứ hai). Không tìm thấy lỗi kỹ thuật, nhưng có hai vấn đề:

1. AI chọn báo lỗi khi thư mục cha chưa tồn tại, nên lần chạy đầu tiên trên máy mới sẽ thất bại.
2. Thông báo `SAVE_FAILED` không nêu lý do thật; mã lỗi gốc chỉ nằm trong `err.cause`.

#### Bước 4 – Sửa

> **Refine:**
> 1. Thêm `fs.mkdirSync(path.dirname(filePath), { recursive: true })` vào đầu khối `try`. Thay test cũ bằng hai test: thư mục cha chưa có thì tự tạo; đường dẫn cha bị một file chiếm chỗ thì báo `SAVE_FAILED` và file đó giữ nguyên.
> 2. Thêm mã lỗi gốc vào cuối thông báo, kèm một assertion kiểm tra điều này.
>
> Kết quả: 10/10 test xanh. Bỏ từng chỗ sửa thì test tương ứng đỏ.

#### Bước 5 – Gửi lại cho AI

> **Prompt:** *Đã kiểm tra chéo code của bạn và thấy còn hai điểm, đã sửa như trên; 10/10 test xanh. Review giúp phiên bản này: còn trường hợp nào chưa an toàn?*

> **AI:**
> - Xác nhận hai chỗ sửa đúng.
> - Phát hiện hai lỗi an toàn có từ phiên bản của chính AI:
>   - (a) nếu `tickets.json` là symlink thì bị thay bằng file thường;
>   - (b) nếu file tạm là symlink thì ghi đè lên file khác. Lỗi này do AI tạo ra khi đổi `'wx'` thành `'w'`.
> - Sửa bằng `realpathSync` và `O_NOFOLLOW`; viết test cho cả hai trước khi sửa.
> - Kể lại rằng lần sửa đầu tiên làm đỏ một test của người nghiên cứu, nên đã đưa mọi bước chạm đĩa vào trong `try`.
> - Nêu thêm một vấn đề thiết kế: tự tạo thư mục sẽ che mất lỗi gõ nhầm đường dẫn.

#### Bước 6 – Đánh giá phản hồi

- Đã tái hiện cả hai lỗi symlink trên phiên bản trước.
- Phiên bản mới đạt 12/12 test; hai test mới đỏ với phiên bản cũ.
- Điểm `EEXIST` khó hiểu khi đường dẫn cha bị chiếm chỗ cũng tự hết (nay báo `ENOTDIR`), do thứ tự các bước thay đổi. AI không nhắc tới điểm này.

**Bảng 10. Đánh giá các gợi ý ở bước 5**

| Gợi ý | Quyết định | Lý do |
|---|---|---|
| Dùng `realpathSync` cho file đích là symlink | Chấp nhận | Tái hiện được lỗi; tình huống thực tế (đồng bộ thư mục) |
| Mở file tạm với `O_NOFOLLOW` | Chấp nhận | Tái hiện được lỗi; có thể phá dữ liệu ngoài dự án |
| Không tự tạo thư mục trong `save`, để CLI tạo thư mục mặc định | Chưa chốt | Hợp lý vì bản sửa 1 tạo ra rủi ro ghi dữ liệu vào chỗ sai; để lại cho tuần 2 khi viết tầng CLI |
| Symlink hỏng, thư mục vừa tạo không được dọn | Ghi nhận là giới hạn | Hiếm gặp |

> *Nhận xét.* Vòng này cho thấy giá trị của bước "Validate together": chính bản sửa của người nghiên cứu được AI chỉ ra điểm yếu, và AI cũng tự phát hiện lỗi trong code của mình. Không có bên nào đúng tuyệt đối; test là thứ phân xử.

---

## Phụ lục B. Câu hỏi và trả lời

### B.1 Nguyên lý TDD

**Câu 1. TDD là gì và khác gì với viết test sau khi code?**
Viết test trước, rồi viết code vừa đủ để test thành công. Viết test sau thường khiến test phản ánh code đã có; viết test trước khiến test phản ánh yêu cầu.

**Câu 2. Giải thích Red–Green–Refactor.**
Red: viết một test nhỏ và xác nhận nó thất bại đúng lý do. Green: viết code tối thiểu để test thành công. Refactor: cải thiện cấu trúc, chạy lại toàn bộ test để đảm bảo hành vi không đổi.

**Câu 3. Test fail vì hàm chưa tồn tại có tính là Red không?**
Kent Beck chấp nhận, nhưng lỗi đó chưa chứng minh assertion hoạt động. Nên thêm stub rỗng để test fail vì sai kết quả; đó là fail đúng lý do.

**Câu 4. Test list là gì?**
Bước đầu tiên của Canon TDD: liệt kê các kịch bản cần test trước khi code, mỗi lần chỉ chuyển một mục thành test, gặp trường hợp mới thì thêm vào danh sách.

### B.2 Các cấp độ test

**Câu 5. Phân biệt unit, integration và E2E test.**
Unit: một hàm hoặc module, thường không dùng phụ thuộc thật, rất nhanh. Integration: nhiều thành phần phối hợp, có phụ thuộc thật như file. E2E: toàn hệ thống như người dùng thật. Đây là cách dùng phổ biến, không phải định nghĩa tuyệt đối (Bảng 4 và phần giải thích bên dưới).

**Câu 6. Kim tự tháp test là gì?**
Mô hình của Mike Cohn: nhiều unit test, vừa phải integration test, ít E2E test, vì unit test nhanh, ổn định và chỉ ra đúng vị trí lỗi.

**Câu 7. Test lớp lưu trữ file như thế nào? Vì sao không mock fs?**
Tách phần xử lý chuỗi thành hàm thuần để test phần lớn ca hỏng mà không cần file; phần đọc ghi còn lại test bằng file thật trong thư mục tạm. Không mock `fs` vì test sẽ gắn với cách cài đặt, và đã kiểm chứng rằng mock bị bỏ qua khi import kiểu destructuring.

### B.3 Test cho CLI

**Câu 8. CLI tool cần được kiểm tra những gì?**
Bốn nhóm: commands, validation, file storage và errors (`stderr`, exit code, không lộ stack trace).

**Câu 9. Vì sao exit code quan trọng?**
Script và CI dựa vào exit code để biết lệnh thành công hay thất bại. Lỗi mà trả về 0 thì các bước tiếp theo sẽ chạy với dữ liệu sai.

### B.4 Kiểm chứng code do AI sinh ra

**Câu 10. Test giúp kiểm soát code AI như thế nào?**
Test là tiêu chí khách quan. Ví dụ: hàm `save` của AI qua 9/9 test, nhưng khi review thêm, hai test mới cho trường hợp symlink đỏ với phiên bản cũ, chứng minh có lỗi thật.

**Câu 11. AI nói "đã chạy thật" thì có tin được không?**
Không nên tin ngay. Trong nghiên cứu, các kết quả AI báo đã được dựng lại và chạy để kiểm chứng. Phần lớn đúng, nhưng có lần AI ghi "Chạy: fail" cho những test thực ra không bao giờ chạy.

**Câu 12. Coverage 100% có đủ không?**
Không. Đã thấy code đạt 100% coverage mà `createTicket([], {})` vẫn tạo ticket không tiêu đề. Cần assertion cụ thể và mutation testing.

**Câu 13. Nêu một trường hợp AI đưa thông tin sai.**
AI khẳng định chữ "ế" ở dạng NFD có độ dài 2; chạy thử cho kết quả 3. Một lần khác AI đưa ra kết luận "đừng mock fs" trước khi so sánh các phương án, và thừa nhận khi được chỉ ra.

### B.5 Quá trình nghiên cứu

**Câu 14. Ba workflow được áp dụng như thế nào?**
Layered Questioning để học TDD qua bốn tầng; Solution Exploration để chọn chiến lược test lớp lưu trữ (9 phương án, chọn H + A); Iterative Refinement để review, sửa và gửi lại hàm `save` (Phụ lục A).

**Câu 15. Bài học quan trọng nhất là gì?**
AI trả lời phần lớn chính xác, nhưng sai sót thật chỉ lộ ra khi hỏi tiếp, chạy lại code hoặc yêu cầu review thêm một vòng. Viết test trước giúp người phát triển giữ quyền quyết định thế nào là đúng.