# 에디터 ↔ DB 연동 계획

## Context

대시보드에서 다이어그램을 생성하면 `/diagram/[id]` 페이지로 이동하지만, 실제 에디터가 아닌 JSON 스텁만 표시됨. 메인 에디터(`/`)는 DB와 연결 없이 메모리에서만 동작.

**목표**: 에디터와 DB를 연결하여 다이어그램 생성/저장/불러오기가 실제로 동작하게 만든다.

### 기존 빌딩 블록 (이미 있음)
- `specToFlow()` — `src/lib/layout/layoutEngine.ts` (InfraSpec → React Flow nodes/edges)
- `useDiagramPersistence` — `src/hooks/useDiagramPersistence.ts` (자동저장, 미사용 상태)
- API CRUD — `/api/diagrams` (POST), `/api/diagrams/[id]` (GET/PUT/DELETE)
- `useInfraState` — 에디터 전체 상태 관리 (loadFromSpec 없음)

---

## Step 1: useInfraState에 loadFromSpec 추가

**File**: `src/hooks/useInfraState.ts`

`clearDiagram` 아래에 `loadFromSpec` 추가:

```typescript
import { specToFlow } from '@/lib/layout';

const loadFromSpec = useCallback(
  (spec: InfraSpec, nodesJson?: Node[], edgesJson?: Edge[]) => {
    if (nodesJson?.length && edgesJson?.length) {
      setNodes(nodesJson);
      setEdges(edgesJson);
    } else {
      const { nodes: generated, edges: generatedEdges } = specToFlow(spec);
      setNodes(generated);
      setEdges(generatedEdges);
    }
    setCurrentSpec(spec);
    setLastResult(null);
    resetAnimation();
    clearSelection();
  },
  [setNodes, setEdges, setLastResult, resetAnimation, clearSelection]
);
```

return 객체에 `loadFromSpec` 추가.

---

## Step 2: InfraEditor 공유 컴포넌트 추출

**New file**: `src/components/editor/InfraEditor.tsx`

`/page.tsx`의 에디터 UI를 추출하여 재사용 가능한 컴포넌트로 만든다.

```typescript
interface InfraEditorProps {
  diagramId?: string | null;
  initialSpec?: InfraSpec | null;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  title?: string;
  onTitleChange?: (title: string) => void;
  onFirstSave?: (diagramId: string) => void;
}
```

핵심:
- `useInfraState()` 호출
- `initialSpec`이 있으면 mount 시 `loadFromSpec()` 호출 (ref로 1회만)
- `diagramId`가 있으면 `useDiagramPersistence` 활성화
- `diagramId`가 없으면 "저장" 버튼 표시 → POST → `onFirstSave(id)` 콜백

---

## Step 3: /page.tsx 간소화

**File**: `src/app/page.tsx`

```typescript
export default function Home() {
  const router = useRouter();
  return (
    <InfraEditor
      onFirstSave={(id) => router.push(`/diagram/${id}`)}
    />
  );
}
```

---

## Step 4: /diagram/[id] 에디터 페이지 교체

**File**: `src/app/diagram/[id]/page.tsx`

스텁 → 실제 에디터:
1. `GET /api/diagrams/${id}` → diagram 데이터 로드
2. 로딩/에러 상태 표시
3. `<InfraEditor diagramId={id} initialSpec={spec} initialNodes={...} initialEdges={...} />` 렌더

---

## Step 5: Header에 저장 상태 + 제목 편집 추가

**File**: `src/components/layout/Header.tsx`

HeaderProps에 추가:
- `isSaving?: boolean`, `lastSavedAt?: Date | null`
- `title?: string`, `onTitleChange?: (title: string) => void`
- `onSave?: () => void` (신규 다이어그램용)

UI:
- `title`이 있으면 로고 옆에 편집 가능한 제목 input
- `lastSavedAt`이 있으면 "저장됨 · N초 전" 배지
- `isSaving`이면 "저장 중..." 배지
- `onSave`가 있으면 (미저장 상태) Save 버튼

---

## Step 6: useDiagramPersistence에 isSaving 상태 반응성 개선

**File**: `src/hooks/useDiagramPersistence.ts`

현재 `isSaving`과 `lastSavedAt`이 ref 기반이라 re-render를 트리거하지 않음.
→ `useState`로 변경하여 UI 업데이트가 반영되게 수정.

```typescript
const [isSaving, setIsSaving] = useState(false);
const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
```

---

## 검증

1. `npx tsc --noEmit` — 0 errors
2. `npx vitest run` — 모든 테스트 통과
3. 수동 테스트:
   - `/` 접속 → 프롬프트 입력 → 다이어그램 생성 → Save 클릭 → `/diagram/[id]`로 이동 확인
   - `/diagram/[id]` 접속 → 에디터 로드 확인 → 노드 수정 → 자동저장 확인
   - 대시보드 → 기존 다이어그램 클릭 → 에디터 로드 확인
   - 새로고침 → 데이터 유지 확인

## 파일 변경 요약

| 파일 | 작업 |
|------|------|
| `src/hooks/useInfraState.ts` | `loadFromSpec` 추가 |
| `src/components/editor/InfraEditor.tsx` | 신규 (page.tsx에서 추출) |
| `src/app/page.tsx` | 간소화 (InfraEditor 사용) |
| `src/app/diagram/[id]/page.tsx` | 스텁 → 실제 에디터 |
| `src/components/layout/Header.tsx` | 제목 편집 + 저장 상태 |
| `src/hooks/useDiagramPersistence.ts` | ref → useState 반응성 개선 |
