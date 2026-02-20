---
name: brainstorm
description: "Socratic dialogue for design refinement. Explores requirements and compares alternatives for new feature design."
user-invocable: true
---

## Brainstorming: $ARGUMENTS

### Phase 1: Requirements Exploration
Ask and answer:
- What problem does this feature solve?
- Who uses this feature?
- What does success look like?
- What happens without this feature?
- Are there existing similar solutions?

### Phase 2: Constraints
- Technical constraints (framework, performance, compatibility)?
- Time/resource constraints?
- Security requirements?

### Phase 3: Alternative Exploration
For each viable approach:

```
Option A: [approach]
├── Pros: ...
├── Cons: ...
└── Risks: ...
```

Compare at least 2-3 options.

### Phase 4: Decision & Documentation
```markdown
## Decision: [chosen approach]

### Context
[Why this decision was needed]

### Options Considered
1. [Option A] - why rejected
2. [Option B] - why chosen
3. [Option C] - why rejected

### Consequences
- Positive: ...
- Negative: ...
- Risks: ...

### Action Items
- [ ] ...
```

### Integration
After brainstorming, consider running:
- `@pessimist` for risk analysis
- `@optimist` for opportunity analysis
