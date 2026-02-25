# Deep Research 보고서 통합 — 구현 플랜

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** GPT Deep Research 보고서에서 도출된 7개 기능을 InfraFlow에 통합하여 답변 품질·신뢰·UX를 강화한다.

**Architecture:** 3-phase 구현. Phase 1(기반): Input Safety + Project Profile + Reference Box. Phase 2(핵심): Persona + Assumption Checker + Structured Response. Phase 3(확장): Cost Sensitivity. 모든 기능은 optional/graceful degradation으로 기존 동작을 깨트리지 않는다.

**Tech Stack:** TypeScript strict, vitest (happy-dom), React 19, Next.js App Router, Zod, framer-motion, localStorage, 기존 TraceCollector/PostVerifier/enrichContext 파이프라인 재활용.

**Design Doc:** `docs/plans/2026-02-25-deep-research-integration-design.md`

---

## Phase 1: 기반 (Input Safety → Project Profile → Reference Box)

---

### Task 1: Input Safety — 타입 및 공통 패턴 추출

**Files:**
- Create: `src/lib/security/patterns.ts`
- Modify: `src/lib/security/llmSecurityControls.ts:118-136` (패턴 분리)
- Test: `src/lib/security/__tests__/patterns.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/security/__tests__/patterns.test.ts
import { describe, it, expect } from 'vitest';
import { CREDENTIAL_PATTERNS, PII_PATTERNS, matchPatterns } from '../patterns';

describe('Security Patterns', () => {
  describe('CREDENTIAL_PATTERNS', () => {
    it('detects AWS access key', () => {
      const result = matchPatterns('my key is AKIAIOSFODNN7EXAMPLE');
      expect(result.some(r => r.type === 'aws-key')).toBe(true);
    });

    it('detects OpenAI API key', () => {
      const result = matchPatterns('sk-proj-abc123def456ghi789jkl012mno');
      expect(result.some(r => r.type === 'openai-key')).toBe(true);
    });

    it('detects GitHub PAT', () => {
      const result = matchPatterns('ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh');
      expect(result.some(r => r.type === 'github-pat')).toBe(true);
    });

    it('detects GCP API key', () => {
      const result = matchPatterns('AIzaSyA-abc123_def456-ghi789jkl012mno3');
      expect(result.some(r => r.type === 'gcp-key')).toBe(true);
    });

    it('detects Slack token', () => {
      const result = matchPatterns('xoxb-123456789-abcdefghij');
      expect(result.some(r => r.type === 'slack-token')).toBe(true);
    });
  });

  describe('PII_PATTERNS', () => {
    it('detects password assignment', () => {
      const result = matchPatterns('password=myS3cret!');
      expect(result.some(r => r.type === 'password')).toBe(true);
    });

    it('detects email address', () => {
      const result = matchPatterns('contact user@example.com for info');
      expect(result.some(r => r.type === 'email')).toBe(true);
    });

    it('detects Korean phone number', () => {
      const result = matchPatterns('연락처 010-1234-5678');
      expect(result.some(r => r.type === 'phone-kr')).toBe(true);
    });

    it('detects credit card number', () => {
      const result = matchPatterns('card 4111-1111-1111-1111');
      expect(result.some(r => r.type === 'credit-card')).toBe(true);
    });
  });

  describe('matchPatterns', () => {
    it('returns empty array for safe input', () => {
      expect(matchPatterns('firewall과 WAF를 추가해줘')).toEqual([]);
    });

    it('returns masked snippet', () => {
      const result = matchPatterns('key is sk-proj-abc123def456ghi789jkl012mno');
      expect(result[0].masked).toContain('sk-****');
    });

    it('detects multiple patterns in one string', () => {
      const result = matchPatterns('password=test AKIAIOSFODNN7EXAMPLE');
      expect(result).toHaveLength(2);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/security/__tests__/patterns.test.ts`
Expected: FAIL — module `../patterns` not found

**Step 3: Write minimal implementation**

```typescript
// src/lib/security/patterns.ts
/**
 * Shared security detection patterns.
 *
 * Used by both validateOutputSafety (existing) and validateInputSafety (new).
 * Extracted from llmSecurityControls.ts for reuse.
 */

export interface PatternMatch {
  type: string;
  masked: string;
  location?: 'prompt' | 'profile';
}

interface PatternDef {
  type: string;
  regex: RegExp;
  maskPrefix: string;
}

export const CREDENTIAL_PATTERNS: PatternDef[] = [
  { type: 'aws-key',     regex: /AKIA[0-9A-Z]{16}/g,              maskPrefix: 'AKIA****' },
  { type: 'gcp-key',     regex: /AIza[0-9A-Za-z_-]{35}/g,         maskPrefix: 'AIza****' },
  { type: 'openai-key',  regex: /sk-[a-zA-Z0-9_-]{20,}/g,         maskPrefix: 'sk-****' },
  { type: 'github-pat',  regex: /ghp_[a-zA-Z0-9]{36}/g,           maskPrefix: 'ghp_****' },
  { type: 'slack-token',  regex: /xox[bpors]-[a-zA-Z0-9-]+/g,     maskPrefix: 'xox****' },
];

export const PII_PATTERNS: PatternDef[] = [
  { type: 'password',    regex: /(?:password|passwd|pwd)\s*[=:]\s*\S+/gi,  maskPrefix: 'password=****' },
  { type: 'email',       regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, maskPrefix: '****@****' },
  { type: 'phone-kr',    regex: /01[0-9]-\d{3,4}-\d{4}/g,          maskPrefix: '010-****-****' },
  { type: 'credit-card', regex: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,     maskPrefix: '****-****-****-****' },
];

const ALL_PATTERNS = [...CREDENTIAL_PATTERNS, ...PII_PATTERNS];

export function matchPatterns(input: string): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const pattern of ALL_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(input)) {
      matches.push({
        type: pattern.type,
        masked: pattern.maskPrefix,
      });
    }
  }

  return matches;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/security/__tests__/patterns.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/security/patterns.ts src/lib/security/__tests__/patterns.test.ts
git commit -m "feat(security): extract shared credential+PII detection patterns"
```

---

### Task 2: Input Safety — validateInputSafety 함수

**Files:**
- Create: `src/lib/security/inputSafetyCheck.ts`
- Test: `src/lib/security/__tests__/inputSafetyCheck.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/security/__tests__/inputSafetyCheck.test.ts
import { describe, it, expect } from 'vitest';
import { validateInputSafety } from '../inputSafetyCheck';

describe('validateInputSafety', () => {
  it('returns safe for normal prompt', () => {
    const result = validateInputSafety('firewall과 WAF를 추가해줘', 'prompt');
    expect(result.safe).toBe(true);
    expect(result.detectedPatterns).toEqual([]);
  });

  it('detects API key in prompt', () => {
    const result = validateInputSafety('my key AKIAIOSFODNN7EXAMPLE', 'prompt');
    expect(result.safe).toBe(false);
    expect(result.detectedPatterns[0].type).toBe('aws-key');
    expect(result.detectedPatterns[0].location).toBe('prompt');
  });

  it('detects PII in profile', () => {
    const result = validateInputSafety('user@example.com', 'profile');
    expect(result.safe).toBe(false);
    expect(result.detectedPatterns[0].type).toBe('email');
    expect(result.detectedPatterns[0].location).toBe('profile');
  });

  it('provides bilingual warning message', () => {
    const result = validateInputSafety('password=secret123', 'prompt');
    expect(result.warningMessage).toBeDefined();
    expect(result.warningMessageKo).toBeDefined();
  });

  it('detects multiple issues', () => {
    const result = validateInputSafety('password=test key=AKIAIOSFODNN7EXAMPLE', 'prompt');
    expect(result.safe).toBe(false);
    expect(result.detectedPatterns.length).toBeGreaterThanOrEqual(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/security/__tests__/inputSafetyCheck.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/lib/security/inputSafetyCheck.ts
/**
 * Input-side safety validation.
 *
 * Complements the existing OUTPUT-side validateOutputSafety() in llmSecurityControls.ts.
 * Checks prompts and profile data for credentials and PII before processing.
 */

import { matchPatterns, type PatternMatch } from './patterns';

export interface InputSafetyResult {
  safe: boolean;
  detectedPatterns: PatternMatch[];
  warningMessage?: string;
  warningMessageKo?: string;
}

export function validateInputSafety(
  input: string,
  location: 'prompt' | 'profile',
): InputSafetyResult {
  const matches = matchPatterns(input).map(m => ({ ...m, location }));

  if (matches.length === 0) {
    return { safe: true, detectedPatterns: [] };
  }

  const types = matches.map(m => m.type).join(', ');

  return {
    safe: false,
    detectedPatterns: matches,
    warningMessage: `Sensitive data detected (${types}). Please remove before proceeding.`,
    warningMessageKo: `민감한 정보가 감지되었습니다 (${types}). 제거 후 다시 시도하세요.`,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/security/__tests__/inputSafetyCheck.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/security/inputSafetyCheck.ts src/lib/security/__tests__/inputSafetyCheck.test.ts
git commit -m "feat(security): add input-side safety validation for prompts and profiles"
```

