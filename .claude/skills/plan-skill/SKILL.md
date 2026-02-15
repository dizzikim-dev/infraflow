---
name: plan-skill
description: "작업을 실행 가능한 단계로 분해하는 계획 수립."
user-invocable: true
---

## Plan: $ARGUMENTS

### Plan Structure

```markdown
# Plan: [feature name]

## Goal
[1-2 sentence goal]

## Success Criteria
- [ ] [verifiable criterion 1]
- [ ] [verifiable criterion 2]
- [ ] [verifiable criterion 3]

## Prerequisites
- [required dependencies]
- [required tools/libraries]

## Steps

### Step 1: [title]
**File**: `path/to/file.ts`
**Tasks**:
1. [specific task]
2. [specific task]
**Done when**: [completion criterion]

### Step 2: [title]
...
```

### Plan Types

**Feature Plan**: Test → Implement → Refactor → Integration test → Document
**Bug Fix Plan**: Reproduce → Root cause → Fix → Regression test → Verify
**Refactor Plan**: Verify current tests → Plan changes → Incremental change → Document

### Good Plan Checklist
- Each step completable in a focused session
- Each step has a clear completion criterion
- Dependencies between steps are explicit
- File paths are specific
- Parallel-capable steps are marked

### Bad Plan Signs
- Vague steps like "implement it"
- Very large single steps
- No completion criteria
- No file paths
- Ignored dependencies
