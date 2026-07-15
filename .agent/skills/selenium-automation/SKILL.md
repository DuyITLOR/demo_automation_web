---
name: selenium-automation
description: Sinh script Selenium (TypeScript + Mocha) để tự động chạy các test case trong thư mục testcases/ của EShop. Với MỖI file test case (VD testcase-FR-02-login-lockout.md), sinh đúng một file script Selenium trong selenium/tests/ bao phủ toàn bộ TC trong file đó, chạy được ở cả 2 mức — UI thật (frontend :5173) và API (:3000). Sau khi chạy, tự động sinh báo cáo HTML bằng mochawesome (selenium/mochawesome-report/) tổng hợp pass/fail và bug. Kèm hướng dẫn cài đặt & chạy (selenium/README.md) và chụp bug snapshot vào selenium/bug-snapshots/ khi actual ≠ expected. Dùng khi người dùng muốn "tự động hóa", "chạy testcase bằng Selenium", hoặc "automation test".
---

# Selenium Automation — Chạy test case bằng Selenium (TS + Mocha)

## Mục tiêu

Chuyển các test case đã thiết kế trong `testcases/*.md` thành **script Selenium chạy được**, tự động thực thi và **so sánh actual vs expected**. Khi có sai lệch (nghi vấn bug), tự động **chụp screenshot** và ghi log vào `selenium/bug-snapshots/`. Sau mỗi lần chạy, sinh **báo cáo Markdown** trong `selenium/reports/` tổng hợp kết quả pass/fail và bug.

Stack cố định của dự án này:
- **Ngôn ngữ:** TypeScript (Node.js) — chạy qua **`tsx`** (loader nhanh, cấu hình `.mocharc` tối giản, Node ≥18).
- **Thư viện:** `selenium-webdriver` + `mocha` (test runner) + `chai` (assertion) + `mochawesome` (reporter HTML), dùng `@types/*` cho type an toàn.
- **Driver:** ChromeDriver (Chrome). Cho phép chạy `headless`.
- **2 mức thực thi cho mỗi FR khi khả thi:**
  - **UI** — điều khiển trình duyệt thật trên frontend (`http://localhost:5173`).
  - **API** — gọi thẳng endpoint backend (`http://localhost:3000`) để kiểm chứng state/counter/logic mà UI khó quan sát.

## Điều kiện tiên quyết (kiểm tra trước khi sinh script)

1. Có file test case trong `testcases/`. Nếu chưa có → gợi ý chạy skill `state-transition-testing` (hoặc kỹ thuật phù hợp) để sinh trước.
2. Đọc `docs/README.md` (đặc tả FR + URL + tài khoản mặc định) và `docs/api_specification.md` (endpoint, body, response) để biết selector nghiệp vụ và hợp đồng API.
3. Hệ thống EShop đang chạy (backend :3000, frontend :5173). Nếu không chạy, script vẫn sinh được nhưng sẽ fail lúc thực thi — ghi rõ trong README.

---

## BƯỚC 1 — Chọn test case nguồn

- Người dùng chỉ định file (VD `testcase-FR-02-login-lockout.md`) hoặc "tất cả".
- Với mỗi file test case → sinh **đúng một** file script `selenium/tests/<FR-ID>.<feature>.test.ts`.
- Đọc **toàn bộ** file test case: mọi TC, precondition, test data, step (state trước/event/state sau), expected result, và bảng nghi vấn bug ở cuối.

## BƯỚC 2 — Ánh xạ mỗi TC → một `it()` của Mocha

- Mỗi `TC-<FR-ID>-<NNN>` trở thành một khối `it('TC-... : mô tả', ...)`.
- Nhóm theo mục của test case (Single transition / Invalid / 1-switch / End-to-end) bằng `describe()` lồng nhau.
- **Precondition = code setup**, không phải comment. Reset trạng thái tài khoản trước mỗi TC (VD gọi API để xóa failCount / mở khóa, hoặc chờ hết timeout khóa) trong `beforeEach`/đầu `it`. Nếu backend không có endpoint reset, mô phỏng bằng cách chờ (VD chờ 30s hết khóa) và ghi chú rõ.
- **Test data** lấy đúng từ file test case (email/password/OTP...). Không tự bịa dữ liệu khác. Khai báo kiểu rõ ràng (`interface`/`type`) cho test data khi hợp lý.
- **Expected result → assertion** (`chai.expect`). Với hành vi mà spec định nghĩa rõ (VD "sai ≥3 lần → khóa 30s", "failCount tăng đúng 1"), assert đúng theo **spec** (không theo hành vi hiện tại của hệ thống) — để nếu hệ thống sai thì test **fail và lộ bug**.

## BƯỚC 3 — Hai mức UI và API

- **UI test:** dùng `driver.get(FRONTEND_URL + '/login')`, tìm input bằng selector ổn định (ưu tiên `input[type="email"]`, `input[type="password"]`, nút submit theo text/role). Chờ bằng `driver.wait(until....)`, không dùng sleep cứng trừ khi kiểm timeout (VD chờ 30s mở khóa).
- **API test:** dùng `fetch` (Node 18+) hoặc `axios` POST tới `/api/login` với body JSON, assert `status`, `token`, message. Định nghĩa `type` cho request/response body. Dùng để kiểm chính xác counter/lockout mà UI che giấu.
- Với FR-02, cả 2 mức đều áp dụng. Với FR chỉ có ý nghĩa ở một mức, ghi rõ và sinh mức phù hợp.

## BƯỚC 4 — Bug snapshot khi actual ≠ expected

