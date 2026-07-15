# Hướng dẫn chạy Automation từ số 0 (chỉ có EShop + 2 skill)

> **Dành cho:** người mới nhận về **chỉ 2 thứ** — thư mục `eshop/` (EShop SUT) và 2 skill trong `.claude/skills/` (`state-transition-testing`, `selenium-automation`) — **chưa có** `testcases/`, `test-design/`, `selenium/`.
> **Mục tiêu:** từ đó dùng **Claude Code** để *sinh ra* bộ test case + project Selenium, chạy thật trên EShop, và ra báo cáo HTML.

---

## 0. Nguyên tắc: skill là "khuôn", Claude Code là "thợ"

2 skill **không phải script chạy bằng terminal** — chúng là **hướng dẫn cho Claude**. Người dùng gõ `/tên-skill` trong **Claude Code**, Claude đọc tài liệu EShop rồi **tự sinh** test case + project Selenium. Vì vậy quy trình xoay quanh Claude Code, không phải gõ lệnh tay.

```
eshop/ (EShop)  +  2 skill
        │
        ▼  Claude Code: /state-transition-testing
test-design/  →  testcases/*.md
        │
        ▼  Claude Code: /selenium-automation
selenium/  →  chạy  →  mochawesome-report/ (HTML) + bug-snapshots/
```

---

## 1. Điều kiện cần (cài 1 lần)

| Thứ | Ghi chú |
|---|---|
| **Claude Code** | Đã có 2 skill trong `.claude/skills/` |
| **Node ≥ 18** + npm | Chạy backend, frontend, Selenium |
| **Google Chrome** | Selenium điều khiển trình duyệt |
| **`sqlite3` CLI** | Test dùng để đặt/đọc state tài khoản trong DB (macOS có sẵn; Linux: `apt install sqlite3`) |

---

## 2. Bước 1 — Bật EShop SUT (bắt buộc)

Test chạy **thật** trên EShop nên phải bật SUT trước. Backend hardcode cổng **:3000** → đảm bảo :3000 trống (nếu Docker/app khác chiếm: `docker stop <tên-container>`).

```bash
# Terminal 1 — backend (:3000)
cd eshop/backend
npm install
node database.js      # tạo + seed DB (database.sqlite)
node server.js        # GIỮ terminal này chạy

# Terminal 2 — frontend (:5173)
cd eshop/frontend-web
npm install
npm run dev           # GIỮ terminal này chạy
```

Kiểm tra: `curl localhost:3000/api/products` phải trả `200`.

---

## 3. Bước 2 — Sinh test case bằng skill ① (trong Claude Code)

Gõ lệnh skill kèm yêu cầu, **nói rõ tài liệu ở `eshop/`**:

```
/state-transition-testing
→ "Sinh test case cho FR-02 trong eshop"
```

Claude sẽ:
1. Đọc `eshop/README.md` (đặc tả FR) + `eshop/api_specification.md`
2. Dựng state model (state / event / guard / bảng chuyển trạng thái + sơ đồ)
3. Sinh ra:
   - `test-design/test-design-*.md`
   - `testcases/testcase-FR-02-*.md` (các TC: 0-switch, invalid, 1-switch, end-to-end)

> Có thể chọn FR khác giàu trạng thái: **FR-03** (OTP 2 bước), **FR-10** (vòng đời đơn hàng).

---

## 4. Bước 3 — Sinh + chạy Selenium bằng skill ② (trong Claude Code)

```
/selenium-automation
→ "Dựa vào testcases/testcase-FR-02-login-lockout.md, sinh script và chạy"
```

Claude sẽ:
1. Đọc test case + soi backend/DB EShop để biết hành vi thật
2. Sinh project `selenium/` (config, utils, test script, `.mocharc.json`)
3. `npm install` + chạy test → sinh **report mochawesome (HTML)**

---

## 5. Bước 4 — Xem kết quả

| Thứ | Đường dẫn |
|---|---|
| Báo cáo HTML | `selenium/mochawesome-report/index.html` (mở bằng trình duyệt) |
| Ảnh bằng chứng bug | `selenium/bug-snapshots/` |

### Chạy lại sau này (không cần Claude)
```bash
cd selenium
npm test                                        # full (test @slow chờ 30s → ~2 phút)
npx mocha --reporter spec --invert --grep "@slow|\[UI\]"   # nhanh, bỏ test chờ 30s + UI
```

---

## 6. Những chỗ hay vấp (đọc kỹ)

1. **Đường dẫn tài liệu:** skill `selenium-automation` (phần điều kiện) ghi đọc `docs/README.md`, nhưng tài liệu EShop thật ở **`eshop/README.md`** + **`eshop/api_specification.md`**. → Khi gọi skill, **nói rõ tài liệu nằm ở `eshop/`**, kẻo Claude báo "không tìm thấy docs".
2. **:3000 bị chiếm** (Docker/app khác) → backend không chạy → mọi login trả 404. Phải giải phóng :3000 trước.
3. **Thiếu `sqlite3` CLI** → helper đặt/đọc state trong DB sẽ lỗi.
4. **Nhiều test FAIL là ĐÚNG — không phải lỗi setup.** Test assert **theo đặc tả (spec)** để *lộ bug* của EShop (EShop có bug cố ý: bộ đếm login +2 thay vì +1, khóa 180s thay vì 30s...). Test fail nghĩa là nó **tố cáo đúng bug**.
5. **Test `@slow`** chờ 30s (theo spec) nên chạy lâu; dùng lệnh "nhanh" ở mục 5 để bỏ qua khi cần.

---

## 7. Tóm tắt 1 phút

```
1. Bật EShop:  backend :3000  +  frontend :5173
2. Claude Code:  /state-transition-testing   → testcases/
3. Claude Code:  /selenium-automation        → selenium/ + chạy
4. Mở:  selenium/mochawesome-report/index.html
```

> Nhớ: **skill cần Claude Code để chạy** (nó sinh code, không phải lệnh terminal). Sau khi đã có `selenium/` thì chạy lại chỉ cần `npm test`.
