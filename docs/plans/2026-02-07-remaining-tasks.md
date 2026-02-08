# InfraFlow 남은 작업 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 코드 품질 개선을 위한 리팩토링 및 접근성 향상 완료

**Architecture:** 대형 파일 모듈화, 중복 코드 제거, React 최적화, WCAG 접근성 준수

**Tech Stack:** Next.js 16, React 19, TypeScript 5, React Flow 12

---

## 현재 상태

| 항목 | 현재 값 | 목표 |
|------|---------|------|
| infrastructureDB.ts | 1,519줄 | 카테고리별 ~200줄 |
| Parser 중복 | 존재 | 제거 |
| 컴포넌트 메모이제이션 | 부분 적용 | 전체 적용 |
| 접근성 (ARIA) | 미적용 | WCAG AA 준수 |

---

## Phase 3: 코드 리팩토링

### Task 3.1: infrastructureDB.ts 카테고리별 분할

**Files:**
- Modify: `src/lib/data/infrastructureDB.ts` (1,519줄 → ~100줄)
- Create: `src/lib/data/components/security.ts`
- Create: `src/lib/data/components/network.ts`
- Create: `src/lib/data/components/compute.ts`
- Create: `src/lib/data/components/cloud.ts`
- Create: `src/lib/data/components/storage.ts`
- Create: `src/lib/data/components/auth.ts`
- Create: `src/lib/data/components/external.ts`
- Create: `src/lib/data/components/index.ts`

**Step 1: 디렉토리 생성**

```bash
mkdir -p src/lib/data/components
```

**Step 2: 공통 타입 파일 생성**

```typescript
// src/lib/data/types.ts
export interface InfraComponent {
  id: string;
  name: string;
  nameKo: string;
  category: 'security' | 'network' | 'compute' | 'cloud' | 'storage' | 'auth' | 'external';
  description: string;
  descriptionKo: string;
  functions: string[];
  functionsKo: string[];
  features: string[];
  featuresKo: string[];
  recommendedPolicies: PolicyRecommendation[];
  tier: 'external' | 'dmz' | 'internal' | 'data';
  ports?: string[];
  protocols?: string[];
  vendors?: string[];
}

export interface PolicyRecommendation {
  name: string;
  nameKo: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'access' | 'security' | 'monitoring' | 'compliance' | 'performance';
}
```

**Step 3: Security 컴포넌트 분리**

```typescript
// src/lib/data/components/security.ts
import type { InfraComponent } from '../types';

export const securityComponents: Record<string, InfraComponent> = {
  'firewall': {
    id: 'firewall',
    name: 'Firewall',
    nameKo: '방화벽',
    category: 'security',
    // ... 기존 데이터
  },
  'waf': { /* ... */ },
  'ids-ips': { /* ... */ },
  'vpn-gateway': { /* ... */ },
  'nac': { /* ... */ },
  'dlp': { /* ... */ },
};
```

**Step 4: Network 컴포넌트 분리**

```typescript
// src/lib/data/components/network.ts
import type { InfraComponent } from '../types';

export const networkComponents: Record<string, InfraComponent> = {
  'router': { /* ... */ },
  'switch': { /* ... */ },
  'load-balancer': { /* ... */ },
  'dns': { /* ... */ },
  'cdn': { /* ... */ },
};
```

**Step 5: 나머지 카테고리 분리 (compute, cloud, storage, auth, external)**

동일한 패턴으로 각 파일 생성

**Step 6: Index 파일로 통합**

```typescript
// src/lib/data/components/index.ts
import { securityComponents } from './security';
import { networkComponents } from './network';
import { computeComponents } from './compute';
import { cloudComponents } from './cloud';
import { storageComponents } from './storage';
import { authComponents } from './auth';
import { externalComponents } from './external';
import type { InfraComponent } from '../types';

export const allComponents: Record<string, InfraComponent> = {
  ...securityComponents,
  ...networkComponents,
  ...computeComponents,
  ...cloudComponents,
  ...storageComponents,
  ...authComponents,
  ...externalComponents,
};

// 카테고리별 접근 export
export {
  securityComponents,
  networkComponents,
  computeComponents,
  cloudComponents,
  storageComponents,
  authComponents,
  externalComponents,
};
```

