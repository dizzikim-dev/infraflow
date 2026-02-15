#!/bin/bash
# Post-task verification: type check and test
echo "Running post-task verification..."

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Type check
if ! npx tsc --noEmit --pretty 2>&1 | head -20; then
  echo "WARNING: TypeScript errors detected" >&2
  exit 0
fi

# Quick test run
if ! npx vitest run --reporter=dot 2>&1 | tail -5; then
  echo "WARNING: Test failures detected" >&2
  exit 0
fi

echo "Post-task verification passed"
exit 0
