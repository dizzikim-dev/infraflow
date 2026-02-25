/**
 * Kubernetes Network Resource Generators
 *
 * Generates Kubernetes YAML for network-related infrastructure components
 * including load balancers, API gateways, DNS services, and network comments.
 *
 * @module lib/export/kubernetes/networkResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import type { KubernetesExportOptions } from './types';
import { sanitizeK8sName } from './helpers';

/**
 * Network node type resource generators for Kubernetes.
 */
export const networkResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, options: KubernetesExportOptions) => string>> = {
  'router': () => `# Router: Kubernetes networking handled by CNI plugin`,
  'switch-l2': () => `# L2 Switch: Kubernetes networking handled by CNI plugin`,
  'switch-l3': () => `# L3 Switch: Kubernetes networking handled by CNI plugin`,

  'load-balancer': (node, options) => `
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}-lb
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    managed-by: infraflow
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
spec:
  type: LoadBalancer
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
  selector:
    tier: web`,

  'api-gateway': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: gateway
spec:
  replicas: ${options.replicaCount || 2}
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: gateway
    spec:
      containers:
        - name: kong
          image: kong:3.4
          ports:
            - containerPort: 8000
            - containerPort: 8443
          env:
            - name: KONG_DATABASE
              value: "off"
            - name: KONG_PROXY_ACCESS_LOG
              value: /dev/stdout
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: LoadBalancer
  ports:
    - name: proxy
      port: 80
      targetPort: 8000
    - name: proxy-ssl
      port: 443
      targetPort: 8443
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'sd-wan': () => `# SD-WAN: Managed externally`,
  'wireless-ap': () => `# Wireless AP: Physical device, not applicable in Kubernetes`,

  'dns': (node, options) => `
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}-dns
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - name: dns
      port: 53
      targetPort: 53
      protocol: UDP
  selector:
    app: coredns`,

  'cdn': () => `# CDN: Managed externally (CloudFront, Cloudflare, etc.)`,
};
