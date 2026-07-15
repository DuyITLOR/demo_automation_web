---
name: state-transition-testing
description: Sinh test case bằng kỹ thuật State Transition Testing (kiểm thử chuyển trạng thái). Skill có 2 kịch bản. (A) Nếu người dùng CHƯA có test design mà chỉ cung cấp tài liệu (README, API spec, danh sách FR...): phân tích TẤT CẢ FR, xác định FR nào phù hợp state transition testing và liệt kê trong test design; MỖI FR phù hợp có state diagram + bảng chuyển trạng thái RIÊNG; lưu vào thư mục test-design/. (B) Nếu người dùng ĐÃ có test design: MỖI FR sinh đúng một file test case trong testcases/, bên trong bao phủ từ single transition (0-switch) → 1-switch → end-to-end. Dùng khi hành vi phụ thuộc trạng thái, vòng đời đối tượng, workflow, hoặc máy trạng thái (login lockout, order lifecycle, session, payment flow...).
---

# State Transition Testing — Sinh test design & test case theo chuyển trạng thái

## Mục tiêu

Áp dụng kỹ thuật **State Transition Testing** để mô hình hóa hành vi phụ thuộc trạng thái và sinh bộ test case bao phủ các chuyển trạng thái (transitions), từ chuyển đơn (1 state → 1 state) đến chuỗi end-to-end.

> **Khi nào dùng State Transition Testing?**
> Khi hành vi của hệ thống phụ thuộc vào **trạng thái hiện tại + sự kiện (event)** chứ không chỉ vào đầu vào — ví dụ: vòng đời đơn hàng (Created → Paid → Shipped → Delivered), khóa tài khoản sau N lần sai mật khẩu, phiên đăng nhập, luồng thanh toán, máy ATM. Cùng một event cho kết quả khác nhau tùy state.

## Cơ sở lý thuyết

- **ISTQB FL Syllabus §4.2.4 — State Transition Testing**: mô hình hóa hệ thống thành các state, event, guard, action và transition; thiết kế test case để phủ transitions.
- **Thành phần của một state model:**
  - **State (trạng thái):** tình huống hệ thống đang ở, chờ event. VD: `Locked`, `Idle`, `Paid`.
  - **Event / Trigger:** hành động/tín hiệu gây chuyển trạng thái. VD: `submitPassword`, `pay`, `timeout`.
  - **Guard (điều kiện):** điều kiện phải đúng thì transition mới xảy ra. VD: `[attempts < 3]`.
  - **Action:** việc hệ thống thực hiện khi chuyển. VD: `increment counter`, `send email`.
  - **Transition:** `(state nguồn, event, [guard]) → (state đích, action)`.
  - **Invalid transition:** cặp (state, event) **không** có transition hợp lệ — phải kiểm thử để chắc hệ thống từ chối/không đổi trạng thái.
- **Mức bao phủ (coverage):**
  - **0-switch (all transitions):** phủ mọi transition hợp lệ ít nhất 1 lần.
  - **1-switch:** phủ mọi cặp transition liên tiếp hợp lệ.
  - **Invalid transitions:** phủ các cặp (state, event) không hợp lệ.
  - **End-to-end:** chuỗi từ state khởi đầu → state kết thúc theo đường đi thực tế của nghiệp vụ.

---

## BƯỚC 0 — Phân loại kịch bản (BẮT BUỘC làm trước)

Skill có **2 kịch bản**. Xác định người dùng đang ở kịch bản nào:

- **Kịch bản A — CHƯA có test design:** người dùng chỉ đưa tài liệu (README, API spec, mô tả nghiệp vụ, code...) và **chưa có** bảng chuyển trạng thái. → Đi tới **PHẦN A** (thiết kế test design). Sau khi tạo xong test design, hỏi người dùng có muốn sinh luôn test case không; nếu có thì chạy tiếp **PHẦN B** dùng chính test design vừa tạo.
- **Kịch bản B — ĐÃ có test design:** người dùng đã cung cấp test design (state model + bảng chuyển trạng thái, dù ở file trong `test-design/` hay dán trực tiếp). → Bỏ qua PHẦN A, đi thẳng tới **PHẦN B** (sinh test case).

