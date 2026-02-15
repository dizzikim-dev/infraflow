#!/bin/bash
# Teammate idle verification: quick type check
cd "$CLAUDE_PROJECT_DIR" || exit 0

npx tsc --noEmit --pretty 2>&1 | head -10
exit 0
