# AGENTS.md — Hướng dẫn cho AI agent (xuyên tool)

> File này được **Codex, Antigravity, Cursor, Claude Code**... đọc tự động để hiểu repo và biết dùng skill nào.
> (Antigravity đọc `AGENTS.md` từ v1.20.3+, ưu tiên `GEMINI.md` nếu có. Codex nạp `AGENTS.md` vào chuỗi instruction mỗi phiên và mở `SKILL.md` khi quyết định dùng skill.)

---

## Repo này là gì

Demo automation cho **EShop** (web bán hàng có **bug cố ý** để thực hành kiểm thử). Gồm SUT + 3 skill để **agent tự sinh test automation** bằng Selenium và Playwright.

- `eshop/` — EShop SUT (submodule). Tài liệu FR: `eshop/README.md`, `eshop/api_specification.md`.
- `.claude/skills/` — 3 skill (chuẩn Agent Skill / SKILL.md).
- `docs/` — hướng dẫn chạy chi tiết.
- `run_eshop.sh` — bật toàn bộ EShop.

## Setup trước khi chạy test

1. Bật EShop: `./run_eshop.sh` → backend `:3000` + web `:5173` (cần 2 cổng này trống).
2. Yêu cầu môi trường: **Node ≥ 18**, **Google Chrome**, **`sqlite3` CLI**.

---

## Skills có sẵn — MỞ `SKILL.md` và làm theo khi task khớp

Mỗi skill là 1 folder chứa `SKILL.md`. Khi người dùng yêu cầu việc khớp phần "Khi dùng", **hãy đọc đầy đủ file `SKILL.md` tương ứng rồi thực hiện đúng các bước trong đó**:

| Skill | Đường dẫn SKILL.md | Khi dùng |
|---|---|---|
| **state-transition-testing** | `.claude/skills/state-transition-testing/SKILL.md` | Sinh test case theo kỹ thuật State Transition (login lockout, vòng đời đơn hàng, workflow, session...). Đọc tài liệu ở `eshop/` → sinh `test-design/` + `testcases/`. |
| **selenium-automation** | `.claude/skills/selenium-automation/SKILL.md` | "Tự động hóa / chạy testcase bằng Selenium". Từ `testcases/` → sinh project Selenium (TS + Mocha), chạy, ra **mochawesome HTML report**. |
| **playwright-automation** | `.claude/skills/playwright-automation/SKILL.md` | "Tự động hóa bằng Playwright / E2E test web". Từ `testcases/` → sinh Playwright specs (đa trình duyệt), chạy, ra report + trace/video. |

**Quy trình điển hình:** `state-transition-testing` (sinh testcases) → `selenium-automation` **hoặc** `playwright-automation` (sinh + chạy).

---

## Quy tắc quan trọng (mọi agent tuân theo)

- **Tài liệu EShop ở `eshop/`** (không phải `docs/` ở gốc) — khi skill nói "đọc docs/README.md" thì hiểu là `eshop/README.md` + `eshop/api_specification.md`.
- **Assert theo ĐẶC TẢ (spec), không theo hành vi hệ thống** — mục tiêu là để test FAIL và **lộ bug**. Nhiều test fail là **kỳ vọng**, không phải lỗi script.
- **Precondition bằng code thật** (reset state qua DB `sqlite3` hoặc API), không chỉ ghi chú.
- **Không commit** secrets (`.env`, token) và `node_modules/`.
- Cần EShop đang chạy (`:3000` + `:5173`) thì test mới có ý nghĩa.

---

## Ghi chú theo từng tool

- **Claude Code:** tự nạp skill từ `.claude/skills/` → gõ `/tên-skill`.
- **Codex / Antigravity / Cursor:** đọc `AGENTS.md` này tự động → theo bảng skill ở trên, mở `SKILL.md` khi cần. (Muốn discovery kiểu "native skill" của từng tool thì copy folder skill vào thư mục skill riêng của tool đó — hỏi maintainer.)