**Step 7: infrastructureDB.ts 리팩토링**

```typescript
// src/lib/data/infrastructureDB.ts (리팩토링 후 ~50줄)
import { allComponents } from './components';
import type { InfraComponent, PolicyRecommendation } from './types';

// Re-export for backward compatibility
export type { InfraComponent, PolicyRecommendation };
export const infrastructureDB = allComponents;

// 기존 유틸리티 함수들 유지
export const categoryIcons: Record<string, string> = {
  security: '🔒',
  network: '🌐',
  compute: '🖥️',
  cloud: '☁️',
  storage: '📦',
  auth: '🔐',
  external: '👤',
};

export const tierOrder = ['external', 'dmz', 'internal', 'data'] as const;

export const tierInfo: Record<string, { name: string; nameKo: string; color: string }> = {
  external: { name: 'External', nameKo: '외부', color: '#64748b' },
  dmz: { name: 'DMZ', nameKo: 'DMZ', color: '#f59e0b' },
  internal: { name: 'Internal', nameKo: '내부망', color: '#22c55e' },
  data: { name: 'Data', nameKo: '데이터', color: '#8b5cf6' },
};
```

**Step 8: 테스트 실행**

Run: `npm test`
Expected: ALL PASS

**Step 9: Commit**

```bash
git add src/lib/data/
git commit -m "refactor: split infrastructureDB into category modules

- Extract security, network, compute, cloud, storage, auth, external
- Create shared types.ts for InfraComponent interface
- Maintain backward compatibility via re-exports
- Reduce main file from 1519 to ~50 lines"
```

---

### Task 3.2: Parser 패턴 중복 제거

**Files:**
- Modify: `src/lib/parser/UnifiedParser.ts`
- Create: `src/lib/parser/sharedPatterns.ts`

**Step 1: 중복 패턴 분석**

Run: `grep -n "pattern.*firewall\|pattern.*waf" src/lib/parser/*.ts`

**Step 2: 공유 패턴 파일 생성**

