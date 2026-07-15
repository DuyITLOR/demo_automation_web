# Test Cases — FR-01 Đăng ký tài khoản

**Requirement ID:** FR-01
**Module / Technique:** Authentication / State Transition Testing
**Nguồn test design:** [test-design-eshop.md](file:///d:/demo_automation_web/test-design/test-design-eshop.md) → mục FR-01 — Đăng ký tài khoản

---

## 1. Single transitions (0-switch)

### TC-FR-01-001: Nhập dữ liệu không hợp lệ từ trạng thái rỗng
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T1 — (S1 Idle, E1: input_invalid_data) → (S2: Incomplete/Invalid / Hiển thị lỗi validation)

**Preconditions:**
- Người dùng đang ở màn hình Đăng ký tài khoản. Form đăng ký trống.
- Trạng thái hiện tại: **S1 Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập Email sai định dạng: `invalidemail` | **S2: Incomplete/Invalid** |

**Expected result:** 
- Giao diện hiển thị thông báo lỗi định dạng Email không hợp lệ.
- Nút "Đăng ký" bị vô hiệu hóa (disabled).
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-002: Nhập dữ liệu hợp lệ từ trạng thái rỗng
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T2 — (S1 Idle, E2: input_valid_data) → (S3: Ready / Kích hoạt nút submit)

**Preconditions:**
- Người dùng đang ở màn hình Đăng ký tài khoản. Form đăng ký trống.
- Trạng thái hiện tại: **S1 Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập đầy đủ thông tin hợp lệ:<br>- Họ tên: `Nguyen Van A`<br>- Email: `new_user@domain.com`<br>- Mật khẩu: `Password123!`<br>- Xác nhận mật khẩu: `Password123!` | **S3: Ready** |

**Expected result:** 
- Form không còn lỗi validation nào.
- Nút "Đăng ký" được kích hoạt (enabled) để sẵn sàng bấm.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-003: Cập nhật dữ liệu không hợp lệ từ trạng thái không hợp lệ
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T3 — (S2: Incomplete/Invalid, E1: input_invalid_data) → (S2: Incomplete/Invalid / Cập nhật lỗi validation)

**Preconditions:**
- Form đăng ký đang có lỗi email không hợp lệ.
- Trạng thái hiện tại: **S2: Incomplete/Invalid**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S2 | Nhập mật khẩu yếu: `123` | **S2: Incomplete/Invalid** |

**Expected result:** 
- Giao diện cập nhật thêm lỗi độ mạnh mật khẩu (yêu cầu mật khẩu mạnh).
- Nút "Đăng ký" tiếp tục bị vô hiệu hóa.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-004: Cập nhật dữ liệu hợp lệ từ trạng thái không hợp lệ
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T4 — (S2: Incomplete/Invalid, E2: input_valid_data) → (S3: Ready / Ẩn lỗi, kích hoạt submit)

**Preconditions:**
- Form đăng ký đang thiếu trường mật khẩu xác nhận và bị báo lỗi.
- Trạng thái hiện tại: **S2: Incomplete/Invalid**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S2 | Điền trường xác nhận mật khẩu khớp với mật khẩu đã nhập | **S3: Ready** |

**Expected result:** 
- Biểu mẫu ẩn tất cả các thông báo lỗi.
- Nút "Đăng ký" được kích hoạt.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-005: Xóa sạch form từ trạng thái không hợp lệ
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T5 — (S2: Incomplete/Invalid, E4: clear/reset) → (S1: Idle / Xóa sạch form và lỗi)

**Preconditions:**
- Form đăng ký đang điền dở dang và có thông báo lỗi.
- Trạng thái hiện tại: **S2: Incomplete/Invalid**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S2 | Tải lại (Reload) trang | **S1: Idle** |

**Expected result:** 
- Toàn bộ các trường nhập liệu được reset về trống.
- Các thông báo lỗi validation bị ẩn.
- Nút "Đăng ký" bị vô hiệu hóa.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-006: Nhập dữ liệu không hợp lệ từ trạng thái sẵn sàng
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T6 — (S3: Ready, E1: input_invalid_data) → (S2: Incomplete/Invalid / Hiện lỗi, khóa submit)

**Preconditions:**
- Các trường trên form đã điền đầy đủ và đúng định dạng.
- Trạng thái hiện tại: **S3: Ready**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S3 | Xóa bớt nội dung của trường Họ tên | **S2: Incomplete/Invalid** |

**Expected result:** 
- Giao diện hiển thị lỗi thiếu trường bắt buộc "Họ tên".
- Nút "Đăng ký" lập tức bị vô hiệu hóa.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-007: Đăng ký thành công với email chưa tồn tại
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T7 — (S3: Ready, E3: submit [Email chưa tồn tại]) → (S4: Registered / Lưu DB, thành công, chuyển hướng)

**Preconditions:**
- Form đã điền đầy đủ thông tin hợp lệ. Email sử dụng chưa từng được đăng ký trong hệ thống (`new_unique_user@domain.com`).
- Trạng thái hiện tại: **S3: Ready**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S3 | Bấm nút "Đăng ký" | **S4: Registered** |

**Expected result:** 
- Một request `POST /api/register` được gửi đi và trả về mã thành công `200 OK`.
- Hiển thị thông báo đăng ký thành công.
- Trình duyệt tự động chuyển hướng người dùng sang trang Đăng nhập.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-008: Đăng ký thất bại với email đã tồn tại
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T8 — (S3: Ready, E3: submit [Email đã tồn tại]) → (S5: Error_Email_Exists / Hiển thị lỗi trùng email)

**Preconditions:**
- Form điền đầy đủ thông tin hợp lệ, nhưng Email sử dụng là `test@eshop.com` (đã tồn tại trong DB).
- Trạng thái hiện tại: **S3: Ready**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S3 | Bấm nút "Đăng ký" | **S5: Error_Email_Exists** |

**Expected result:** 
- Backend trả về mã lỗi `400 Bad Request` kèm thông báo email đã tồn tại.
- Trên form đăng ký xuất hiện thông báo lỗi "Email đã tồn tại".
- Nút "Đăng ký" giữ nguyên trạng thái bật hoặc hiển thị lỗi tại vị trí quy định.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-009: Xóa sạch form từ trạng thái sẵn sàng
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T9 — (S3: Ready, E4: clear/reset) → (S1: Idle / Xóa sạch form)

**Preconditions:**
- Form đã điền đầy đủ thông tin hợp lệ.
- Trạng thái hiện tại: **S3: Ready**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S3 | Tải lại (Reload) trang | **S1: Idle** |

**Expected result:** 
- Form được làm trống hoàn toàn. Nút "Đăng ký" bị vô hiệu hóa.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-010: Nhập dữ liệu không hợp lệ sau khi lỗi trùng email
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T10 — (S5: Error_Email_Exists, E1: input_invalid_data) → (S2: Incomplete/Invalid / Hiện lỗi validation)

**Preconditions:**
- Form đang hiển thị thông báo lỗi email đã tồn tại.
- Trạng thái hiện tại: **S5: Error_Email_Exists**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S5 | Nhập mật khẩu xác nhận không khớp | **S2: Incomplete/Invalid** |

**Expected result:** 
- Thông báo lỗi mật khẩu xác nhận không khớp xuất hiện.
- Nút submit bị vô hiệu hóa.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-011: Thay đổi email hợp lệ sau khi lỗi trùng email
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T11 — (S5: Error_Email_Exists, E2: input_valid_data) → (S3: Ready / Ẩn lỗi email cũ, sẵn sàng)

**Preconditions:**
- Form đang hiển thị thông báo lỗi email đã tồn tại.
- Trạng thái hiện tại: **S5: Error_Email_Exists**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S5 | Đổi email sang địa chỉ mới chưa tồn tại: `fixed_user@domain.com` | **S3: Ready** |

**Expected result:** 
- Ẩn thông báo lỗi trùng email cũ.
- Nút "Đăng ký" được kích hoạt lại.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-012: Xóa sạch form sau khi lỗi trùng email
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T12 — (S5: Error_Email_Exists, E4: clear/reset) → (S1: Idle / Xóa sạch form và lỗi)

**Preconditions:**
- Form đang hiển thị thông báo lỗi email đã tồn tại.
- Trạng thái hiện tại: **S5: Error_Email_Exists**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S5 | Tải lại (Reload) trang | **S1: Idle** |

**Expected result:** 
- Form trống hoàn toàn, ẩn lỗi cũ, nút Đăng ký khóa.
**Status / Related bugs:** Not Run / None

---

## 2. Invalid transitions

### TC-FR-01-013: Bấm Đăng ký khi form rỗng
**Loại kịch bản:** Invalid transition
**Transition phủ:** (S1: Idle, E3: submit) — Không có transition hợp lệ

**Preconditions:**
- Trang đăng ký vừa tải, chưa nhập gì.
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Cố gắng submit form (ví dụ: click vào nút đăng ký bị khóa, hoặc trigger submit qua code) | **S1: Idle** |

**Expected result:** 
- Hệ thống chặn không gửi API `POST /api/register`.
- Form giữ nguyên trạng thái ban đầu.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-014: Bấm Đăng ký khi form chứa dữ liệu không hợp lệ
**Loại kịch bản:** Invalid transition
**Transition phủ:** (S2: Incomplete/Invalid, E3: submit) — Không có transition hợp lệ

**Preconditions:**
- Form đang chứa thông tin sai định dạng email.
- Trạng thái hiện tại: **S2: Incomplete/Invalid**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S2 | Cố gắng submit form | **S2: Incomplete/Invalid** |

**Expected result:** 
- Không gửi API đi, giữ nguyên trạng thái lỗi và tiếp tục vô hiệu hóa nút submit.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-015: Bấm Đăng ký lại mà không sửa email đã trùng
**Loại kịch bản:** Invalid transition
**Transition phủ:** (S5: Error_Email_Exists, E3: submit) — Không có transition hợp lệ

**Preconditions:**
- Form vừa nhận thông báo lỗi email trùng và đang ở trạng thái lỗi.
- Trạng thái hiện tại: **S5: Error_Email_Exists**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S5 | Nhấp lại nút "Đăng ký" một lần nữa mà không sửa đổi email | **S5: Error_Email_Exists** |

**Expected result:** 
- Nút submit bị khóa hoặc hệ thống hiển thị lại thông báo lỗi trùng email cũ, không đổi trạng thái.
**Status / Related bugs:** Not Run / None

---

## 3. 1-switch (Cặp transition liên tiếp)

### TC-FR-01-020: Đang nhập sai tiếp tục sửa sai (T1 rồi T3)
**Loại kịch bản:** 1-switch
**Cặp transition phủ:** T1 (S1→S2) → T3 (S2→S2)

**Preconditions:**
- Trang đăng ký vừa tải.
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập email sai định dạng | **S2: Incomplete/Invalid** |
| 2 | S2 | Nhập tiếp mật khẩu không khớp | **S2: Incomplete/Invalid** |

**Expected result:** Form liên tục báo lỗi và nút submit bị khóa.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-021: Đang nhập sai sửa lại cho đúng (T1 rồi T4)
**Loại kịch bản:** 1-switch
**Cặp transition phủ:** T1 (S1→S2) → T4 (S2→S3)

**Preconditions:**
- Trang đăng ký vừa tải.
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập mật khẩu yếu: `123` | **S2: Incomplete/Invalid** |
| 2 | S2 | Sửa lại mật khẩu mạnh và điền đầy đủ các thông tin hợp lệ | **S3: Ready** |

**Expected result:** Form mất hoàn toàn thông báo lỗi, nút Đăng ký được bật lên.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-022: Đang nhập sai bấm reset form (T1 rồi T5)
**Loại kịch bản:** 1-switch
**Cặp transition phủ:** T1 (S1→S2) → T5 (S2→S1)

**Preconditions:**
- Trang đăng ký vừa tải.
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập email sai định dạng | **S2: Incomplete/Invalid** |
| 2 | S2 | Tải lại trang | **S1: Idle** |

**Expected result:** Form quay lại trạng thái trống rỗng ban đầu.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-023: Đang sẵn sàng chuyển sang sai (T2 rồi T6)
**Loại kịch bản:** 1-switch
**Cặp transition phủ:** T2 (S1→S3) → T6 (S3→S2)

**Preconditions:**
- Trang đăng ký vừa tải.
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập đầy đủ thông tin hợp lệ | **S3: Ready** |
| 2 | S3 | Xóa bớt số ký tự của mật khẩu làm mật khẩu yếu đi | **S2: Incomplete/Invalid** |

**Expected result:** Nút Đăng ký bị vô hiệu hóa lại và hiển thị lỗi validation mật khẩu.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-024: Điền thông tin đúng nhưng email bị trùng (T2 rồi T8)
**Loại kịch bản:** 1-switch
**Cặp transition phủ:** T2 (S1→S3) → T8 (S3→S5)

**Preconditions:**
- Trang đăng ký vừa tải.
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập đầy đủ thông tin hợp lệ với email `test@eshop.com` | **S3: Ready** |
| 2 | S3 | Bấm nút "Đăng ký" | **S5: Error_Email_Exists** |

**Expected result:** Form hiển thị lỗi "Email đã tồn tại".
**Status / Related bugs:** Not Run / None

---

## 4. End-to-end paths

### TC-FR-01-030: Vòng đời đăng ký thành công trực tiếp (Happy Path)
**Loại kịch bản:** End-to-end path
**Path phủ:** S1 Idle → T2 → S3 Ready → T7 → S4 Registered → [*]

**Preconditions:**
- Sử dụng email hoàn toàn mới chưa từng đăng ký (`happy_user@domain.com`).
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập đầy đủ thông tin hợp lệ | **S3: Ready** |
| 2 | S3 | Bấm nút "Đăng ký" | **S4: Registered** |

**Expected result:** Đăng ký thành công, lưu tài khoản vào DB và chuyển hướng sang trang đăng nhập.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-031: Đăng ký trùng email, sửa lại và thành công
**Loại kịch bản:** End-to-end path
**Path phủ:** S1 Idle → T2 → S3 Ready → T8 → S5 Error_Email_Exists → T11 → S3 Ready → T7 → S4 Registered → [*]

**Preconditions:**
- Có sẵn tài khoản `test@eshop.com` trong hệ thống.
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập đầy đủ thông tin hợp lệ với email `test@eshop.com` | **S3: Ready** |
| 2 | S3 | Bấm nút "Đăng ký" | **S5: Error_Email_Exists** |
| 3 | S5 | Sửa email thành `fixed_user@domain.com` | **S3: Ready** |
| 4 | S3 | Bấm nút "Đăng ký" | **S4: Registered** |

**Expected result:** Hệ thống báo trùng email, sau khi đổi email mới thì đăng ký thành công và chuyển hướng trang.
**Status / Related bugs:** Not Run / None

---

### TC-FR-01-032: Nhập thông tin lỗi, sửa lại rồi reset trang
**Loại kịch bản:** End-to-end path
**Path phủ:** S1 Idle → T1 → S2 Incomplete/Invalid → T4 → S3 Ready → T9 → S1 Idle

**Preconditions:**
- Trạng thái hiện tại: **S1: Idle**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Idle | Nhập email sai định dạng | **S2: Incomplete/Invalid** |
| 2 | S2 | Sửa email đúng định dạng và nhập đủ các trường hợp lệ | **S3: Ready** |
| 3 | S3 | Tải lại trang | **S1: Idle** |

**Expected result:** Form đi qua lỗi, sẵn sàng, rồi quay về trống hoàn toàn sau khi tải lại trang.
**Status / Related bugs:** Not Run / None

---

## 5. Truy vết coverage — FR-01

### Transition hợp lệ (0-switch)
| Transition | Mô tả | Test case |
|---|---|---|
| **T1** | S1 → S2 (input_invalid_data) | TC-FR-01-001 |
| **T2** | S1 → S3 (input_valid_data) | TC-FR-01-002 |
| **T3** | S2 → S2 (input_invalid_data) | TC-FR-01-003 |
| **T4** | S2 → S3 (input_valid_data) | TC-FR-01-004 |
| **T5** | S2 → S1 (clear/reset) | TC-FR-01-005 |
| **T6** | S3 → S2 (input_invalid_data) | TC-FR-01-006 |
| **T7** | S3 → S4 (submit - email chưa tồn tại) | TC-FR-01-007 |
| **T8** | S3 → S5 (submit - email đã tồn tại) | TC-FR-01-008 |
| **T9** | S3 → S1 (clear/reset) | TC-FR-01-009 |
| **T10** | S5 → S2 (input_invalid_data) | TC-FR-01-010 |
| **T11** | S5 → S3 (input_valid_data) | TC-FR-01-011 |
| **T12** | S5 → S1 (clear/reset) | TC-FR-01-012 |

### Invalid transitions
| (State, Event) | Test case |
|---|---|
| (S1, E3: submit) | TC-FR-01-013 |
| (S2, E3: submit) | TC-FR-01-014 |
| (S5, E3: submit) | TC-FR-01-015 |

### 1-switch
| Cặp transition | Test case |
|---|---|
| T1 → T3 | TC-FR-01-020 |
| T1 → T4 | TC-FR-01-021 |
| T1 → T5 | TC-FR-01-022 |
| T2 → T6 | TC-FR-01-023 |
| T2 → T8 | TC-FR-01-024 |
| T8 → T11 | TC-FR-01-025 |

### End-to-end paths
| Path | Test case |
|---|---|
| S1 → S3 → S4 | TC-FR-01-030 |
| S1 → S3 → S5 → S3 → S4 | TC-FR-01-031 |
| S1 → S2 → S3 → S1 | TC-FR-01-032 |

> **Xác nhận độ phủ:** Tất cả 12 transition hợp lệ (T1..T12), 3 transition không hợp lệ chủ chốt và các cặp 1-switch cùng luồng nghiệp vụ chính đều đã được bao phủ đầy đủ.