---

### Task 3: Project Profile — 타입 정의 및 Zod 스키마

**Files:**
- Create: `src/types/profile.ts`
- Create: `src/lib/validations/profile.ts`
- Test: `src/lib/validations/__tests__/profile.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/validations/__tests__/profile.test.ts
import { describe, it, expect } from 'vitest';
import { ProjectProfileStoreSchema, validateProfileSafety } from '../profile';
import type { ProjectProfile, ProjectProfileStore } from '@/types/profile';

describe('ProjectProfileStoreSchema', () => {
  it('validates a minimal profile store', () => {
    const store: ProjectProfileStore = {
      version: 1,
      activeProfileId: null,
      profiles: [],
    };
    const result = ProjectProfileStoreSchema.safeParse(store);
    expect(result.success).toBe(true);
  });

  it('validates a store with one profile', () => {
    const store: ProjectProfileStore = {
      version: 1,
      activeProfileId: 'prof-1',
      profiles: [{
        id: 'prof-1',
        name: '금융권 프로젝트',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        industry: 'finance',
        companySize: 'enterprise',
      }],
    };
    const result = ProjectProfileStoreSchema.safeParse(store);
    expect(result.success).toBe(true);
  });

  it('rejects invalid version', () => {
    const store = { version: 99, activeProfileId: null, profiles: [] };
    const result = ProjectProfileStoreSchema.safeParse(store);
    expect(result.success).toBe(false);
  });
});

describe('validateProfileSafety', () => {
  it('passes for safe profile', () => {
    const profile: ProjectProfile = {
      id: 'p1', name: 'Test', createdAt: 0, updatedAt: 0,
      industry: 'finance', companySize: 'enterprise',
    };
    const result = validateProfileSafety(profile);
    expect(result.safe).toBe(true);
  });

  it('fails if name contains API key', () => {
    const profile: ProjectProfile = {
      id: 'p1', name: 'sk-proj-abc123def456ghi789jkl012mno', createdAt: 0, updatedAt: 0,
      industry: 'finance', companySize: 'enterprise',
    };
    const result = validateProfileSafety(profile);
    expect(result.safe).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/validations/__tests__/profile.test.ts`
Expected: FAIL

**Step 3: Write types + validation**

```typescript
// src/types/profile.ts
/**
 * Project Profile types for storing per-project context
 * (industry, scale, SLA, budget, regulations, persona).
 */

export interface PersonaPreset {
  id: string;
  name: string;
  nameKo: string;
  depth: 'summary' | 'standard' | 'detailed';
  focus: 'cost-schedule' | 'security-compliance' | 'operations-sre' | 'learning';
  tone: 'consulting' | 'learning';
}

export interface ProjectProfile {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;

  industry: string;
  companySize: string;
  teamSize?: number;

  slaTarget?: string;
  dataClassification?: string;
  regulations?: string[];
  cloudPreference?: string;

  budgetRange?: { min: number; max: number; currency: string };

  persona?: PersonaPreset;
}

export interface ProjectProfileStore {
  version: 1;
  activeProfileId: string | null;
  profiles: ProjectProfile[];
}
```

```typescript
// src/lib/validations/profile.ts
/**
 * Zod schemas and safety validation for Project Profile.
 */

import { z } from 'zod';
import { validateInputSafety } from '@/lib/security/inputSafetyCheck';
import type { ProjectProfile } from '@/types/profile';

const PersonaPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(),
  depth: z.enum(['summary', 'standard', 'detailed']),
  focus: z.enum(['cost-schedule', 'security-compliance', 'operations-sre', 'learning']),
  tone: z.enum(['consulting', 'learning']),
});

const ProjectProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  createdAt: z.number(),
  updatedAt: z.number(),
  industry: z.string(),
  companySize: z.string(),
  teamSize: z.number().optional(),
  slaTarget: z.string().optional(),
  dataClassification: z.string().optional(),
  regulations: z.array(z.string()).optional(),
  cloudPreference: z.string().optional(),
  budgetRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }).optional(),
  persona: PersonaPresetSchema.optional(),
});

export const ProjectProfileStoreSchema = z.object({
  version: z.literal(1),
  activeProfileId: z.string().nullable(),
  profiles: z.array(ProjectProfileSchema),
});

/** Check all string fields in a profile for sensitive data */
export function validateProfileSafety(profile: ProjectProfile) {
  const allStrings = Object.values(profile)
    .filter((v): v is string => typeof v === 'string')
    .join(' ');

  return validateInputSafety(allStrings, 'profile');
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/validations/__tests__/profile.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/types/profile.ts src/lib/validations/profile.ts src/lib/validations/__tests__/profile.test.ts
git commit -m "feat(profile): add ProjectProfile types and Zod validation with safety check"
```

---

### Task 4: Project Profile — useProjectProfile 훅

**Files:**
- Create: `src/hooks/useProjectProfile.ts`
- Test: `src/hooks/__tests__/useProjectProfile.test.ts`

**Step 1: Write the failing test**

