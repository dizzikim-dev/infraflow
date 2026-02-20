---
paths:
  - "src/**/__tests__/**/*.ts"
  - "src/**/__tests__/**/*.tsx"
---

# TDD Rules (Test-Driven Development)

## Rule IDs

| ID | Rule | Priority |
|----|------|----------|
| TDD-001 | Write test first | P0 (Required) |
| TDD-002 | One test at a time | P0 (Required) |
| TDD-003 | Verify failure before implementing | P0 (Required) |
| TDD-004 | Minimal implementation | P1 (Recommended) |
| TDD-005 | Run tests after refactoring | P0 (Required) |
| TDD-006 | Test naming convention | P1 (Recommended) |
| TDD-007 | Test independence | P1 (Recommended) |

---

## TDD-001: Write Test First

All new features must have tests written BEFORE implementation code.

```
1. Analyze requirements
2. Write test case (RED)
3. Run test → confirm failure
4. Write implementation (GREEN)
5. Refactor (REFACTOR)
```

## TDD-002: One Test at a Time

Write and pass one test case before moving to the next. Do not write 10 tests at once.

## TDD-003: Verify Failure Before Implementing

Confirm the test fails for the EXPECTED reason before writing implementation. This ensures:
- The test is correctly written
- The test actually validates something
- No accidental passing

## TDD-004: Minimal Implementation

Write the simplest code that makes the test pass. More tests naturally generalize the implementation.

## TDD-005: Run Tests After Refactoring

```bash
# Before refactoring
npx vitest run  # All tests pass

# Refactor code

# After refactoring
npx vitest run  # All tests must still pass
```

## TDD-006: Test Naming

Use descriptive behavior-based names:

```typescript
// Wrong
it('test1', () => { ... });
it('parsePrompt works', () => { ... });

// Correct
it('should parse 3-tier architecture prompt', () => { ... });
it('should return empty components for unknown prompt', () => { ... });
it('should throw error when prompt is empty', () => { ... });
```

Pattern: `should [behavior] when [condition]`

## TDD-007: Test Independence

Each test must be independent — no shared mutable state between tests.

```typescript
// Wrong: dependent tests
let sharedState;
it('test 1', () => { sharedState = createState(); });
it('test 2', () => { sharedState.modify(); }); // depends on test 1

// Correct: independent tests
it('test 1', () => { const state = createState(); /* ... */ });
it('test 2', () => { const state = createState(); state.modify(); /* ... */ });
```

## Test Commands

```bash
npx vitest run                    # All unit tests
npx vitest run src/lib/parser     # Specific directory
npx vitest run --coverage         # With coverage report
```
