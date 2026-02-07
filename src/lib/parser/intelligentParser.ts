import { InfraSpec, InfraNodeSpec, ConnectionSpec, InfraNodeType } from '@/types';
import { ConversationContext, SmartParseResult, SpecModification } from './UnifiedParser';
import { CommandType } from './patterns';

/**
 * Intent analysis result from LLM
 */
export interface IntentAnalysis {
  intent: CommandType;
  confidence: number;
  components: ExtractedComponent[];
  position?: PositionInfo;
  reasoning?: string;
}

export interface ExtractedComponent {
  type: InfraNodeType;
  label: string;
  zone?: string;
  description?: string;
}

export interface PositionInfo {
  type: 'before' | 'after' | 'between' | 'start' | 'end';
  reference?: string;
  referenceSecond?: string;
}

/**
 * System prompt for intent analysis
 */
export const INTENT_ANALYSIS_PROMPT = `당신은 인프라 아키텍처 전문가입니다. 사용자의 프롬프트에서 의도와 컴포넌트를 추출합니다.

다음 형식으로 JSON 응답을 제공하세요:
{
  "intent": "create|add|remove|modify|connect|disconnect|query",
  "confidence": 0.0-1.0,
  "components": [
    {
      "type": "firewall|waf|load-balancer|web-server|db-server|...",
      "label": "표시 이름",
      "zone": "dmz|internal|external|data (선택)",
      "description": "설명 (선택)"
    }
  ],
  "position": {
    "type": "before|after|between|start|end",
    "reference": "기준 컴포넌트 타입 (선택)",
    "referenceSecond": "두 번째 기준 (between인 경우)"
  },
  "reasoning": "분석 근거 (선택)"
}

의도 유형:
- create: 새 아키텍처 생성 ("보여줘", "만들어줘", "설계해줘")
- add: 기존 아키텍처에 컴포넌트 추가 ("추가해줘", "붙여줘", "넣어줘")
- remove: 컴포넌트 제거 ("삭제해줘", "빼줘", "없애줘")
- modify: 컴포넌트 수정 ("변경해줘", "바꿔줘", "수정해줘")
- connect: 연결 생성 ("연결해줘", "이어줘")
- disconnect: 연결 해제 ("끊어줘", "연결 해제해줘")
- query: 정보 질의 ("뭐가 있어?", "어떻게 되어있어?")

사용 가능한 컴포넌트 타입:
- 보안: firewall, waf, ids-ips, vpn-gateway, nac, dlp
- 네트워크: router, switch-l2, switch-l3, load-balancer, sd-wan, dns, cdn
- 컴퓨팅: web-server, app-server, db-server, container, vm, kubernetes
- 클라우드: aws-vpc, azure-vnet, gcp-network, private-cloud
- 스토리지: san-nas, object-storage, backup, cache, storage
- 인증: ldap-ad, sso, mfa, iam
- 외부: user, internet

JSON만 출력하세요. 설명은 필요 없습니다.`;

/**
 * Parse intent analysis response from LLM
 */
export function parseIntentResponse(content: string): IntentAnalysis | null {
  const tryParse = (jsonStr: string): unknown => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  };

  // Try direct parse first
  let parsed = tryParse(content);
  if (parsed && isIntentAnalysis(parsed)) {
    return parsed as IntentAnalysis;
  }

  // Try to extract JSON from markdown code block
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    parsed = tryParse(jsonMatch[1].trim());
    if (parsed && isIntentAnalysis(parsed)) {
      return parsed as IntentAnalysis;
    }
  }

  // Try to find JSON object in response
  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    parsed = tryParse(objectMatch[0]);
    if (parsed && isIntentAnalysis(parsed)) {
      return parsed as IntentAnalysis;
    }
  }

  return null;
}

/**
 * Type guard for IntentAnalysis
 */
function isIntentAnalysis(obj: unknown): obj is IntentAnalysis {
  if (!obj || typeof obj !== 'object') return false;

  const analysis = obj as Record<string, unknown>;

  const validIntents: CommandType[] = [
    'create', 'add', 'remove', 'modify', 'connect', 'disconnect', 'query',
  ];

  if (!validIntents.includes(analysis.intent as CommandType)) return false;
  if (typeof analysis.confidence !== 'number') return false;
  if (!Array.isArray(analysis.components)) return false;

  return true;
}

/**
 * Apply intent analysis to current spec
 */
