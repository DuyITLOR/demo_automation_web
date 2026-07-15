---
name: playwright-automation
description: Sinh script Playwright (TypeScript + @playwright/test) để tự động chạy các test case trong thư mục testcases/ của EShop. Với MỖI file test case (VD testcase-FR-02-login-lockout.md), sinh đúng một file spec Playwright trong tests/web/ (và tests/admin/ nếu là màn hình admin), bao phủ toàn bộ TC trong file đó, chạy được ở cả 2 mức — UI thật (frontend :5173, đa trình duyệt) và API (request fixture tới backend :3000). Tận dụng auto-screenshot/trace/video của Playwright làm bug snapshot khi actual ≠ expected, đồng thời sinh báo cáo Markdown tổng hợp pass/fail và bug. Kèm hướng dẫn cài đặt & chạy (README.md). Dùng khi người dùng muốn "tự động hóa bằng Playwright", "chạy testcase bằng Playwright", hoặc "E2E test web".
---

# Playwright Automation — Chạy test case bằng Playwright (TS + @playwright/test)

## Mục tiêu

Chuyển các test case đã thiết kế trong `testcases/*.md` thành **spec Playwright chạy được**, tự động thực thi và **so sánh actual vs expected**. Khi có sai lệch (nghi vấn bug), Playwright **tự chụp screenshot + quay video + lưu trace**; skill còn ghi thêm log bug và **sinh báo cáo Markdown** tổng hợp kết quả pass/fail và bug sau mỗi lần chạy.

Stack cố định của dự án này:
- **Ngôn ngữ:** TypeScript (Node.js ≥18, ESM — `"type": "module"`).
- **Test runner:** `@playwright/test` (đã có `config/playwright/playwright.config.ts`). **Không** dùng Mocha/Chai — assertion dùng `expect` của Playwright (auto-retry).
- **Trình duyệt:** Chromium/Firefox/WebKit qua `projects` đã cấu hình (`web-chromium`, `web-firefox`, `web-webkit`, `admin-chromium`).
- **2 mức thực thi cho mỗi FR khi khả thi:**
  - **UI** — điều khiển trình duyệt thật trên frontend (`http://localhost:5173`) qua fixture `page`.
  - **API** — gọi thẳng backend (`http://localhost:3000`) qua fixture `request` để kiểm chứng state/counter/logic mà UI khó quan sát.

> **Khác biệt với skill `selenium-automation`:** cùng triết lý (mỗi TC = một test, assert theo spec để lộ bug, có báo cáo + bug snapshot) nhưng dùng API của Playwright: `page`/`request` fixture, `expect` auto-retry web-first, locator theo vai trò/nhãn, và tận dụng screenshot/trace/video sẵn có thay vì tự chụp thủ công.

## Điều kiện tiên quyết (kiểm tra trước khi sinh script)

1. Có file test case trong `testcases/`. Nếu chưa có → gợi ý chạy skill `state-transition-testing` (hoặc kỹ thuật phù hợp) để sinh trước.
2. Đọc `docs/README.md`/`docs/proposal.md` (đặc tả FR + URL + tài khoản mặc định) và `docs/api_specification.md` nếu có (endpoint, body, response) để biết selector nghiệp vụ và hợp đồng API.
3. Đã có `config/playwright/playwright.config.ts` và `config/playwright/package.json`. Nếu chưa cài trình duyệt → `npx playwright install`.
4. Hệ thống EShop đang chạy (backend :3000, frontend :5173; admin :5174 nếu test admin). Nếu không chạy, spec vẫn sinh được nhưng sẽ fail lúc thực thi — ghi rõ trong README. **KHÔNG** bật `webServer` tự khởi động trong config trừ khi người dùng yêu cầu (EShop khởi động bằng `run_eshop.sh`).

---

## BƯỚC 1 — Chọn test case nguồn

- Người dùng chỉ định file (VD `testcase-FR-02-login-lockout.md`) hoặc "tất cả".
- Với mỗi file test case → sinh **đúng một** file spec:
  - Màn hình frontend web → `tests/web/<FR-ID>.<feature>.spec.ts`
  - Màn hình web admin → `tests/admin/<FR-ID>.<feature>.spec.ts`
  - Tên phải khớp `testMatch` trong config (`web[\\/].*\.spec\.ts$`, `admin[\\/].*\.spec\.ts$`).
- Đọc **toàn bộ** file test case: mọi TC, precondition, test data, step (state trước/event/state sau), expected result, và bảng nghi vấn bug ở cuối.

## BƯỚC 2 — Ánh xạ mỗi TC → một `test()`

