/**
 * Kubernetes Security Resource Generators
 *
 * Generates Kubernetes YAML for security-related infrastructure components
 * including NetworkPolicies, WAF ConfigMaps, IDS DaemonSets, and security comments.
 *
 * @module lib/export/kubernetes/securityResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import type { KubernetesExportOptions } from './types';
import { sanitizeK8sName } from './helpers';

/**
 * Security node type resource generators for Kubernetes.
 */
export const securityResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, options: KubernetesExportOptions) => string>> = {
  'firewall': (node, options) => `
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${sanitizeK8sName(node.id)}-firewall
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
spec:
  podSelector:
    matchLabels:
      app: ${sanitizeK8sName(node.label)}
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443
        - protocol: TCP
          port: 80
  egress:
    - to:
        - namespaceSelector: {}`,

  'waf': (node, options) => `
---
# WAF configuration typically handled by ingress controller or external WAF
# For example, using ModSecurity with NGINX Ingress
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${sanitizeK8sName(node.id)}-waf-rules
  namespace: ${options.namespace || 'default'}
data:
  modsecurity.conf: |
    SecRuleEngine On
    SecRequestBodyAccess On
    SecRule REQUEST_HEADERS:Content-Type "text/xml" "id:200000,phase:1,t:none,t:lowercase,pass,nolog,ctl:requestBodyProcessor=XML"`,

  'ids-ips': (node, options) => `
---
# IDS/IPS typically deployed as a DaemonSet
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: ${sanitizeK8sName(node.id)}-ids
  namespace: ${options.namespace || 'default'}
spec:
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}-ids
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}-ids
    spec:
      containers:
        - name: falco
          image: falcosecurity/falco:latest
          securityContext:
            privileged: true`,

  'vpn-gateway': () => `# VPN Gateway: Managed externally or via service mesh`,
  'nac': () => `# NAC: Implemented via NetworkPolicy and service mesh`,
  'dlp': () => `# DLP: Implemented via custom admission controller`,
  'sase-gateway': () => `# SASE Gateway: Implemented via service mesh and network policies`,
  'ztna-broker': () => `# ZTNA Broker: Implemented via identity-aware proxy`,
  'casb': () => `# CASB: Implemented via API gateway policies and admission controllers`,
  'siem': () => `# SIEM: Use Fluentd/Fluent Bit DaemonSet for log collection`,
  'soar': () => `# SOAR: Implemented via event-driven automation (Argo Events, Tekton)`,
  'cctv-camera': () => `# CCTV Camera: Physical device, not applicable to Kubernetes`,
  'nvr': () => `# NVR: Physical device, not applicable to Kubernetes`,
  'video-server': () => `# Video Server: Can be deployed as a containerized VMS`,
  'access-control': () => `# Access Control: Physical device, not applicable to Kubernetes`,
};
