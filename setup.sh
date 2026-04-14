#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  AuthKit — One-shot local setup script
#  Usage: chmod +x setup.sh && ./setup.sh
# ═══════════════════════════════════════════════════════════════

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}${CYAN}⚡  AuthKit Setup${RESET}"
echo -e "    Full-stack JWT Auth — Node.js + MySQL + Next.js"
echo ""

# ── Step 1: Check Node.js ──────────────────────────────────────
echo -e "${BOLD}[1/6]${RESET} Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo -e "  ${RED}✗ Node.js not found. Install from https://nodejs.org${RESET}"
  exit 1
fi
NODE_VER=$(node -v)
echo -e "  ${GREEN}✓ Node.js $NODE_VER${RESET}"

# ── Step 2: Check MySQL ────────────────────────────────────────
echo -e "${BOLD}[2/6]${RESET} Checking MySQL..."
if ! command -v mysql &>/dev/null; then
  echo -e "  ${YELLOW}⚠ mysql CLI not found — skipping DB creation (do it manually).${RESET}"
  SKIP_DB=true
else
  echo -e "  ${GREEN}✓ MySQL found${RESET}"
  SKIP_DB=false
fi

# ── Step 3: Configure backend .env ────────────────────────────
echo ""
echo -e "${BOLD}[3/6]${RESET} Backend configuration"
echo ""

if [ ! -f "auth-api/.env" ]; then
  cp auth-api/.env.example auth-api/.env
fi

echo -e "  ${YELLOW}Enter your MySQL connection details:${RESET}"
read -p "  MySQL host     [localhost]: " DB_HOST
DB_HOST="${DB_HOST:-localhost}"

read -p "  MySQL port     [3306]: " DB_PORT
DB_PORT="${DB_PORT:-3306}"

read -p "  MySQL user     [root]: " DB_USER
DB_USER="${DB_USER:-root}"

read -s -p "  MySQL password: " DB_PASS
echo ""

read -p "  Database name  [auth_db]: " DB_NAME
DB_NAME="${DB_NAME:-auth_db}"

# Generate JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Write .env
cat > auth-api/.env <<ENV
# ── Server ─────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── Database ────────────────────────────────────────────────────
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# ── JWT ─────────────────────────────────────────────────────────
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
ENV

echo -e "  ${GREEN}✓ auth-api/.env written${RESET}"

# ── Step 4: Create DB + install backend ───────────────────────
echo ""
echo -e "${BOLD}[4/6]${RESET} Setting up backend..."

if [ "$SKIP_DB" = false ]; then
  echo -e "  Creating database '${DB_NAME}'..."
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
    -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null \
    && echo -e "  ${GREEN}✓ Database created (or already exists)${RESET}" \
    || echo -e "  ${YELLOW}⚠ Could not create DB automatically — create it manually: CREATE DATABASE ${DB_NAME};${RESET}"
fi

cd auth-api
echo -e "  Installing backend dependencies..."
npm install --silent
echo -e "  ${GREEN}✓ npm install done${RESET}"

echo -e "  Running Prisma migration..."
npx prisma migrate dev --name init --skip-generate 2>&1 | tail -5
npx prisma generate --silent
echo -e "  ${GREEN}✓ Prisma migration + generate done${RESET}"
cd ..

# ── Step 5: Install frontend ───────────────────────────────────
echo ""
echo -e "${BOLD}[5/6]${RESET} Setting up frontend..."
cd auth-frontend
echo -e "  Installing frontend dependencies..."
npm install --silent
echo -e "  ${GREEN}✓ npm install done${RESET}"
cd ..

# ── Step 6: Done ───────────────────────────────────────────────
echo ""
echo -e "${BOLD}[6/6]${RESET} ${GREEN}Setup complete!${RESET}"
echo ""
echo -e "${BOLD}  To start the application:${RESET}"
echo ""
echo -e "  ${CYAN}Terminal 1 (backend):${RESET}"
echo -e "    cd auth-api && npm run dev"
echo ""
echo -e "  ${CYAN}Terminal 2 (frontend):${RESET}"
echo -e "    cd auth-frontend && npm run dev"
echo ""
echo -e "  ${CYAN}Open in browser:${RESET}"
echo -e "    http://localhost:3001"
echo ""
echo -e "  ${CYAN}API health check:${RESET}"
echo -e "    http://localhost:3000/health"
echo ""
