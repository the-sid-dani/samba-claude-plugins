#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/.claude/hooks"

echo "=== Samba Claude Code Plugins Setup ==="
echo ""

# Step 1: Build hooks (required)
echo "[1/4] Building hooks..."
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is required. Install from https://nodejs.org/"
  exit 1
fi

cd "$HOOKS_DIR"
npm install --silent 2>/dev/null
npm run build 2>/dev/null
echo "  OK: Hooks built ($(ls dist/*.mjs 2>/dev/null | wc -l | tr -d ' ') hooks compiled)"

# Step 2: Optional CLIs
echo ""
echo "[2/4] Checking optional CLI tools..."

check_cli() {
  local name="$1" install_cmd="$2" description="$3"
  if command -v "$name" &>/dev/null; then
    echo "  OK: $name installed ($(command -v "$name"))"
  else
    echo "  SKIP: $name not found — $description"
    echo "        Install: $install_cmd"
  fi
}

check_cli "tldr" "pip install llm-tldr" "Enables 95% token savings on code reads (Tier 2 hooks)"
check_cli "sg" "brew install ast-grep" "Enables structural code search"
check_cli "qlty" "brew install qlty" "Enables universal linting (70+ linters)"

# Step 3: Verify Python (for 2 hooks)
echo ""
echo "[3/4] Checking Python..."
if command -v python3 &>/dev/null; then
  echo "  OK: python3 found ($(python3 --version 2>&1))"
else
  echo "  WARN: python3 not found — auto-handoff-stop and premortem-suggest hooks will be inactive"
fi

# Step 4: Summary
echo ""
echo "[4/4] Setup complete!"
echo ""
echo "Plugin location: $SCRIPT_DIR"
echo ""
echo "What works now:"
echo "  - 19 agents (architect, kraken, spark, sleuth, ...)"
echo "  - 31 skills (/build, /fix, /tdd, /review, ...)"
echo "  - Tier 1 hooks (standalone, always active)"
if command -v tldr &>/dev/null; then
  echo "  - Tier 2 hooks (TLDR-enhanced, active)"
else
  echo "  - Tier 2 hooks will activate once you install tldr"
fi
echo ""
echo "To use: open any project with Claude Code. Plugins activate automatically."