- Mỗi `TC-<FR-ID>-<NNN>` trở thành một khối `test('TC-... : mô tả', async ({ page, request }) => { ... })`.
- Nhóm theo mục của test case (Single transition / Invalid / 1-switch / End-to-end) bằng `test.describe()` lồng nhau.
- **Precondition = code setup**, không phải comment. Reset trạng thái trước mỗi TC trong `test.beforeEach` (VD gọi API xóa failCount / mở khóa qua `request.post(...)`, hoặc chờ hết timeout khóa). Nếu backend không có endpoint reset, mô phỏng bằng chờ và ghi chú rõ.
- **Test data** lấy đúng từ file test case (email/password/OTP...). Không tự bịa dữ liệu khác. Khai báo `interface`/`type` cho test data khi hợp lý.
- **Expected result → assertion** bằng `expect` của Playwright (`await expect(locator).toBeVisible()`, `expect(res.status()).toBe(...)`). Với hành vi spec định nghĩa rõ (VD "sai ≥3 lần → khóa 30s", "failCount tăng đúng 1"), assert đúng theo **spec** (không theo hành vi hiện tại của hệ thống) — để nếu hệ thống sai thì test **fail và lộ bug**.

## BƯỚC 3 — Hai mức UI và API

- **UI test:** dùng fixture `page`. Điều hướng bằng `page.goto('/login')` (baseURL đã set). **Ưu tiên locator theo vai trò/nhãn/văn bản**: `getByRole`, `getByLabel`, `getByText`, `getByPlaceholder`; hạn chế CSS/XPath. **Đặc biệt lưu ý văn bản tiếng Việt có dấu** ("Đăng nhập", "Thêm vào giỏ", "Chào, Test User") — selector phải khớp đúng dấu. Không dùng `waitForTimeout` cứng trừ khi kiểm timeout nghiệp vụ (VD chờ 30s mở khóa) — `expect` đã auto-retry.
- **API test:** dùng fixture `request` (`request.post('http://localhost:3000/api/login', { data: {...} })`), assert `res.status()`, body (`await res.json()`), message. Định nghĩa `type` cho request/response body. Dùng để kiểm chính xác counter/lockout mà UI che giấu.
- Với FR-02, cả 2 mức đều áp dụng (thường tách thành 2 `describe`: "UI" và "API"). Với FR chỉ có ý nghĩa ở một mức, ghi rõ và sinh mức phù hợp.
- Khi giao diện thay đổi và selector không khớp: sinh lại locator bằng `npx playwright codegen http://localhost:5173/`.

## BƯỚC 4 — Bug snapshot khi actual ≠ expected

Tận dụng cơ chế sẵn có của Playwright (đã bật trong config): `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'on-first-retry'` → khi test fail, ảnh/video/trace tự lưu kèm HTML report.

Bổ sung để tập trung bằng chứng bug:
- Dùng `testInfo.attach(...)` hoặc hook `test.afterEach` kiểm `testInfo.status !== testInfo.expectedStatus` để: chụp thêm `page.screenshot()` lưu vào `tests/bug-snapshots/<TC-ID>-<timestamp>.png`, và **ghi một mục vào `tests/bug-snapshots/BUGS.md`** gồm: TC ID, mô tả, **Expected**, **Actual**, mức (UI/API), đường dẫn ảnh + link trace, thời điểm.
- **Không nuốt lỗi**: vẫn để test fail; snapshot chỉ để làm bằng chứng.

## BƯỚC 5 — Báo cáo Markdown

Playwright đã sinh **HTML report** (`playwright-report/`, xem bằng `npx playwright show-report`). Ngoài ra, sinh **một custom reporter** (`tests/utils/mdReporter.ts` implement interface `Reporter` của `@playwright/test`) để xuất báo cáo Markdown sau mỗi lần chạy:

- **Tên file:** `reports/report-<YYYYMMDD-HHmmss>.md` (mỗi lần chạy một file, không đè lên nhau) + cập nhật `reports/latest.md` trỏ tới lần mới nhất.
- **Nội dung báo cáo:**
  - **Tiêu đề + metadata:** thời điểm chạy, môi trường (`baseURL`, backend URL, danh sách project/trình duyệt), tổng thời lượng.
  - **Bảng tổng hợp:** tổng số test, Pass ✅, Fail ❌, Skip ⏭️, Flaky ⚠️, tỉ lệ pass (%).
  - **Bảng chi tiết theo test:** cột `TC ID | Mô tả | Project (trình duyệt/mức) | Kết quả | Thời lượng (ms) | Ghi chú`. TC ID và mô tả trích từ tiêu đề `test()`.
  - **Mục Bug (nếu có fail):** với mỗi test fail liệt kê **Expected**, **Actual**, thông báo lỗi, và **link tới ảnh/trace** (đường dẫn tương đối) — đồng bộ với `BUGS.md`.
  - **Nhóm theo `describe()`** để phản ánh cấu trúc test case.
