---
name: debug
description: "4-step systematic debugging. Root cause analysis when bugs occur."
user-invocable: true
---

## Systematic Debugging: $ARGUMENTS

### Step 1: Symptom Collection
- What exactly went wrong?
- What was the expected behavior?
- What was the actual behavior?
- Any error messages or stack traces?
- When did it start happening?
- Is it reproducible?

Collect: error logs, stack traces, console output, network requests.

### Step 2: Hypothesis Formation
- Review recent changes (`git log --oneline -10`)
- Identify related code areas
- Check dependencies
- Check environment differences

Format each hypothesis as: "[X] is in [Y] state, causing [symptom]"

### Step 3: Hypothesis Testing
- Start with the most likely hypothesis
- Make minimal changes to verify
- Add logging/debugging points
- Record results for each hypothesis tested

### Step 4: Root Cause Fix
- Fix the root cause, not just the symptom
- Verify fix doesn't break other things
- Add regression test: `npx vitest run`
- Run type check: `npx tsc --noEmit`
- Document: cause, fix, and prevention

### Rules
- Collect evidence BEFORE guessing
- Test ONE hypothesis at a time
- Record before/after state
- Run regression tests after fix
- Remove all debug code when done