```typescript
// src/lib/parser/sharedPatterns.ts
export interface ComponentPattern {
  pattern: RegExp;
  type: string;
  label: string;
  labelKo: string;
  category: string;
}

export const componentPatterns: ComponentPattern[] = [
  // Security
  { pattern: /firewall|방화벽|fw/i, type: 'firewall', label: 'Firewall', labelKo: '방화벽', category: 'security' },
  { pattern: /waf|웹방화벽|웹\s*애플리케이션\s*방화벽/i, type: 'waf', label: 'WAF', labelKo: '웹방화벽', category: 'security' },
  { pattern: /ids|ips|ids\/ips|침입\s*탐지|침입\s*방지/i, type: 'ids-ips', label: 'IDS/IPS', labelKo: '침입탐지/방지', category: 'security' },
  { pattern: /vpn|가상사설망/i, type: 'vpn-gateway', label: 'VPN Gateway', labelKo: 'VPN 게이트웨이', category: 'security' },

  // Network
  { pattern: /router|라우터/i, type: 'router', label: 'Router', labelKo: '라우터', category: 'network' },
  { pattern: /switch|스위치/i, type: 'switch', label: 'Switch', labelKo: '스위치', category: 'network' },
  { pattern: /load\s*balancer|lb|로드\s*밸런서|부하\s*분산/i, type: 'load-balancer', label: 'Load Balancer', labelKo: '로드밸런서', category: 'network' },
  { pattern: /cdn|콘텐츠\s*전송/i, type: 'cdn', label: 'CDN', labelKo: 'CDN', category: 'network' },

  // Compute
  { pattern: /web\s*server|웹\s*서버/i, type: 'web-server', label: 'Web Server', labelKo: '웹 서버', category: 'compute' },
  { pattern: /app\s*server|was|애플리케이션\s*서버/i, type: 'app-server', label: 'App Server', labelKo: '앱 서버', category: 'compute' },
  { pattern: /db\s*server|database|데이터베이스|디비/i, type: 'db-server', label: 'DB Server', labelKo: 'DB 서버', category: 'compute' },
  { pattern: /kubernetes|k8s|쿠버네티스/i, type: 'kubernetes', label: 'Kubernetes', labelKo: '쿠버네티스', category: 'compute' },

  // Cloud
  { pattern: /aws|아마존/i, type: 'aws-vpc', label: 'AWS VPC', labelKo: 'AWS VPC', category: 'cloud' },
  { pattern: /azure|애저/i, type: 'azure-vnet', label: 'Azure VNet', labelKo: 'Azure VNet', category: 'cloud' },
  { pattern: /gcp|구글\s*클라우드/i, type: 'gcp-network', label: 'GCP Network', labelKo: 'GCP 네트워크', category: 'cloud' },

  // Storage
  { pattern: /nas|san|스토리지/i, type: 'storage', label: 'Storage', labelKo: '스토리지', category: 'storage' },
  { pattern: /redis|캐시/i, type: 'cache', label: 'Cache', labelKo: '캐시', category: 'storage' },

  // Auth
  { pattern: /ldap|ad|active\s*directory|디렉토리/i, type: 'ldap-ad', label: 'LDAP/AD', labelKo: 'LDAP/AD', category: 'auth' },
  { pattern: /sso|싱글\s*사인온/i, type: 'sso', label: 'SSO', labelKo: 'SSO', category: 'auth' },
  { pattern: /mfa|다중\s*인증|2단계/i, type: 'mfa', label: 'MFA', labelKo: '다중인증', category: 'auth' },

  // External
  { pattern: /user|사용자|유저|클라이언트/i, type: 'user', label: 'User', labelKo: '사용자', category: 'external' },
  { pattern: /internet|인터넷/i, type: 'internet', label: 'Internet', labelKo: '인터넷', category: 'external' },
];

// 패턴 검색 유틸리티
export function findComponentByPattern(text: string): ComponentPattern | null {
  for (const pattern of componentPatterns) {
    if (pattern.pattern.test(text)) {
      return pattern;
    }
  }
  return null;
}

export function findAllComponentsByPattern(text: string): ComponentPattern[] {
  return componentPatterns.filter(p => p.pattern.test(text));
}
```

**Step 3: UnifiedParser에서 공유 패턴 사용**

```typescript
// src/lib/parser/UnifiedParser.ts
import { componentPatterns, findComponentByPattern, findAllComponentsByPattern } from './sharedPatterns';

// 기존 중복 패턴 정의 삭제하고 import 사용
```

**Step 4: 테스트 실행**

Run: `npm test -- src/__tests__/lib/parser/`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/parser/
git commit -m "refactor: extract shared patterns from parsers

- Create sharedPatterns.ts with ComponentPattern interface
- Add findComponentByPattern and findAllComponentsByPattern utilities
- Remove duplicate pattern definitions from UnifiedParser
- Improve maintainability with single source of truth"
```

---

## Phase 4: 성능 최적화

### Task 4.1: BaseNode 컴포넌트 메모이제이션

**Files:**
- Modify: `src/components/nodes/BaseNode.tsx`

**Step 1: 현재 BaseNode 구조 확인**

Run: `head -50 src/components/nodes/BaseNode.tsx`

**Step 2: React.memo 적용**

```typescript
// src/components/nodes/BaseNode.tsx
import React, { memo, useCallback } from 'react';

interface BaseNodeProps {
  data: InfraNodeData;
  selected: boolean;
  id: string;
}

