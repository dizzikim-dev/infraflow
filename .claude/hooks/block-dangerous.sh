#!/bin/bash
# Block destructive commands from being executed
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

if echo "$COMMAND" | grep -iE '\b(rm -rf /|DROP TABLE|DROP DATABASE|TRUNCATE|format |mkfs)\b' > /dev/null; then
  echo "Blocked: Destructive command detected" >&2
  exit 2
fi

exit 0