Nếu không rõ, kiểm tra thư mục `test-design/`. Nếu vẫn không chắc → hỏi người dùng một câu ngắn: *"Bạn đã có test design (bảng chuyển trạng thái) chưa, hay cần tôi thiết kế từ tài liệu?"*

Ghi rõ ở đầu output: đang chạy Kịch bản A hay B, và nguồn thông tin đã dùng.

---

## PHẦN A — Phân tích FR & Thiết kế Test Design (khi CHƯA có)

Chỉ chạy phần này ở Kịch bản A. Đọc kỹ **toàn bộ** tài liệu (API spec, README, danh sách FR...) trước khi bắt đầu.

### A1 — Trích xuất & phân loại toàn bộ FR
- Liệt kê **mọi FR** tìm được trong tài liệu (mã FR + mô tả ngắn).
- Với mỗi FR, đánh giá **có phù hợp State Transition Testing không**. Phù hợp khi: cùng một event cho kết quả khác nhau tùy trạng thái trước đó; có vòng đời / trường status; có ràng buộc thứ tự, timeout, retry, lockout-sau-N-lần; API có động từ chuyển trạng thái (`activate`, `cancel`, `pay`, `approve`, `expire`...).
- **KHÔNG phù hợp** (loại khỏi phạm vi, ghi rõ lý do): kiểm tra/định dạng/tính toán thuần (stateless); CRUD/lookup đơn không có vòng đời; logic tổ hợp phụ thuộc đầu vào hiện tại chứ không phụ thuộc lịch sử.
- Lập **bảng phân loại FR**: mỗi FR → `Phù hợp (trong phạm vi)` / `Không phù hợp (ngoài phạm vi)` + lý do một dòng. **Không bỏ im lặng FR nào.** Với FR ngoài phạm vi, gợi ý kỹ thuật thay thế (domain-testing / boundary-value-analysis / decision-table).

### A2 — Với MỖI FR phù hợp → dựng state model riêng
Lặp lại các bước sau cho **từng FR** được đánh dấu phù hợp (mỗi FR có state model, bảng, và sơ đồ **riêng**):

- **A2.1 — States:** liệt kê mọi trạng thái của FR đó; đánh dấu initial/final; gán mã `S1`, `S2`... kèm tên rõ nghĩa.
- **A2.2 — Event / Guard / Action:** liệt kê event gây chuyển; ghi guard (nếu có) và action đi kèm.
- **A2.3 — State Transition Table (bảng chuyển trạng thái):** bảng đầy đủ hàng = state nguồn × event; ô = (state đích, action) hoặc **"—" (invalid / không đổi)**; ghi rõ transition invalid + hành vi mong đợi.
- **A2.4 — State Diagram (BẮT BUỘC):** sơ đồ Mermaid `stateDiagram-v2` khớp 1-1 với bảng — đủ mọi state, mọi transition hợp lệ, có `[*] -->` initial và `--> [*]` final, nhãn cạnh ghi event + guard. Đối chiếu: mỗi transition trong bảng phải có trong sơ đồ và ngược lại.

> **Không bịa**: nếu tài liệu thiếu thông tin trạng thái của một FR, nêu rõ giả định hoặc hỏi lại thay vì suy diễn.

### A3 — Lưu test design
- Lưu vào thư mục **`test-design/`**.
- Tên file: `test-design-<feature-kebab>.md` (VD: `test-design-eshop.md`).
- Cấu trúc file theo [references/test-design-format.md](references/test-design-format.md): mở đầu bằng **bảng phân loại FR** (A1), rồi mỗi FR phù hợp là một mục riêng chứa **bảng chuyển trạng thái + sơ đồ Mermaid** của chính nó.

Sau khi lưu, thông báo đường dẫn file, tóm tắt "X FR phù hợp / Y FR ngoài phạm vi", và hỏi có muốn sinh test case luôn không.

---

## PHẦN B — Sinh Test Case (khi ĐÃ có test design)

Chạy phần này ở Kịch bản B, hoặc tiếp nối sau PHẦN A.