// 비교 함수 정의
const arePropsEqual = (prevProps: BaseNodeProps, nextProps: BaseNodeProps): boolean => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data.label === nextProps.data.label &&
    prevProps.data.nodeType === nextProps.data.nodeType &&
    prevProps.data.category === nextProps.data.category
  );
};

// 컴포넌트에 memo 적용
export const BaseNode = memo(function BaseNode({ data, selected, id }: BaseNodeProps) {
  // 이벤트 핸들러 메모이제이션
  const handleClick = useCallback(() => {
    // click logic
  }, [id]);

  return (
    // JSX
  );
}, arePropsEqual);
```

**Step 3: 테스트 실행**

Run: `npm test -- src/__tests__/components/nodes/BaseNode.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/nodes/BaseNode.tsx
git commit -m "perf: add React.memo to BaseNode component

- Add custom comparison function for shallow equality
- Memoize event handlers with useCallback
- Prevent unnecessary re-renders on parent updates"
```

---

### Task 4.2: AnimatedEdge 컴포넌트 메모이제이션

**Files:**
- Modify: `src/components/edges/AnimatedEdge.tsx`

**Step 1: React.memo 적용**

```typescript
// src/components/edges/AnimatedEdge.tsx
import React, { memo } from 'react';

const areEdgePropsEqual = (prev: AnimatedEdgeProps, next: AnimatedEdgeProps): boolean => {
  return (
    prev.id === next.id &&
    prev.source === next.source &&
    prev.target === next.target &&
    prev.selected === next.selected &&
    prev.animated === next.animated
  );
};

export const AnimatedEdge = memo(function AnimatedEdge(props: AnimatedEdgeProps) {
  // 기존 로직
}, areEdgePropsEqual);
```

**Step 2: 테스트 및 커밋**

```bash
git add src/components/edges/AnimatedEdge.tsx
git commit -m "perf: add React.memo to AnimatedEdge component"
```

---

### Task 4.3: Bundle 크기 분석 및 최적화

**Step 1: Bundle 분석**

```bash
cd /Users/hyunkikim/dev/경기도의회\ VDI\ Openclaw\ 구축/infraflow
npm run build 2>&1 | grep -E "Route|Size|First"
```

**Step 2: 대형 컴포넌트 Dynamic Import 적용**

```typescript
// src/app/page.tsx
import dynamic from 'next/dynamic';

// Heavy 컴포넌트 lazy loading
const SecurityAuditPanel = dynamic(
  () => import('@/components/panels/SecurityAuditPanel'),
  {
    ssr: false,
    loading: () => <div className="animate-pulse bg-slate-700 h-64 rounded" />
  }
);

const TemplateGallery = dynamic(
  () => import('@/components/panels/TemplateGallery'),
  { ssr: false }
);

const ExportPanel = dynamic(
  () => import('@/components/panels/ExportPanel'),
  { ssr: false }
);
```

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "perf: add dynamic imports for heavy components

- Lazy load SecurityAuditPanel, TemplateGallery, ExportPanel
- Add loading skeleton for better UX
- Reduce initial bundle size"
```

---

## Phase 5: 접근성 개선

### Task 5.1: BaseNode ARIA 레이블 추가

**Files:**
- Modify: `src/components/nodes/BaseNode.tsx`

**Step 1: ARIA 속성 추가**