```typescript
// src/hooks/__tests__/useProjectProfile.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectProfile } from '../useProjectProfile';
import type { ProjectProfile } from '@/types/profile';

const makeProfile = (id: string, name: string): ProjectProfile => ({
  id, name, createdAt: Date.now(), updatedAt: Date.now(),
  industry: 'finance', companySize: 'enterprise',
});

describe('useProjectProfile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty state', () => {
    const { result } = renderHook(() => useProjectProfile());
    expect(result.current.profiles).toEqual([]);
    expect(result.current.activeProfile).toBeNull();
  });

  it('creates a profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
    });
    expect(result.current.profiles).toHaveLength(1);
    expect(result.current.profiles[0].name).toBe('금융권');
  });

  it('sets active profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
      result.current.setActiveProfileId('p1');
    });
    expect(result.current.activeProfile?.id).toBe('p1');
  });

  it('updates a profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
      result.current.updateProfile('p1', { name: '보험업' });
    });
    expect(result.current.profiles[0].name).toBe('보험업');
  });

  it('deletes a profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
      result.current.deleteProfile('p1');
    });
    expect(result.current.profiles).toHaveLength(0);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
    });
    const stored = JSON.parse(localStorage.getItem('infraflow-profiles') || '{}');
    expect(stored.profiles).toHaveLength(1);
  });

  it('exports profiles as JSON', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
    });
    const json = result.current.exportJSON();
    expect(json).toContain('"version":1');
    expect(json).toContain('금융권');
  });

  it('imports profiles from JSON', () => {
    const { result } = renderHook(() => useProjectProfile());
    const json = JSON.stringify({
      version: 1,
      activeProfileId: 'p1',
      profiles: [makeProfile('p1', 'Imported')],
    });
    act(() => {
      const importResult = result.current.importJSON(json);
      expect(importResult.success).toBe(true);
    });
    expect(result.current.profiles).toHaveLength(1);
    expect(result.current.profiles[0].name).toBe('Imported');
  });

  it('rejects import with sensitive data', () => {
    const { result } = renderHook(() => useProjectProfile());
    const json = JSON.stringify({
      version: 1,
      activeProfileId: null,
      profiles: [makeProfile('p1', 'sk-proj-abc123def456ghi789jkl012mno')],
    });
    act(() => {
      const importResult = result.current.importJSON(json);
      expect(importResult.success).toBe(false);
    });
  });

  it('rejects profile creation with sensitive data', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      const createResult = result.current.createProfile(
        makeProfile('p1', 'password=secret123')
      );
      expect(createResult.success).toBe(false);
    });
    expect(result.current.profiles).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useProjectProfile.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/hooks/useProjectProfile.ts
'use client';

/**
 * Hook for managing project profiles with localStorage persistence.
 *
 * Supports N profiles per user, Export/Import JSON, and safety validation.
 */

import { useState, useCallback, useEffect } from 'react';
import type { ProjectProfile, ProjectProfileStore } from '@/types/profile';
import { ProjectProfileStoreSchema, validateProfileSafety } from '@/lib/validations/profile';

const STORAGE_KEY = 'infraflow-profiles';

const EMPTY_STORE: ProjectProfileStore = {
  version: 1,
  activeProfileId: null,
  profiles: [],
};

function loadStore(): ProjectProfileStore {
  if (typeof window === 'undefined') return EMPTY_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = ProjectProfileStoreSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_STORE;
  } catch {
    return EMPTY_STORE;
  }
}

function saveStore(store: ProjectProfileStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

interface MutationResult {
  success: boolean;
  error?: string;
}

export function useProjectProfile() {
  const [store, setStore] = useState<ProjectProfileStore>(EMPTY_STORE);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const persist = useCallback((next: ProjectProfileStore) => {
    setStore(next);
    saveStore(next);
  }, []);

  const createProfile = useCallback((profile: ProjectProfile): MutationResult => {
    const safety = validateProfileSafety(profile);
    if (!safety.safe) {
      return { success: false, error: safety.warningMessageKo };
    }
    persist({
      ...store,
      profiles: [...store.profiles, profile],
    });
    return { success: true };
  }, [store, persist]);

  const updateProfile = useCallback((id: string, patch: Partial<ProjectProfile>) => {
    persist({
      ...store,
      profiles: store.profiles.map(p =>
        p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
      ),
    });
  }, [store, persist]);

  const deleteProfile = useCallback((id: string) => {
    persist({
      ...store,
      activeProfileId: store.activeProfileId === id ? null : store.activeProfileId,
      profiles: store.profiles.filter(p => p.id !== id),
    });
  }, [store, persist]);

  const setActiveProfileId = useCallback((id: string | null) => {
    persist({ ...store, activeProfileId: id });
  }, [store, persist]);

  const activeProfile = store.profiles.find(p => p.id === store.activeProfileId) ?? null;

  const exportJSON = useCallback((): string => {
    return JSON.stringify(store, null, 2);
  }, [store]);

  const importJSON = useCallback((json: string): MutationResult => {
    try {
      const parsed = ProjectProfileStoreSchema.safeParse(JSON.parse(json));
      if (!parsed.success) {
        return { success: false, error: 'Invalid profile format' };
      }
      // Safety check all profiles
      for (const profile of parsed.data.profiles) {
        const safety = validateProfileSafety(profile);
        if (!safety.safe) {
          return { success: false, error: safety.warningMessageKo };
        }
      }
      persist(parsed.data);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to parse JSON' };
    }
  }, [persist]);

  return {
    profiles: store.profiles,
    activeProfile,
    activeProfileId: store.activeProfileId,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfileId,
    exportJSON,
    importJSON,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useProjectProfile.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/hooks/useProjectProfile.ts src/hooks/__tests__/useProjectProfile.test.ts
git commit -m "feat(profile): add useProjectProfile hook with localStorage, Export/Import, safety"
```

---

### Task 5: Reference Box — SourceAggregator

**Files:**
- Create: `src/lib/rag/sourceAggregator.ts`
- Test: `src/lib/rag/__tests__/sourceAggregator.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/rag/__tests__/sourceAggregator.test.ts
import { describe, it, expect } from 'vitest';
import { aggregateSources, type AggregatedSource } from '../sourceAggregator';
import type { TracedDocument, TracedRelationship } from '../types';

const makeDoc = (id: string, score: number, category: string = 'security'): TracedDocument => ({
  id, collection: 'test', score, title: `Doc ${id}`, category,
});

const makeRel = (id: string, source: string, target: string): TracedRelationship => ({
  id, source, target, type: 'requires', confidence: 0.9, reasonKo: '필수',
});

describe('aggregateSources', () => {
  it('deduplicates by document id', () => {
    const docs = [makeDoc('d1', 0.9), makeDoc('d1', 0.8), makeDoc('d2', 0.7)];
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources).toHaveLength(2);
  });

  it('ranks by score (highest first)', () => {
    const docs = [makeDoc('d1', 0.5), makeDoc('d2', 0.9), makeDoc('d3', 0.7)];
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources[0].id).toBe('d2');
  });

  it('limits to default max (7)', () => {
    const docs = Array.from({ length: 15 }, (_, i) => makeDoc(`d${i}`, 0.9 - i * 0.01));
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources.length).toBeLessThanOrEqual(7);
  });

  it('respects custom limit', () => {
    const docs = Array.from({ length: 10 }, (_, i) => makeDoc(`d${i}`, 0.9));
    const result = aggregateSources({ documents: docs, relationships: [] }, { limit: 3 });
    expect(result.sources).toHaveLength(3);
  });

  it('tags usedInSteps based on collection', () => {
    const docs = [
      { ...makeDoc('d1', 0.9), collection: 'PRODUCT_INTELLIGENCE' },
      { ...makeDoc('d2', 0.8), collection: 'EXTERNAL_CONTENT' },
    ];
    const result = aggregateSources({ documents: docs, relationships: [] });
    expect(result.sources[0].usedInSteps).toContain('rag');
    expect(result.sources[1].usedInSteps).toContain('live-augment');
  });

  it('includes verification badge from score', () => {
    const result = aggregateSources(
      { documents: [makeDoc('d1', 0.9)], relationships: [] },
      { verificationScore: 85 },
    );
    expect(result.verificationBadge).toBe('pass');
  });

  it('sets warning badge for low score', () => {
    const result = aggregateSources(
      { documents: [], relationships: [] },
      { verificationScore: 55 },
    );
    expect(result.verificationBadge).toBe('warning');
  });

  it('sets fail badge for very low score', () => {
    const result = aggregateSources(
      { documents: [], relationships: [] },
      { verificationScore: 30 },
    );
    expect(result.verificationBadge).toBe('fail');
  });

  it('includes patternsMatched from relationships', () => {
    const rels = [makeRel('r1', 'firewall', 'waf'), makeRel('r2', 'waf', 'load-balancer')];
    const result = aggregateSources({ documents: [], relationships: rels });
    expect(result.patternsMatched.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/rag/__tests__/sourceAggregator.test.ts`
Expected: FAIL

**Step 3: Write minimal implementation**

```typescript
// src/lib/rag/sourceAggregator.ts
/**
 * Answer-level Source Aggregator
 *
 * Transforms raw TracedDocuments + TracedRelationships from the
 * TraceCollector into a deduplicated, ranked, limited set of
 * AggregatedSources for the ReferenceBox UI.
 */

import type { TracedDocument, TracedRelationship } from './types';

export interface AggregatedSource {
  id: string;
  title: string;
  category: string;
  score: number;
  collection: string;
  usedInSteps: ('rag' | 'enrichment' | 'verify' | 'live-augment')[];
}

export interface AnswerEvidence {
  sources: AggregatedSource[];
  verificationBadge: 'pass' | 'warning' | 'fail';
  verificationScore: number;
  openIssues: string[];
  patternsMatched: string[];
}

interface AggregateInput {
  documents: TracedDocument[];
  relationships: TracedRelationship[];
}

interface AggregateOptions {
  limit?: number;
  verificationScore?: number;
  openIssues?: string[];
}

const DEFAULT_LIMIT = 7;

function inferSteps(collection: string): AggregatedSource['usedInSteps'] {
  if (collection === 'EXTERNAL_CONTENT') return ['live-augment'];
  return ['rag'];
}

function scoreToBadge(score: number): 'pass' | 'warning' | 'fail' {
  if (score >= 70) return 'pass';
  if (score >= 50) return 'warning';
  return 'fail';
}

export function aggregateSources(
  input: AggregateInput,
  options: AggregateOptions = {},
): AnswerEvidence {
  const { limit = DEFAULT_LIMIT, verificationScore = 100, openIssues = [] } = options;

  // Dedupe by id
  const seen = new Set<string>();
  const unique: TracedDocument[] = [];
  for (const doc of input.documents) {
    if (!seen.has(doc.id)) {
      seen.add(doc.id);
      unique.push(doc);
    }
  }

  // Rank by score (descending)
  unique.sort((a, b) => b.score - a.score);

  // Limit
  const limited = unique.slice(0, limit);

  // Convert
  const sources: AggregatedSource[] = limited.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    score: doc.score,
    collection: doc.collection,
    usedInSteps: inferSteps(doc.collection),
  }));

  // Extract pattern names from relationship types
  const patternsMatched = [...new Set(input.relationships.map(r => `${r.source}→${r.target}`))];

  return {
    sources,
    verificationBadge: scoreToBadge(verificationScore),
    verificationScore,
    openIssues,
    patternsMatched,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/rag/__tests__/sourceAggregator.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/rag/sourceAggregator.ts src/lib/rag/__tests__/sourceAggregator.test.ts
git commit -m "feat(rag): add SourceAggregator with dedupe, rank, limit, verification badge"
```

