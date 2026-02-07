import { AnimationSequence, AnimationStep, InfraSpec, EdgeFlowType } from '@/types';

export type ScenarioType =
  | 'request-response'  // 요청/응답 왕복
  | 'request-only'      // 요청만
  | 'blocked'           // 차단된 요청
  | 'sync'              // 동기화/복제
  | 'full-flow'         // 전체 흐름
  // 장애 시나리오 (P1 확장)
  | 'server-failure'    // 서버 장애 시뮬레이션
  | 'failover'          // 페일오버 동작
  | 'ddos-attack'       // DDoS 공격 시뮬레이션
  | 'network-partition' // 네트워크 단절
  | 'load-balancing';   // 부하 분산 시각화

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

    case 'server-failure':
      // Server failure simulation - request goes through then fails
      {
        const failureNodeIndex = Math.min(
          Math.floor(connectionPath.length * 0.7),
          connectionPath.length - 1
        );

        // Normal flow until failure point
        connectionPath.slice(0, failureNodeIndex + 1).forEach((conn, index) => {
          steps.push({
            from: conn.source,
            to: conn.target,
            delay: index === 0 ? 0 : stepDelay,
            duration: stepDuration,
            type: index === failureNodeIndex ? 'blocked' : 'request',
            label: index === failureNodeIndex ? '⚠️ SERVER DOWN' : undefined,
          });
        });

        // Error propagation back to source
        connectionPath.slice(0, failureNodeIndex).reverse().forEach((conn, index) => {
          steps.push({
            from: conn.target,
            to: conn.source,
            delay: index === 0 ? stepDelay * 2 : stepDelay,
            duration: stepDuration * 0.7,
            type: 'blocked',
            label: index === 0 ? '500 Error' : undefined,
          });
        });
      }
      break;

    case 'failover':
      // Failover scenario - primary fails, secondary takes over
      {
        const primaryPath = connectionPath.slice(0, Math.ceil(connectionPath.length / 2));
        const secondaryPath = connectionPath.slice(Math.ceil(connectionPath.length / 2));

        // Initial request to primary
        primaryPath.forEach((conn, index) => {
          steps.push({
            from: conn.source,
            to: conn.target,
            delay: index === 0 ? 0 : stepDelay,
            duration: stepDuration,
            type: 'request',
            label: index === 0 ? 'Primary Path' : undefined,
          });
        });

        // Primary failure
        const lastPrimary = primaryPath[primaryPath.length - 1];
        if (lastPrimary) {
          steps.push({
            from: lastPrimary.target,
            to: lastPrimary.target,
            delay: stepDelay,
            duration: stepDuration * 1.5,
            type: 'blocked',
            label: '❌ PRIMARY FAILED',
          });
        }

        // Failover to secondary
        if (secondaryPath.length > 0) {
          steps.push({
            from: primaryPath[0]?.source || spec.nodes[0]?.id || '',
            to: secondaryPath[0]?.source || '',
            delay: stepDelay * 2,
            duration: stepDuration,
            type: 'sync',
            label: '🔄 FAILOVER',
          });

          secondaryPath.forEach((conn, index) => {
            steps.push({
              from: conn.source,
              to: conn.target,
              delay: stepDelay,
              duration: stepDuration,
              type: 'request',
              label: index === 0 ? 'Secondary Path' : undefined,
            });
          });
        }
      }
      break;

    case 'ddos-attack':
      // DDoS attack simulation - multiple rapid requests then blocked
      {
        const attackTarget = connectionPath[0];
        if (attackTarget) {
          // Multiple attack requests
          for (let i = 0; i < 5; i++) {
            steps.push({
              from: attackTarget.source,
              to: attackTarget.target,
              delay: i * (stepDelay / 3),
              duration: stepDuration / 2,
              type: 'request',
              label: i === 0 ? '🔴 ATTACK' : undefined,
            });
          }

          // Security device blocks
          steps.push({
            from: attackTarget.target,
            to: attackTarget.source,
            delay: stepDelay * 2,
            duration: stepDuration,
            type: 'blocked',
            label: '🛡️ BLOCKED BY WAF',
          });

          // Normal traffic continues
          connectionPath.forEach((conn, index) => {
            steps.push({
              from: conn.source,
              to: conn.target,
              delay: stepDelay * 3 + index * stepDelay,
              duration: stepDuration,
              type: 'encrypted',
              label: index === 0 ? '✅ Legitimate Traffic' : undefined,
            });
          });
        }
      }
      break;

    case 'network-partition':
      // Network partition - some paths become unreachable
      {
        const partitionPoint = Math.floor(connectionPath.length / 2);

        // Initial flow works
        connectionPath.slice(0, partitionPoint).forEach((conn, index) => {
          steps.push({
            from: conn.source,
            to: conn.target,
            delay: index === 0 ? 0 : stepDelay,
            duration: stepDuration,
            type: 'request',
          });
        });

        // Network partition occurs
        if (partitionPoint < connectionPath.length) {
          const partitionConn = connectionPath[partitionPoint];
          steps.push({
            from: partitionConn.source,
            to: partitionConn.target,
            delay: stepDelay,
            duration: stepDuration * 2,
            type: 'blocked',
            label: '🔌 NETWORK PARTITION',
          });

          // Timeout indication
          steps.push({
            from: partitionConn.target,
            to: connectionPath[0]?.source || '',
            delay: stepDelay * 3,
            duration: stepDuration,
            type: 'blocked',
            label: '⏱️ TIMEOUT',
          });
        }
      }
      break;

    case 'load-balancing':
      // Load balancing visualization - traffic distributed across paths
      {
        // Find load balancer node
        const lbNodeIndex = spec.nodes.findIndex(
          (n) => n.type === 'load-balancer' || n.label.toLowerCase().includes('lb')
        );

        if (lbNodeIndex >= 0) {
          const lbNode = spec.nodes[lbNodeIndex];
          const outgoingConns = spec.connections.filter((c) => c.source === lbNode.id);

          // Traffic to load balancer
          const incomingConns = spec.connections.filter((c) => c.target === lbNode.id);
          incomingConns.forEach((conn, index) => {
            steps.push({
              from: conn.source,
              to: conn.target,
              delay: index * stepDelay,
              duration: stepDuration,
              type: 'request',
              label: '📊 Traffic',
            });
          });

          // Distributed to backends
          outgoingConns.forEach((conn, index) => {
            steps.push({
              from: conn.source,
              to: conn.target,
              delay: stepDelay * 2 + index * (stepDelay / 2),
              duration: stepDuration,
              type: 'request',
              label: `Backend ${index + 1}`,
            });
          });

          // Responses back
          outgoingConns.forEach((conn, index) => {
            steps.push({
              from: conn.target,
              to: conn.source,
              delay: stepDelay * 4 + index * (stepDelay / 2),
              duration: stepDuration,
              type: 'response',
            });
          });
        } else {
          // Fallback to standard request-response
          connectionPath.forEach((conn, index) => {
            steps.push({
              from: conn.source,
              to: conn.target,
              delay: index === 0 ? 0 : stepDelay,
              duration: stepDuration,
              type: 'request',
            });
          });
        }
      }
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
    // 장애 시나리오
    'server-failure': '서버 장애',
    'failover': '페일오버',
    'ddos-attack': 'DDoS 공격',
    'network-partition': '네트워크 단절',
    'load-balancing': '부하 분산',
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
    // 장애 시나리오
    'server-failure': '서버 다운 시 에러 전파 경로 시각화',
    'failover': '장애 발생 시 이중화 경로로 전환',
    'ddos-attack': 'DDoS 공격 시도 및 WAF 차단 시뮬레이션',
    'network-partition': '네트워크 단절로 인한 타임아웃 발생',
    'load-balancing': '로드밸런서 트래픽 분산 동작',
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
  category: 'basic' | 'failure' | 'performance';
}> {
  return [
    // 기본 시나리오
    {
      type: 'request-response',
      name: '요청/응답',
      description: '왕복 데이터 흐름',
      icon: '🔄',
      category: 'basic',
    },
    {
      type: 'request-only',
      name: '요청만',
      description: '단방향 흐름',
      icon: '➡️',
      category: 'basic',
    },
    {
      type: 'blocked',
      name: '차단',
      description: '보안 차단 시뮬레이션',
      icon: '🚫',
      category: 'basic',
    },
    {
      type: 'sync',
      name: '동기화',
      description: '데이터 복제',
      icon: '🔁',
      category: 'basic',
    },
    {
      type: 'full-flow',
      name: '전체',
      description: '모든 연결 동시 표시',
      icon: '🌊',
      category: 'basic',
    },
    // 장애 시나리오
    {
      type: 'server-failure',
      name: '서버 장애',
      description: '서버 다운 시 에러 전파',
      icon: '💥',
      category: 'failure',
    },
    {
      type: 'failover',
      name: '페일오버',
      description: '이중화 경로 전환',
      icon: '🔀',
      category: 'failure',
    },
    {
      type: 'ddos-attack',
      name: 'DDoS 공격',
      description: '공격 및 WAF 차단',
      icon: '🛡️',
      category: 'failure',
    },
    {
      type: 'network-partition',
      name: '네트워크 단절',
      description: '파티션 및 타임아웃',
      icon: '🔌',
      category: 'failure',
    },
    // 성능 시나리오
    {
      type: 'load-balancing',
      name: '부하 분산',
      description: 'LB 트래픽 분산',
      icon: '⚖️',
      category: 'performance',
    },
  ];
}
