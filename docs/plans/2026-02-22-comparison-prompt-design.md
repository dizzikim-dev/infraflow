# Comparison Panel Prompt — Design Document

> Date: 2026-02-22
> Status: Approved
> Author: AI + Hyunki

## Problem

비교 모드에서 양쪽 패널을 **수정할 방법이 없음**. 현재는 진입 시 동일한 다이어그램이 양쪽에 복사되고, 수동으로 노드 라벨만 편집 가능. "오른쪽에 WAF 추가" 같은 구조적 수정이 불가.

## Solution: ComparisonPromptBar

각 ComparisonPanel 하단에 **미니 프롬프트 바**를 배치. LLM 기반 수정(`/api/modify`)을 각 패널에 독립적으로 적용.

### Approach: Option A — 패널 하단 인라인 프롬프트

```
┌──────────── Left Panel ───────────┐ ┌──────────── Right Panel ──────────┐
│  [변경 전 / 아키텍처 A]          │ │  [변경 후 / 아키텍처 B]           │
│                                   │ │                                   │
│       FlowCanvas (다이어그램)     │ │       FlowCanvas (다이어그램)      │
│                                   │ │                                   │
│ ┌───────────────────────────────┐ │ │ ┌───────────────────────────────┐ │
│ │ "보안 강화해줘"        [적용] │ │ │ │ "DB 이중화해줘"        [적용] │ │
│ └───────────────────────────────┘ │ │ └───────────────────────────────┘ │
└───────────────────────────────────┘ └───────────────────────────────────┘
```

Rejected alternatives:
- Option B (중앙 통합 프롬프트): 타겟 전환 UX 번거로움, 동시 편집 불가
- Option C (기존 PromptPanel 재사용): 레이아웃 충돌, 복잡한 수정 필요

## Data Flow

```
ComparisonPromptBar (side=left)
  ↓ handleSubmit(prompt)
  ↓ useComparisonPrompt hook
  ↓ POST /api/modify { prompt, currentSpec: leftPanel.spec, nodes, edges }
  ↓ Response: { spec, reasoning, operations }
  ↓ specToFlow(spec) → newNodes, newEdges
  ↓ Position merge (preserve existing layout)
  ↓ onPanelUpdate(spec, newNodes, newEdges)
  ↓ useComparisonMode.updateLeftPanel()
  ↓ diff auto-recomputes (useMemo in useComparisonMode)
```

Right panel follows identical but independent flow.

## Hook: useComparisonPrompt

```typescript
interface UseComparisonPromptConfig {
  panel: PanelState;
  onPanelUpdate: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;
}

interface UseComparisonPromptReturn {
  isLoading: boolean;
  error: string | null;
  lastModification: { reasoning?: string; operations?: Operation[] } | null;
  handleSubmit: (prompt: string) => Promise<void>;
  cancel: () => void;
}
```

Key design decisions:
- Each panel gets its own hook instance → independent AbortController + requestId
- Reuses `/api/modify` endpoint (same as useLLMModifier)
- Position merge: preserves existing node positions for layout stability
- No conversation context tracking (comparison prompts are one-shot modifications)

## Component: ComparisonPromptBar

```typescript
interface ComparisonPromptBarProps {
  side: 'left' | 'right';
  panel: PanelState;
  onPanelUpdate: (spec: InfraSpec | null, nodes: Node[], edges: Edge[]) => void;
}
```

UI elements:
- Single-line text input with placeholder ("이 패널 수정...")
- Submit button (arrow icon, teal accent)
- Loading spinner during LLM call
- Error message (red, auto-dismiss 5s)
- Last modification indicator (collapsible, shows operation count)

Keyboard:
- Enter → submit
- Escape → cancel pending request

## Integration

ComparisonPanel.tsx modified to include ComparisonPromptBar at the bottom, receiving `onPanelUpdate` callback from ComparisonView.

ComparisonView.tsx already passes `onLeftPanelUpdate` / `onRightPanelUpdate` — these become the `onPanelUpdate` prop for each side's prompt bar.

## File Structure

```
src/hooks/
  └── useComparisonPrompt.ts          # New — LLM modify for comparison panels

src/components/comparison/
  ├── ComparisonPromptBar.tsx          # New — mini prompt input
  └── ComparisonPanel.tsx              # Modified — add prompt bar
```

## Test Plan

- **Unit tests**: useComparisonPrompt hook (submit, cancel, error handling, position merge)
- **Component tests**: ComparisonPromptBar (render, input, submit, loading, error states)
- **Integration**: ComparisonPanel renders prompt bar and passes callbacks correctly
