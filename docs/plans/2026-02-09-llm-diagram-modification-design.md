# LLM 기반 다이어그램 수정 기능 설계

> **작성일**: 2026-02-09
> **목표**: 자연어 프롬프트로 기존 인프라 다이어그램을 자유롭게 수정하는 기능

## 1. 개요

### 문제점
현재 파서는 규칙 기반으로 동작하며, "firewall 대신 VPN 장비 구성해줘" 같은 수정 요청을 처리할 수 없음.
- `modify` 핸들러가 노드의 type 변경을 지원하지 않음
- "X 대신 Y" 패턴을 replace 명령으로 인식하지 못함
- 교체 시 기존 연결(edge) 유지 로직 없음

### 해결 방향
- **LLM 기반**: Claude Sonnet으로 자연어 의도 완벽 분석
- **Diff 기반 응답**: 전체 재생성이 아닌 변경 사항만 반환
- **연결 보존**: 노드 교체 시 기존 edge 유지

---

## 2. 아키텍처

```
사용자 프롬프트: "보안 강화해줘"
        │
        ▼
┌───────────────────────────────────────────────────┐
│  Context Builder                                  │
│  • 현재 캔버스 상태 (nodes, edges) 추출           │
│  • 노드별 타입/연결 관계 정리                     │
│  • 대화 히스토리 포함                             │
└───────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────┐
│  Claude Sonnet API                                │
│  • System Prompt: 인프라 전문가 역할 정의         │
│  • Context: 현재 다이어그램 JSON                  │
│  • User Message: 사용자 프롬프트                  │
│  • Response: Diff 형식의 변경 사항                │
└───────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────┐
│  Diff Applier                                     │
│  • ADD: 새 노드 추가 + 연결 생성                  │
│  • REMOVE: 노드 삭제 + 연결 정리                  │
│  • REPLACE: 노드 타입 변경 + 연결 유지            │
│  • MODIFY: 속성 변경 (label, description 등)      │
└───────────────────────────────────────────────────┘
        │
        ▼
    캔버스 업데이트
```

---

## 3. LLM 프롬프트 설계

### System Prompt

```typescript
const SYSTEM_PROMPT = `당신은 인프라 아키텍처 수정 전문가입니다.

## 역할
사용자의 자연어 요청을 분석하여 현재 인프라 다이어그램에 적용할 변경 사항을 JSON으로 반환합니다.

## 사용 가능한 컴포넌트 타입
- security: firewall, waf, ids-ips, vpn-gateway, nac, dlp
- network: router, switch, load-balancer, cdn, dns, sd-wan
- compute: web-server, app-server, db-server, container, vm, kubernetes
- cloud: aws-vpc, azure-vnet, gcp-network, private-cloud
- storage: san-nas, object-storage, cache, backup
- auth: ldap, sso, mfa, iam
- external: user, internet

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "reasoning": "변경 이유 설명",
  "operations": [
    {
      "type": "add|remove|replace|modify|connect|disconnect",
      "target": "노드ID 또는 새 노드 타입",
      "data": { /* 변경 데이터 */ }
    }
  ]
}`;
```

### 응답 형식

```typescript
interface LLMResponse {
  reasoning: string;
  operations: Operation[];
}

type Operation =
  | { type: 'add'; target: string; data: AddData }
  | { type: 'remove'; target: string }
  | { type: 'replace'; target: string; data: ReplaceData }
  | { type: 'modify'; target: string; data: ModifyData }
  | { type: 'connect'; data: ConnectData }
  | { type: 'disconnect'; data: DisconnectData };
```

### 응답 예시

```json
// "firewall 대신 VPN 장비 구성해줘"
{
  "reasoning": "Firewall을 VPN Gateway로 교체합니다. 기존 연결은 유지됩니다.",
  "operations": [
    {
      "type": "replace",
      "target": "firewall-1",
      "data": {
        "newType": "vpn-gateway",
        "label": "VPN Gateway",
        "preserveConnections": true
      }
    }
  ]
}

// "보안 강화해줘"
{
  "reasoning": "현재 구성에 IDS/IPS와 WAF를 추가하여 보안을 강화합니다.",
  "operations": [
    {
      "type": "add",
      "target": "ids-ips",
      "data": {
        "label": "IDS/IPS",
        "afterNode": "firewall-1"
      }
    },
    {
      "type": "add",
      "target": "waf",
      "data": {
        "label": "WAF",
        "beforeNode": "load-balancer-1"
      }
    }
  ]
}
```

---

## 4. Diff Applier

### 핵심 로직

```typescript
export function applyOperations(
  currentSpec: InfraSpec,
  operations: Operation[]
): ApplyResult {
  let spec = structuredClone(currentSpec);

  for (const op of operations) {
    switch (op.type) {
      case 'replace': spec = applyReplace(spec, op); break;
      case 'add': spec = applyAdd(spec, op); break;
      case 'remove': spec = applyRemove(spec, op); break;
      case 'modify': spec = applyModify(spec, op); break;
      case 'connect': spec = applyConnect(spec, op); break;
      case 'disconnect': spec = applyDisconnect(spec, op); break;
    }
  }

  return { success: true, newSpec: spec };
}
```