---

### Task 6: Reference Box — AnswerEvidence를 LLM API에 연결

**Files:**
- Modify: `src/lib/rag/traceCollector.ts:132-142` (buildSummary 확장)
- Modify: `src/app/api/llm/route.ts:489-510` (answerEvidence 포함)
- Modify: `src/lib/llm/llmParser.ts:13-29` (LLMParseResult에 answerEvidence 추가)
- Modify: `src/hooks/usePromptParser.ts:15-49` (ParseResultInfo에 answerEvidence 추가)
- Modify: `src/hooks/useLocalParser.ts` (answerEvidence 전달)
- Test: `src/lib/rag/__tests__/traceCollector.test.ts` (기존 테스트 확장)

**Step 1: Extend TraceCollector to build AnswerEvidence**

`traceCollector.ts`의 `buildSummary()` 메서드 아래에 `buildEvidence()` 추가:

```typescript
// traceCollector.ts — 새 메서드 추가 (buildSummary 아래)
import { aggregateSources, type AnswerEvidence } from './sourceAggregator';

/** Produce answer-level evidence for the ReferenceBox */
buildEvidence(verificationScore?: number): AnswerEvidence {
  return aggregateSources(
    {
      documents: this.trace.ragSearch.documents,
      relationships: this.trace.enrichment.relationshipsMatched,
    },
    {
      verificationScore: verificationScore ?? 100,
      openIssues: [],
    },
  );
}
```

**Step 2: Add answerEvidence to ParseResultInfo**

`usePromptParser.ts` ParseResultInfo 인터페이스에 추가:

```typescript
/** Answer-level evidence for ReferenceBox (sources, badge, patterns) */
answerEvidence?: AnswerEvidence | null;
```

**Step 3: Add answerEvidence to LLMParseResult**

`llmParser.ts` LLMParseResult 인터페이스에 추가:

```typescript
answerEvidence?: AnswerEvidence | null;
```

`parseWithLLM()` 함수에서 API 응답의 `answerEvidence`를 캡처:

```typescript
answerEvidence: data.answerEvidence ?? null,
```

**Step 4: LLM route에서 answerEvidence 포함**

`route.ts`의 POST 핸들러에서, LLM 호출 성공 시:

```typescript
// TraceCollector가 있는 경우 (향후 통합 시)
// 현재는 answerEvidence를 빈 기본값으로 포함
```

> Note: 현재 route.ts에 TraceCollector가 직접 통합되어 있지 않아, 이 Task에서는 타입 연결만 하고, 실제 TraceCollector→AnswerEvidence 연결은 Phase 2에서 StructuredResponse와 함께 완성한다.

**Step 5: useLocalParser에서 answerEvidence 전달**

`useLocalParser.ts`에서 LLM 결과를 applySpec할 때:

```typescript
answerEvidence: llmResult.answerEvidence,
```

**Step 6: Run all tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 전체 통과 (타입 변경이 optional이므로 하위 호환)

**Step 7: Commit**

```bash
git add src/lib/rag/traceCollector.ts src/hooks/usePromptParser.ts src/lib/llm/llmParser.ts src/app/api/llm/route.ts src/hooks/useLocalParser.ts
git commit -m "feat(rag): wire AnswerEvidence through LLM pipeline to ParseResultInfo"
```

---

### Task 7: Reference Box — ReferenceBox UI 컴포넌트

**Files:**
- Create: `src/components/panels/ReferenceBox.tsx`
- Test: `src/components/panels/__tests__/ReferenceBox.test.tsx`
- Modify: `src/components/panels/PromptPanel.tsx` (ReferenceBox 삽입)

**Step 1: Write the failing test**

```typescript
// src/components/panels/__tests__/ReferenceBox.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReferenceBox } from '../ReferenceBox';
import type { AnswerEvidence } from '@/lib/rag/sourceAggregator';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children as React.ReactNode}</div>;
    },
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockEvidence: AnswerEvidence = {
  sources: [
    { id: 's1', title: 'AWS Well-Architected', category: 'cloud', score: 0.95, collection: 'PI', usedInSteps: ['rag'] },
    { id: 's2', title: 'OWASP Top 10', category: 'security', score: 0.9, collection: 'PI', usedInSteps: ['rag', 'verify'] },
    { id: 's3', title: 'Cisco Firewall Guide', category: 'vendor', score: 0.8, collection: 'PI', usedInSteps: ['enrichment'] },
  ],
  verificationBadge: 'pass',
  verificationScore: 85,
  openIssues: [],
  patternsMatched: ['firewall→waf'],
};

describe('ReferenceBox', () => {
  it('renders collapsed summary by default', () => {
    render(<ReferenceBox evidence={mockEvidence} />);
    expect(screen.getByText(/참조 출처/)).toBeDefined();
    expect(screen.getByText(/3/)).toBeDefined(); // source count
    expect(screen.getByText(/PASS/i)).toBeDefined();
  });

  it('expands on click to show source list', () => {
    render(<ReferenceBox evidence={mockEvidence} />);
    fireEvent.click(screen.getByText(/참조 출처/));
    expect(screen.getByText('AWS Well-Architected')).toBeDefined();
    expect(screen.getByText('OWASP Top 10')).toBeDefined();
    expect(screen.getByText('Cisco Firewall Guide')).toBeDefined();
  });

  it('shows usedInSteps tags', () => {
    render(<ReferenceBox evidence={mockEvidence} />);
    fireEvent.click(screen.getByText(/참조 출처/));
    expect(screen.getByText('rag')).toBeDefined();
  });

  it('shows warning badge when verification is warning', () => {
    const warningEvidence = { ...mockEvidence, verificationBadge: 'warning' as const, verificationScore: 55 };
    render(<ReferenceBox evidence={warningEvidence} />);
    expect(screen.getByText(/WARNING/i)).toBeDefined();
  });

  it('calls onOpenEvidence when "자세히 보기" clicked', () => {
    const onOpen = vi.fn();
    render(<ReferenceBox evidence={mockEvidence} onOpenEvidence={onOpen} />);
    fireEvent.click(screen.getByText(/참조 출처/));
    fireEvent.click(screen.getByText(/자세히 보기/));
    expect(onOpen).toHaveBeenCalled();
  });

  it('renders nothing when evidence is null', () => {
    const { container } = render(<ReferenceBox evidence={null} />);
    expect(container.firstChild).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/panels/__tests__/ReferenceBox.test.tsx`
Expected: FAIL

**Step 3: Write the component**

