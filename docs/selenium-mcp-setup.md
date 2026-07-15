# Setup & chạy Selenium MCP cho người mới bắt đầu

> **Dành cho:** người mới muốn cho AI agent (Claude Code) **tự lái trình duyệt** để soi trang / lấy selector / chụp màn hình EShop bằng câu lệnh tiếng Việt.
> **Server dùng:** [`@angiejones/mcp-selenium`](https://github.com/angiejones/mcp-selenium) — mã nguồn mở, **miễn phí**.

---

## 0. MCP là gì (30 giây)

**MCP** = chuẩn để AI agent gọi "tool" bên ngoài. **Selenium MCP** biến Selenium thành các tool (`navigate`, `click`, `take_screenshot`...) để Claude **tự điều khiển Chrome thật** ngay trong lúc chat.

> ⚠️ MCP dùng để **khám phá / lấy selector / debug live** — KHÔNG thay thế suite test chính thức. Test để nộp vẫn là code Selenium trong `selenium/`.

---

## 1. Điều kiện cần

| Thứ | Kiểm tra | Ghi chú |
|---|---|---|
| **Claude Code** | — | Nơi gõ lệnh MCP |
| **Node.js ≥ 18** | `node -v` | |
| **npx** | `npx -v` | Đi kèm Node |
| **Google Chrome** | có cài | |

> **Không cần tải tay gì cả.** `npx` tự tải server MCP từ npm, và Selenium tự tải ChromeDriver (Selenium Manager) — chỉ cần **internet ở lần chạy đầu**.

---

## 2. Cài đặt (chọn 1 trong 2 cách)

### Cách A — Repo đã có sẵn `.mcp.json` (nhanh nhất)
Nếu ở gốc repo đã có file `.mcp.json` chứa server `selenium` → **khỏi cài gì**:
1. Mở project bằng **Claude Code**.
2. Lần đầu Claude Code hỏi **"trust / cho phép server `selenium`?"** → chọn **cho phép**.
3. **Khởi động lại Claude Code** (xem mục 3).

### Cách B — Chưa có `.mcp.json`
Chạy 1 lệnh trong terminal (scope project để cả nhóm dùng chung + commit git được):
```bash
claude mcp add --scope project selenium -- npx -y @angiejones/mcp-selenium@latest
```
Lệnh này tạo file `.mcp.json` ở gốc repo với nội dung:
```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": ["-y", "@angiejones/mcp-selenium@latest"]
    }
  }
}
```

> Nếu báo `MCP server selenium already exists in .mcp.json` → **không phải lỗi**, nghĩa là đã có sẵn rồi, bỏ qua.

---

## 3. ⚠️ Khởi động lại Claude Code (bước quan trọng nhất)

Tool MCP **chỉ nạp lúc Claude Code khởi động**. Sau khi thêm `.mcp.json`:
1. Thoát và mở lại Claude Code.
2. Cho phép (trust) server nếu được hỏi.
3. Kiểm tra bằng terminal:
   ```bash
   claude mcp list
   ```
   Phải thấy dòng `selenium`. Lúc này các tool `start_browser`, `navigate`, `take_screenshot`... mới dùng được.

---

## 3b. Không dùng Claude Code? — cài cho agent khác

Bản thân server **KHÔNG thuộc Claude**. Nó là **MCP chuẩn** → client/agent nào hỗ trợ MCP đều dùng được. Chỉ khác **chỗ dán config** + **tên key**; server thì y hệt.

**Khối config chung** (dán vào file config của client bạn dùng):
```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": ["-y", "@angiejones/mcp-selenium@latest"]
    }
  }
}
```

| Client / Agent | Dán vào file | Tên key |
|---|---|---|
| Claude Code | `.mcp.json` (gốc repo) | `mcpServers` |
| Claude Desktop | `claude_desktop_config.json` | `mcpServers` |
| Cursor | `.cursor/mcp.json` (project) hoặc `~/.cursor/mcp.json` | `mcpServers` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `mcpServers` |
| Cline (extension VS Code) | `cline_mcp_settings.json` (globalStorage của VS Code) | `mcpServers` |
| Continue | `~/.continue/config.json` | `mcpServers` |
| **VS Code** (MCP/Copilot) | `.vscode/mcp.json` | **`servers`** ⚠️ khác |

> ⚠️ **VS Code dùng key `servers`** (không phải `mcpServers`):
> ```json
> {
>   "servers": {
>     "selenium": { "command": "npx", "args": ["-y", "@angiejones/mcp-selenium@latest"] }
>   }
> }
> ```

**Goose (CLI):** không cần file, chạy thẳng:
```bash
goose session --with-extension "npx -y @angiejones/mcp-selenium@latest"
```

**Không dùng client nào / agent tự viết:** chạy server standalone rồi nối vào agent của bạn qua **MCP SDK** (giao tiếp stdio):
```bash
npx -y @angiejones/mcp-selenium@latest
```

**Sau khi dán config → khởi động lại client** để nạp tool (như bước 3). Điều kiện (Node, Chrome, npx tự tải) và cách dùng (mục 4–5) **giống hệt**, không phụ thuộc client.

---

## 4. Cách dùng — ra lệnh bằng tiếng Việt

Trong Claude Code, cứ nói bằng lời, ví dụ:

> *"Mở Chrome, vào trang login EShop (`http://localhost:5173/login`), chụp màn hình cho tui xem."*

Claude sẽ tự gọi chuỗi tool: `start_browser` → `navigate` → `take_screenshot` → rồi hiển thị/mô tả lại.

Vài mẫu câu hữu ích:
- *"Vào EShop, tìm ô tìm kiếm, gõ `laptop`, chụp kết quả."*
- *"Soi nút 'Thêm vào giỏ' và cho tui biết id/xpath của nó."* ← lấy selector để viết test
- *"Thêm sản phẩm vào giỏ, checkout, chụp chỗ báo lỗi."*
- *"Đóng trình duyệt đi."* ← gọi `close_session`

---

## 5. Các tool Selenium MCP cung cấp

| Nhóm | Tool |
|---|---|
| Phiên | `start_browser`, `close_session` |
| Điều hướng | `navigate` |
| Tương tác | `interact` (click/hover), `send_keys`, `press_key`, `upload_file` |
| Đọc dữ liệu | `get_element_text`, `get_element_attribute` |
| Ảnh | `take_screenshot` |
| Nâng cao | `execute_script`, `window`, `frame`, `alert` |
| Cookie | `add_cookie`, `get_cookies`, `delete_cookie` |
| Chẩn đoán | `diagnostics` (console/lỗi/network) |

---

## 6. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| Không thấy tool `start_browser`... | Khởi động lại Claude Code; kiểm tra `claude mcp list` |
| Không được hỏi "trust" | Kiểm tra `.mcp.json` đúng cú pháp; thử chạy lại lệnh ở Cách B |
| Mở trang bị lỗi kết nối | EShop chưa chạy — bật frontend `:5173` (và backend `:3000` nếu cần) |
| Lỗi driver Chrome | Cập nhật Chrome mới nhất; xóa cache `~/.cache/selenium` rồi thử lại |
| Chrome không tắt | Ra lệnh *"đóng trình duyệt"* để gọi `close_session` |

---

## 7. Ghi nhớ nhanh

```
1. Có .mcp.json (hoặc chạy: claude mcp add --scope project selenium -- npx -y @angiejones/mcp-selenium@latest)
2. Khởi động lại Claude Code + cho phép (trust)
3. claude mcp list  → thấy "selenium"
4. Bật EShop (:5173), rồi ra lệnh: "mở EShop chụp màn hình"
```

> MCP là **đôi mắt live** để Claude soi trang giúp bạn viết test nhanh hơn — còn suite `selenium/` mới là bài nộp.
