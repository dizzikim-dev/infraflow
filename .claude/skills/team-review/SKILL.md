---
name: team-review
description: "Create an agent team for parallel code review. Security, performance, and test validation in parallel."
user-invocable: true
---

## Team Code Review: $ARGUMENTS

Create an agent team for comprehensive code review.

### Team Structure

**Security Reviewer** (`@security-reviewer`):
- Analyze `src/app/api/` and `src/lib/auth/` for OWASP Top 10
- Check for hardcoded secrets, injection vulnerabilities
- Verify access control and input validation

**Performance Analyst**:
- Check `src/lib/knowledge/` and `src/lib/learning/` for N+1 queries, memory leaks
- Review React component rendering efficiency
- Identify unnecessary re-renders

**Test Validator**:
- Verify test coverage with `npx vitest run --coverage`
- Check for missing edge case tests
- Validate test quality (no brittle assertions)

### Review Protocol

Each reviewer:
1. Read relevant files using Glob and Read tools
2. Document findings classified as Critical / High / Medium / Low
3. Share findings with teammates
4. Challenge each other's conclusions

### Output Format

```markdown
## Team Review Summary

### Security Findings
| Severity | Finding | File | Remediation |
|----------|---------|------|-------------|

### Performance Findings
| Severity | Finding | File | Remediation |
|----------|---------|------|-------------|

### Test Coverage
| Area | Coverage | Missing Tests |
|------|----------|---------------|

### Verdict: APPROVE / REQUEST CHANGES
```
