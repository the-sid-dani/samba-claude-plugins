#!/bin/bash
# SessionStart hook: Persist CLAUDE_PROJECT_DIR to CLAUDE_ENV_FILE
# Makes the project dir available to all subsequent bash commands

if [ -n "$CLAUDE_ENV_FILE" ]; then
    echo "export CLAUDE_PROJECT_DIR=\"$(pwd)\"" >> "$CLAUDE_ENV_FILE"
fi
