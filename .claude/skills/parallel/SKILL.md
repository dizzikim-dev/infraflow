---
name: parallel
description: "복잡한 작업을 여러 에이전트에 분배하여 병렬 처리."
user-invocable: true
---

## Parallel Agent Dispatch: $ARGUMENTS

### Step 1: Task Analysis
- Are tasks independent (no shared state)?
- Are tasks modifying different files?
- Is there a clear integration point?

Only parallelize if tasks are truly independent.

### Step 2: Task Distribution
Define for each agent:
1. Clear scope (which files, which functionality)
2. Input/output format
3. Constraints
4. Completion criteria
5. Interface with other agents

### Step 3: Agent Execution
Launch agents using the Task tool with appropriate subagent types.

Example split:
- **Frontend Agent**: React components, styles, hooks
- **Backend Agent**: Parser logic, API endpoints, data layer
- **QA Agent**: Test cases, integration tests

### Step 4: Result Integration
- Verify each agent's output
- Resolve any conflicts
- Run full test suite: `npx vitest run`
- Run type check: `npx tsc --noEmit`

### Rules
- MUST verify task independence before parallelizing
- NEVER modify the same file in parallel
- ALWAYS run integration tests after merging
- Define clear interfaces between agents
