# EShop Selenium Automation Tests (TypeScript + Mocha)

Bộ mã nguồn kiểm thử tự động bằng Selenium WebDriver (TypeScript + Mocha) cho tính năng **FR-01: Đăng ký tài khoản** của dự án EShop.

## Cấu trúc thư mục
- `tests/` — Chứa script kiểm thử (ánh xạ 1-1 từ test cases).
- `utils/` — Các helper dùng chung:
  - `driver.ts`: Cấu hình Chrome WebDriver (chạy ở chế độ Headless mặc định).
  - `db.ts`: Reset dữ liệu CSDL SQLite qua CLI `sqlite3`.
  - `bugReporter.ts`: Chụp ảnh màn hình khi test thất bại và lưu nhật ký lỗi.
  - `api.ts`: Helper gọi API trực tiếp lên Backend.
  - `config.ts`: Chứa URL cấu hình.
- `bug-snapshots/` — Chứa ảnh chụp màn hình lúc test fail và file [BUGS.md](bug-snapshots/BUGS.md) tổng hợp lỗi.
- `mochawesome-report/` — Thư mục báo cáo HTML tự sinh sau khi chạy test.

## Hướng dẫn cài đặt & Chạy test

### 1. Chuẩn bị môi trường
- Đảm bảo EShop SUT đang chạy:
  - Backend: `http://localhost:3000`
  - Frontend: `http://localhost:5173`
- Đã cài đặt CLI `sqlite3` trên hệ điều hành.

### 2. Cài đặt thư viện
Chạy lệnh sau tại thư mục này để cài đặt dependencies:
```bash
npm install
```

### 3. Thực thi kiểm thử
- **Chạy toàn bộ test suite:**
  ```bash
  npm test
  ```
- **Chạy không ở chế độ headless (mở trình duyệt thật):**
  ```bash
  $env:HEADLESS="false"; npm test
  ```

### 4. Xem báo cáo
- Báo cáo HTML trực quan: Mở tệp [mochawesome-report/index.html](mochawesome-report/index.html) bằng trình duyệt.
- Nhật ký bug: Xem tệp [bug-snapshots/BUGS.md](bug-snapshots/BUGS.md).
