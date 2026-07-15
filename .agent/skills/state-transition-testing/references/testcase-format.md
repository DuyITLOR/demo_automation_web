# Format Output — State Transition Test Case

Dùng ở **Kịch bản B** (sinh test case). **MỖI FR MỘT FILE RIÊNG** trong thư mục `testcases/`, bên trong chứa **tất cả** test case của FR đó.

---

## Quy ước bắt buộc

- **Tên file:** `testcase-<FR-ID>-<slug>.md` — VD: `testcase-FR-04-order-lifecycle.md`. Mỗi FR đúng một file.
- **Mã test case:** `TC-<FR-ID>-<NNN>` — NNN 3 chữ số. VD: `TC-FR-04-001`.
- **Technique** ghi: `State Transition Testing`.
- **Status** ban đầu: `Not Run`. **Related bugs**: `None`.
- Thứ tự test case trong file: **0-switch → invalid → 1-switch → end-to-end**.
- Mỗi test case ghi rõ **loại kịch bản** và mỗi bước ghi **state trước → event → state sau**.
- Cuối file: **bảng truy vết coverage** của FR đó.

---

## Khung một file test case (một FR)

```markdown
# Test Cases — FR-04 Vòng đời đơn hàng

**Requirement ID:** FR-04
**Module / Technique:** Order / State Transition Testing
**Nguồn test design:** test-design/test-design-eshop.md → mục FR-04

---

## 1. Single transitions (0-switch)

### TC-FR-04-001: Thanh toán đơn mới (S1 Created → S2 Paid)
**Loại kịch bản:** Single transition (0-switch)
**Transition phủ:** T1 — (S1 Created, E1 pay) → (S2 Paid / trừ kho)

**Preconditions:** Đơn ở state **S1 Created**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Created | Gọi pay với thẻ hợp lệ | S2 Paid, kho bị trừ |

**Expected result:** Đơn chuyển sang Paid, trừ kho, ghi giao dịch.
**Status / Related bugs:** Not Run / None

### TC-FR-04-002: ... (T2, T3, T4, T5 — mỗi transition một test case)

---

## 2. Invalid transitions

### TC-FR-04-010: Ship đơn chưa thanh toán (S1 Created + ship — invalid)
**Loại kịch bản:** Invalid transition
**Transition phủ:** (S1 Created, E2 ship) — không có transition hợp lệ

**Preconditions:** Đơn ở state **S1 Created**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Created | Gọi ship | S1 Created (không đổi) |

**Expected result:** Hệ thống từ chối ("đơn chưa thanh toán"), giữ nguyên Created.
**Status / Related bugs:** Not Run / None

---

## 3. 1-switch (cặp transition liên tiếp)

### TC-FR-04-020: Tạo → thanh toán → giao vận (T1 rồi T3)
**Loại kịch bản:** 1-switch
**Cặp transition phủ:** T1 (S1→S2) → T3 (S2→S3)

**Preconditions:** Đơn ở state **S1 Created**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Created | pay | S2 Paid |
| 2 | S2 Paid | ship | S3 Shipped |

**Expected result:** Đơn đi qua Paid rồi Shipped, có mã vận đơn.
**Status / Related bugs:** Not Run / None

---

## 4. End-to-end paths

### TC-FR-04-030: Vòng đời đầy đủ đến Delivered
**Loại kịch bản:** End-to-end path
**Path phủ:** S1 →(pay)→ S2 →(ship)→ S3 →(deliver)→ S4  (T1, T3, T5)

**Preconditions:** Đơn ở state **S1 Created**

**Test steps:**
| # | State trước | Event / Action | State sau (mong đợi) |
|---|-------------|----------------|----------------------|
| 1 | S1 Created | pay | S2 Paid |
| 2 | S2 Paid | ship | S3 Shipped |
| 3 | S3 Shipped | deliver | S4 Delivered |

**Expected result:** Đơn hoàn tất vòng đời, đóng đơn ở Delivered.
**Status / Related bugs:** Not Run / None

### TC-FR-04-031: Hủy đơn trước khi ship (S1 → S5)  ... (nhánh lỗi/hủy)

---

## 5. Truy vết coverage — FR-04

### Transition hợp lệ (0-switch)
| Transition | Mô tả | Test case |
|-----------|-------|-----------|
| T1 | S1 →(pay)→ S2 | TC-FR-04-001 |
| T3 | S2 →(ship)→ S3 | TC-FR-04-003 |
| T5 | S3 →(deliver)→ S4 | TC-FR-04-005 |

### Invalid transitions
| (State, Event) | Test case |
|----------------|-----------|
| (S1, ship) | TC-FR-04-010 |
| (S2, pay) | TC-FR-04-011 |

### 1-switch
| Cặp | Test case |
|-----|-----------|
| T1→T3 | TC-FR-04-020 |

### End-to-end
| Path | Test case |
|------|-----------|
| Created→Paid→Shipped→Delivered | TC-FR-04-030 |
| Created→Cancelled | TC-FR-04-031 |

> Đã phủ: tất cả transition hợp lệ + invalid + 1-switch của FR-04. (Ghi rõ mục chưa phủ + lý do nếu có.)
```

---

## Ghi chú
- Cột "State trước / State sau" trong test steps là bắt buộc — cốt lõi của kỹ thuật này.
- Một file = một FR = tất cả test case của FR đó; không tách mỗi kịch bản một file, cũng không gộp nhiều FR vào một file.
- Happy path / 0-switch trước, sau đó invalid, rồi 1-switch, cuối cùng end-to-end.
