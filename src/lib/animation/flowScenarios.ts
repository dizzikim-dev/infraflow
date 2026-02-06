import { AnimationSequence, AnimationStep, InfraSpec, EdgeFlowType } from '@/types';

export type ScenarioType =
  | 'request-response'  // 요청/응답 왕복
  | 'request-only'      // 요청만
  | 'blocked'           // 차단된 요청
  | 'sync'              // 동기화/복제
  | 'full-flow';        // 전체 흐름

/**
 * Generate animation sequence from infrastructure spec
 */
export function generateFlowSequence(
  spec: InfraSpec,
  type: ScenarioType = 'request-response',
  options: {
    stepDuration?: number;
    stepDelay?: number;
    loop?: boolean;
  } = {}
): AnimationSequence {
  const { stepDuration = 800, stepDelay = 200, loop = true } = options;

  const steps: AnimationStep[] = [];

  // Build connection path
  const connectionPath = buildConnectionPath(spec);

  switch (type) {
    case 'request-only':
      // Forward path only
      connectionPath.forEach((conn, index) => {
        steps.push({
          from: conn.source,
          to: conn.target,
          delay: index === 0 ? 0 : stepDelay,
          duration: stepDuration,
          type: conn.flowType || 'request',
          label: conn.label,
        });
      });
      break;

    case 'request-response':
      // Forward path
      connectionPath.forEach((conn, index) => {
        steps.push({
          from: conn.source,
          to: conn.target,
          delay: index === 0 ? 0 : stepDelay,
          duration: stepDuration,
          type: conn.flowType || 'request',
          label: conn.label || 'Request',
        });
      });

      // Add pause before response
      const lastStep = steps[steps.length - 1];
      if (lastStep) {
        lastStep.duration += 300; // Extra time at destination
      }

      // Return path (response)
      [...connectionPath].reverse().forEach((conn, index) => {
        steps.push({
          from: conn.target,
          to: conn.source,
          delay: index === 0 ? stepDelay * 2 : stepDelay,
          duration: stepDuration,
          type: 'response',
          label: 'Response',
        });
      });
      break;

    case 'blocked':
      // Forward path until blocked
      const blockedIndex = Math.min(2, connectionPath.length - 1);
      connectionPath.slice(0, blockedIndex + 1).forEach((conn, index) => {
        const isBlocked = index === blockedIndex;
        steps.push({
          from: conn.source,
          to: conn.target,
          delay: index === 0 ? 0 : stepDelay,
          duration: isBlocked ? stepDuration * 1.5 : stepDuration,
          type: isBlocked ? 'blocked' : 'request',
          label: isBlocked ? 'BLOCKED' : undefined,
        });
      });
      break;

    case 'sync':
      // Bidirectional sync flow
      connectionPath.forEach((conn, index) => {
        steps.push({
          from: conn.source,
          to: conn.target,
          delay: index === 0 ? 0 : stepDelay,
          duration: stepDuration,
          type: 'sync',
          label: 'Sync',
        });
      });
      break;

    case 'full-flow':
      // All connections animated simultaneously with stagger
      spec.connections.forEach((conn, index) => {
        steps.push({
          from: conn.source,
          to: conn.target,
          delay: index * (stepDelay / 2),
          duration: stepDuration,
          type: conn.flowType || 'request',
          label: conn.label,
        });
      });
      break;
  }

  return {
    id: `scenario-${type}-${Date.now()}`,
    name: getScenarioName(type),
    description: getScenarioDescription(type),
    steps,
    loop,
  };
}

/**
 * Build a linear path through the connections
 */
function buildConnectionPath(spec: InfraSpec): Array<{
  source: string;
  target: string;
  flowType?: EdgeFlowType;
  label?: string;
}> {
  // Find root nodes (no incoming edges)
  const targetNodes = new Set(spec.connections.map((c) => c.target));
  const sourceNodes = new Set(spec.connections.map((c) => c.source));

  const rootCandidates = Array.from(sourceNodes).filter((s) => !targetNodes.has(s));
  const root = rootCandidates[0] || spec.nodes[0]?.id;

  if (!root) return [];

  // BFS to build path
  const visited = new Set<string>();
  const path: Array<{ source: string; target: string; flowType?: EdgeFlowType; label?: string }> = [];
  const queue = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const outgoing = spec.connections.filter((c) => c.source === current);
    for (const conn of outgoing) {
      if (!visited.has(conn.target)) {
        path.push({
          source: conn.source,
          target: conn.target,
          flowType: conn.flowType,
          label: conn.label,
        });
        queue.push(conn.target);
      }
    }
  }

  return path;
}

function getScenarioName(type: ScenarioType): string {
  const names: Record<ScenarioType, string> = {
    'request-response': '요청/응답 흐름',
    'request-only': '요청 흐름',
    blocked: '차단된 요청',
    sync: '동기화 흐름',
    'full-flow': '전체 흐름',
  };
  return names[type];
}

function getScenarioDescription(type: ScenarioType): string {
  const descriptions: Record<ScenarioType, string> = {
    'request-response': '클라이언트 요청부터 서버 응답까지의 완전한 흐름',
    'request-only': '요청 방향으로만 진행되는 단방향 흐름',
    blocked: '보안 장비에서 차단되는 요청 시뮬레이션',
    sync: '데이터 동기화 및 복제 흐름',
    'full-flow': '모든 연결을 동시에 애니메이션',
  };
  return descriptions[type];
}

/**
 * Get available scenario types
 */
export function getAvailableScenarios(): Array<{
  type: ScenarioType;
  name: string;
  description: string;
  icon: string;
}> {
  return [
    {
      type: 'request-response',
      name: '요청/응답',
      description: '왕복 데이터 흐름',
      icon: '🔄',
    },
    {
      type: 'request-only',
      name: '요청만',
      description: '단방향 흐름',
      icon: '➡️',
    },
    {
      type: 'blocked',
      name: '차단',
      description: '보안 차단 시뮬레이션',
      icon: '🚫',
    },
    {
      type: 'sync',
      name: '동기화',
      description: '데이터 복제',
      icon: '🔁',
    },
    {
      type: 'full-flow',
      name: '전체',
      description: '모든 연결 동시 표시',
      icon: '🌊',
    },
  ];
}
