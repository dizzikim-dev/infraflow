---
name: verify
description: "Systematic verification before completion. Tests, type check, build, security checks."
user-invocable: true
---

## Verification Checklist

### 1. Code Quality
```bash
npx tsc --noEmit          # Type check - must pass
npx vitest run            # Unit tests - must pass
npm run lint              # Lint - must pass
npm run build             # Build - must pass
```

### 2. Functionality
- [ ] All requirements met
- [ ] Edge cases tested (empty input, max input, invalid format)
- [ ] Error messages are clear and recoverable

### 3. Security
- [ ] No XSS vulnerabilities
- [ ] No SQL injection risks
- [ ] CSRF protection in place
- [ ] No hardcoded secrets/credentials

### 4. Design System Compliance
- [ ] Color tokens used (no hardcoded colors)
- [ ] Contrast ratio >= 4.5:1
- [ ] Standard font sizes and spacing
- [ ] Transitions <= 300ms

### 5. Documentation
- [ ] Complex logic has comments
- [ ] Public API documented
- [ ] INFRASTRUCTURE_COMPONENTS.md updated (if infra data changed)

### Verification Report
```
Status: PASSED / FAILED
Tests:  X/Y passed
Types:  No errors / N errors
Build:  Success / Failed
Issues: [list any issues found]
```

### Rules
- ALL checks must pass before declaring work complete
- Never ignore failing tests
- Never ignore warnings
- Never rely on manual testing alone
