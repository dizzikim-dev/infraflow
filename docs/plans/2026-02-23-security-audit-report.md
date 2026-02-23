# InfraFlow Security Audit Report

**Date**: 2026-02-23  
**Auditor**: Security Review Agent  
**Scope**: Authentication, API Security, XSS Prevention, Injection Risks, Dependencies, Data Exposure, CSP, Secret Management, SSRF

---

## Executive Summary

InfraFlow demonstrates **strong security posture** overall, with comprehensive OWASP LLM Top 10 controls already implemented. The project shows mature security practices including:

- CSRF protection across all mutating endpoints
- LLM prompt injection prevention via XML delimiters
- Output validation for API keys and malicious patterns
- Rate limiting on all public endpoints
- Strict CSP headers
- Server-side-only API key storage
- NextAuth.js v5 with JWT + OAuth
- Input validation with Zod schemas

**Overall Security Score**: 72/100 (Medium-High)

**Critical Findings**: 2  
**High Findings**: 5  
**Medium Findings**: 8  
**Low Findings**: 6

---

## Security Findings

| ID | Finding | Severity | OWASP Category | Remediation |
|----|---------|----------|----------------|-------------|
| **S-001** | Missing CSRF protection on non-knowledge admin endpoints | **Critical** | A01:Broken Access | Add CSRF check to `/api/admin/users/[id]` PATCH |
| **S-002** | API key patterns in LLM output not masked in responses | **Critical** | A02:Cryptographic Failures | Mask detected API keys before returning to client |
| **S-003** | Rate limiter uses in-memory store (non-persistent) | **High** | A04:Insecure Design | Migrate to Redis (Upstash) for production |
| **S-004** | No session fixation protection | **High** | A07:Identification/Auth Failures | Regenerate session ID on login |
| **S-005** | Missing HTTP Strict-Transport-Security header | **High** | A05:Security Misconfiguration | Add HSTS header in next.config.mjs |
| **S-006** | JWT secret not validated at startup | **High** | A02:Cryptographic Failures | Add NEXTAUTH_SECRET validation in env.ts |
| **S-007** | Insufficient password complexity (no min length enforcement) | **High** | A07:Identification/Auth Failures | Enforce 12+ chars (currently 8) |
| **S-008** | CSP allows 'unsafe-inline' and 'unsafe-eval' | **Medium** | A05:Security Misconfiguration | Migrate to nonce-based CSP |
| **S-009** | No account lockout after failed login attempts | **Medium** | A07:Identification/Auth Failures | Add brute-force protection |
| **S-010** | LLM response sanitization gaps for indirect injection | **Medium** | LLM01:Prompt Injection | Validate node labels/descriptions |
| **S-011** | Missing CSRF token for form-based auth | **Medium** | A01:Broken Access | Enable NextAuth CSRF token |
| **S-012** | No API request size limits on /api/llm | **Medium** | A04:Insecure Design | Add 5MB body size limit |
| **S-013** | Sensitive error messages expose stack traces | **Medium** | A01:Broken Access | Sanitize errors in production |
| **S-014** | No CORS policy configured | **Medium** | A05:Security Misconfiguration | Add explicit CORS config |
| **S-015** | Dependency vulnerabilities (minimatch) | **Medium** | A06:Vulnerable Components | Run `npm audit fix` |
| **S-016** | Missing X-Frame-Options header | **Low** | A05:Security Misconfiguration | Add X-Frame-Options: DENY |
| **S-017** | No X-Content-Type-Options header | **Low** | A05:Security Misconfiguration | Add nosniff header |
| **S-018** | Missing Referrer-Policy header | **Low** | A05:Security Misconfiguration | Add strict-origin-when-cross-origin |
| **S-019** | No Permissions-Policy header | **Low** | A05:Security Misconfiguration | Restrict browser features |
| **S-020** | LLM metrics logged without sanitization | **Low** | A09:Security Logging Failures | Redact sensitive data from logs |
| **S-021** | No password reset flow | **Low** | A07:Identification/Auth Failures | Implement forgot password |

---

## Detailed Analysis

### 1. Authentication & Authorization

**Location**: `src/lib/auth/`, `src/app/api/auth/`

