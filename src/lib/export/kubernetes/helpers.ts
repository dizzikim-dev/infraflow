/**
 * Kubernetes Export Helpers
 *
 * Shared utility functions for the Kubernetes export module including
 * name sanitization, deployment generation, namespace creation,
 * ingress generation, and network policy generation.
 *
 * @module lib/export/kubernetes/helpers
 */

import { InfraSpec, InfraNodeSpec } from '@/types';
import type { KubernetesExportOptions } from './types';

/**
 * Sanitizes a name for use as a Kubernetes resource name.
 *
 * Kubernetes resource names must:
 * - Be lowercase
 * - Contain only alphanumeric characters and hyphens
 * - Not start or end with a hyphen
 * - Be at most 63 characters
 *
 * @param {string} name - The original name to sanitize
 * @returns {string} Sanitized name safe for Kubernetes resources
 *
 * @example
 * sanitizeK8sName('Web Server 1') // Returns 'web-server-1'
 * sanitizeK8sName('My__App') // Returns 'my-app'
 */
export function sanitizeK8sName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63);
}

/**
 * Generates a standard Kubernetes Deployment with associated Service.
 *
 * Creates a Deployment with configured replicas, resource limits, and
 * health probes, along with a ClusterIP Service for internal access.
 *
 * @param {InfraNodeSpec} node - The infrastructure node specification
 * @param {KubernetesExportOptions} options - Export options including namespace and replica count
 * @param {string} tier - Application tier (web, app, container)
 * @param {number} port - Container and service port
 * @returns {string} Kubernetes YAML for Deployment and Service
 */
export function generateDeployment(
  node: InfraNodeSpec,
  options: KubernetesExportOptions,
  tier: string,
  port: number
): string {
  const replicaCount = options.replicaCount || 2;

  return `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: ${tier}
    managed-by: infraflow
spec:
  replicas: ${replicaCount}
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: ${tier}
    spec:
      containers:
        - name: ${tier}
          image: nginx:latest  # Replace with your image
          ports:
            - containerPort: ${port}
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
          readinessProbe:
            httpGet:
              path: /health
              port: ${port}
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: ${port}
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
spec:
  type: ClusterIP
  ports:
    - port: ${port}
      targetPort: ${port}
  selector:
    app: ${sanitizeK8sName(node.id)}`;
}

/**
 * Generates a Kubernetes Namespace resource.
 *
 * @param {string} namespace - The namespace name
 * @returns {string} Kubernetes YAML for the Namespace
 */
export function generateNamespace(namespace: string): string {
  return `
---
apiVersion: v1
kind: Namespace
metadata:
  name: ${namespace}
  labels:
    managed-by: infraflow`;
}

/**
 * Generates a Kubernetes Ingress resource for web-facing services.
 *
 * Creates an Ingress with TLS configuration and path-based routing
 * for web servers and load balancers found in the specification.
 *
 * @param {InfraSpec} spec - The infrastructure specification
 * @param {KubernetesExportOptions} options - Export options including namespace
 * @returns {string} Kubernetes YAML for the Ingress, or empty string if no web nodes
 */
export function generateIngress(spec: InfraSpec, options: KubernetesExportOptions): string {
  const webNodes = spec.nodes.filter((n) =>
    ['web-server', 'load-balancer'].includes(n.type)
  );

  if (webNodes.length === 0) return '';

  const rules = webNodes.map((node) => `
        - path: /
          pathType: Prefix
          backend:
            service:
              name: ${sanitizeK8sName(node.id)}
              port:
                number: 80`).join('');

  return `
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: ${options.namespace || 'default'}
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - example.com
      secretName: tls-secret
  rules:
    - host: example.com
      http:
        paths:${rules}`;
}

/**
 * Generates default NetworkPolicy resources for namespace isolation.
 *
 * Creates two NetworkPolicies:
 * 1. default-deny-ingress: Blocks all ingress traffic by default
 * 2. allow-internal: Allows traffic between pods in the same namespace
 *
 * @param {KubernetesExportOptions} options - Export options including namespace
 * @returns {string} Kubernetes YAML for NetworkPolicy resources
 */
export function generateDefaultNetworkPolicy(options: KubernetesExportOptions): string {
  return `
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: ${options.namespace || 'default'}
spec:
  podSelector: {}
  policyTypes:
    - Ingress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-internal
  namespace: ${options.namespace || 'default'}
spec:
  podSelector: {}
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector: {}`;
}