```typescript
// src/components/panels/ReferenceBox.tsx
'use client';

/**
 * Inline Reference Box — collapsed summary with expandable source list.
 *
 * Shows "▸ 참조 출처 (N) · 검증 PASS · 경고 M" in collapsed state.
 * Expands to show aggregated sources with usedInSteps tags.
 * "자세히 보기" opens the full EvidencePanel.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnswerEvidence } from '@/lib/rag/sourceAggregator';

interface ReferenceBoxProps {
  evidence: AnswerEvidence | null;
  onOpenEvidence?: () => void;
}

const BADGE_STYLES = {
  pass: 'bg-emerald-500/20 text-emerald-300',
  warning: 'bg-amber-500/20 text-amber-300',
  fail: 'bg-red-500/20 text-red-300',
};

const BADGE_LABELS = { pass: 'PASS', warning: 'WARNING', fail: 'FAIL' };

const STEP_COLORS: Record<string, string> = {
  rag: 'bg-blue-500/20 text-blue-300',
  enrichment: 'bg-emerald-500/20 text-emerald-300',
  verify: 'bg-purple-500/20 text-purple-300',
  'live-augment': 'bg-orange-500/20 text-orange-300',
};

export function ReferenceBox({ evidence, onOpenEvidence }: ReferenceBoxProps) {
  const [expanded, setExpanded] = useState(false);

  if (!evidence) return null;

  const { sources, verificationBadge, openIssues } = evidence;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-3"
    >
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-zinc-700/50 hover:bg-zinc-700/70 rounded-xl border border-zinc-600/50 transition-colors"
      >
        <span className="text-zinc-400">{expanded ? '▾' : '▸'}</span>
        <span className="text-zinc-300">참조 출처</span>
        <span className="px-1.5 py-0.5 rounded-full bg-zinc-600 text-zinc-300">{sources.length}</span>
        <span className="text-zinc-600">·</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${BADGE_STYLES[verificationBadge]}`}>
          검증 {BADGE_LABELS[verificationBadge]}
        </span>
        {openIssues.length > 0 && (
          <>
            <span className="text-zinc-600">·</span>
            <span className="text-amber-400">경고 {openIssues.length}</span>
          </>
        )}
        <span className="ml-auto text-zinc-500">References</span>
      </button>

      {/* Expanded source list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 space-y-1"
          >
            {sources.map((src) => (
              <div
                key={src.id}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg border border-white/5 text-xs"
              >
                <span className="text-zinc-300 flex-1 truncate">{src.title}</span>
                <span className="text-[10px] text-zinc-500">{(src.score * 100).toFixed(0)}%</span>
                <div className="flex gap-1">
                  {src.usedInSteps.map((step) => (
                    <span
                      key={step}
                      className={`text-[9px] px-1 py-0.5 rounded ${STEP_COLORS[step] ?? 'bg-zinc-600 text-zinc-400'}`}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {onOpenEvidence && (
              <button
                onClick={onOpenEvidence}
                className="w-full text-center text-[10px] text-emerald-400/70 hover:text-emerald-400 py-1.5 transition-colors"
              >
                자세히 보기 / View Details →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/panels/__tests__/ReferenceBox.test.tsx`
Expected: ALL PASS

**Step 5: Integrate into PromptPanel**

`src/components/panels/PromptPanel.tsx` — PromptPanelProps에 `answerEvidence` 추가하고, AI 응답 영역과 입력 영역 사이에 ReferenceBox 삽입:

```typescript
// PromptPanelProps에 추가:
answerEvidence?: AnswerEvidence | null;
onOpenEvidence?: () => void;

// Routing Decision Display의 </AnimatePresence> 뒤에 삽입:
{answerEvidence && (
  <ReferenceBox evidence={answerEvidence} onOpenEvidence={onOpenEvidence} />
)}
```

**Step 6: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 전체 통과

**Step 7: Commit**

```bash
git add src/components/panels/ReferenceBox.tsx src/components/panels/__tests__/ReferenceBox.test.tsx src/components/panels/PromptPanel.tsx
git commit -m "feat(ui): add ReferenceBox component with collapsed/expanded source list"
```

---

## Phase 2: 핵심 (Persona → Assumption Checker → Structured Response)

---

### Task 8: Persona — PERSONA_PRESETS + buildPersonaInstruction

**Files:**
- Add to: `src/types/profile.ts` (PersonaPreset는 Task 3에서 이미 정의됨)
- Create: `src/lib/llm/personaInstruction.ts`
- Test: `src/lib/llm/__tests__/personaInstruction.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/llm/__tests__/personaInstruction.test.ts
import { describe, it, expect } from 'vitest';
import { PERSONA_PRESETS, buildPersonaInstruction } from '../personaInstruction';

describe('PERSONA_PRESETS', () => {
  it('has 10 presets matching P1-P10', () => {
    expect(PERSONA_PRESETS).toHaveLength(10);
  });

  it('each preset has all required fields', () => {
    for (const preset of PERSONA_PRESETS) {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.nameKo).toBeDefined();
      expect(['summary', 'standard', 'detailed']).toContain(preset.depth);
      expect(['cost-schedule', 'security-compliance', 'operations-sre', 'learning']).toContain(preset.focus);
      expect(['consulting', 'learning']).toContain(preset.tone);
    }
  });
});

describe('buildPersonaInstruction', () => {
  it('returns empty string for undefined persona', () => {
    expect(buildPersonaInstruction(undefined)).toBe('');
  });

  it('includes depth instruction for CTO', () => {
    const cto = PERSONA_PRESETS.find(p => p.id === 'p1-cto')!;
    const instruction = buildPersonaInstruction(cto);
    expect(instruction).toContain('Depth');
    expect(instruction).toContain('standard');
  });

  it('includes security focus for CISO', () => {
    const ciso = PERSONA_PRESETS.find(p => p.id === 'p5-security')!;
    const instruction = buildPersonaInstruction(ciso);
    expect(instruction).toContain('보안');
  });

  it('includes learning tone for student', () => {
    const student = PERSONA_PRESETS.find(p => p.id === 'p8-student')!;
    const instruction = buildPersonaInstruction(student);
    expect(instruction).toContain('교육');
  });

  it('always includes the IMPORTANT guard clause', () => {
    const cto = PERSONA_PRESETS.find(p => p.id === 'p1-cto')!;
    const instruction = buildPersonaInstruction(cto);
    expect(instruction).toContain('Facts');
    expect(instruction).toContain('do NOT change');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/llm/__tests__/personaInstruction.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/lib/llm/personaInstruction.ts
/**
 * Persona-based system prompt adaptation.
 *
 * Changes ONLY emphasis, depth, and terminology.
 * Facts, architecture, and recommendations are NEVER altered.
 */

import type { PersonaPreset } from '@/types/profile';

export const PERSONA_PRESETS: PersonaPreset[] = [
  { id: 'p1-cto',         name: 'Startup CTO',      nameKo: '스타트업 CTO',      depth: 'standard', focus: 'cost-schedule',       tone: 'consulting' },
  { id: 'p2-consultant',  name: 'SI Consultant',     nameKo: 'SI 컨설턴트',       depth: 'detailed', focus: 'cost-schedule',       tone: 'consulting' },
  { id: 'p3-it-manager',  name: 'SMB IT Manager',    nameKo: '중소기업 IT관리자',  depth: 'standard', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p4-architect',   name: 'Cloud Architect',   nameKo: '클라우드 아키텍트',  depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p5-security',    name: 'Security/CISO',     nameKo: '보안/CISO',         depth: 'detailed', focus: 'security-compliance', tone: 'consulting' },
  { id: 'p6-ai-ml',       name: 'AI/ML Engineer',    nameKo: 'AI/ML 엔지니어',    depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p7-sre',         name: 'DevOps/SRE',        nameKo: 'DevOps/SRE',        depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p8-student',     name: 'Student/Educator',  nameKo: '학생/교육자',        depth: 'standard', focus: 'learning',            tone: 'learning'   },
  { id: 'p9-public',      name: 'Public Sector',     nameKo: '공공기관',           depth: 'standard', focus: 'security-compliance', tone: 'consulting' },
  { id: 'p10-msp',        name: 'MSP/Reseller',      nameKo: 'MSP/리셀러',        depth: 'standard', focus: 'cost-schedule',       tone: 'consulting' },
];

const DEPTH_MAP: Record<string, string> = {
  summary: '핵심만 간결하게. 3~5줄 요약 중심.',
  standard: '표준 깊이. 요약 + 핵심 설명 + 다음 단계.',
  detailed: '상세 분석. 트레이드오프, 대안, 운영 고려사항 포함.',
};

const FOCUS_MAP: Record<string, string> = {
  'cost-schedule': '비용과 일정을 최우선으로 강조.',
  'security-compliance': '보안 통제, 컴플라이언스 증빙, 위험 분석을 최우선으로.',
  'operations-sre': '운영 안정성, 관측성, 장애 대응을 최우선으로.',
  learning: '개념 설명 중심. 용어를 풀어서 설명하고 예시를 많이 사용.',
};

const TONE_MAP: Record<string, string> = {
  consulting: '전문 컨설턴트 톤. 근거 기반, 비교 분석 중심.',
  learning: '교육자 톤. 친절하게, 단계적으로, 배경지식 없어도 이해 가능하게.',
};

export function buildPersonaInstruction(persona: PersonaPreset | undefined): string {
  if (!persona) return '';

  return `\n\n[Response Style]
- Depth: ${DEPTH_MAP[persona.depth]}
- Focus: ${FOCUS_MAP[persona.focus]}
- Tone: ${TONE_MAP[persona.tone]}
- IMPORTANT: Facts, architecture, and recommendations do NOT change based on persona. Only emphasis, depth, and terminology change.`;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/llm/__tests__/personaInstruction.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/llm/personaInstruction.ts src/lib/llm/__tests__/personaInstruction.test.ts
git commit -m "feat(persona): add PERSONA_PRESETS and buildPersonaInstruction for 3-axis adaptation"
```

---

### Task 9: Assumption Checker — requiredAssumptions 테이블 + 체커 로직

**Files:**
- Create: `src/lib/knowledge/assumptions.ts`
- Create: `src/lib/knowledge/assumptionChecker.ts`
- Test: `src/lib/knowledge/__tests__/assumptionChecker.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/knowledge/__tests__/assumptionChecker.test.ts
import { describe, it, expect } from 'vitest';
import { checkAssumptions, REQUIRED_ASSUMPTIONS } from '../assumptionChecker';
import type { ProjectProfile } from '@/types/profile';

const makeProfile = (overrides: Partial<ProjectProfile> = {}): ProjectProfile => ({
  id: 'p1', name: 'Test', createdAt: 0, updatedAt: 0,
  industry: 'finance', companySize: 'enterprise',
  ...overrides,
});

describe('REQUIRED_ASSUMPTIONS', () => {
  it('has assumptions for db-server', () => {
    expect(REQUIRED_ASSUMPTIONS['db-server']).toBeDefined();
    expect(REQUIRED_ASSUMPTIONS['db-server'].length).toBeGreaterThan(0);
  });

  it('has assumptions for waf', () => {
    expect(REQUIRED_ASSUMPTIONS['waf']).toBeDefined();
  });

  it('each assumption has required fields', () => {
    for (const [, defs] of Object.entries(REQUIRED_ASSUMPTIONS)) {
      for (const def of defs) {
        expect(def.key).toBeDefined();
        expect(def.label).toBeDefined();
        expect(def.labelKo).toBeDefined();
        expect(['required', 'optional']).toContain(def.priority);
      }
    }
  });
});

describe('checkAssumptions', () => {
  it('returns missing assumptions for node types', () => {
    const result = checkAssumptions(['db-server', 'waf'], null);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters out assumptions answered by profile', () => {
    const profile = makeProfile({ slaTarget: '99.99', dataClassification: 'confidential' });
    const allResult = checkAssumptions(['db-server'], null);
    const filteredResult = checkAssumptions(['db-server'], profile);
    expect(filteredResult.length).toBeLessThanOrEqual(allResult.length);
  });

  it('returns required before optional', () => {
    const result = checkAssumptions(['db-server'], null);
    const firstOptionalIdx = result.findIndex(a => a.priority === 'optional');
    const lastRequiredIdx = result.findLastIndex(a => a.priority === 'required');
    if (firstOptionalIdx >= 0 && lastRequiredIdx >= 0) {
      expect(firstOptionalIdx).toBeGreaterThan(lastRequiredIdx);
    }
  });

  it('limits to maxQuestions', () => {
    const result = checkAssumptions(['db-server', 'waf', 'load-balancer'], null, { maxQuestions: 3 });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('deduplicates assumptions across node types', () => {
    // If two node types share an assumption key (e.g., 'compliance'), it appears once
    const result = checkAssumptions(['waf', 'firewall'], null);
    const keys = result.map(a => a.key);
    const uniqueKeys = [...new Set(keys)];
    expect(keys.length).toBe(uniqueKeys.length);
  });

  it('returns empty for unknown node type', () => {
    const result = checkAssumptions(['unknown-type' as never], null);
    expect(result).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/knowledge/__tests__/assumptionChecker.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/lib/knowledge/assumptions.ts
/**
 * Required Assumptions per node type / category.
 *
 * Each definition maps to a question that should be asked
 * if not already answered by the project profile.
 */

export interface AssumptionDef {
  key: string;
  label: string;
  labelKo: string;
  priority: 'required' | 'optional';
  /** Profile field that answers this assumption (for auto-fill) */
  profileField?: string;
}

export const REQUIRED_ASSUMPTIONS: Record<string, AssumptionDef[]> = {
  'db-server': [
    { key: 'rpo', label: 'RPO (Recovery Point)', labelKo: 'RPO (복구 시점 목표)', priority: 'required' },
    { key: 'rto', label: 'RTO (Recovery Time)', labelKo: 'RTO (복구 시간 목표)', priority: 'required' },
    { key: 'pii', label: 'Contains PII?', labelKo: '개인정보 포함 여부', priority: 'required', profileField: 'dataClassification' },
    { key: 'writeRatio', label: 'Write/read ratio', labelKo: '쓰기/읽기 비율', priority: 'optional' },
    { key: 'encryptionAtRest', label: 'Encryption at rest', labelKo: '저장 암호화 필요', priority: 'optional' },
  ],
  'waf': [
    { key: 'trafficRegion', label: 'Traffic region', labelKo: '트래픽 유입 지역', priority: 'required' },
    { key: 'compliance', label: 'Compliance framework', labelKo: '적용 컴플라이언스', priority: 'required', profileField: 'regulations' },
    { key: 'threatModel', label: 'Threat model', labelKo: '위협 모델', priority: 'optional' },
  ],
  'firewall': [
    { key: 'compliance', label: 'Compliance framework', labelKo: '적용 컴플라이언스', priority: 'required', profileField: 'regulations' },
    { key: 'throughput', label: 'Expected throughput', labelKo: '예상 처리량', priority: 'optional' },
  ],
  'load-balancer': [
    { key: 'peakQps', label: 'Peak QPS', labelKo: '피크 초당 요청 수', priority: 'required' },
    { key: 'stickySession', label: 'Sticky sessions?', labelKo: '세션 고정 필요', priority: 'optional' },
    { key: 'sla', label: 'SLA target', labelKo: 'SLA 목표', priority: 'required', profileField: 'slaTarget' },
  ],
  'kubernetes': [
    { key: 'clusterSize', label: 'Cluster size', labelKo: '클러스터 규모', priority: 'required' },
    { key: 'multiTenant', label: 'Multi-tenancy?', labelKo: '멀티테넌시 필요', priority: 'optional' },
  ],
  'vpn-gateway': [
    { key: 'userCount', label: 'Concurrent users', labelKo: '동시 접속 사용자 수', priority: 'required' },
    { key: 'siteToSite', label: 'Site-to-site?', labelKo: '사이트 간 연결 필요', priority: 'required' },
  ],
  'gpu-server': [
    { key: 'workloadType', label: 'Training or inference?', labelKo: '학습용/추론용', priority: 'required' },
    { key: 'modelSize', label: 'Model size (params)', labelKo: '모델 크기 (파라미터)', priority: 'required' },
    { key: 'batchSize', label: 'Batch size', labelKo: '배치 크기', priority: 'optional' },
  ],
  'vector-db': [
    { key: 'documentCount', label: 'Document count', labelKo: '문서 수', priority: 'required' },
    { key: 'queryLatency', label: 'Query latency SLA', labelKo: '쿼리 지연 SLA', priority: 'optional' },
  ],
};
```

```typescript
// src/lib/knowledge/assumptionChecker.ts
/**
 * Assumption Checker
 *
 * Detects missing constraints for a given set of node types,
 * filters by project profile answers, and returns prioritized questions.
 */

import { REQUIRED_ASSUMPTIONS, type AssumptionDef } from './assumptions';
import type { ProjectProfile } from '@/types/profile';

export { REQUIRED_ASSUMPTIONS } from './assumptions';

interface CheckOptions {
  maxQuestions?: number;
}

export function checkAssumptions(
  nodeTypes: string[],
  profile: ProjectProfile | null,
  options: CheckOptions = {},
): AssumptionDef[] {
  const { maxQuestions = 5 } = options;

  // Gather all assumptions for the given node types
  const seen = new Set<string>();
  const all: AssumptionDef[] = [];

  for (const nodeType of nodeTypes) {
    const defs = REQUIRED_ASSUMPTIONS[nodeType];
    if (!defs) continue;
    for (const def of defs) {
      if (seen.has(def.key)) continue;
      seen.add(def.key);
      all.push(def);
    }
  }

  // Filter out assumptions answered by profile
  const filtered = profile
    ? all.filter(def => {
        if (!def.profileField) return true;
        const value = profile[def.profileField as keyof ProjectProfile];
        if (value === undefined || value === null) return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'string' && value === '') return true;
        return false;
      })
    : all;

  // Sort: required first, then optional
  filtered.sort((a, b) => {
    if (a.priority === 'required' && b.priority === 'optional') return -1;
    if (a.priority === 'optional' && b.priority === 'required') return 1;
    return 0;
  });

  // Limit
  return filtered.slice(0, maxQuestions);
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/knowledge/__tests__/assumptionChecker.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/knowledge/assumptions.ts src/lib/knowledge/assumptionChecker.ts src/lib/knowledge/__tests__/assumptionChecker.test.ts
git commit -m "feat(assumptions): add requiredAssumptions table and checkAssumptions logic"
```

---

### Task 10: Structured Response — 타입 + JSON 파서 확장

**Files:**
- Create: `src/types/structuredResponse.ts`
- Modify: `src/lib/llm/jsonParser.ts:27-62` (spec + meta 동시 파싱)
- Test: `src/lib/llm/__tests__/jsonParser.enhanced.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/llm/__tests__/jsonParser.enhanced.test.ts
import { describe, it, expect } from 'vitest';
import { parseEnhancedLLMResponse } from '../jsonParser';

describe('parseEnhancedLLMResponse', () => {
  it('parses spec-only response (backward compatible)', () => {
    const content = JSON.stringify({
      nodes: [{ id: 'n1', type: 'firewall', label: 'FW' }],
      connections: [],
    });
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.spec?.nodes).toHaveLength(1);
    expect(result.meta).toBeNull();
  });

  it('parses spec + meta response', () => {
    const content = JSON.stringify({
      spec: {
        nodes: [{ id: 'n1', type: 'firewall', label: 'FW' }],
        connections: [],
      },
      meta: {
        summary: '핵심 결론',
        assumptions: ['트래픽 월 10만'],
        options: [
          { name: 'Option A', pros: ['저렴'], cons: ['제한'] },
          { name: 'Option B', pros: ['유연'], cons: ['비쌈'] },
        ],
        tradeoffs: ['비용 vs 유연성'],
        artifacts: ['terraform'],
      },
    });
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.meta).toBeDefined();
    expect(result.meta?.summary).toBe('핵심 결론');
    expect(result.meta?.options).toHaveLength(2);
  });

  it('returns null meta when meta parsing fails', () => {
    const content = JSON.stringify({
      spec: {
        nodes: [{ id: 'n1', type: 'firewall', label: 'FW' }],
        connections: [],
      },
      meta: { summary: 123 }, // invalid type
    });
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.meta).toBeNull(); // graceful degradation
  });

  it('handles malformed JSON gracefully', () => {
    const result = parseEnhancedLLMResponse('not json at all');
    expect(result.spec).toBeNull();
    expect(result.meta).toBeNull();
  });

  it('extracts from markdown code block', () => {
    const content = '```json\n' + JSON.stringify({
      spec: { nodes: [{ id: 'n1', type: 'waf', label: 'WAF' }], connections: [] },
      meta: { summary: 'test', assumptions: [], options: [], tradeoffs: [], artifacts: [] },
    }) + '\n```';
    const result = parseEnhancedLLMResponse(content);
    expect(result.spec).toBeDefined();
    expect(result.meta?.summary).toBe('test');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/llm/__tests__/jsonParser.enhanced.test.ts`
Expected: FAIL

**Step 3: Write types + parser extension**

```typescript
// src/types/structuredResponse.ts
/**
 * Structured Response metadata from LLM.
 * Complements InfraSpec with consulting-grade context.
 */

export interface ResponseOption {
  name: string;
  pros: string[];
  cons: string[];
  estimatedCostRange?: string;
}

export interface StructuredResponseMeta {
  summary: string;
  assumptions: string[];
  options: ResponseOption[];
  tradeoffs: string[];
  artifacts: string[];
}
```

Then extend `jsonParser.ts` — add `parseEnhancedLLMResponse()` function below existing `parseJSONFromLLMResponse()`:

```typescript
// Add to jsonParser.ts (after existing parseJSONFromLLMResponse):

import type { StructuredResponseMeta } from '@/types/structuredResponse';

interface EnhancedParseResult {
  spec: InfraSpec | null;
  meta: StructuredResponseMeta | null;
}

export function parseEnhancedLLMResponse(content: string): EnhancedParseResult {
  // Try to extract JSON from content (reuse existing extraction logic)
  let parsed: unknown;
  try {
    // Try direct parse
    parsed = JSON.parse(content);
  } catch {
    // Try markdown code block extraction
    const mdMatch = content.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
    if (mdMatch) {
      try { parsed = JSON.parse(mdMatch[1]); } catch { /* fall through */ }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { spec: null, meta: null };
  }

  const obj = parsed as Record<string, unknown>;

  // Case 1: { spec: {...}, meta: {...} } — new enhanced format
  if (obj.spec && typeof obj.spec === 'object') {
    const spec = parseJSONFromLLMResponse(JSON.stringify(obj.spec));
    const meta = parseMetaSafe(obj.meta);
    return { spec, meta };
  }

  // Case 2: { nodes: [...], connections: [...] } — legacy format
  const spec = parseJSONFromLLMResponse(content);
  return { spec, meta: null };
}

function parseMetaSafe(raw: unknown): StructuredResponseMeta | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  if (typeof obj.summary !== 'string') return null;
  if (!Array.isArray(obj.assumptions)) return null;
  if (!Array.isArray(obj.options)) return null;
  if (!Array.isArray(obj.tradeoffs)) return null;
  if (!Array.isArray(obj.artifacts)) return null;

  return {
    summary: obj.summary,
    assumptions: obj.assumptions.filter((a): a is string => typeof a === 'string'),
    options: obj.options.filter((o): o is StructuredResponseMeta['options'][0] =>
      typeof o === 'object' && o !== null && 'name' in o),
    tradeoffs: obj.tradeoffs.filter((t): t is string => typeof t === 'string'),
    artifacts: obj.artifacts.filter((a): a is string => typeof a === 'string'),
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/llm/__tests__/jsonParser.enhanced.test.ts`
Expected: ALL PASS

**Step 5: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 전체 통과 (기존 parseJSONFromLLMResponse는 건드리지 않음)

**Step 6: Commit**

```bash
git add src/types/structuredResponse.ts src/lib/llm/jsonParser.ts src/lib/llm/__tests__/jsonParser.enhanced.test.ts
git commit -m "feat(llm): add parseEnhancedLLMResponse for spec+meta structured parsing"
```

---

### Task 11: Structured Response — System Prompt 확장 + LLM route 연결

**Files:**
- Modify: `src/app/api/llm/route.ts:98-131` (SYSTEM_PROMPT 확장)
- Modify: `src/app/api/llm/route.ts:316-365` (callProviderOnce에서 enhanced parsing)
- Test: `src/__tests__/api/llm.test.ts` (기존 테스트에 structured response 케이스 추가)

**Step 1: Update SYSTEM_PROMPT**

`route.ts`의 SYSTEM_PROMPT 끝부분 `Only output valid JSON. No explanations.` 을 교체:

```
Output a JSON object. Two supported formats:

Format A (enhanced — preferred):
{
  "spec": { "nodes": [...], "connections": [...], "zones": [...] },
  "meta": {
    "summary": "3-5 line conclusion in the user's language",
    "assumptions": ["assumption 1", "assumption 2"],
    "options": [
      { "name": "Option A", "pros": ["..."], "cons": ["..."], "estimatedCostRange": "$X-$Y/mo" },
      { "name": "Option B", "pros": ["..."], "cons": ["..."] }
    ],
    "tradeoffs": ["tradeoff description"],
    "artifacts": ["terraform", "kubernetes", "checklist"]
  }
}

Format B (legacy — acceptable):
{ "nodes": [...], "connections": [...], "zones": [...] }

Always include at least 2 options in meta.options. The spec is REQUIRED. Meta is RECOMMENDED but optional.
Only output valid JSON. No additional text.
```

**Step 2: Update callProviderOnce to use enhanced parser**

Replace `parseJSONFromLLMResponse(content)` with `parseEnhancedLLMResponse(content)` in callProviderOnce, and return both spec and meta in the response.

**Step 3: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 전체 통과

**Step 4: Commit**

```bash
git add src/app/api/llm/route.ts
git commit -m "feat(llm): extend system prompt for structured spec+meta response format"
```

---

## Phase 3: 확장 (Cost Sensitivity)

---

### Task 12: Cost Sensitivity — analyzeSensitivity 함수

**Files:**
- Create: `src/lib/consulting/costSensitivity.ts`
- Test: `src/lib/consulting/__tests__/costSensitivity.test.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/consulting/__tests__/costSensitivity.test.ts
import { describe, it, expect } from 'vitest';
import { analyzeSensitivity, type CostSensitivityResult } from '../costSensitivity';
import type { InfraSpec } from '@/types';

const testSpec: InfraSpec = {
  nodes: [
    { id: 'n1', type: 'load-balancer', label: 'ALB' },
    { id: 'n2', type: 'web-server', label: 'Web' },
    { id: 'n3', type: 'db-server', label: 'DB' },
    { id: 'n4', type: 'cache', label: 'Redis' },
  ],
  connections: [],
};

describe('analyzeSensitivity', () => {
  it('returns 3 scenarios (upper/baseline/lower)', () => {
    const result = analyzeSensitivity(testSpec);
    expect(result.upperBound).toBeDefined();
    expect(result.baseline).toBeDefined();
    expect(result.lowerBound).toBeDefined();
  });

  it('upper >= baseline >= lower', () => {
    const result = analyzeSensitivity(testSpec);
    expect(result.upperBound.totalMonthly).toBeGreaterThanOrEqual(result.baseline.totalMonthly);
    expect(result.baseline.totalMonthly).toBeGreaterThanOrEqual(result.lowerBound.totalMonthly);
  });

  it('identifies sensitive variables', () => {
    const result = analyzeSensitivity(testSpec);
    expect(result.sensitiveVariables.length).toBeGreaterThan(0);
    expect(result.sensitiveVariables[0].variable).toBeDefined();
    expect(result.sensitiveVariables[0].variableKo).toBeDefined();
    expect(result.sensitiveVariables[0].impactPercent).toBeGreaterThan(0);
  });

  it('handles empty spec', () => {
    const result = analyzeSensitivity({ nodes: [], connections: [] });
    expect(result.baseline.totalMonthly).toBe(0);
  });

  it('sorts sensitive variables by impact (highest first)', () => {
    const result = analyzeSensitivity(testSpec);
    for (let i = 1; i < result.sensitiveVariables.length; i++) {
      expect(result.sensitiveVariables[i - 1].impactPercent)
        .toBeGreaterThanOrEqual(result.sensitiveVariables[i].impactPercent);
    }
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/consulting/__tests__/costSensitivity.test.ts`
Expected: FAIL

**Step 3: Write implementation**

```typescript
// src/lib/consulting/costSensitivity.ts
/**
 * Cost Sensitivity Analysis
 *
 * Generates 3-scenario cost estimates (upper/baseline/lower)
 * and identifies which variables have the most cost impact.
 *
 * Uses the existing BASE_COSTS from costComparator as baseline.
 */

import type { InfraSpec } from '@/types';
import { BASE_COSTS } from '@/lib/data/infrastructureDB';

export interface CostEstimate {
  totalMonthly: number;
  breakdown: { nodeType: string; label: string; monthly: number }[];
}

export interface SensitiveVariable {
  variable: string;
  variableKo: string;
  impactPercent: number;
}

export interface CostSensitivityResult {
  upperBound: CostEstimate;
  baseline: CostEstimate;
  lowerBound: CostEstimate;
  sensitiveVariables: SensitiveVariable[];
}

const UPPER_MULTIPLIER = 1.8;  // peak traffic, no optimization
const LOWER_MULTIPLIER = 0.5;  // RI/Spot, caching, right-sizing

function estimateForSpec(spec: InfraSpec, multiplier: number): CostEstimate {
  const breakdown = spec.nodes.map(node => {
    const baseCost = BASE_COSTS[node.type] ?? 50;
    return {
      nodeType: node.type,
      label: node.label,
      monthly: Math.round(baseCost * multiplier),
    };
  });

  return {
    totalMonthly: breakdown.reduce((sum, b) => sum + b.monthly, 0),
    breakdown,
  };
}

const SENSITIVITY_FACTORS: SensitiveVariable[] = [
  { variable: 'traffic-volume', variableKo: '트래픽 규모', impactPercent: 0 },
  { variable: 'storage-growth', variableKo: '스토리지 증가율', impactPercent: 0 },
  { variable: 'data-transfer', variableKo: '데이터 전송량', impactPercent: 0 },
  { variable: 'compute-reservation', variableKo: '컴퓨트 예약 비율', impactPercent: 0 },
];

export function analyzeSensitivity(spec: InfraSpec): CostSensitivityResult {
  const upperBound = estimateForSpec(spec, UPPER_MULTIPLIER);
  const baseline = estimateForSpec(spec, 1.0);
  const lowerBound = estimateForSpec(spec, LOWER_MULTIPLIER);

  // Calculate sensitivity: how much each factor contributes to the gap
  const gap = upperBound.totalMonthly - lowerBound.totalMonthly;

  const hasCompute = spec.nodes.some(n => ['web-server', 'app-server', 'container', 'kubernetes', 'gpu-server'].includes(n.type));
  const hasStorage = spec.nodes.some(n => ['san-nas', 'object-storage', 'backup', 'db-server'].includes(n.type));
  const hasNetwork = spec.nodes.some(n => ['load-balancer', 'cdn', 'router'].includes(n.type));
  const hasCache = spec.nodes.some(n => ['cache'].includes(n.type));

  const variables: SensitiveVariable[] = [];
  if (gap > 0) {
    if (hasCompute) variables.push({ variable: 'compute-reservation', variableKo: '컴퓨트 예약 비율', impactPercent: 35 });
    if (hasNetwork) variables.push({ variable: 'traffic-volume', variableKo: '트래픽 규모', impactPercent: 30 });
    if (hasStorage) variables.push({ variable: 'storage-growth', variableKo: '스토리지 증가율', impactPercent: 25 });
    if (hasCache) variables.push({ variable: 'cache-hit-rate', variableKo: '캐시 히트율', impactPercent: 15 });
    if (hasNetwork) variables.push({ variable: 'data-transfer', variableKo: '데이터 전송량', impactPercent: 20 });
  }

  // Sort by impact
  variables.sort((a, b) => b.impactPercent - a.impactPercent);

  return { upperBound, baseline, lowerBound, sensitiveVariables: variables };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/consulting/__tests__/costSensitivity.test.ts`
Expected: ALL PASS

**Step 5: Run full verification**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 전체 통과

**Step 6: Commit**

```bash
git add src/lib/consulting/costSensitivity.ts src/lib/consulting/__tests__/costSensitivity.test.ts
git commit -m "feat(consulting): add cost sensitivity analysis with 3-scenario estimation"
```

---

## Final Verification

After all 12 tasks:

```bash
npx tsc --noEmit && npx vitest run
```

Expected: TypeScript strict 통과, 전체 테스트 (기존 6,675 + 신규 ~100) 통과.

---

## Task Summary

| Task | Phase | 영역 | 핵심 산출물 | 예상 테스트 |
|---:|---|---|---|---:|
| 1 | 1 | Input Safety | patterns.ts (공통 패턴) | 11 |
| 2 | 1 | Input Safety | inputSafetyCheck.ts | 5 |
| 3 | 1 | Profile | types + Zod 스키마 | 5 |
| 4 | 1 | Profile | useProjectProfile 훅 | 9 |
| 5 | 1 | Reference Box | sourceAggregator.ts | 9 |
| 6 | 1 | Reference Box | 파이프라인 연결 (타입 와이어링) | 0 (기존 통과) |
| 7 | 1 | Reference Box | ReferenceBox.tsx + PromptPanel 통합 | 6 |
| 8 | 2 | Persona | personaInstruction.ts | 5 |
| 9 | 2 | Assumption | assumptions.ts + assumptionChecker.ts | 7 |
| 10 | 2 | Structured | structuredResponse.ts + jsonParser 확장 | 5 |
| 11 | 2 | Structured | system prompt + route 연결 | 0 (기존 통과) |
| 12 | 3 | Cost | costSensitivity.ts | 5 |
| **Total** | | | | **~67** |