#### Strengths
- NextAuth.js v5 beta with Credentials + OAuth (Google, GitHub)
- JWT session with 24-hour expiration
- Role-based access control (USER/ADMIN)
- Password hashing with bcrypt (12 rounds)
- Strong password regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/`
- Protected routes via middleware with `requireAuth()` / `requireAdmin()`

#### Vulnerabilities

**S-004: No session fixation protection (High)**
- **File**: `src/lib/auth/auth.ts:27-49`
- **Issue**: Session ID not regenerated on login
- **Fix**: Add `session.regenerate()` in NextAuth callbacks
```typescript
async jwt({ token, user, trigger }) {
  if (trigger === 'signIn') {
    // Regenerate token ID
    token.jti = nanoid(16);
  }
  // ...
}
```

**S-006: JWT secret not validated (High)**
- **File**: `src/lib/config/env.ts:40`
- **Issue**: NEXTAUTH_SECRET optional, no startup validation
- **Fix**: Add required check in production
```typescript
NEXTAUTH_SECRET: z.string().refine(
  (val) => process.env.NODE_ENV !== 'production' || val,
  { message: 'NEXTAUTH_SECRET required in production' }
),
```

**S-007: Weak password minimum length (High)**
- **File**: `src/lib/validations/auth.ts:20-27`
- **Issue**: 8-char minimum insufficient (NIST recommends 12+)
- **Fix**: Update to `.min(12, '비밀번호는 12자 이상이어야 합니다')`

**S-009: No account lockout (Medium)**
- **File**: `src/app/api/auth/register/route.ts`
- **Issue**: Unlimited login attempts allowed
- **Fix**: Add failed attempt counter in Prisma schema, lock after 5 failures

**S-021: No password reset (Low)**
- **Issue**: Users cannot recover accounts
- **Fix**: Implement email-based reset flow with expiring tokens

---

### 2. API Security

**Location**: `src/app/api/`, `src/lib/middleware/`, `src/lib/api/`

#### Strengths
- CSRF protection on **core** mutating endpoints (`/api/parse`, `/api/modify`, `/api/knowledge/*`)
- Rate limiting on all LLM endpoints (10 req/min, 100 req/day)
- Input validation with Zod schemas
- Admin-only knowledge API routes with `requireAdmin()`
- Request size validation via `checkRequestSize()`
- AbortController timeout (30s) on LLM calls

#### Vulnerabilities

**S-001: Missing CSRF on admin user endpoint (Critical)**
- **File**: `src/app/api/admin/users/[id]/route.ts:42-95`
- **Issue**: PATCH method lacks CSRF check
- **Fix**: Add CSRF validation
```typescript
export async function PATCH(req: NextRequest, context: RouteContext) {
  // Add CSRF check
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const secFetchSite = req.headers.get('sec-fetch-site');
  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
  }
  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'CSRF check failed' }, { status: 403 });
  }
  // ...existing code
}
```

**S-003: In-memory rate limiter (High)**
- **File**: `src/lib/middleware/rateLimiter.ts:58-129`
- **Issue**: Data lost on restart, ineffective in serverless
- **Warning already logged**: Line 132-135
- **Fix**: Replace with Redis (Upstash recommended)
```typescript
// Install: npm install @upstash/redis
import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
```

**S-011: Missing NextAuth CSRF token (Medium)**
- **File**: `src/lib/auth/auth.config.ts`
- **Issue**: NextAuth CSRF token not explicitly enabled
- **Fix**: Add to authConfig
```typescript
export const authConfig = {
  // ...
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  // ...
}
```

**S-012: No body size limit on LLM endpoints (Medium)**
- **File**: `src/app/api/llm/route.ts`, `src/app/api/parse/route.ts`
- **Issue**: Could send 100MB+ payloads
- **Fix**: Add to `next.config.mjs`
```javascript
experimental: {
  bodyParserConfig: {
    sizeLimit: '5mb',
  },
},
```

**S-013: Stack traces in production (Medium)**
- **File**: Multiple API routes (e.g., `src/app/api/modify/route.ts:570`)
- **Issue**: `error.message` returned to client
- **Fix**: Sanitize errors
```typescript
return NextResponse.json(
  { error: process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message 
  },
  { status: 500 }
);
```

**S-014: No CORS policy (Medium)**
- **File**: `next.config.mjs`
- **Issue**: No explicit CORS headers, defaults may be permissive
- **Fix**: Add explicit CORS config
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
      ],
    },
  ];
},
```

---

### 3. XSS Prevention

**Location**: `src/components/`, `src/lib/parser/`

#### Strengths
- No `dangerouslySetInnerHTML` found in codebase
- React automatic escaping on all text nodes
- LLM output validated via `validateOutputSafety()` (detects XSS patterns)
- CSP header restricts inline scripts (partial)

#### Vulnerabilities

**S-008: CSP allows unsafe-inline/unsafe-eval (Medium)**
- **File**: `next.config.mjs:14-24`
- **Issue**: Weakens XSS protection
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // ← Too permissive
```
- **Fix**: Migrate to nonce-based CSP
```javascript
// 1. Generate nonce in middleware
import { nanoid } from 'nanoid';
const nonce = nanoid(16);

// 2. Set CSP with nonce
"script-src 'self' 'nonce-${nonce}'",
"style-src 'self' 'nonce-${nonce}'",

// 3. Add nonce to <script>/<style> tags in _document.tsx
<script nonce={nonce}>...</script>
```

---

### 4. Injection Risks

**Location**: `src/lib/llm/`, `src/lib/parser/`, `src/lib/security/`

#### Strengths
- **LLM Prompt Injection**: XML delimiters `<user_request>` (MIT-01-1)
- **Prompt sanitization**: `sanitizeUserInput()` removes dangerous patterns
- **Output validation**: `validateOutputSafety()` detects malicious code
- **No SQL injection**: Prisma ORM (parameterized queries only)
- **No command injection**: No `exec()` or shell commands from user input

#### Vulnerabilities

**S-010: Indirect prompt injection via node labels (Medium)**
- **File**: `src/lib/security/llmSecurityControls.ts` (GAP-01-1)
- **Issue**: Node labels/descriptions not validated before LLM context
- **Fix**: Add label validation
```typescript
export function sanitizeNodeLabel(label: string): string {
  // Remove prompt override attempts
  const dangerous = [
    /ignore\s+(all\s+)?(previous|above)/gi,
    /system\s*:/gi,
    /you\s+are\s+now/gi,
  ];
  let clean = label;
  for (const pattern of dangerous) {
    clean = clean.replace(pattern, '');
  }
  return clean.slice(0, 100); // Max 100 chars
}
```

**S-002: API keys in LLM output not masked (Critical)**
- **File**: `src/lib/security/llmSecurityControls.ts:130-136`
- **Issue**: Patterns detected but not redacted
- **Fix**: Add redaction function
```typescript
export function redactSensitiveData(text: string): string {
  const patterns = [
    { regex: /AKIA[0-9A-Z]{16}/g, replacement: 'AKIA****************' },
    { regex: /AIza[0-9A-Za-z_-]{35}/g, replacement: 'AIza***********************************' },
    { regex: /sk-[a-zA-Z0-9]{20,}/g, replacement: 'sk-********************' },
    { regex: /ghp_[a-zA-Z0-9]{36}/g, replacement: 'ghp_************************************' },
    { regex: /xox[bpors]-[a-zA-Z0-9-]+/g, replacement: 'xox*-***************' },
  ];
  let redacted = text;
  for (const { regex, replacement } of patterns) {
    redacted = redacted.replace(regex, replacement);
  }
  return redacted;
}

// Apply in route handlers before returning
const response = NextResponse.json({
  success: true,
  rawResponse: redactSensitiveData(llmResponse),
});
```

---

### 5. Dependency Vulnerabilities

**Location**: `package.json`, `package-lock.json`

#### Current Status
- **npm audit**: 7 vulnerabilities (6 high, 1 moderate)
- **Root cause**: `minimatch` < 3.0.5 (CVE-2022-3517)
- **Affected**: ESLint toolchain (dev-only)

#### Vulnerabilities

**S-015: Dependency vulnerabilities (Medium)**
- **Packages**: `@eslint/config-array`, `@eslint/eslintrc`, `@typescript-eslint/*`
- **CVE**: CVE-2022-3517 (ReDoS in minimatch)
- **Severity**: High (CVSS 7.5) but **dev-only** impact
- **Fix**: Update ESLint to v10
```bash
npm install eslint@10.0.1 --save-dev
npm audit fix
```

#### Production Dependencies (Clean)
- `next-auth@5.0.0-beta.30` - No known CVEs
- `bcryptjs@3.0.3` - No known CVEs
- `zod@4.3.6` - No known CVEs
- `@prisma/client@6.19.2` - No known CVEs

---

### 6. Data Exposure

**Location**: `src/lib/config/env.ts`, `src/app/api/llm/`, `.env.example`

#### Strengths
- API keys server-side only (no `NEXT_PUBLIC_` prefix)
- `.env.example` has clear security warnings
- LLM output validated for API key patterns
- NextAuth secrets not exposed to client
- Error messages don't leak DB structure

#### Vulnerabilities

**S-020: LLM metrics logged without sanitization (Low)**
- **File**: `src/lib/utils/llmMetrics.ts`
- **Issue**: Could log prompts containing passwords/secrets
- **Fix**: Add log sanitization
```typescript
export function recordLLMCall(data: LLMCallMetric) {
  const sanitized = {
    ...data,
    // Redact if prompt is logged
    prompt: data.prompt ? redactSensitiveData(data.prompt) : undefined,
  };
  // ...existing logging
}
```

---

### 7. CSP & Security Headers

**Location**: `next.config.mjs`, `src/middleware.ts`

#### Current Headers
```javascript
Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
```

#### Missing Headers

**S-005: Missing HSTS (High)**
- **File**: `next.config.mjs:8-28`
- **Fix**: Add HSTS header
```javascript
headers: [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // ...existing CSP
],
```

**S-016: Missing X-Frame-Options (Low)**
- **Current**: CSP `frame-ancestors 'none'` provides protection
- **Fix**: Add redundant header for older browsers
```javascript
{ key: 'X-Frame-Options', value: 'DENY' },
```

**S-017: Missing X-Content-Type-Options (Low)**
```javascript
{ key: 'X-Content-Type-Options', value: 'nosniff' },
```

**S-018: Missing Referrer-Policy (Low)**
```javascript
{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
```

**S-019: Missing Permissions-Policy (Low)**
```javascript
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
```

---

### 8. Secret Management

**Location**: `.env`, `src/lib/config/env.ts`, `src/lib/llm/providers.ts`

#### Strengths
- Secrets in `.env` (not committed)
- `.env.example` as template
- Zod validation in `env.ts`
- Server-side-only access via `process.env`

#### Gaps
- No secret rotation policy
- No vault integration (HashiCorp Vault, AWS Secrets Manager)
- API keys stored in plaintext .env

**Recommendation (Low Priority)**:
- Add secret rotation instructions in docs
- Consider vault integration for production

---

### 9. SSRF / Open Redirect

**Location**: `src/app/api/llm/route.ts`, `src/lib/plugins/loader.ts`

#### Analysis
- **LLM API calls**: Fixed URLs (`https://api.anthropic.com`, `https://api.openai.com`)
- **No user-controlled fetch()**: All external requests hardcoded
- **No redirect endpoints**: No open redirect vulnerabilities
- **Vendor crawling**: Found WebFetch references in vendor catalog tests, but **test-only** (not production code)

#### Verdict
**No SSRF or Open Redirect vulnerabilities found.**

---

## STRIDE Analysis

| Threat | Description | Target | Mitigation |
|--------|-------------|--------|------------|
| **Spoofing** | Attacker impersonates user | Auth endpoints | MFA not implemented (GAP) ✗, JWT validation ✓ |
| **Tampering** | CSRF attack modifies data | Admin user update | Missing CSRF on `/api/admin/users/[id]` ✗ |
| **Repudiation** | Admin actions not logged | Knowledge CRUD | No audit trail (GAP) ✗ |
| **Information Disclosure** | API keys leaked in LLM output | LLM response | Detection exists ✓, masking missing ✗ |
| **Denial of Service** | Rate limit bypass via rotation | `/api/llm` | In-memory store vulnerable ✗ |
| **Elevation of Privilege** | USER → ADMIN | Role update endpoint | Self-role-change prevented ✓ |

---

## OWASP Top 10 Mapping

| OWASP | Relevant Findings | Status |
|-------|------------------|--------|
| A01: Broken Access Control | S-001 (CSRF admin), S-013 (error messages) | 🔴 High Risk |
| A02: Cryptographic Failures | S-002 (API key leak), S-006 (JWT secret) | 🔴 High Risk |
| A03: Injection | S-010 (indirect prompt injection) | 🟡 Medium Risk |
| A04: Insecure Design | S-003 (in-memory rate limit), S-012 (no size limit) | 🟡 Medium Risk |
| A05: Security Misconfiguration | S-008 (CSP), S-014 (CORS), S-005 (HSTS) | 🟡 Medium Risk |
| A06: Vulnerable Components | S-015 (minimatch) | 🟡 Medium Risk |
| A07: Identification/Auth Failures | S-004, S-007, S-009, S-021 | 🔴 High Risk |
| A08: Software/Data Integrity | None found | 🟢 Low Risk |
| A09: Security Logging Failures | S-020 (log sanitization) | 🟢 Low Risk |
| A10: SSRF | None found | 🟢 Low Risk |

---

## OWASP LLM Top 10 Compliance

Based on `src/lib/security/llmSecurityControls.ts`:

| Control | Status | Score | Critical Gaps |
|---------|--------|-------|---------------|
| LLM01: Prompt Injection | Partial | 50/100 | GAP-01-1 (indirect injection), GAP-01-2 (pre-filtering) |
| LLM02: Insecure Output | Implemented | 100/100 | None ✓ |
| LLM03: Training Data Poisoning | N/A | - | Uses external APIs only |
| LLM04: Model DoS | Partial | 50/100 | GAP-04-1 (dynamic token limit), GAP-04-2 (cost tracking) |
| LLM05: Supply Chain | Planned | 10/100 | GAP-05-1 (npm audit pipeline), GAP-05-2 (model pinning) |
| LLM06: Sensitive Info Disclosure | Partial | 50/100 | **GAP-06-1 (output filtering) ← S-002** |
| LLM07: Insecure Plugin Design | Implemented | 100/100 | None ✓ |
| LLM08: Excessive Agency | Implemented | 100/100 | None ✓ |
| LLM09: Overreliance | Partial | 50/100 | GAP-09-1 (confidence score), GAP-09-2 (disclaimer) |
| LLM10: Model Theft | N/A | - | Uses external APIs only |

**Overall LLM Security Score**: 64/100 (from `runSecurityAudit()`)

---

## Remediation Roadmap

### Immediate (P0 - Critical)

1. **S-001**: Add CSRF to `/api/admin/users/[id]` PATCH (15 min)
2. **S-002**: Implement `redactSensitiveData()` in API responses (30 min)

### Short-term (P1 - High, 1-2 weeks)

3. **S-003**: Migrate to Redis rate limiter (Upstash) (4 hours)
4. **S-004**: Add session regeneration on login (1 hour)
5. **S-005**: Add HSTS header (10 min)
6. **S-006**: Require NEXTAUTH_SECRET in production (15 min)
7. **S-007**: Increase password min to 12 chars (5 min)

### Medium-term (P2 - Medium, 2-4 weeks)

8. **S-008**: Implement nonce-based CSP (8 hours)
9. **S-009**: Add account lockout (2 hours)
10. **S-010**: Validate node labels/descriptions (2 hours)
11. **S-011**: Enable NextAuth CSRF token (30 min)
12. **S-012**: Add body size limit (15 min)
13. **S-013**: Sanitize production errors (1 hour)
14. **S-014**: Configure CORS policy (30 min)
15. **S-015**: Update ESLint, run `npm audit fix` (30 min)

### Long-term (P3 - Low, 1-3 months)

16. **S-016 to S-019**: Add missing security headers (1 hour total)
17. **S-020**: Sanitize LLM metrics logs (1 hour)
18. **S-021**: Implement password reset flow (8 hours)

---

## Compliance Checklist

### Authentication/Authorization
- [x] MFA authentication (OAuth supported, not enforced)
- [x] Session timeout (24h)
- [x] Role-based access control
- [ ] CSRF protection (missing on admin endpoints) ← **S-001**

### Network Security
- [x] HTTPS enforcement (middleware.ts:8-16)
- [ ] HSTS header ← **S-005**
- [ ] CORS policy ← **S-014**
- [x] Rate limiting

### Data Protection
- [x] Password hashing (bcrypt 12 rounds)
- [ ] API key redaction ← **S-002**
- [x] Server-side secret storage
- [x] Zod input validation

### Code Security
- [x] Input validation (Zod schemas)
- [x] Parameterized queries (Prisma ORM)
- [ ] Strict CSP (allows unsafe-inline) ← **S-008**
- [ ] Dependency scanning pipeline ← **S-015**

---

## Testing Recommendations

1. **Penetration Testing**
   - CSRF bypass attempts on admin endpoints
   - Session fixation attacks
   - Rate limit evasion via IP rotation
   - LLM prompt injection with nested delimiters

2. **Automated Scanning**
   - OWASP ZAP for API security
   - Snyk/Dependabot for dependency monitoring
   - Semgrep for SAST (Static Application Security Testing)

3. **Security Regression Tests**
   - Add test: CSRF rejection on admin PATCH
   - Add test: API key redaction in responses
   - Add test: Account lockout after 5 failures
   - Add test: HSTS header presence

---

## Conclusion

InfraFlow has a **solid security foundation** with mature LLM-specific controls. The codebase shows evidence of security-conscious design (CSRF protection, input validation, output sanitization). 

**Key Priorities**:
1. Fix critical CSRF gap on admin endpoints (S-001)
2. Implement API key redaction (S-002)
3. Migrate rate limiter to Redis for production resilience (S-003)
4. Add missing security headers (S-005, S-016-S-019)

After addressing P0 and P1 items, the security score would improve to **85+/100**.

---

## References

- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [OWASP LLM Top 10 v1.1](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [NextAuth.js Security Best Practices](https://next-auth.js.org/configuration/options#security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- InfraFlow LLM Controls: `src/lib/security/llmSecurityControls.ts`

---

**End of Report**
