# PR-2: Security Hardening Bundle -- Code Review

**Date**: 2026-02-23
**Reviewer**: Senior Code Reviewer (Claude Opus 4.6)
**Commit**: `9e1915a feat(security): security hardening bundle`
**Baseline**: `359cfbc` (previous release)
**Build**: TypeScript clean, 154 test files, 5,590 tests passing

---

## Executive Summary

The Security Hardening Bundle addresses 2 Critical (C2, C3) and 4 High (H2-H5) findings from the project review. All 6 planned fixes are implemented, with 39 new tests covering each fix. The implementation is clean, consistent with existing patterns, and well-tested. **No critical issues found.** Two important items and several suggestions are noted below.

**Verdict: APPROVED** with two recommended follow-ups.

---

## 1. Plan Alignment

| Finding ID | Planned | Implemented | Status |
|------------|---------|-------------|--------|
| C2 | CSRF on `/api/admin/users/[id]` PATCH | Done -- Origin + Sec-Fetch-Site check | Aligned |
| C3 | `redactSensitiveData()` for LLM responses | Done -- 5 credential patterns, applied to rawResponse | Aligned |
| H2 | JWT session fixation (jti = randomUUID) | Done -- in `auth.config.ts` jwt callback | Aligned |
| H3 | HSTS header | Done -- `max-age=31536000; includeSubDomains` | Aligned |
| H4 | Require NEXTAUTH_SECRET in production | Done -- `validateProductionEnv()` | Partial (see I-1) |
| H5 | Password min 12 chars | Done -- Zod `.min(12)` in RegisterSchema | Aligned |

**Plan deviation for H4**: The function `validateProductionEnv()` exists and is tested, but it is never called at application startup. See Important issue I-1 below.

**Bonus items beyond plan**: X-Content-Type-Options, Referrer-Policy, X-Frame-Options headers were added (not in the original PR-2 scope but a positive addition).

---

## 2. What Was Done Well

1. **CSRF pattern consistency**: The CSRF check in `route.ts` mirrors the exact same logic used in `knowledgeRouteFactory.ts` and `modify/route.ts`. The `Sec-Fetch-Site` + `Origin` dual-check is the correct defense-in-depth approach.

2. **Credential redaction**: The `redactSensitiveData()` function correctly resets `lastIndex` before each regex (line 652 of `llmSecurityControls.ts`), preventing the stateful global regex bug that commonly causes intermittent test failures.

3. **JWT jti placement**: The `jti` is assigned only when `user` is truthy (i.e., on login), so it does not get overwritten on token refresh. This is the correct behavior for session fixation prevention, and the test on line 95-107 of `auth.config.test.ts` explicitly verifies this.

4. **Test quality**: The test suite is thorough. Notable highlights:
   - The CSRF test handles happy-dom's forbidden header limitation via `headers.get` monkey-patching (creative and well-documented).
   - The auth validation tests cover boundary conditions (exactly 12 chars, each special character individually).
   - The `redactSensitiveData` tests verify both positive matches and false-positive resistance (e.g., `sk-short` should NOT match).
   - The `next.config.mjs` header tests directly import the config and verify the async `headers()` return value.

5. **Security headers**: The header set (HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, CSP) is comprehensive and uses correct values. `poweredByHeader: false` is a nice touch.

6. **CREDENTIAL_PATTERNS separation**: Extracting credential patterns into their own const separate from `DANGEROUS_OUTPUT_PATTERNS` provides clear semantic meaning -- detection vs. redaction are distinct concerns even though they share the same regex patterns.

---

## 3. Issues

### IMPORTANT (should fix)

**I-1: `validateProductionEnv()` is never called at startup**

The function is defined and tested but never wired into the application lifecycle. A `grep` for `validateProductionEnv` across the entire `src/` directory (excluding tests) finds only the definition in `src/lib/config/env.ts`. There is no `instrumentation.ts`, no call in `app/layout.tsx`, and no call in any server entry point.

