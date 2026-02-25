/**
 * InfraFlow Consulting — Cost Sensitivity Analysis
 *
 * Generates 3-scenario cost estimates (upper/baseline/lower)
 * and identifies which variables have the most cost impact.
 *
 * Uses the existing BASE_COSTS from costData as baseline,
 * averaging across providers (AWS, Azure, GCP, on-prem) for
 * a provider-neutral estimate.
 */

import type { InfraSpec, InfraNodeType } from '@/types/infra';
import { BASE_COSTS } from '@/lib/cost/costData';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CostEstimate {
  totalMonthly: number;
  breakdown: { nodeType: string; label: string; monthly: number }[];
}

export interface SensitiveVariable {
  /** English variable name */
  variable: string;
  /** Korean variable name */
  variableKo: string;
  /** How much this variable affects total cost (%) */
  impactPercent: number;
}

export interface CostSensitivityResult {
  upperBound: CostEstimate;
  baseline: CostEstimate;
  lowerBound: CostEstimate;
  sensitiveVariables: SensitiveVariable[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const UPPER_MULTIPLIER = 1.8;
const LOWER_MULTIPLIER = 0.5;
const DEFAULT_COST = 50;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derive a single baseline monthly cost for a node type by averaging
 * non-zero provider costs from BASE_COSTS.
 */
function getBaselineCost(nodeType: InfraNodeType): number {
  const entry = BASE_COSTS[nodeType];
  if (!entry) return DEFAULT_COST;

  const costs = [entry.aws.cost, entry.azure.cost, entry.gcp.cost, entry.onprem.cost];
  const nonZero = costs.filter(c => c > 0);
  if (nonZero.length === 0) return 0;
  return Math.round(nonZero.reduce((sum, c) => sum + c, 0) / nonZero.length);
}

function estimateForSpec(spec: InfraSpec, multiplier: number): CostEstimate {
  const breakdown = spec.nodes.map(node => {
    const baseCost = getBaselineCost(node.type);
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

// ---------------------------------------------------------------------------
// Category detectors for sensitivity analysis
// ---------------------------------------------------------------------------

const COMPUTE_TYPES: ReadonlySet<string> = new Set([
  'web-server', 'app-server', 'container', 'kubernetes', 'gpu-server',
  'ai-cluster', 'vm',
]);

const STORAGE_TYPES: ReadonlySet<string> = new Set([
  'san-nas', 'object-storage', 'backup', 'db-server', 'storage',
  'vector-db',
]);

const NETWORK_TYPES: ReadonlySet<string> = new Set([
  'load-balancer', 'cdn', 'router', 'sd-wan', 'api-gateway',
]);

const CACHE_TYPES: ReadonlySet<string> = new Set([
  'cache', 'elasticsearch',
]);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Analyze cost sensitivity for a given infrastructure spec.
 *
 * Returns upper (1.8x), baseline (1.0x), and lower (0.5x) scenarios
 * plus a sorted list of variables with the most cost impact.
 */
export function analyzeSensitivity(spec: InfraSpec): CostSensitivityResult {
  const upperBound = estimateForSpec(spec, UPPER_MULTIPLIER);
  const baseline = estimateForSpec(spec, 1.0);
  const lowerBound = estimateForSpec(spec, LOWER_MULTIPLIER);

  const gap = upperBound.totalMonthly - lowerBound.totalMonthly;

  const hasCompute = spec.nodes.some(n => COMPUTE_TYPES.has(n.type));
  const hasStorage = spec.nodes.some(n => STORAGE_TYPES.has(n.type));
  const hasNetwork = spec.nodes.some(n => NETWORK_TYPES.has(n.type));
  const hasCache = spec.nodes.some(n => CACHE_TYPES.has(n.type));

  const variables: SensitiveVariable[] = [];
  if (gap > 0) {
    if (hasCompute)
      variables.push({ variable: 'compute-reservation', variableKo: '컴퓨트 예약 비율', impactPercent: 35 });
    if (hasNetwork)
      variables.push({ variable: 'traffic-volume', variableKo: '트래픽 규모', impactPercent: 30 });
    if (hasStorage)
      variables.push({ variable: 'storage-growth', variableKo: '스토리지 증가율', impactPercent: 25 });
    if (hasNetwork)
      variables.push({ variable: 'data-transfer', variableKo: '데이터 전송량', impactPercent: 20 });
    if (hasCache)
      variables.push({ variable: 'cache-hit-rate', variableKo: '캐시 히트율', impactPercent: 15 });
  }

  variables.sort((a, b) => b.impactPercent - a.impactPercent);

  return { upperBound, baseline, lowerBound, sensitiveVariables: variables };
}
