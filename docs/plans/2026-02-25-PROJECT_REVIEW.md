# InfraFlow Comprehensive Project Review

> **Date**: 2026-02-25
> **Reviewers**: 4 parallel agents (Explore Audit, Pessimist, Optimist, Security)
> **Scope**: Full codebase — 719 source files, 199 test files, 6,309 tests
> **Purpose**: Identify improvements, create actionable PR plan for next Claude session

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Code Audit Findings](#2-code-audit-findings)
3. [Pessimist Analysis — Risks & Weaknesses](#3-pessimist-analysis)
4. [Optimist Analysis — Strengths & Opportunities](#4-optimist-analysis)
5. [Security Review Findings](#5-security-review-findings)
6. [Synthesis — Key Improvements Needed](#6-synthesis)
7. [PR Plan — Prioritized & Parallelizable](#7-pr-plan)
8. [Appendix — Raw Data](#8-appendix)

---

## 1. Executive Summary

### Overall Scores

| Dimension | Score | Grade |
|-----------|-------|-------|
| Code Quality | 88/100 | A- |
| Architecture | 82/100 | B+ |
| Security | 68/100 | C+ |
| Test Coverage | 78/100 | B+ |
| Data Quality | 55/100 | C |
| Scalability | 60/100 | C+ |
| **Composite** | **72/100** | **B** |

### Headline Findings

**Critical Issues (Must Fix Before Launch)**:
1. **S1**: Demo mode bypasses ALL authentication — admin access for anyone
2. **R-001**: Vendor catalogs (1,100+ products) eagerly loaded into memory — OOM at 200 users
3. **R-004**: Rate limiter fail-closed without Redis — entire site goes 503 on Vercel
4. **S2**: NEXTAUTH_SECRET is optional in env validation — session forgery risk

**Strategic Strengths**:
1. Knowledge graph (140 rels, 41 patterns, 45 antipatterns) — 18-month competitive lead
2. RAG pipeline with graph-guided retrieval + post-verification — publishable research
3. 6,309 tests, TypeScript strict, zero circular dependencies — enterprise-grade quality
4. 22 vendor catalogs + 111 cloud services — only vendor-neutral infrastructure knowledge base

**Key Metrics**:
- 0 circular dependencies
- 0 dead code files
- 3 legitimate TODOs
- 13 security findings (1 Critical, 2 High, 5 Medium, 3 Low, 2 Info)
- 16 architectural risks (4 Critical, 11 Major, 1 Minor)
- ~96% of vendor products are stubs (40/1,100 enriched)

---

## 2. Code Audit Findings

### 2.1 Dependencies — CLEAN

All dependencies are actively used. No bloat. Heavy packages (chromadb, html2canvas, jspdf) are dynamically imported.

### 2.2 Dead Code — NONE

Zero abandoned code, zero commented-out functions. Only 3 legitimate TODOs in Terraform export (Azure/monitoring/Grafana support).

### 2.3 Code Duplication — MINIMAL

Zod schemas centralized. Knowledge graph data properly split by domain. No consolidation needed.

### 2.4 Test Coverage Gaps

| Module | Priority | Impact | Missing Tests |
|--------|----------|--------|---------------|
| `src/lib/recommendation/` | HIGH | Product matching core logic | matcher.ts, cloudMatcher.ts, scorer.ts |
| `src/lib/auth/loginSecurity.ts` | HIGH | Security critical path | lockout logic, edge cases |
| `src/lib/llm/providers.ts` | HIGH | LLM provider selection | provider fallback, error handling |
| `src/lib/middleware/rateLimiter.ts` | MEDIUM | Rate limiting logic | Redis fallback, edge cases |
| `src/lib/cost/costEstimator.ts` | MEDIUM | Cost calculation | tier pricing, currency |
| `src/lib/parser/intelligentParser.ts` | MEDIUM | AI-assisted parsing | complex prompts |
| `src/lib/layout/` | LOW | Auto-layout engine | visual regression |
| `src/lib/animation/` | LOW | Animation engine | visual regression |

### 2.5 Large Files to Split

| File | Lines | Recommended Split |
|------|-------|-------------------|
| `src/app/admin/rag/page.tsx` | 1,175 | TraceViewer, IndexingForm, HealthStatus, CrawlHistory |
| `src/lib/export/kubernetesExport.ts` | 1,464 | StatefulSet, Deployment, Service, ConfigMap generators |
| `src/lib/export/terraformExport.ts` | 948 | Entry point + providers/ + generators/ |

### 2.6 Import Graph — EXCELLENT

- Zero circular dependencies
- Clean layer separation (UI → Domain → Infrastructure)
- All imports flow downward
- Longest chain: 3 levels (InfraEditor → usePromptParser → lib/llm → lib/rag)

---

## 3. Pessimist Analysis

### 3.1 Critical Risks

#### R-001: Memory Bloat from Eager Vendor Catalog Loading
- **File**: `src/lib/knowledge/vendorCatalog/index.ts:54-77`
- **Problem**: `allVendorCatalogs` imports 22 vendor files (1,100+ products) synchronously at module scope
- **Impact**: At 200 concurrent users on Vercel (1GB limit) → OOM crash
- **Evidence**: `getAllVendorCatalogsAsync()` exists but marked `@deprecated` and unused
- **Fix**: Refactor all callers to use async loader + Redis cache (3-5 days)

#### R-004: Rate Limiter Fail-Closed Without Redis
- **File**: `src/lib/middleware/rateLimiter.ts:274-316`
- **Problem**: On Vercel without Redis env vars → `RejectAllStore` rejects ALL requests
- **Impact**: Misconfigured deploy = complete service outage
- **Fix**: Add degraded mode with in-memory limits instead of hard reject (2 days)

#### R-002: Vendor Lock-in to Anthropic/OpenAI
- **File**: `src/app/api/llm/route.ts:419-450`
- **Problem**: Hard-coded API clients, no abstraction, no cost monitoring
- **Impact**: Price hike or outage = service degradation
- **Fix**: Add LiteLLM abstraction layer (5-7 days)

#### R-003: Data Staleness (Manual Crawl Only)
- **Problem**: No automated re-crawl, no change detection, no freshness monitoring
- **Impact**: Recommending EOL products, wrong pricing
- **Fix**: Automated crawler with weekly schedule (10-15 days)

### 3.2 Major Risks

| ID | Risk | File | Impact |
|----|------|------|--------|
| R-005 | 96% vendor products are stubs | vendorCatalog/ | Bad recommendations |
| R-006 | Bleeding-edge deps (Next 16, NextAuth beta) | package.json | Breaking changes |
| R-007 | ChromaDB external dependency | rag/chromaClient.ts | Feature degradation |
| R-008 | No bundle size budget | next.config.mjs | 5MB+ bundle |
| R-009 | N+1 query in enrichContext | api/llm/route.ts | 5-10s latency for large diagrams |
| R-010 | DB writes on every login attempt | lib/auth/auth.ts | Connection pool exhaustion under brute-force |
| R-011 | Hardcoded config values | Multiple | Cannot customize per customer |
| R-012 | 71 files import from knowledge/ | Multiple | Schema change cascade |
| R-013 | Confidence scores are guesswork | knowledge/types.ts | Wrong recommendations |
| R-014 | TypeScript compile time grows with catalog | types/infra.ts | Cannot deploy at 10K entries |

### 3.3 Scalability Boundaries

| Users | What Breaks | Mitigation |
|-------|-------------|------------|
| 50 | Nothing — works fine | Current state |
| 100 | Memory pressure from vendor catalogs | Async loading + cache |
| 200 | OOM on Vercel (1GB limit) | Lazy loading mandatory |
| 500 | Rate limiter in-memory resets on cold start | Redis required |
| 1,000 | LLM API costs ($500-1000/day) | Cost budgets, caching |
| 10,000 | Knowledge graph compile time | Runtime schema needed |

---

## 4. Optimist Analysis

### 4.1 Core Differentiators

| Differentiator | InfraFlow | Competitors |
|---------------|-----------|-------------|
| Knowledge Graph | 140 typed relationships, 41 patterns, 45 antipatterns, 64 failures, 42 perf profiles | Draw.io: 0, Terraform: 0, AWS WAF: generic checklists |
| Vendor Catalog | 22 vendors, 1,100+ products, vendor-neutral | All competitors: single-vendor or none |
| RAG Pipeline | Graph-guided + post-verification + 5-step traces | No competitor has this |
| IaC Export | Terraform + K8s + PlantUML from diagram | Draw.io: manual, Lucidchart: none |
| Compliance | 6 frameworks (PCI-DSS, HIPAA, ISO 27001, SOC 2, GDPR, NIST) | AWS WAF: 1 framework |

**Competitive Moat**: 18-month lead. $500K+ and 12-18 months to replicate the knowledge graph alone.

### 4.2 Architecture Quality Highlights

- **Builder Pattern**: TraceCollector — clean, non-intrusive trace capture
- **Factory Pattern**: knowledgeRouteFactory — DRY config-driven route generation
- **Adapter Pattern**: ComparisonItem — unified vendor + cloud comparison
- **Graceful Degradation**: ChromaDB optional, keyword fallback, demo mode
- **FIFO Cache**: enrichContext 50-entry cache — serverless-compatible

### 4.3 Quick Win Opportunities (1-2 weeks each)

| Opportunity | Effort | Revenue Impact |
|-------------|--------|---------------|
| Vendor Partnership Program (Cisco, Fortinet, F5) | 1 week | $5K-20K/vendor/year |
| Template Marketplace (30% commission) | 1 week | $10K-50K GMV |
| CloudFormation Export (parallel to Terraform) | 1 week | AWS customer acquisition |
| AI Software in Comparison Panel | 1 week | AI buyer segment |
| RAG Query Testing UI (admin) | 1 week | Developer productivity |

### 4.4 Strategic Market Opportunities

| Market | TAM | Priority |
|--------|-----|----------|
| MSP/SI White-Label | $5M ARR | P0 |
| Vendor Pre-Sales Licensing | $5-10M ARR | P0 |
| Telecom Operators (5G, MEF) | $3M ARR | P1 |
| Government/Defense (NIST, FedRAMP) | $5M ARR | P1 |
| Education (university licenses) | $2.5M ARR | P2 |

### 4.5 Data Moat Being Built

1. **Knowledge Graph**: 140 rels + 41 patterns → $2-5M replacement cost
2. **Vendor Catalog**: 1,100+ products → $1-2M (vendor partnerships)
3. **User Diagrams** (future): Training data for AI → $5-10M
4. **RAG Traces**: LLM behavior data → research + calibration value

---

## 5. Security Review Findings

### 5.1 Finding Summary

| ID | Finding | Severity | OWASP | Fix Effort |
|----|---------|----------|-------|------------|
| **S1** | Demo mode bypasses ALL auth (returns DEMO_SESSION with admin) | **CRITICAL** | A01 | 2 hours |
| **S2** | NEXTAUTH_SECRET is optional in env validation | **HIGH** | A05 | 15 min |
| **S3** | Node labels not sanitized before LLM context (indirect prompt injection) | **HIGH** | A03/LLM01 | 1 hour |
| **S4** | API keys not detected in user input (only in LLM output) | **MEDIUM** | A03 | 30 min |
| **S5** | minimatch ReDoS vulnerability (GHSA-3ppc-4f35-3m26) | **MEDIUM** | A06 | 10 min |
| **S6** | GET /api/llm has no rate limit (provider status disclosure) | **MEDIUM** | A05 | 15 min |
| **S7** | No request ID for audit trail / log correlation | **MEDIUM** | A09 | 1 hour |
| **S8** | Session timeout not enforced (maxAge not set) | **MEDIUM** | A07 | 15 min |
| **S9** | No password history check (reuse allowed) | **LOW** | A07 | 4 hours |
| **S10** | CORS policy not explicitly defined | **LOW** | A05 | 30 min |
| **S11** | No Cache-Control for static assets | **LOW** | A05 | 15 min |
| **S12** | LLM max_tokens hardcoded at 2048 | **INFO** | LLM04 | 2 hours |
| **S13** | No per-user cost budget tracking | **INFO** | LLM04 | 8 hours |

### 5.2 OWASP Compliance

**OWASP Top 10 (2021)**: 6/10 Pass, 4/10 Partial
**OWASP LLM Top 10 (2025)**: 68/100 (6 applicable controls)

### 5.3 Strongest Security Areas
- CSRF protection on ALL mutating routes (dual-check: Origin + Sec-Fetch-Site)
- Zod validation on ALL API inputs
- LLM output validation with 16 dangerous patterns + API key redaction
- CSP with per-request nonce (replaces unsafe-inline)
- Rate limiting with fail-closed policy (Redis-backed)

---

## 6. Synthesis — Key Improvements Needed

### Tier 1: CRITICAL (Block Launch)

| # | Improvement | Source | Effort | Impact |
|---|------------|--------|--------|--------|
| 1 | **Remove demo mode auth bypass** — DEMO_SESSION returns admin role | S1 | 2h | Prevents complete auth bypass |
| 2 | **Make NEXTAUTH_SECRET required in prod** — call validateProductionEnv() at startup | S2 | 15min | Prevents session forgery |
| 3 | **Async vendor catalog loading** — refactor allVendorCatalogs to lazy load + cache | R-001 | 3-5d | Prevents OOM at 200 users |
| 4 | **Rate limiter degraded mode** — in-memory fallback instead of RejectAllStore on Vercel | R-004 | 2d | Prevents total outage on deploy misconfiguration |

### Tier 2: HIGH (Pre-Launch)

| # | Improvement | Source | Effort | Impact |
|---|------------|--------|--------|--------|
| 5 | **Sanitize node labels before LLM context** — apply sanitizeUserInput() | S3 | 1h | Prevents indirect prompt injection |
| 6 | **Detect API keys in user input** — reuse validateOutputSafety() | S4 | 30min | Prevents secret leakage |
| 7 | **Fix minimatch ReDoS** — npm audit fix | S5 | 10min | Patches known vulnerability |
| 8 | **Add tests for recommendation engine** — matcher.ts, cloudMatcher.ts, scorer.ts | Audit | 4-6h | Core feature untested |
| 9 | **Add tests for auth security** — loginSecurity.ts edge cases | Audit | 2-3h | Security critical path untested |
| 10 | **Add tests for LLM providers** — provider selection, fallback, errors | Audit | 2h | LLM pipeline untested |

### Tier 3: MEDIUM (Post-Launch Sprint)

| # | Improvement | Source | Effort | Impact |
|---|------------|--------|--------|--------|
| 11 | **Rate limit GET /api/llm** — prevent provider status scraping | S6 | 15min | Info disclosure |
| 12 | **Add request ID to logs** — UUID in middleware, propagate to all routes | S7 | 1h | Audit trail |
| 13 | **Configure session timeout** — maxAge 30min in auth.config.ts | S8 | 15min | Session security |
| 14 | **Split admin RAG page** — 1,175 lines → 4 components | Audit | 2-3h | Maintainability |
| 15 | **Split export modules** — Terraform (948L) + K8s (1,464L) | Audit | 6-10h | Maintainability |
| 16 | **Bundle size CI check** — add budget + webpack analyzer to CI | R-008 | 3d | Prevent 5MB+ bundles |
| 17 | **Extract hardcoded config** — LLM timeout, cache TTL, rate limits to env/DB | R-011 | 3d | Customer customization |
| 18 | **LLM provider abstraction** — abstract Anthropic/OpenAI behind interface | R-002 | 5-7d | Reduce vendor lock-in |

### Tier 4: STRATEGIC (Roadmap)

| # | Improvement | Source | Effort | Impact |
|---|------------|--------|--------|--------|
| 19 | **Automated vendor catalog crawler** — weekly crawl + change detection | R-003 | 10-15d | Data freshness |
| 20 | **Vendor product enrichment** — enrich remaining 1,060 stub products | R-005 | 40-60d | Recommendation quality |
| 21 | **E2E tests with Playwright** — critical user flows | Audit | 2-3d | Regression safety |
| 22 | **Embedded vector store fallback** — Faiss/HNSW when ChromaDB down | R-007 | 5-7d | RAG availability |
| 23 | **Feedback loop for confidence scores** — user rating → ML calibration | R-013 | 15-20d | Recommendation accuracy |
| 24 | **Runtime knowledge schema** — JSON Schema or GraphQL layer | R-012, R-014 | 10-15d | Scalability beyond 10K entries |

---

## 7. PR Plan — Prioritized & Parallelizable

### Execution Strategy

```
Week 1: PR-01 through PR-06 (Critical + Quick Security — can ALL run in parallel)
Week 2: PR-07 through PR-10 (High Priority Tests + Config — can ALL run in parallel)
Week 3: PR-11 through PR-14 (Medium — component splits + infra — mostly parallel)
Week 4+: PR-15 through PR-18 (Strategic — sequential)
```

### Dependency Graph

```
PR-01 ─┐
PR-02 ─┤
PR-03 ─┤── All independent, run in parallel (Week 1)
PR-04 ─┤
PR-05 ─┤
PR-06 ─┘

PR-07 ─┐
PR-08 ─┤── All independent, run in parallel (Week 2)
PR-09 ─┤
PR-10 ─┘

PR-11 ─┐
PR-12 ─┤── Mostly independent (Week 3)
PR-13 ─┤
PR-14 ─┘── depends on PR-03 (async catalog must land first)

PR-15 ─── depends on PR-14 (bundle budget after config extraction)
PR-16 ─── depends on PR-03 (enrichment after async loading)
PR-17 ─── standalone (E2E tests)
PR-18 ─── standalone (vector store fallback)
```

---

### PR-01: Security — Remove Demo Mode Auth Bypass
**Priority**: P0 CRITICAL | **Effort**: 2 hours | **Parallel**: Yes
**Branch**: `fix/remove-demo-auth-bypass`

**Scope**:
- `src/lib/auth/authHelpers.ts` — Remove `DEMO_SESSION` admin bypass or restrict to IP allowlist
- `src/middleware.ts` — Remove demo mode middleware bypass
- Option A (recommended): Make demo mode return `role: 'user'` not `role: 'admin'`
- Option B: Gate demo mode behind `DEMO_ALLOWED_IPS` env var
- Add test: verify demo mode cannot access admin routes

**Acceptance Criteria**:
- [ ] Demo mode does NOT grant admin access
- [ ] All admin routes return 401/403 in demo mode
- [ ] Tests pass: `npx tsc --noEmit && npx vitest run`

---

### PR-02: Security — NEXTAUTH_SECRET + Session Hardening
**Priority**: P0 CRITICAL | **Effort**: 1 hour | **Parallel**: Yes
**Branch**: `fix/auth-session-hardening`

**Scope**:
- `src/lib/config/env.ts` — Make `NEXTAUTH_SECRET` required when `NODE_ENV=production`
- `src/app/layout.tsx` or `src/middleware.ts` — Call `validateProductionEnv()` at startup
- `src/lib/auth/auth.config.ts` — Add `session.maxAge = 1800` (30 min)
- `src/lib/auth/auth.config.ts` — Add `session.updateAge = 86400` (24h refresh)

**Acceptance Criteria**:
- [ ] App crashes on startup if NEXTAUTH_SECRET missing in production
- [ ] Sessions expire after 30 minutes of inactivity
- [ ] Tests pass

---

### PR-03: Perf — Async Vendor Catalog Loading
**Priority**: P0 CRITICAL | **Effort**: 3-5 days | **Parallel**: Yes
**Branch**: `perf/async-vendor-catalog`

**Scope**:
- `src/lib/knowledge/vendorCatalog/index.ts` — Make `getAllVendorCatalogsAsync()` the primary API, remove sync `allVendorCatalogs` export
- All 71+ files importing `allVendorCatalogs` — Migrate to async pattern
- Add in-memory cache with TTL for loaded catalogs
- Consider Redis cache layer for production
- Update `getProductsForNodeType()`, `matchVendorProducts()` to be async

**Key Files to Update**:
```
src/lib/knowledge/vendorCatalog/index.ts (entry point)
src/lib/recommendation/matcher.ts (uses allVendorCatalogs)
src/lib/recommendation/cloudMatcher.ts
src/lib/comparison/ (uses vendor catalog for search)
src/lib/consulting/costComparator.ts
src/app/api/llm/route.ts (enrichment)
```

**Acceptance Criteria**:
- [ ] `allVendorCatalogs` sync export removed
- [ ] All callers use async loading
- [ ] Memory usage at import time: near zero for vendor data
- [ ] Tests pass (update tests to use async patterns)

---

### PR-04: Infra — Rate Limiter Degraded Mode
**Priority**: P0 CRITICAL | **Effort**: 2 days | **Parallel**: Yes
**Branch**: `fix/rate-limiter-degraded-mode`

**Scope**:
- `src/lib/middleware/rateLimiter.ts` — Replace `RejectAllStore` with `DegradedInMemoryStore`
- Degraded mode: Allow requests with conservative limits (50 req/min global)
- Log WARNING when running in degraded mode
- Add health check endpoint that reports rate limiter status
- Fix `process.env.VERCEL` direct read (use `getEnv()`)

**Acceptance Criteria**:
- [ ] Missing Redis on Vercel = degraded mode, NOT total rejection
- [ ] Degraded mode logs WARNING on every request
- [ ] Rate limits still enforced (just less precise without Redis)
- [ ] Tests pass

---

### PR-05: Security — Input Sanitization Hardening
**Priority**: P1 HIGH | **Effort**: 2 hours | **Parallel**: Yes
**Branch**: `fix/input-sanitization-hardening`

**Scope**:
- `src/lib/parser/contextBuilder.ts` — Sanitize node labels before LLM context: `sanitizeUserInput(node.label)`
- `src/app/api/llm/route.ts` — Detect API keys in user prompt input (reuse `validateOutputSafety()`)
- Add rate limit to `GET /api/llm` handler
- Add test for indirect prompt injection via node label
- Add test for API key detection in user input

**Acceptance Criteria**:
- [ ] Node labels are sanitized before inclusion in LLM context
- [ ] API keys in user prompts are rejected with bilingual error message
- [ ] GET /api/llm is rate-limited
- [ ] Tests pass

---

### PR-06: Security — Fix minimatch + npm audit
**Priority**: P1 HIGH | **Effort**: 30 min | **Parallel**: Yes
**Branch**: `fix/npm-audit-minimatch`

**Scope**:
- Run `npm audit fix` to patch minimatch ReDoS (GHSA-3ppc-4f35-3m26)
- Verify no breaking changes from dependency updates
- Add explicit CORS headers in `next.config.mjs` (future-proofing)

**Acceptance Criteria**:
- [ ] `npm audit` returns 0 high/critical vulnerabilities
- [ ] Tests pass
- [ ] Build succeeds

---

### PR-07: Test — Recommendation Engine Coverage
**Priority**: P1 HIGH | **Effort**: 4-6 hours | **Parallel**: Yes
**Branch**: `test/recommendation-engine`

**Scope**:
- `src/lib/recommendation/__tests__/matcher.test.ts` — NEW
  - Test `matchVendorProducts()` with various specs
  - Test scoring dimensions (type/role/useCase/compliance)
  - Test edge cases (empty spec, unknown types, no matches)
- `src/lib/recommendation/__tests__/cloudMatcher.test.ts` — NEW
  - Test `matchCloudServices()` across AWS/Azure/GCP
  - Test provider filtering, SLA requirements
- `src/lib/recommendation/__tests__/scorer.test.ts` — NEW
  - Test scoring algorithm weights
  - Test tie-breaking logic

**Acceptance Criteria**:
- [ ] 30+ tests covering matcher, cloudMatcher, scorer
- [ ] Edge cases: empty input, no matches, max results
- [ ] Tests pass

---

### PR-08: Test — Auth Security Coverage
**Priority**: P1 HIGH | **Effort**: 2-3 hours | **Parallel**: Yes
**Branch**: `test/auth-security`

**Scope**:
- `src/lib/auth/__tests__/loginSecurity.test.ts` — NEW
  - Test lockout after 5 failed attempts
  - Test lockout duration (15 min)
  - Test reset on successful login
  - Test graceful degradation when DB fails
  - Test concurrent login attempts
- `src/lib/auth/__tests__/authHelpers.test.ts` — NEW
  - Test `requireAuth()` with valid/invalid/expired sessions
  - Test `requireAdmin()` with user vs admin roles
  - Test demo mode behavior (after PR-01 changes)

**Acceptance Criteria**:
- [ ] 20+ tests covering lockout, auth helpers, edge cases
- [ ] Tests pass

---

### PR-09: Test — LLM Provider Coverage
**Priority**: P1 HIGH | **Effort**: 2 hours | **Parallel**: Yes
**Branch**: `test/llm-providers`

**Scope**:
- `src/lib/llm/__tests__/providers.test.ts` — NEW
  - Test provider selection (Claude vs OpenAI)
  - Test fallback when primary provider unavailable
  - Test API key validation
  - Test error handling for rate limits, timeouts
- `src/lib/llm/__tests__/llmParser.integration.test.ts` — NEW
  - Test knowledge enrichment pipeline
  - Test prompt building with RAG context

**Acceptance Criteria**:
- [ ] 15+ tests covering providers, fallback, errors
- [ ] Mocked API calls (no real LLM calls in tests)
- [ ] Tests pass

---

### PR-10: Infra — Request ID + Audit Trail
**Priority**: P2 MEDIUM | **Effort**: 1 hour | **Parallel**: Yes
**Branch**: `feat/request-id-audit-trail`

**Scope**:
- `src/middleware.ts` — Generate `x-request-id` (UUID) for every request
- `src/lib/utils/logger.ts` — Accept optional requestId parameter
- `src/app/api/llm/route.ts` — Log requestId on all operations
- `src/app/api/admin/rag/*/route.ts` — Log requestId on all operations
- Add `x-request-id` to response headers for client debugging

**Acceptance Criteria**:
- [ ] Every API response includes `x-request-id` header
- [ ] All log lines include request correlation ID
- [ ] Tests pass

---

### PR-11: Refactor — Split Admin RAG Page
**Priority**: P2 MEDIUM | **Effort**: 2-3 hours | **Parallel**: Yes
**Branch**: `refactor/split-admin-rag-page`

**Scope**:
- `src/app/admin/rag/page.tsx` (1,175 lines) → Split into:
  - `src/app/admin/rag/components/TraceViewer.tsx`
  - `src/app/admin/rag/components/IndexingForm.tsx`
  - `src/app/admin/rag/components/HealthStatus.tsx`
  - `src/app/admin/rag/components/CrawlHistory.tsx`
- Keep `page.tsx` as composition root (~100 lines)

**Acceptance Criteria**:
- [ ] No file > 400 lines
- [ ] Same visual behavior
- [ ] Tests pass

---

### PR-12: Refactor — Split Export Modules
**Priority**: P2 MEDIUM | **Effort**: 6-10 hours | **Parallel**: Yes
**Branch**: `refactor/split-export-modules`

**Scope**:
- `src/lib/export/terraformExport.ts` (948 lines) → Split:
  ```
  export/terraform/
  ├── index.ts (entry point, ~150 lines)
  ├── networkResources.ts
  ├── computeResources.ts
  └── securityResources.ts
  ```
- `src/lib/export/kubernetesExport.ts` (1,464 lines) → Split:
  ```
  export/kubernetes/
  ├── index.ts (entry point, ~150 lines)
  ├── deployments.ts
  ├── services.ts
  ├── statefulsets.ts
  └── configmaps.ts
  ```
- Keep all existing exports intact (re-export from index.ts)

**Acceptance Criteria**:
- [ ] No file > 400 lines
- [ ] All existing tests pass without modification
- [ ] All existing imports work (backward compatible)

---

### PR-13: Infra — Extract Configuration
**Priority**: P2 MEDIUM | **Effort**: 3 days | **Parallel**: Yes
**Branch**: `refactor/extract-configuration`

**Scope**:
- Create `src/lib/config/appConfig.ts` — Centralized runtime config
- Extract from LLM route: timeout, retries, max_tokens → env vars
- Extract from RAG: cache TTL, fetch timeout → env vars
- Extract from rate limiter: limit values → env vars with defaults
- Update `.env.example` with new optional vars

**Config Keys**:
```
LLM_TIMEOUT_MS=30000
LLM_MAX_RETRIES=2
LLM_MAX_TOKENS=2048
RAG_CACHE_TTL_HOURS=24
RAG_FETCH_TIMEOUT_MS=10000
RATE_LIMIT_LLM_PER_MIN=10
RATE_LIMIT_LLM_PER_DAY=100
```

**Acceptance Criteria**:
- [ ] All hardcoded values extracted to appConfig
- [ ] Defaults match current behavior
- [ ] Environment variables override defaults
- [ ] Tests pass

---

### PR-14: Perf — Bundle Size Budget + CI Check
**Priority**: P2 MEDIUM | **Effort**: 3 days | **Parallel**: Partially (after PR-03)
**Branch**: `perf/bundle-size-budget`

**Scope**:
- Add `@next/bundle-analyzer` to devDependencies
- Create `scripts/check-bundle-size.sh` — fails if main bundle > 1MB gzipped
- Add to `next.config.mjs`: `optimizePackageImports` for more packages
- Add dynamic imports for heavy components (knowledge graph data)
- Integrate into CI (GitHub Actions or equivalent)

**Acceptance Criteria**:
- [ ] Bundle analyzer reports generated on build
- [ ] Main bundle < 1MB gzipped
- [ ] CI fails if bundle exceeds budget

---

### PR-15: Strategic — LLM Provider Abstraction
**Priority**: P3 MEDIUM | **Effort**: 5-7 days | **Parallel**: Standalone
**Branch**: `feat/llm-provider-abstraction`

**Scope**:
- Create `src/lib/llm/providers/interface.ts` — `LLMProvider` interface
- Create `src/lib/llm/providers/anthropic.ts` — Anthropic implementation
- Create `src/lib/llm/providers/openai.ts` — OpenAI implementation
- Create `src/lib/llm/providers/registry.ts` — Provider registry with fallback chain
- Update `src/app/api/llm/route.ts` — Use provider registry
- Add cost tracking per request (token count × price)
- Future: Add Ollama, vLLM providers for self-hosted

**Acceptance Criteria**:
- [ ] Provider interface abstracts API differences
- [ ] Fallback chain: Primary → Secondary → Error
- [ ] Cost tracking logged per request
- [ ] Tests pass

---

### PR-16: Strategic — Vendor Product Enrichment Automation
**Priority**: P3 LOW | **Effort**: 10-15 days | **Parallel**: After PR-03
**Branch**: `feat/vendor-enrichment-automation`

**Scope**:
- Enhance `.claude/agents/vendor-catalog-crawler.md` with enrichment workflow
- Create `scripts/enrich-vendor-batch.ts` — batch enrichment runner
- Define enrichment priority: top 100 products by recommendation frequency
- Add `lastEnriched` timestamp to product metadata
- Add quality gate check: reject products missing VC-009 fields

**Acceptance Criteria**:
- [ ] Enrichment workflow documented and scripted
- [ ] Top 100 products enriched (from 40 → 140)
- [ ] Quality gate prevents stub products from being recommended
- [ ] Tests pass

---

### PR-17: Strategic — Playwright E2E Tests
**Priority**: P3 LOW | **Effort**: 2-3 days | **Parallel**: Standalone
**Branch**: `test/playwright-e2e`

**Scope**:
- `tests/e2e/prompt-to-diagram.spec.ts` — Enter prompt → verify diagram appears
- `tests/e2e/template-selection.spec.ts` — Select template → verify nodes/edges
- `tests/e2e/export-terraform.spec.ts` — Create diagram → export → verify output
- `tests/e2e/admin-login.spec.ts` — Login → access admin → verify protected
- `tests/e2e/vendor-comparison.spec.ts` — Open comparison → search → compare

**Acceptance Criteria**:
- [ ] 5 E2E tests covering critical user flows
- [ ] Playwright runs in CI
- [ ] Tests pass against dev server

---

### PR-18: Strategic — Embedded Vector Store Fallback
**Priority**: P3 LOW | **Effort**: 5-7 days | **Parallel**: Standalone
**Branch**: `feat/embedded-vector-fallback`

**Scope**:
- Add `hnswlib-node` or `faiss-node` as optional dependency
- Create `src/lib/rag/embeddedStore.ts` — Local vector store implementation
- Update `src/lib/rag/retriever.ts` — Fallback chain: ChromaDB → Embedded → Keyword
- Pre-compute embeddings for knowledge graph at build time
- Store embeddings as JSON in `src/lib/rag/data/embeddings.json`

**Acceptance Criteria**:
- [ ] RAG works offline (without ChromaDB) using embedded vectors
- [ ] Search quality comparable to ChromaDB for built-in knowledge
- [ ] Tests pass

---

## 7.1 PR Execution Timeline

```
                    Week 1          Week 2          Week 3          Week 4+
                    ──────          ──────          ──────          ──────
PR-01 (demo auth)   ██░░░░░░
PR-02 (secret+sess) █░░░░░░░
PR-03 (async catalog)████████████████
PR-04 (rate limiter) ████████
PR-05 (input sanit)  ██░░░░░░
PR-06 (npm audit)    █░░░░░░░
PR-07 (test recom)               ████████
PR-08 (test auth)                ████░░░░
PR-09 (test llm)                 ███░░░░░
PR-10 (request id)               ██░░░░░░
PR-11 (split rag pg)                         ████░░░░
PR-12 (split export)                         ████████████
PR-13 (config extract)                       ████████████
PR-14 (bundle budget)                                        ████████████
PR-15 (llm abstract)                                         ████████████████
PR-16 (enrichment)                                           ████████████████████
PR-17 (playwright)                                           ████████████
PR-18 (vector fallbk)                                        ████████████████
```

### Parallel Groups

**Group A (Week 1) — 6 PRs, all independent**:
- PR-01, PR-02, PR-03, PR-04, PR-05, PR-06

**Group B (Week 2) — 4 PRs, all independent**:
- PR-07, PR-08, PR-09, PR-10

**Group C (Week 3) — 3 PRs, mostly independent**:
- PR-11, PR-12, PR-13

**Group D (Week 4+) — 5 PRs, some dependencies**:
- PR-14 (after PR-03)
- PR-15, PR-16 (after PR-03)
- PR-17, PR-18 (standalone)

---

## 8. Appendix

### 8.1 Files Most Frequently Referenced

| File | References | Context |
|------|-----------|---------|
| `src/lib/knowledge/vendorCatalog/index.ts` | Audit, Pessimist | Memory bloat, 1100+ products |
| `src/app/api/llm/route.ts` | All 4 agents | LLM pipeline, security, config |
| `src/lib/middleware/rateLimiter.ts` | Audit, Pessimist, Security | Fail-closed, Redis dependency |
| `src/lib/auth/authHelpers.ts` | Security | Demo mode bypass |
| `src/lib/config/env.ts` | Security | NEXTAUTH_SECRET optional |
| `src/lib/rag/chromaClient.ts` | Pessimist, Optimist | External dependency risk |
| `src/lib/knowledge/types.ts` | Pessimist | Confidence scores |
| `package.json` | All 4 agents | Dependencies, versions |
| `next.config.mjs` | Audit, Security | Headers, bundle optimization |
| `src/middleware.ts` | Security | Auth, CSP, HTTPS |

### 8.2 Test Count Breakdown

| Area | Test Files | Approx Tests |
|------|-----------|-------------|
| Knowledge graph (relationships, patterns, antipatterns) | 17 | ~1,200 |
| Vendor catalogs (22 vendors) | 22 | ~2,200 |
| RAG pipeline | 13 | ~400 |
| Parser | 15+ | ~600 |
| Export (Terraform, K8s) | 6 | ~313 |
| Cloud catalog | 3 | ~300 |
| API routes | 12 | ~250 |
| Consulting | 5 | ~200 |
| Components | 10+ | ~300 |
| Other | 96+ | ~544 |
| **Total** | **199** | **~6,309** |

### 8.3 Agent Report Locations

| Agent | Output File |
|-------|------------|
| Explore (Audit) | Agent output — summarized in Section 2 |
| Pessimist | Agent output — summarized in Section 3 |
| Optimist | Agent output — summarized in Section 4 |
| Security | `docs/plans/2026-02-25-security-review.md` (732 lines) |

---

> **Next Steps**: A new Claude session can pick up this document and execute PRs in the specified parallel groups. Start with Group A (PR-01 through PR-06) — all 6 can run simultaneously.