This means the H4 finding ("NEXTAUTH_SECRET not validated at startup") is technically **not resolved** in production. The guard exists but is inert.

**File**: `/Users/hyunkikim/dev/infraflow/src/lib/config/env.ts` (line 117)

**Recommendation**: Create `src/instrumentation.ts` (Next.js instrumentation hook, runs once on server startup):

```typescript
export async function register() {
  const { validateProductionEnv } = await import('@/lib/config/env');
  validateProductionEnv();
}
```

This is the canonical Next.js pattern for startup validation.

---

**I-2: CSRF logic is inlined rather than reusing the shared `checkCsrf` function**

The `knowledgeRouteFactory.ts` already has a reusable `checkCsrf(request)` function (line 114) that returns `NextResponse | null`. The CSRF logic in `/api/admin/users/[id]/route.ts` (lines 49-69) reimplements the same logic inline rather than importing the shared function.

**Files**:
- `/Users/hyunkikim/dev/infraflow/src/app/api/admin/users/[id]/route.ts` (lines 49-69)
- `/Users/hyunkikim/dev/infraflow/src/lib/api/knowledgeRouteFactory.ts` (line 114, `checkCsrf`)

There are also minor inconsistencies between the two implementations:
- The factory error message is `'CSRF check failed'`; the users route says `'CSRF validation failed'`.
- The factory defaults host to `''`; the users route defaults to `'localhost:3000'`.

**Recommendation**: Extract `checkCsrf` into a shared utility (e.g., `src/lib/security/csrf.ts`) and have all routes import it. This is aligned with PR-6 (Environment Variable Consolidation) goals of reducing duplication. At minimum, unify the error messages.

---

### SUGGESTIONS (nice to have)

**S-1: Redaction only applies to `rawResponse`, not to `spec`**

In `/Users/hyunkikim/dev/infraflow/src/app/api/llm/route.ts` (lines 551-556), redaction is applied only to `result.rawResponse`. If the LLM embeds a credential inside a node label (e.g., `{"label": "Redis with key sk-abc..."}`), the `spec` object would pass through unredacted. The `rawResponse` is rarely displayed to users; the `spec` is what renders.

```typescript
// Current (line 552-554):
rawResponse: result.rawResponse ? redactSensitiveData(result.rawResponse) : result.rawResponse,

// Missing:
// spec fields (node labels, descriptions) are not redacted
```

This is a low-probability scenario (LLMs rarely emit real credentials in structured JSON output), but for defense-in-depth the `spec` string fields could also be scanned.

---

**S-2: `CREDENTIAL_PATTERNS` are duplicated from `DANGEROUS_OUTPUT_PATTERNS`**

The 5 credential regex patterns appear in two places within `/Users/hyunkikim/dev/infraflow/src/lib/security/llmSecurityControls.ts`:
- Lines 131-136 inside `DANGEROUS_OUTPUT_PATTERNS`
- Lines 633-638 inside `CREDENTIAL_PATTERNS`

These are independent regex object instances, so they work correctly. However, if a new credential pattern is added in the future, it must be added in both locations. Consider deriving one from the other:

```typescript
const CREDENTIAL_PATTERNS = DANGEROUS_OUTPUT_PATTERNS.filter(
  p => ['aws-access-key', 'gcp-api-key', 'openai-api-key', 'github-pat', 'slack-token'].includes(p.label)
);
```

Note: Since regex objects are stateful (global flag), sharing instances between `validateOutputSafety` and `redactSensitiveData` could cause bugs. If deriving, clone the patterns with `new RegExp(p.pattern.source, p.pattern.flags)`.

---

**S-3: HSTS header missing `preload` directive**

In `/Users/hyunkikim/dev/infraflow/next.config.mjs` (line 28), the HSTS value is:
```
max-age=31536000; includeSubDomains
```