- **Cách nối vào Playwright:** thêm reporter vào mảng `reporter` trong `playwright.config.ts` bên cạnh `['html', ...]` và `['list']`:
  ```ts
  reporter: [['html', { open: 'never' }], ['list'], ['./tests/utils/mdReporter.ts']],
  ```
- Báo cáo Markdown là **sản phẩm bắt buộc** của mỗi lần chạy — luôn nhắc người dùng đường dẫn `reports/latest.md` (và `npx playwright show-report` cho bản HTML) sau khi chạy xong.

## BƯỚC 6 — Hướng dẫn chạy (README.md)

Tạo/cập nhật `config/playwright/README.md` (hoặc README cạnh spec) gồm: yêu cầu (Node ≥18), lệnh cài (`npm install` + `npx playwright install`), cách bật EShop (`run_eshop.sh`), biến môi trường (`ESHOP_WEB_URL`, `ESHOP_ADMIN_URL`, và URL backend), lệnh chạy, nơi xem báo cáo. Các script npm đã có sẵn trong `package.json`:

| Lệnh | Ý nghĩa |
| --- | --- |
| `npm test` | Chạy tất cả spec (mọi project/trình duyệt) |
| `npm run test:web` | Chỉ frontend web (Chromium) |
| `npm run test:admin` | Chỉ web admin (Chromium) |
| `npm run test:headed` | Chạy hiện trình duyệt |
| `npm run test:ui` | Mở UI mode (debug tương tác) |
| `npm run report` | Mở HTML report |
| `npx playwright test -g "TC-FR-02-001"` | Chạy đúng một TC theo tiêu đề |
| `npx playwright test tests/web/FR-02.login-lockout.spec.ts` | Chạy một file |
| `npm run codegen` | Sinh lại locator từ DOM thật |

---

## Cấu trúc thư mục (dựa trên config đã commit)

```
config/playwright/
  playwright.config.ts    # ĐÃ CÓ — testDir ./tests, projects web/admin, reporter html+list
  package.json            # ĐÃ CÓ — scripts test/test:web/codegen...
  README.md               # hướng dẫn cài & chạy
  tests/
    web/
      FR-02.login-lockout.spec.ts   # mỗi test case file (frontend) → 1 spec
      ...
    admin/
      FR-xx.<feature>.spec.ts       # test case màn hình admin → 1 spec
    utils/
      config.ts           # URL, tài khoản, ngưỡng khóa (đọc từ env)
      api.ts              # helper gọi backend (login, reset...) qua request fixture
      bug.ts              # afterEach: screenshot + ghi BUGS.md khi fail
      mdReporter.ts       # custom Reporter → sinh báo cáo Markdown
    bug-snapshots/
      BUGS.md             # nhật ký bug (Expected vs Actual + link ảnh/trace)
      <TC-ID>-<ts>.png    # ảnh bằng chứng bổ sung
  reports/
    latest.md             # báo cáo Markdown lần chạy mới nhất
    report-<ts>.md        # báo cáo từng lần chạy
  playwright-report/       # HTML report tự sinh (show-report)
```

## Nguyên tắc

- **Bám test case gốc**: mỗi TC trong `.md` = một `test()`; ID, data, expected khớp file test case. Không thêm/bớt TC im lặng.
- **Dùng API Playwright đúng cách**: `expect` web-first auto-retry (KHÔNG tự viết vòng lặp chờ); locator theo vai trò/nhãn/văn bản; điều hướng bằng `baseURL` (`page.goto('/...')`).
- **TypeScript an toàn kiểu**: khai báo `interface`/`type` cho test data, request/response API; tránh `any`.
- **Assert theo spec, không theo hệ thống**: mục tiêu là để test fail lộ bug, không chỉnh assert cho pass.
- **Precondition là code**: reset/chuẩn bị state bằng setup thật (`request.post` hoặc chờ) trong `beforeEach`, không chỉ ghi chú.
- **Snapshot mọi sai lệch**: fail → tận dụng screenshot/video/trace của Playwright + ghi mục trong `BUGS.md`, rồi vẫn để fail.
- **Luôn có báo cáo**: mỗi lần chạy sinh HTML report + một file Markdown trong `reports/` (cập nhật `latest.md`); nêu rõ đường dẫn cho người dùng.
- **Tiếng Việt có dấu**: selector văn bản phải khớp đúng dấu; đối chiếu DOM thật của `frontend-web/src` hoặc dùng `codegen`.
- **Chạy được ngay**: sau khi sinh, cung cấp lệnh chạy cụ thể và nêu rõ cần EShop đang chạy.
