---
name: tdd
description: "RED-GREEN-REFACTOR TDD cycle. Write tests first when implementing new features."
user-invocable: true
---

## TDD Cycle for: $ARGUMENTS

### RED Phase - Write Failing Test
1. Create test file in `__tests__/` directory adjacent to the source
2. Write ONE failing test that describes the expected behavior
3. Run `npx vitest run` to confirm the test fails
4. Verify the error message is clear and describes what's missing

### GREEN Phase - Minimal Implementation
5. Write the simplest code that makes the test pass
6. Run `npx vitest run` to confirm the test passes
7. Verify no other tests broke

### REFACTOR Phase - Improve Code Quality
8. Remove duplication, improve naming, restructure
9. Run `npx vitest run` to confirm all tests still pass
10. Run `npx tsc --noEmit` to confirm no type errors

### Rules
- Write test BEFORE implementation code
- Only ONE test at a time
- Confirm test FAILS before implementing
- After refactoring, ALL tests must still pass
- Never modify a test just to make it pass
- Never add features during refactoring