export function applyIntentToSpec(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  switch (intent.intent) {
    case 'create':
      return handleCreateFromIntent(intent, context);
    case 'add':
      return handleAddFromIntent(intent, context);
    case 'remove':
      return handleRemoveFromIntent(intent, context);
    case 'modify':
      return handleModifyFromIntent(intent, context);
    case 'connect':
      return handleConnectFromIntent(intent, context);
    case 'disconnect':
      return handleDisconnectFromIntent(intent, context);
    case 'query':
      return handleQueryFromIntent(intent, context);
    default:
      return {
        success: false,
        commandType: 'create',
        confidence: 0,
        error: '알 수 없는 의도입니다.',
      };
  }
}

function handleCreateFromIntent(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  const nodes: InfraNodeSpec[] = [];
  const connections: ConnectionSpec[] = [];

  // Always add user node if not present and there are components
  let hasUser = intent.components.some((c) => c.type === 'user');
  if (!hasUser && intent.components.length > 0) {
    nodes.push({
      id: 'user',
      type: 'user',
      label: 'User',
    });
    hasUser = true;
  }

  // Add all components
  for (const component of intent.components) {
    const nodeId = `${component.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    nodes.push({
      id: nodeId,
      type: component.type,
      label: component.label,
      zone: component.zone,
      description: component.description,
    });
  }

  // Create linear connections
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({
      source: nodes[i].id,
      target: nodes[i + 1].id,
    });
  }

  return {
    success: true,
    spec: { nodes, connections },
    commandType: 'create',
    confidence: intent.confidence,
  };
}

function handleAddFromIntent(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'add',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  if (intent.components.length === 0) {
    return {
      success: false,
      commandType: 'add',
      confidence: 0.3,
      error: '추가할 컴포넌트를 인식하지 못했습니다.',
    };
  }

  const modifications: SpecModification[] = [];
  const newSpec: InfraSpec = {
    nodes: [...context.currentSpec.nodes],
    connections: [...context.currentSpec.connections],
  };

  for (const component of intent.components) {
    const nodeId = `${component.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newNode: InfraNodeSpec = {
      id: nodeId,
      type: component.type,
      label: component.label,
      zone: component.zone,
      description: component.description,
    };

    newSpec.nodes.push(newNode);
    modifications.push({ type: 'add-node', data: newNode });

    // Handle position-based connections
    if (intent.position) {
      const connection = createConnectionFromPosition(
        nodeId,
        intent.position,
        newSpec
      );
      if (connection) {
        newSpec.connections.push(connection);
        modifications.push({ type: 'add-connection', data: connection });
      }
    }
  }

  return {
    success: true,
    spec: newSpec,
    commandType: 'add',
    modifications,
    confidence: intent.confidence,
  };
}

function handleRemoveFromIntent(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'remove',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const modifications: SpecModification[] = [];
  const nodesToRemove: string[] = [];

  for (const component of intent.components) {
    const matchingNodes = context.currentSpec.nodes.filter(
      (n) => n.type === component.type
    );
    nodesToRemove.push(...matchingNodes.map((n) => n.id));
  }

  if (nodesToRemove.length === 0) {
    return {
      success: false,
      commandType: 'remove',
      confidence: 0.3,
      error: '제거할 컴포넌트를 찾지 못했습니다.',
    };
  }

  const newSpec: InfraSpec = {
    nodes: context.currentSpec.nodes.filter((n) => !nodesToRemove.includes(n.id)),
    connections: context.currentSpec.connections.filter(
      (c) => !nodesToRemove.includes(c.source) && !nodesToRemove.includes(c.target)
    ),
  };

  for (const nodeId of nodesToRemove) {
    modifications.push({ type: 'remove-node', target: nodeId });
  }

  return {
    success: true,
    spec: newSpec,
    commandType: 'remove',
    modifications,
    confidence: intent.confidence,
  };
}

function handleModifyFromIntent(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'modify',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  const modifications: SpecModification[] = [];
  const newSpec: InfraSpec = {
    nodes: [...context.currentSpec.nodes],
    connections: [...context.currentSpec.connections],
  };

  for (const component of intent.components) {
    const nodeIndex = newSpec.nodes.findIndex((n) => n.type === component.type);
    if (nodeIndex >= 0) {
      const existingNode = newSpec.nodes[nodeIndex];
      const updatedNode: InfraNodeSpec = {
        ...existingNode,
        label: component.label || existingNode.label,
        zone: component.zone || existingNode.zone,
        description: component.description || existingNode.description,
      };
      newSpec.nodes[nodeIndex] = updatedNode;
      modifications.push({ type: 'modify-node', target: existingNode.id, data: updatedNode });
    }
  }

  if (modifications.length === 0) {
    return {
      success: false,
      commandType: 'modify',
      confidence: 0.3,
      error: '수정할 컴포넌트를 찾지 못했습니다.',
    };
  }

  return {
    success: true,
    spec: newSpec,
    commandType: 'modify',
    modifications,
    confidence: intent.confidence,
  };
}

function handleConnectFromIntent(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  if (intent.components.length < 2) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0.3,
      error: '연결할 두 컴포넌트를 지정해주세요.',
    };
  }

  const sourceNode = context.currentSpec.nodes.find(
    (n) => n.type === intent.components[0].type
  );
  const targetNode = context.currentSpec.nodes.find(
    (n) => n.type === intent.components[1].type
  );

  if (!sourceNode || !targetNode) {
    return {
      success: false,
      commandType: 'connect',
      confidence: 0.3,
      error: '해당 컴포넌트를 찾을 수 없습니다.',
    };
  }

  const newConnection: ConnectionSpec = {
    source: sourceNode.id,
    target: targetNode.id,
  };

  const newSpec: InfraSpec = {
    nodes: [...context.currentSpec.nodes],
    connections: [...context.currentSpec.connections, newConnection],
  };

  return {
    success: true,
    spec: newSpec,
    commandType: 'connect',
    modifications: [{ type: 'add-connection', data: newConnection }],
    confidence: intent.confidence,
  };
}

