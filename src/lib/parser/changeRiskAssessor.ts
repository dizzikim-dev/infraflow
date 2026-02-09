/**
 * Change Risk Assessor
 *
 * Assesses the risk level of diagram modifications by comparing before/after
 * InfraSpec. Detects security regressions, antipattern introductions, broken
 * mandatory dependencies, redundancy removals, and other risk factors.
 */

import type { InfraSpec, InfraNodeType } from '@/types/infra';
import { ANTIPATTERNS } from '../knowledge/antipatterns';
import { getMandatoryDependencies } from '../knowledge/relationships';
import { getCategoryForType } from '../data/infrastructureDB';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactor {
  code: string;
  level: RiskLevel;
  descriptionKo: string;
  details?: string;
}

export interface ChangeRiskAssessment {
  level: RiskLevel;
  factors: RiskFactor[];
  summary: {
    addedNodes: number;
    removedNodes: number;
    addedConnections: number;
    removedConnections: number;
    totalChanges: number;
  };
  recommendation: 'auto-apply' | 'confirm' | 'review-required';
  recommendationKo: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECURITY_TYPES: InfraNodeType[] = [
  'firewall',
  'waf',
  'ids-ips',
  'vpn-gateway',
  'nac',
  'dlp',
];

const AUTH_TYPES: InfraNodeType[] = ['ldap-ad', 'sso', 'mfa', 'iam'];

const INTERNAL_ONLY_TYPES: InfraNodeType[] = [
  'db-server',
  'ldap-ad',
  'san-nas',
  'backup',
  'cache',
  'app-server',
];

const RISK_LEVEL_ORDER: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

// ---------------------------------------------------------------------------
// Recommendation logic
// ---------------------------------------------------------------------------

export function getRecommendation(level: RiskLevel): {
  recommendation: 'auto-apply' | 'confirm' | 'review-required';
  recommendationKo: string;
} {
  switch (level) {
    case 'critical':
      return {
        recommendation: 'review-required',
        recommendationKo:
          '중대한 변경입니다. 반드시 검토 후 적용하세요.',
      };
    case 'high':
      return {
        recommendation: 'review-required',
        recommendationKo:
          '보안 또는 가용성에 영향을 줄 수 있습니다. 검토를 권장합니다.',
      };
    case 'medium':
      return {
        recommendation: 'confirm',
        recommendationKo: '변경 범위가 넓습니다. 확인 후 적용하세요.',
      };
    case 'low':
    default:
      return {
        recommendation: 'auto-apply',
        recommendationKo: '안전한 변경입니다. 자동 적용 가능합니다.',
      };
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getHighestRisk(factors: RiskFactor[]): RiskLevel {
  let highest: RiskLevel = 'low';
  for (const f of factors) {
    if (RISK_LEVEL_ORDER[f.level] > RISK_LEVEL_ORDER[highest]) {
      highest = f.level;
    }
  }
  return highest;
}

function getNodeTypeSet(spec: InfraSpec): Set<string> {
  return new Set(spec.nodes.map((n) => n.type));
}

function getNodeIds(spec: InfraSpec): Set<string> {
  return new Set(spec.nodes.map((n) => n.id));
}

function connectionKey(c: { source: string; target: string }): string {
  return `${c.source}->${c.target}`;
}

function countByType(spec: InfraSpec, type: InfraNodeType): number {
  return spec.nodes.filter((n) => n.type === type).length;
}

// ---------------------------------------------------------------------------
// Risk factor detection
// ---------------------------------------------------------------------------

export function getRiskFactors(
  before: InfraSpec,
  after: InfraSpec,
): RiskFactor[] {
  const factors: RiskFactor[] = [];

  const beforeIds = getNodeIds(before);
  const afterIds = getNodeIds(after);

  const addedNodeIds = [...afterIds].filter((id) => !beforeIds.has(id));
  const removedNodeIds = [...beforeIds].filter((id) => !afterIds.has(id));

  const beforeConnKeys = new Set(before.connections.map(connectionKey));
  const afterConnKeys = new Set(after.connections.map(connectionKey));

  const addedConnections = [...afterConnKeys].filter(
    (k) => !beforeConnKeys.has(k),
  );
  const removedConnections = [...beforeConnKeys].filter(
    (k) => !afterConnKeys.has(k),
  );

  const removedNodes = before.nodes.filter((n) => removedNodeIds.includes(n.id));

  // --- ALL_NODES_REMOVED ---
  if (before.nodes.length > 0 && after.nodes.length === 0) {
    factors.push({
      code: 'ALL_NODES_REMOVED',
      level: 'critical',
      descriptionKo: '모든 노드가 제거되었습니다. 다이어그램이 비어 있습니다.',
    });
  }

  // --- SECURITY_NODE_REMOVED ---
  for (const node of removedNodes) {
    if (SECURITY_TYPES.includes(node.type as InfraNodeType)) {
      factors.push({
        code: 'SECURITY_NODE_REMOVED',
        level: 'high',
        descriptionKo: `보안 노드가 제거되었습니다: ${node.label} (${node.type})`,
        details: node.type,
      });
    }
  }

  // --- AUTH_NODE_REMOVED ---
  for (const node of removedNodes) {
    if (AUTH_TYPES.includes(node.type as InfraNodeType)) {
      factors.push({
        code: 'AUTH_NODE_REMOVED',
        level: 'high',
        descriptionKo: `인증 노드가 제거되었습니다: ${node.label} (${node.type})`,
        details: node.type,
      });
    }
  }

  // --- BACKUP_REMOVED ---
  for (const node of removedNodes) {
    if (node.type === 'backup') {
      factors.push({
        code: 'BACKUP_REMOVED',
        level: 'high',
        descriptionKo: `백업 노드가 제거되었습니다: ${node.label}`,
        details: node.id,
      });
    }
  }

  // --- MASSIVE_CHANGE / LARGE_CHANGE / MODERATE_CHANGE ---
  const totalChanged = addedNodeIds.length + removedNodeIds.length;
  if (before.nodes.length > 0) {
    const changeRatio = totalChanged / before.nodes.length;
    if (changeRatio > 0.5) {
      factors.push({
        code: 'MASSIVE_CHANGE',
        level: 'critical',
        descriptionKo: `노드의 ${Math.round(changeRatio * 100)}% 이상이 변경되었습니다 (추가: ${addedNodeIds.length}, 제거: ${removedNodeIds.length}).`,
      });
    } else if (changeRatio > 0.3) {
      factors.push({
        code: 'LARGE_CHANGE',
        level: 'high',
        descriptionKo: `노드의 ${Math.round(changeRatio * 100)}%가 변경되었습니다 (추가: ${addedNodeIds.length}, 제거: ${removedNodeIds.length}).`,
      });
    }
  }

  if (totalChanged >= 5 && !factors.some((f) => f.code === 'MASSIVE_CHANGE' || f.code === 'LARGE_CHANGE')) {
    factors.push({
      code: 'MODERATE_CHANGE',
      level: 'medium',
      descriptionKo: `${totalChanged}개의 노드가 변경되었습니다 (추가: ${addedNodeIds.length}, 제거: ${removedNodeIds.length}).`,
    });
  }

  // --- ANTIPATTERN_INTRODUCED ---
  for (const ap of ANTIPATTERNS) {
    try {
      const detectedBefore = ap.detection(before);
      const detectedAfter = ap.detection(after);
      if (!detectedBefore && detectedAfter) {
        factors.push({
          code: 'ANTIPATTERN_INTRODUCED',
          level: 'high',
          descriptionKo: `안티패턴이 도입되었습니다: ${ap.nameKo} (${ap.id})`,
          details: ap.id,
        });
      }
    } catch {
      // Skip antipatterns that throw during detection
    }
  }

  // --- MANDATORY_DEP_BROKEN ---
  // Check if any node in `after` has a mandatory dependency that was satisfied
  // in `before` but is no longer satisfied in `after`
  const afterTypeSet = getNodeTypeSet(after);
  const beforeTypeSet = getNodeTypeSet(before);

  for (const node of after.nodes) {
    const deps = getMandatoryDependencies(node.type as InfraNodeType);
    for (const dep of deps) {
      const targetType = dep.target;
      // Was satisfied in before, now broken in after
      if (beforeTypeSet.has(targetType) && !afterTypeSet.has(targetType)) {
        factors.push({
          code: 'MANDATORY_DEP_BROKEN',
          level: 'high',
          descriptionKo: `필수 의존성이 깨졌습니다: ${node.type}은(는) ${targetType}이(가) 필요합니다.`,
          details: `${node.type} -> ${targetType}`,
        });
      }
    }
  }

  // --- REDUNDANCY_REMOVED ---
  // Check if a component that had 2+ instances now has only 1
  const beforeTypeCounts = new Map<string, number>();
  for (const n of before.nodes) {
    beforeTypeCounts.set(n.type, (beforeTypeCounts.get(n.type) || 0) + 1);
  }
  const afterTypeCounts = new Map<string, number>();
  for (const n of after.nodes) {
    afterTypeCounts.set(n.type, (afterTypeCounts.get(n.type) || 0) + 1);
  }
  for (const [type, beforeCount] of beforeTypeCounts) {
    if (beforeCount >= 2) {
      const afterCount = afterTypeCounts.get(type) || 0;
      if (afterCount === 1) {
        factors.push({
          code: 'REDUNDANCY_REMOVED',
          level: 'medium',
          descriptionKo: `이중화가 제거되었습니다: ${type}이(가) ${beforeCount}개에서 1개로 줄었습니다 (단일 장애점 위험).`,
          details: type,
        });
      }
    }
  }

  // --- INTERNET_EXPOSED ---
  // Check for new direct connections from internet to internal-only components
  const internetNodeIds = after.nodes
    .filter((n) => n.type === 'internet')
    .map((n) => n.id);

  if (internetNodeIds.length > 0) {
    const internalNodeMap = new Map<string, string>();
    for (const n of after.nodes) {
      if (INTERNAL_ONLY_TYPES.includes(n.type as InfraNodeType)) {
        internalNodeMap.set(n.id, n.type);
      }
    }

    for (const conn of after.connections) {
      const isNewConnection = !beforeConnKeys.has(connectionKey(conn));
      if (!isNewConnection) continue;

      // Check if this connects internet to an internal-only component
      const sourceIsInternet = internetNodeIds.includes(conn.source);
      const targetIsInternet = internetNodeIds.includes(conn.target);

      if (sourceIsInternet && internalNodeMap.has(conn.target)) {
        factors.push({
          code: 'INTERNET_EXPOSED',
          level: 'critical',
          descriptionKo: `내부 전용 컴포넌트가 인터넷에 직접 노출되었습니다: ${internalNodeMap.get(conn.target)}`,
          details: `internet -> ${conn.target}`,
        });
      }
      if (targetIsInternet && internalNodeMap.has(conn.source)) {
        factors.push({
          code: 'INTERNET_EXPOSED',
          level: 'critical',
          descriptionKo: `내부 전용 컴포넌트가 인터넷에 직접 노출되었습니다: ${internalNodeMap.get(conn.source)}`,
          details: `${conn.source} -> internet`,
        });
      }
    }
  }

  // --- NO_RISK ---
  if (factors.length === 0) {
    factors.push({
      code: 'NO_RISK',
      level: 'low',
      descriptionKo: '위험 요소가 감지되지 않았습니다.',
    });
  }

  return factors;
}

// ---------------------------------------------------------------------------
// Main assessment function
// ---------------------------------------------------------------------------

export function assessChangeRisk(
  before: InfraSpec,
  after: InfraSpec,
): ChangeRiskAssessment {
  const factors = getRiskFactors(before, after);
  const level = getHighestRisk(factors);
  const { recommendation, recommendationKo } = getRecommendation(level);

  // Compute summary
  const beforeIds = getNodeIds(before);
  const afterIds = getNodeIds(after);

  const addedNodes = [...afterIds].filter((id) => !beforeIds.has(id)).length;
  const removedNodes = [...beforeIds].filter((id) => !afterIds.has(id)).length;

  const beforeConnKeys = new Set(before.connections.map(connectionKey));
  const afterConnKeys = new Set(after.connections.map(connectionKey));

  const addedConnections = [...afterConnKeys].filter(
    (k) => !beforeConnKeys.has(k),
  ).length;
  const removedConnections = [...beforeConnKeys].filter(
    (k) => !afterConnKeys.has(k),
  ).length;

  return {
    level,
    factors,
    summary: {
      addedNodes,
      removedNodes,
      addedConnections,
      removedConnections,
      totalChanges: addedNodes + removedNodes + addedConnections + removedConnections,
    },
    recommendation,
    recommendationKo,
  };
}