### B1 — Nạp & xác nhận test design
- Đọc test design (từ file `test-design/` hoặc nội dung người dùng dán). Xác định **danh sách FR** có trong test design, mỗi FR kèm state model + bảng chuyển trạng thái của nó.
- Tóm tắt: có bao nhiêu FR, mỗi FR có bao nhiêu state / transition hợp lệ / cặp (state, event) invalid. Xác nhận trước khi sinh.

### B2 — Sinh test case — MỖI FR MỘT FILE RIÊNG
Với **mỗi FR** trong test design → tạo **đúng một file** `.md` trong thư mục **`testcases/`** chứa **tất cả** test case của FR đó.
- Tên file: `testcase-<FR-ID>-<slug>.md` (VD: `testcase-FR-04-order-lifecycle.md`).
- Bên trong file, sinh test case bao phủ **từ đơn giản đến end-to-end**, theo thứ tự:
  1. **Single transitions (0-switch):** mỗi transition hợp lệ → 1 test case (1 state → 1 state qua 1 event).
  2. **Invalid transitions:** mỗi cặp (state, event) không hợp lệ → 1 test case (kiểm tra hệ thống từ chối / giữ nguyên state).
  3. **1-switch:** mỗi cặp transition liên tiếp hợp lệ → 1 test case.
  4. **End-to-end paths:** các chuỗi từ initial state → final state theo luồng nghiệp vụ chính và các nhánh quan trọng (happy path + đường lỗi/hủy).
- Mã test case: `TC-<FR-ID>-<NNN>` (VD `TC-FR-04-001`). Technique ghi: `State Transition Testing`.
- Mỗi test case ghi rõ: **loại kịch bản**, **transition/path được phủ**, state trước/sau mỗi bước, event, guard, expected result. Định dạng theo [references/testcase-format.md](references/testcase-format.md).

### B3 — Bảng truy vết coverage (mỗi FR)
Trong mỗi file FR, cuối file đặt bảng truy vết Transition ↔ Test case và xác nhận **mọi transition hợp lệ + mọi invalid transition + mọi cặp 1-switch của FR đó đều được phủ**. Ghi rõ mục nào chưa phủ và lý do — không bỏ im lặng.

### B5 — Nghi vấn bug
- Transition mà spec và code xử lý khác nhau.
- Invalid transition mà hệ thống lại cho phép (chuyển trạng thái sai).
- Guard bị nhầm điều kiện (VD `<` vs `<=`).
- Missing transition: event hợp lệ tại một state nhưng không được định nghĩa.

---

## Output

- **Kịch bản A:** một file test design trong `test-design/` — mở đầu bằng bảng phân loại FR, rồi mỗi FR phù hợp một mục riêng (bảng chuyển trạng thái + sơ đồ Mermaid). Hỏi có sinh test case tiếp không.
- **Kịch bản B:** mỗi FR một file test case trong `testcases/` (chứa toàn bộ test case của FR đó, có bảng truy vết coverage cuối file) + nghi vấn bug.

Nếu người dùng chưa chỉ rõ nơi lưu, dùng đúng hai thư mục mặc định: `test-design/` và `testcases/`. Nếu thư mục chưa tồn tại thì tạo.

## Nguyên tắc

- **Không bịa hành vi**: mọi state/event/guard/transition phải dẫn từ tài liệu hoặc mô tả người dùng; nếu thiếu, nêu giả định rõ ràng hoặc hỏi lại.
- **Không bỏ sót FR**: Kịch bản A phải phân loại MỌI FR (trong/ngoài phạm vi) kèm lý do — không im lặng bỏ FR nào.
- **Mỗi FR một state model, một file**: Kịch bản A → mỗi FR phù hợp có sơ đồ + bảng riêng; Kịch bản B → mỗi FR đúng một file test case.
- **Phủ đủ**: trong mỗi FR, 0-switch (all transitions) + invalid transitions + 1-switch + end-to-end là mức bắt buộc.
- **Luôn vẽ state diagram**: mỗi FR phù hợp (Kịch bản A) BẮT BUỘC có sơ đồ Mermaid `stateDiagram-v2` khớp với bảng chuyển trạng thái — không được bỏ qua.
- **Bám format & mã**: `TC-<FR-ID>-<NNN>`, technique đúng `State Transition Testing`.
