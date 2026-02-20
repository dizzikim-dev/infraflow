---
paths:
  - "src/app/api/**/*.ts"
---

# API Route Rules

- CSRF Origin header check required on all mutating endpoints
- Rate limiter must be applied to all public endpoints
- Prisma model access must check `ALLOWED_MODELS` whitelist
- All user input must be validated server-side (Zod preferred)
- Consistent response format: `{ success: boolean, data?: T, error?: string }`
- Never log sensitive data (passwords, tokens, API keys)
- Never expose internal implementation details in error responses
- Knowledge API routes use `knowledgeRouteFactory` for consistency
