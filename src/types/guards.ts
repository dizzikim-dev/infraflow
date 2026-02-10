/**
 * Type Guards
 * 런타임 타입 검증을 위한 가드 함수들
 */

import {
  InfraNodeData,
  InfraNodeType,
  TierType,
  NodeCategory,
  PolicyRule,
  InfraSpec,
  InfraNodeSpec,
  ConnectionSpec,
  EdgeFlowType,
} from './infra';
import { infrastructureDB } from '@/lib/data/infrastructureDB';

// Derive valid node types from infrastructureDB (SSoT)
const validNodeTypes = new Set<string>(Object.keys(infrastructureDB));

// Valid categories including extended types used in InfraNodeData
const validCategories = new Set<string>([
  'security', 'network', 'compute', 'cloud', 'storage', 'auth', 'telecom', 'wan',
]);

// Valid flow types matching EdgeFlowType union
const validFlowTypes = new Set<string>([
  'request', 'response', 'sync', 'blocked', 'encrypted',
  'wan-link', 'wireless', 'tunnel',
]);

/**
 * InfraNodeData 타입 가드
 */
export function isInfraNodeData(data: unknown): data is InfraNodeData {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.label === 'string' &&
    typeof obj.nodeType === 'string' &&
    typeof obj.category === 'string'
  );
}

/**
 * TierType 타입 가드
 */
export function isValidTier(tier: unknown): tier is TierType {
  return (
    tier === 'external' ||
    tier === 'dmz' ||
    tier === 'internal' ||
    tier === 'data'
  );
}

/**
 * NodeCategory 타입 가드
 */
export function isValidCategory(category: unknown): category is NodeCategory {
  return typeof category === 'string' && validCategories.has(category);
}

/**
 * InfraNodeType 타입 가드 — derived from infrastructureDB keys (SSoT)
 */
export function isValidNodeType(type: unknown): type is InfraNodeType {
  return typeof type === 'string' && validNodeTypes.has(type);
}

/**
 * EdgeFlowType 타입 가드
 */
export function isValidFlowType(flowType: unknown): flowType is EdgeFlowType {
  return typeof flowType === 'string' && validFlowTypes.has(flowType);
}

/**
 * PolicyRule 타입 가드
 */
export function isPolicyRule(rule: unknown): rule is PolicyRule {
  if (!rule || typeof rule !== 'object') return false;

  const obj = rule as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    (obj.type === 'allow' || obj.type === 'deny' || obj.type === 'rate-limit')
  );
}

/**
 * InfraNodeSpec 타입 가드
 */
export function isInfraNodeSpec(spec: unknown): spec is InfraNodeSpec {
  if (!spec || typeof spec !== 'object') return false;

  const obj = spec as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.label === 'string'
  );
}

/**
 * ConnectionSpec 타입 가드
 */
export function isConnectionSpec(spec: unknown): spec is ConnectionSpec {
  if (!spec || typeof spec !== 'object') return false;

  const obj = spec as Record<string, unknown>;
  return (
    typeof obj.source === 'string' &&
    typeof obj.target === 'string'
  );
}

/**
 * InfraSpec 타입 가드
 */
export function isInfraSpec(spec: unknown): spec is InfraSpec {
  if (!spec || typeof spec !== 'object') return false;

  const obj = spec as Record<string, unknown>;

  if (!Array.isArray(obj.nodes) || !Array.isArray(obj.connections)) {
    return false;
  }

  return (
    obj.nodes.every(isInfraNodeSpec) &&
    obj.connections.every(isConnectionSpec)
  );
}

/**
 * 안전한 데이터 추출 유틸
 */
export function safeGetTier(data: unknown): TierType {
  if (isInfraNodeData(data) && isValidTier(data.tier)) {
    return data.tier;
  }
  return 'internal'; // 기본값
}

export function safeGetZone(data: unknown): string | undefined {
  if (isInfraNodeData(data)) {
    return typeof data.zone === 'string' ? data.zone : undefined;
  }
  return undefined;
}

export function safeGetNodeType(data: unknown): InfraNodeType {
  if (isInfraNodeData(data) && isValidNodeType(data.nodeType)) {
    return data.nodeType;
  }
  return 'user'; // 기본값
}
