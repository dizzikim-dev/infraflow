/**
 * Infrastructure Failure Scenarios (Layer 4)
 *
 * Re-exports all failure categories and provides combined registry + lookup helpers.
 * This is a drop-in replacement for the former monolith failures.ts.
 */

import type { InfraNodeType } from '@/types/infra';
import type { FailureScenario } from '../types';

import { NETWORK_FAILURES } from './networkFailures';
import { SECURITY_FAILURES } from './securityFailures';
import { COMPUTE_FAILURES } from './computeFailures';
import { DATA_FAILURES } from './dataFailures';
import { AUTH_FAILURES, AUTH_EXT_FAILURES } from './authFailures';
import { TELECOM_FAILURES } from './telecomFailures';
import { CLOUD_FAILURES } from './cloudFailures';
import { K8S_FAILURES } from './k8sFailures';
import { HYBRID_FAILURES, SASE_FAILURES } from './hybridFailures';

/** All failure scenarios, frozen for immutability */
export const FAILURE_SCENARIOS: readonly FailureScenario[] = Object.freeze([
  ...NETWORK_FAILURES,
  ...SECURITY_FAILURES,
  ...COMPUTE_FAILURES,
  ...DATA_FAILURES,
  ...AUTH_FAILURES,
  ...TELECOM_FAILURES,
  ...CLOUD_FAILURES,
  ...K8S_FAILURES,
  ...AUTH_EXT_FAILURES,
  ...HYBRID_FAILURES,
  ...SASE_FAILURES,
]);

/** Alias for FAILURE_SCENARIOS */
export const FAILURES = FAILURE_SCENARIOS;

/**
 * Get all failure scenarios that affect a given infrastructure component
 * (either as the primary component or in the affected list).
 */
export function getFailuresForComponent(component: InfraNodeType): FailureScenario[] {
  return FAILURE_SCENARIOS.filter(
    (f) => f.component === component || f.affectedComponents.includes(component),
  );
}

/**
 * Get high-impact failure scenarios — 'service-down' and 'data-loss' only.
 */
export function getHighImpactFailures(): FailureScenario[] {
  return FAILURE_SCENARIOS.filter(
    (f) => f.impact === 'service-down' || f.impact === 'data-loss',
  );
}

/**
 * Get failure scenarios filtered by likelihood level.
 */
export function getFailuresByLikelihood(likelihood: 'high' | 'medium' | 'low'): FailureScenario[] {
  return FAILURE_SCENARIOS.filter((f) => f.likelihood === likelihood);
}