```typescript
// src/components/nodes/BaseNode.tsx
export const BaseNode = memo(function BaseNode({ data, selected, id }: BaseNodeProps) {
  return (
    <div
      role="button"
      aria-label={`${data.labelKo || data.label} 인프라 노드. ${data.category} 카테고리.`}
      aria-pressed={selected}
      aria-describedby={`node-desc-${id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // 선택 토글
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // 삭제
        }
      }}
      className={cn(
        'infra-node',
        `infra-node-${data.category}`,
        selected && 'ring-2 ring-blue-500',
        'focus:outline-none focus:ring-2 focus:ring-blue-400'
      )}
    >
      {/* 스크린 리더용 숨겨진 설명 */}
      <span id={`node-desc-${id}`} className="sr-only">
        {data.descriptionKo || data.description}
      </span>

      {/* 기존 UI */}
    </div>
  );
}, arePropsEqual);
```

**Step 2: Tailwind sr-only 유틸리티 확인**

```css
/* tailwind.config 또는 globals.css에 이미 포함됨 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Step 3: 테스트**

Run: `npm test -- src/__tests__/components/nodes/BaseNode.test.tsx`

**Step 4: Commit**

```bash
git add src/components/nodes/BaseNode.tsx
git commit -m "a11y: add ARIA labels and keyboard navigation to BaseNode

- Add role='button' and aria-label for screen readers
- Add aria-pressed for selection state
- Add keyboard handlers for Enter, Space, Delete
- Add visible focus ring for keyboard users
- Add sr-only description for additional context"
```

---

### Task 5.2: FlowCanvas 키보드 네비게이션

**Files:**
- Modify: `src/components/shared/FlowCanvas.tsx`
- Create: `src/hooks/useKeyboardNavigation.ts`

**Step 1: 키보드 네비게이션 훅 생성**

```typescript
// src/hooks/useKeyboardNavigation.ts
import { useCallback, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

interface UseKeyboardNavigationOptions {
  onDeleteNode?: (nodeId: string) => void;
  onSelectAll?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const { getNodes, setNodes, fitView } = useReactFlow();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement;

    // 입력 필드에서는 무시
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? event.metaKey : event.ctrlKey;

    // Delete: 선택된 노드 삭제
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selectedNodes = getNodes().filter(n => n.selected);
      selectedNodes.forEach(node => {
        options.onDeleteNode?.(node.id);
      });
    }

    // Cmd/Ctrl + A: 전체 선택
    if (modKey && event.key === 'a') {
      event.preventDefault();
      options.onSelectAll?.();
    }

    // Cmd/Ctrl + Z: 실행 취소
    if (modKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      options.onUndo?.();
    }

    // Cmd/Ctrl + Shift + Z 또는 Cmd/Ctrl + Y: 다시 실행
    if ((modKey && event.shiftKey && event.key === 'z') || (modKey && event.key === 'y')) {
      event.preventDefault();
      options.onRedo?.();
    }

    // Cmd/Ctrl + 0: 화면에 맞추기
    if (modKey && event.key === '0') {
      event.preventDefault();
      fitView({ padding: 0.2 });
    }

    // Tab: 다음 노드로 포커스 이동
    if (event.key === 'Tab') {
      const nodes = getNodes();
      const selectedIndex = nodes.findIndex(n => n.selected);
      const nextIndex = event.shiftKey
        ? (selectedIndex - 1 + nodes.length) % nodes.length
        : (selectedIndex + 1) % nodes.length;

      if (nodes[nextIndex]) {
        event.preventDefault();
        setNodes(nodes.map((n, i) => ({
          ...n,
          selected: i === nextIndex
        })));
      }
    }
  }, [getNodes, setNodes, fitView, options]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

**Step 2: FlowCanvas에 훅 적용**

```typescript
// src/components/shared/FlowCanvas.tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

export function FlowCanvas({ ... }) {
  useKeyboardNavigation({
    onDeleteNode: handleDeleteNode,
    onSelectAll: handleSelectAll,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  // 기존 로직
}
```

**Step 3: 테스트**

```typescript
// src/__tests__/hooks/useKeyboardNavigation.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

describe('useKeyboardNavigation', () => {
  it('should call onDeleteNode when Delete key is pressed', () => {
    // 테스트 로직
  });

  it('should call onUndo when Ctrl+Z is pressed', () => {
    // 테스트 로직
  });
});
```

**Step 4: Commit**

```bash
git add src/hooks/useKeyboardNavigation.ts src/components/shared/FlowCanvas.tsx
git commit -m "a11y: add keyboard navigation for FlowCanvas

- Create useKeyboardNavigation hook
- Support Delete, Ctrl+A, Ctrl+Z, Ctrl+Shift+Z, Ctrl+0
- Tab navigation between nodes
- Skip keyboard handling in input fields"
```

---

### Task 5.3: 단축키 도움말 패널 추가

**Files:**
- Create: `src/components/shared/KeyboardShortcuts.tsx`

**Step 1: 단축키 도움말 컴포넌트 생성**

```typescript
// src/components/shared/KeyboardShortcuts.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const shortcuts = [
  { keys: ['Delete'], description: '선택된 노드 삭제', descriptionEn: 'Delete selected nodes' },
  { keys: ['⌘', 'A'], description: '전체 선택', descriptionEn: 'Select all' },
  { keys: ['⌘', 'Z'], description: '실행 취소', descriptionEn: 'Undo' },
  { keys: ['⌘', 'Shift', 'Z'], description: '다시 실행', descriptionEn: 'Redo' },
  { keys: ['⌘', '0'], description: '화면에 맞추기', descriptionEn: 'Fit to view' },
  { keys: ['Tab'], description: '다음 노드로 이동', descriptionEn: 'Focus next node' },
  { keys: ['Shift', 'Tab'], description: '이전 노드로 이동', descriptionEn: 'Focus previous node' },
  { keys: ['Enter'], description: '노드 선택', descriptionEn: 'Select node' },
  { keys: ['?'], description: '단축키 도움말', descriptionEn: 'Show shortcuts' },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
        aria-label="키보드 단축키 보기"
      >
        <Keyboard className="w-5 h-5 text-slate-400" />
      </button>

      {/* 모달 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-labelledby="shortcuts-title"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="shortcuts-title" className="text-lg font-semibold text-white">
                  키보드 단축키
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-700 rounded"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <ul className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <li key={index} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                    <span className="text-slate-300">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300 font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-slate-500 text-center">
                ? 키를 눌러 이 도움말을 열거나 닫을 수 있습니다
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

**Step 2: 메인 레이아웃에 추가**

```typescript
// src/app/page.tsx
import { KeyboardShortcuts } from '@/components/shared/KeyboardShortcuts';

export default function Home() {
  return (
    <>
      {/* 기존 UI */}
      <KeyboardShortcuts />
    </>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/shared/KeyboardShortcuts.tsx src/app/page.tsx