Adding `; preload` would allow submission to the HSTS preload list (hstspreload.org), which provides browser-level enforcement before the first visit. This is only relevant if the production domain is intended for preload submission.

---

**S-4: Consider `DATABASE_URL` in production env validation**

The `validateProductionEnv()` function only checks `NEXTAUTH_SECRET`. For a production deployment, `DATABASE_URL` is equally critical. Consider expanding the check:

```typescript
if (env.NODE_ENV === 'production') {
  if (!env.NEXTAUTH_SECRET) {
    throw new Error('FATAL: NEXTAUTH_SECRET is required in production');
  }
  if (!env.DATABASE_URL) {
    throw new Error('FATAL: DATABASE_URL is required in production');
  }
}
```

---

**S-5: Password policy not enforced on LoginSchema**

The `LoginSchema` in `/Users/hyunkikim/dev/infraflow/src/lib/validations/auth.ts` (line 11) only requires `min(1)` for password. This is correct for login (existing users may have shorter passwords from before the policy change), but it means there is no migration path for existing users with passwords under 12 characters. Consider flagging such users for password reset on next login.

---

## 4. Test Quality Assessment

| Test File | Tests | Coverage Notes |
|-----------|-------|----------------|
| `users-patch-csrf.test.ts` | 6 | Covers cross-site, wrong origin, same-origin, matching origin, none, same-site. Excellent edge case coverage. |
| `next-config-headers.test.ts` | 6 | Validates all 5 headers + poweredByHeader. Clean and straightforward. |
| `auth.config.test.ts` | 7 | Session config, jti on login, jti uniqueness, jti preservation on refresh, role default. Thorough. |
| `env.test.ts` (new tests) | 4 | validateProductionEnv: production without secret, production with secret, dev without, test without. |
| `auth.test.ts` (expanded) | 13 | Boundary: min 12 chars, exact 12, each special char, missing uppercase/lowercase/digit/special. |
| `llmSecurityControls.test.ts` (new tests) | ~13 | redactSensitiveData: all 5 patterns, multiple in one string, empty, null, false positives, surrounding text. |

**Total new tests**: 39 (as claimed)

**Test patterns used correctly**:
- `vi.hoisted` for mock setup before `vi.mock` hoisting
- `beforeEach` with `vi.clearAllMocks` for isolation
- Boundary value testing for password length
- False-positive resistance testing for credential patterns

**Minor observation**: The env.test.ts has significant boilerplate for saving/restoring `process.env` (repeated 4 times across describe blocks). This could be extracted into a shared test utility, but it is functionally correct as-is.

---

## 5. Security Pattern Verification

| Check | Result |
|-------|--------|
| CSRF uses `Sec-Fetch-Site` + `Origin` dual-check | PASS |
| CSRF blocks `same-site` (subdomain attack) | PASS |
| CSRF allows `none` (direct navigation / Postman) | PASS |
| Credential patterns use global flag with `lastIndex` reset | PASS |
| `redactSensitiveData` handles null/undefined without throwing | PASS |
| HSTS includes `includeSubDomains` | PASS |
| `X-Frame-Options: DENY` matches `frame-ancestors 'none'` in CSP | PASS (defense-in-depth) |
| JWT `jti` uses `crypto.randomUUID()` (CSPRNG) | PASS |
| Password regex requires all 4 character classes | PASS |
| No secrets logged in any implementation code | PASS |

---

## 6. Final Verdict

**APPROVED** -- The implementation is high-quality, well-tested, and aligned with the plan. Two follow-ups recommended:

1. **I-1 (Important)**: Wire `validateProductionEnv()` into the startup lifecycle via `instrumentation.ts`. Without this, the H4 finding from the project review remains unresolved in practice.
2. **I-2 (Important)**: Extract CSRF logic into a shared utility to eliminate duplication and ensure consistent error messages across all routes.

Both can be addressed in a small follow-up commit without affecting the existing tests.
