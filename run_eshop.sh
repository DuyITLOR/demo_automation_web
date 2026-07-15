#!/bin/bash
# Run the full EShop SUT: backend + web + web-admin + mobile (Expo).
# Ports:  backend :3000 | web :5173 | admin :5174 | mobile: Expo (Metro :8081)
# Usage:  ./run_eshop.sh          (start everything, Ctrl+C stops all)
#         ./run_eshop.sh reset    (re-seed the database, then start)

set -e

# Resolve EShop folder relative to this script (works no matter where you call it)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ESHOP="$ROOT/eshop"
BACKEND="$ESHOP/backend"
WEB="$ESHOP/frontend-web"
ADMIN="$ESHOP/frontend-admin"
MOBILE="$ESHOP/frontend-mobile"

if [ ! -d "$BACKEND" ]; then
  echo "ERROR: EShop not found at $ESHOP"
  exit 1
fi

# Install dependencies for a folder only if node_modules is missing.
install_if_needed() {
  local dir="$1" label="$2"
  if [ -d "$dir" ] && [ ! -d "$dir/node_modules" ]; then
    echo ">> Installing $label dependencies..."
    (cd "$dir" && npm install)
  fi
}

install_if_needed "$BACKEND" "backend"
install_if_needed "$WEB" "frontend-web"
install_if_needed "$ADMIN" "frontend-admin"
install_if_needed "$MOBILE" "frontend-mobile"

# Seed the database on first run, or when 'reset' is passed.
if [ ! -f "$BACKEND/database.sqlite" ] || [ "$1" = "reset" ]; then
  echo ">> Seeding database (creates seed users, products, coupons)..."
  (cd "$BACKEND" && node database.js)
fi

# Collect child PIDs so we can stop them all together.
PIDS=()

echo ">> Starting backend (server) on http://localhost:3000 ..."
(cd "$BACKEND" && node server.js) &
PIDS+=($!)

echo ">> Starting frontend-web on http://localhost:5173 ..."
(cd "$WEB" && npm run dev) &
PIDS+=($!)

echo ">> Starting frontend-admin on http://localhost:5174 ..."
(cd "$ADMIN" && npm run dev) &
PIDS+=($!)

if [ -d "$MOBILE" ]; then
  echo ">> Starting frontend-mobile (Expo) ..."
  (cd "$MOBILE" && npx expo start) &
  PIDS+=($!)
fi

cleanup() {
  echo ""
  echo ">> Stopping all servers..."
  kill "${PIDS[@]}" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo ""
echo "============================================================"
echo "  EShop is starting up (all platforms)."
echo "  Web shop (test this): http://localhost:5173"
echo "  Web admin:            http://localhost:5174"
echo "  API backend:          http://localhost:3000"
echo "  Mobile:               Expo (scan the QR code in this terminal)"
echo "  Login:  test@eshop.com / Test1234!   (normal user)"
echo "          admin@eshop.com / Admin123!  (admin)"
echo "  Press Ctrl+C to stop everything."
echo "============================================================"

# Wait for any process to exit (keeps the script alive).
wait