git commit -m "a11y: add keyboard shortcuts help modal

- Create KeyboardShortcuts component with ? toggle
- List all available shortcuts with descriptions
- Add floating trigger button
- Escape to close modal"
```

---

## 실행 순서 및 체크리스트

| Phase | Task | 예상 시간 | 의존성 |
|-------|------|----------|--------|
| 3.1 | infrastructureDB 분할 | 1-2시간 | 없음 |
| 3.2 | Parser 중복 제거 | 30분 | 없음 |
| 4.1 | BaseNode 메모이제이션 | 20분 | 없음 |
| 4.2 | AnimatedEdge 메모이제이션 | 15분 | 없음 |
| 4.3 | Dynamic Import 적용 | 30분 | 없음 |
| 5.1 | BaseNode ARIA | 30분 | 4.1 |
| 5.2 | 키보드 네비게이션 | 45분 | 없음 |
| 5.3 | 단축키 도움말 | 30분 | 5.2 |

**총 예상 시간: 4-5시간**

---

## 완료 기준

- [ ] infrastructureDB.ts가 카테고리별 모듈로 분할됨
- [ ] Parser 중복 패턴이 sharedPatterns.ts로 통합됨
- [ ] BaseNode, AnimatedEdge에 React.memo 적용됨
- [ ] 대형 컴포넌트에 Dynamic Import 적용됨
- [ ] BaseNode에 ARIA 레이블 추가됨
- [ ] 키보드 네비게이션 동작함
- [ ] 단축키 도움말 모달 표시됨
- [ ] 모든 테스트 통과
- [ ] 빌드 성공