### Replace 로직 (핵심)

```typescript
function applyReplace(spec: InfraSpec, op: ReplaceOperation): InfraSpec {
  const nodeIndex = spec.nodes.findIndex(n =>
    n.id === op.target || n.type === op.target
  );

  const oldNode = spec.nodes[nodeIndex];
  const newNodeId = `${op.data.newType}-${Date.now()}`;

  // 1. 노드 교체 (위치/zone 유지)
  spec.nodes[nodeIndex] = {
    id: newNodeId,
    type: op.data.newType,
    label: op.data.label || op.data.newType,
    zone: oldNode.zone,
  };

  // 2. 연결 업데이트
  if (op.data.preserveConnections) {
    spec.connections = spec.connections.map(conn => ({
      ...conn,
      source: conn.source === oldNode.id ? newNodeId : conn.source,
      target: conn.target === oldNode.id ? newNodeId : conn.target,
    }));
  }

  return spec;
}
```

---

## 5. Context Builder

### 캔버스 상태 추출

```typescript
export function buildContext(nodes: Node[], edges: Edge[]): DiagramContext {
  const nodeContexts = nodes.map(node => ({
    id: node.id,
    type: node.data.nodeType,
    label: node.data.label,
    category: node.data.category,
    zone: node.data.tier,
    connectedTo: edges.filter(e => e.source === node.id).map(e => e.target),
    connectedFrom: edges.filter(e => e.target === node.id).map(e => e.source),
  }));

  return {
    nodes: nodeContexts,
    connections: edges.map(e => ({ source: e.source, target: e.target })),
    summary: generateSummary(nodeContexts),
  };
}
```

### LLM에 전달되는 형식

```
## 현재 다이어그램 상태

### 노드 목록
- firewall-1 (firewall): "Firewall" [dmz]
    └ 연결: cdn-1 → [이 노드] → web-server-1, web-server-2

### 요약
3티어 웹 아키텍처 (10개 노드)

---

## 사용자 요청
"firewall 대신 VPN 장비 구성해줘"
```

---

## 6. API 엔드포인트

### /api/modify

```typescript
export async function POST(request: Request) {
  const { prompt, currentSpec, nodes, edges } = await request.json();

  // 1. Context 빌드
  const context = buildContext(nodes, edges);

  // 2. Claude Sonnet 호출
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: formatUserMessage(context, prompt) }],
  });

  // 3. 응답 파싱 및 검증
  const llmResponse = validateLLMResponse(parseJSON(response));

  // 4. Operations 적용
  const result = applyOperations(currentSpec, llmResponse.operations);

  return Response.json({
    success: result.success,
    spec: result.newSpec,
    reasoning: llmResponse.reasoning,
    operations: llmResponse.operations,
  });
}
```

---

## 7. 에러 처리

| 에러 코드 | 상황 | 사용자 메시지 |
|----------|------|--------------|
| API_KEY_MISSING | API 키 없음 | "AI 기능을 사용하려면 API 키 설정이 필요합니다." |
| API_RATE_LIMIT | 요청 한도 초과 | "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." |
| API_TIMEOUT | 응답 시간 초과 | "AI 응답 시간이 초과되었습니다." |
| NODE_NOT_FOUND | 노드 없음 | "해당 노드를 찾을 수 없습니다." |
| INVALID_JSON | JSON 파싱 실패 | "AI 응답을 처리할 수 없습니다." |

---

## 8. 파일 구조

```
src/
├── app/api/modify/route.ts          # 신규: LLM 수정 API
├── lib/parser/
│   ├── contextBuilder.ts            # 신규: 캔버스 상태 추출
│   ├── diffApplier.ts               # 신규: Operations 적용
│   ├── responseValidator.ts         # 신규: LLM 응답 검증
│   ├── prompts.ts                   # 신규: 프롬프트 정의
│   └── errors.ts                    # 신규: 에러 정의
├── hooks/usePromptParser.ts         # 수정: LLM 기반 로직
└── components/panels/PromptPanel.tsx # 수정: UI 개선
```

---

## 9. 구현 순서

1. `lib/parser/prompts.ts` - System/User 프롬프트 정의
2. `lib/parser/contextBuilder.ts` - 캔버스 상태 추출
3. `lib/parser/diffApplier.ts` - Operations 적용 로직
4. `lib/parser/responseValidator.ts` - Zod 스키마 검증
5. `lib/parser/errors.ts` - 에러 클래스 정의
6. `app/api/modify/route.ts` - API 엔드포인트
7. `hooks/usePromptParser.ts` - Hook 수정
8. `components/panels/PromptPanel.tsx` - UI 수정
9. 테스트 파일 작성
