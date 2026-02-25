/**
 * Kubernetes Export Module (Re-export)
 *
 * This file re-exports from the modularized kubernetes/ directory for backward
 * compatibility. All implementation has been split into sub-modules:
 *
 * - kubernetes/types.ts — KubernetesExportOptions interface
 * - kubernetes/helpers.ts — sanitizeK8sName, generateDeployment, etc.
 * - kubernetes/securityResources.ts — Security node generators
 * - kubernetes/networkResources.ts — Network node generators
 * - kubernetes/computeResources.ts — Compute node generators
 * - kubernetes/storageResources.ts — Storage, cloud, auth, external generators
 * - kubernetes/aiResources.ts — AI node generators
 * - kubernetes/index.ts — Combined resource map + exportToKubernetes
 *
 * @module lib/export/kubernetesExport
 */

export {
  exportToKubernetes,
  sanitizeK8sName,
  generateDeployment,
  generateNamespace,
  generateIngress,
  generateDefaultNetworkPolicy,
  type KubernetesExportOptions,
} from './kubernetes';