function handleDisconnectFromIntent(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  if (!context.currentSpec) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0,
      error: '먼저 아키텍처를 생성해주세요.',
    };
  }

  if (intent.components.length < 2) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0.3,
      error: '연결 해제할 두 컴포넌트를 지정해주세요.',
    };
  }

  const sourceNode = context.currentSpec.nodes.find(
    (n) => n.type === intent.components[0].type
  );
  const targetNode = context.currentSpec.nodes.find(
    (n) => n.type === intent.components[1].type
  );

  if (!sourceNode || !targetNode) {
    return {
      success: false,
      commandType: 'disconnect',
      confidence: 0.3,
      error: '해당 컴포넌트를 찾을 수 없습니다.',
    };
  }

  const newSpec: InfraSpec = {
    nodes: [...context.currentSpec.nodes],
    connections: context.currentSpec.connections.filter(
      (c) =>
        !(c.source === sourceNode.id && c.target === targetNode.id) &&
        !(c.source === targetNode.id && c.target === sourceNode.id)
    ),
  };

  return {
    success: true,
    spec: newSpec,
    commandType: 'disconnect',
    modifications: [
      { type: 'remove-connection', target: `${sourceNode.id}-${targetNode.id}` },
    ],
    confidence: intent.confidence,
  };
}

function handleQueryFromIntent(
  intent: IntentAnalysis,
  context: ConversationContext
): SmartParseResult {
  return {
    success: true,
    commandType: 'query',
    query: intent.reasoning || '',
    spec: context.currentSpec || undefined,
    confidence: intent.confidence,
  };
}

function createConnectionFromPosition(
  newNodeId: string,
  position: PositionInfo,
  spec: InfraSpec
): ConnectionSpec | null {
  if (!position.reference) {
    // Default: connect to last node
    const lastNode = spec.nodes[spec.nodes.length - 2]; // -2 because new node is already added
    return lastNode ? { source: lastNode.id, target: newNodeId } : null;
  }

  const referenceNode = spec.nodes.find((n) => n.type === position.reference);
  if (!referenceNode) return null;

  switch (position.type) {
    case 'after':
      return { source: referenceNode.id, target: newNodeId };
    case 'before':
      return { source: newNodeId, target: referenceNode.id };
    case 'between':
      if (position.referenceSecond) {
        const secondRef = spec.nodes.find((n) => n.type === position.referenceSecond);
        if (secondRef) {
          // Remove existing connection between the two refs
          const existingIdx = spec.connections.findIndex(
            (c) =>
              (c.source === referenceNode.id && c.target === secondRef.id) ||
              (c.source === secondRef.id && c.target === referenceNode.id)
          );
          if (existingIdx >= 0) {
            spec.connections.splice(existingIdx, 1);
          }
          // Add connections through new node
          spec.connections.push({ source: referenceNode.id, target: newNodeId });
          return { source: newNodeId, target: secondRef.id };
        }
      }
      return { source: referenceNode.id, target: newNodeId };
    default:
      return { source: referenceNode.id, target: newNodeId };
  }
}