Bọc phần assert/quan sát trong `try/catch` (helper `captureOnFail`). Khi một `it()` fail:
- **UI:** chụp `driver.takeScreenshot()` lưu PNG vào `selenium/bug-snapshots/<TC-ID>-<timestamp>.png`.
- **Ghi log:** thêm một mục vào `selenium/bug-snapshots/BUGS.md` gồm: TC ID, mô tả, **Expected**, **Actual**, mức (UI/API), đường dẫn ảnh, thời điểm.
- **Nhúng vào report HTML:** gọi `addContext(this, { title: 'Bug', value: <đường-dẫn-ảnh> })` (từ `mochawesome/addContext`) để đính ảnh + Expected/Actual vào đúng test fail → hiện ngay trong `mochawesome-report/index.html`. Đường dẫn ảnh phải **tương đối từ thư mục report** (VD `../bug-snapshots/<file>.png`) để thẻ `<img>` load được. Với TC mức API (không có `driver`), chỉ cần addContext text Expected/Actual.
- Vẫn để test **fail** (throw lại lỗi) — snapshot chỉ để làm bằng chứng, không nuốt lỗi.

## BƯỚC 5 — Báo cáo HTML bằng mochawesome (selenium/mochawesome-report/)

Dùng thư viện **`mochawesome`** (reporter cho Mocha) để **tự sinh báo cáo HTML + JSON** sau mỗi lần chạy — không tự viết reporter.

- **Cài:** `npm install --save-dev mochawesome`.
- **Cấu hình `.mocharc.json`:**
  ```json
  {
    "extension": ["ts"],
    "spec": "tests/**/*.test.ts",
    "timeout": 60000,
    "node-option": ["import=tsx"],
    "reporter": "mochawesome",
    "reporter-option": [
      "reportDir=mochawesome-report",
      "reportFilename=index",
      "overwrite=true",
      "charts=true"
    ]
  }
  ```
- **Kết quả sinh ra:** `selenium/mochawesome-report/index.html` (mở bằng trình duyệt) + `index.json` + thư mục `assets/`. mochawesome tự tổng hợp: số Pass ✅/Fail ❌/Skip ⏭️, tỉ lệ pass, biểu đồ tròn, thời lượng, cây `describe`/`it` (phản ánh Single/1-switch/End-to-end), và stack lỗi của test fail.
- **Nhúng bằng chứng bug:** dùng `mochawesome/addContext` (xem BƯỚC 4) để đính ảnh + Expected/Actual vào đúng test fail → hiện ngay trong HTML report.
- **Console:** mochawesome vẫn in tóm tắt pass/fail ra console khi chạy (không cần `mocha-multi-reporters`).
- Báo cáo là **sản phẩm bắt buộc** của mỗi lần chạy — luôn nhắc người dùng mở `selenium/mochawesome-report/index.html` sau khi chạy xong.

> **Ghi chú kỹ thuật:** reporter là thư viện JS đã publish (`mochawesome`) nên Mocha `require()` ổn định. Các file `.ts` (test, utils) vẫn nạp qua **`tsx`** nhờ `node-option: ["import=tsx"]` trong `.mocharc.json` — tránh được bẫy nạp reporter `.ts` thủ công.

---

## Cấu trúc thư mục sinh ra

```
selenium/
  package.json            # deps + scripts (mocha, selenium-webdriver, chai, mochawesome, tsx, @types/*)
  tsconfig.json           # cấu hình TypeScript
  .mocharc.json           # loader tsx (node-option import) + reporter mochawesome (HTML)
  utils/
    driver.ts             # tạo/đóng WebDriver (Chrome, headless option)
    config.ts             # BASE_URL, API_URL, tài khoản, ngưỡng khóa
    bugReporter.ts        # captureOnFail: screenshot + addContext + ghi BUGS.md
    api.ts                # helper gọi API (login, reset...)
  tests/
    FR-02.login-lockout.test.ts
    ...                   # mỗi test case file → 1 test script
  mochawesome-report/     # (tự sinh bởi mochawesome) báo cáo HTML
    index.html            # mở bằng trình duyệt
    index.json            # dữ liệu thô
    assets/               # css/js/font của mochawesome
  bug-snapshots/
    BUGS.md               # nhật ký bug (Expected vs Actual + link ảnh)
    <TC-ID>-<ts>.png      # ảnh bằng chứng (nhúng vào HTML report qua addContext)
```

## Nguyên tắc

- **Bám test case gốc**: mỗi TC trong `.md` = một `it()`; ID, data, expected phải khớp file test case. Không thêm/bớt TC im lặng.
- **TypeScript an toàn kiểu**: khai báo `interface`/`type` cho test data, request/response API; tránh `any` trừ khi bất khả kháng.
- **Assert theo spec, không theo hệ thống**: mục tiêu là để test fail lộ bug, không phải chỉnh assert cho pass.
- **Precondition là code**: reset/chuẩn bị state bằng setup thật (API hoặc chờ), không chỉ ghi chú.
- **Snapshot mọi sai lệch**: actual ≠ expected → screenshot + mục trong `BUGS.md`, rồi vẫn để fail.
- **Luôn có báo cáo**: mỗi lần chạy `mochawesome` tự sinh `mochawesome-report/index.html` (+ `index.json`); nêu rõ đường dẫn cho người dùng.
- **Không hardcode chờ vô cớ**: dùng `driver.wait/until`; chỉ sleep cứng cho timeout nghiệp vụ thật (khóa 30s).
- **Chạy được ngay**: sau khi sinh, cung cấp lệnh chạy cụ thể và nêu rõ nếu cần EShop đang chạy.
