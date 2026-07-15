# Demo Automation Web — EShop

> Repo demo **tự chứa** cho seminar Web Automation: **EShop (SUT)** + bộ **skills** (dùng được cho **Claude Code** và **Agent Skills**) để agent tự sinh test automation bằng **Selenium** và **Playwright**, kèm **docs** hướng dẫn chạy.

---

## Có gì trong repo

| Thư mục / file | Nội dung |
|---|---|
| `eshop/` | **EShop SUT** (submodule → `github.com/DuyITLOR/group05_eshop`) — web bán hàng có **bug cố ý** để thực hành kiểm thử |
| `.claude/skills/` | **3 skill**: `state-transition-testing`, `selenium-automation`, `playwright-automation` |
| `docs/` | Hướng dẫn chạy automation + setup Selenium MCP |
| `run_eshop.sh` | Script bật toàn bộ EShop (backend + web + admin + mobile) |

---

## Điều kiện cần
- **Node ≥ 18**, **Google Chrome**, **`sqlite3` CLI**
- **Claude Code** (hoặc agent hỗ trợ Agent Skills)

---

## 1. Clone (kèm submodule EShop)

```bash
git clone --recurse-submodules https://github.com/DuyITLOR/demo_automation_web.git
cd demo_automation_web
```
Nếu đã lỡ clone mà quên `--recurse-submodules`:
```bash
git submodule update --init --recursive
```

## 2. Bật EShop (SUT)

```bash
./run_eshop.sh          # backend :3000 + web :5173 (+ admin :5174, mobile)
./run_eshop.sh reset    # seed lại DB rồi chạy
```
> Đảm bảo cổng **:3000** và **:5173** đang trống trước khi chạy.

## 3. Dùng skills để sinh + chạy automation

Mở repo bằng **Claude Code**, rồi gõ:

| Lệnh | Kết quả |
|---|---|
| `/state-transition-testing` | Phân tích FR của EShop → sinh `test-design/` + `testcases/` |
| `/selenium-automation` | Từ `testcases/` → sinh project Selenium, chạy, ra **mochawesome HTML report** |
| `/playwright-automation` | Từ `testcases/` → sinh project Playwright, chạy, ra report (trace/video) |

> Khi gọi skill, **nói rõ tài liệu EShop ở `eshop/`** (`eshop/README.md`, `eshop/api_specification.md`).
> Hướng dẫn chi tiết từng bước: [docs/automation-run-guide.md](docs/automation-run-guide.md).

---

## Skills dùng cho Claude Code **và** agent khác

Các skill trong `.claude/skills/` viết theo chuẩn **Agent Skill** (mỗi skill là 1 folder chứa `SKILL.md`):

- **Claude Code:** tự động nạp từ `.claude/skills/` → gõ `/tên-skill`.
- **Codex / Antigravity / Cursor:** đọc [`AGENTS.md`](AGENTS.md) ở gốc repo — file chuẩn **xuyên-tool** mô tả repo + trỏ tới từng `SKILL.md` để agent mở khi task khớp. (Codex nạp `AGENTS.md` mỗi phiên; Antigravity đọc từ v1.20.3+.)
- **Agent/tool khác:** trỏ thẳng tới các folder `SKILL.md` trong `.claude/skills/` — cùng nội dung, không cần chép lại.

---

## MCP (tùy chọn) — cho agent lái browser live

Muốn agent **tự mở trình duyệt soi DOM / lấy selector / chụp màn hình** ngay trong lúc chat: xem [docs/selenium-mcp-setup.md](docs/selenium-mcp-setup.md) (kèm cách cài cho Claude Code lẫn Cursor/VS Code/Windsurf...).

---

## Ghi nhớ nhanh

```
1. git clone --recurse-submodules ...   (lấy cả EShop)
2. ./run_eshop.sh                        (bật SUT: :3000 + :5173)
3. Claude Code: /state-transition-testing → /selenium-automation (hoặc /playwright-automation)
4. Xem report + bug snapshot
```

> EShop cố tình có bug → nhiều test sẽ **FAIL, đó là kỳ vọng** (test tố cáo bug theo đặc tả).
