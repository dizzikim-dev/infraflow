/**
 * Kubernetes Export Types
 *
 * Shared types and interfaces for the Kubernetes export module.
 *
 * @module lib/export/kubernetes/types
 */

/**
 * Options for Kubernetes export.
 *
 * @interface KubernetesExportOptions
 * @property {string} [namespace='default'] - Kubernetes namespace for resources
 * @property {boolean} [includeNamespace=true] - Whether to include namespace resource
 * @property {boolean} [includeIngress=true] - Whether to include Ingress resource
 * @property {boolean} [includeNetworkPolicy=true] - Whether to include NetworkPolicy resources
 * @property {number} [replicaCount=2] - Default replica count for Deployments
 */
export interface KubernetesExportOptions {
  namespace?: string;
  includeNamespace?: boolean;
  includeIngress?: boolean;
  includeNetworkPolicy?: boolean;
  replicaCount?: number;
}
