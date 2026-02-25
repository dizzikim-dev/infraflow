/**
 * Kubernetes Storage, Cloud, Auth, External, Telecom, and WAN Resource Generators
 *
 * Generates Kubernetes YAML for storage, cloud, authentication, external,
 * telecom, and WAN infrastructure components.
 *
 * @module lib/export/kubernetes/storageResources
 */

import { InfraNodeSpec, InfraNodeType } from '@/types';
import type { KubernetesExportOptions } from './types';
import { sanitizeK8sName } from './helpers';

/**
 * Storage, cloud, auth, external, telecom, and WAN node type resource generators for Kubernetes.
 */
export const storageAndMiscResourceMap: Partial<Record<InfraNodeType, (node: InfraNodeSpec, options: KubernetesExportOptions) => string>> = {
  // Cloud nodes
  'aws-vpc': () => `# AWS VPC: Kubernetes runs within the VPC`,
  'azure-vnet': () => `# Azure VNet: Kubernetes runs within the VNet`,
  'gcp-network': () => `# GCP Network: Kubernetes runs within the network`,
  'private-cloud': () => `# Private Cloud: Kubernetes deployment target`,

  // Storage nodes
  'san-nas': (node, options) => `
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${sanitizeK8sName(node.id)}-pvc
  namespace: ${options.namespace || 'default'}
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: efs-sc
  resources:
    requests:
      storage: 100Gi`,

  'object-storage': () => `# Object Storage: Use S3-compatible storage via CSI driver`,
  'backup': () => `# Backup: Use Velero for cluster backup`,

  'cache': (node, options) => `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: cache
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: cache
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - port: 6379
      targetPort: 6379
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'elasticsearch': (node, options) => `
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
  labels:
    app: ${sanitizeK8sName(node.label)}
    tier: search
spec:
  serviceName: ${sanitizeK8sName(node.id)}
  replicas: 3
  selector:
    matchLabels:
      app: ${sanitizeK8sName(node.id)}
  template:
    metadata:
      labels:
        app: ${sanitizeK8sName(node.id)}
        tier: search
    spec:
      containers:
        - name: elasticsearch
          image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
          ports:
            - containerPort: 9200
            - containerPort: 9300
          env:
            - name: discovery.type
              value: zen
            - name: xpack.security.enabled
              value: "true"
          resources:
            requests:
              memory: "2Gi"
              cpu: "500m"
            limits:
              memory: "4Gi"
              cpu: "1000m"
          volumeMounts:
            - name: data
              mountPath: /usr/share/elasticsearch/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi
---
apiVersion: v1
kind: Service
metadata:
  name: ${sanitizeK8sName(node.id)}
  namespace: ${options.namespace || 'default'}
spec:
  type: ClusterIP
  ports:
    - name: http
      port: 9200
      targetPort: 9200
    - name: transport
      port: 9300
      targetPort: 9300
  selector:
    app: ${sanitizeK8sName(node.id)}`,

  'storage': (node, options) => `
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${sanitizeK8sName(node.id)}-pvc
  namespace: ${options.namespace || 'default'}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi`,

  // Auth nodes
  'ldap-ad': () => `# LDAP/AD: Integrate via external identity provider`,
  'sso': () => `# SSO: Implement via OAuth2 Proxy or Dex`,
  'mfa': () => `# MFA: Implement at identity provider level`,
  'iam': () => `# IAM: Use RBAC and ServiceAccounts`,

  // External nodes
  'user': () => `# User: External client`,
  'internet': () => `# Internet: External network`,

  // Zone
  'zone': () => `# Zone: Network zone boundary`,

  // Telecom
  'central-office': () => `# Central Office: Telecom facility`,
  'base-station': () => `# Base Station: Wireless access point`,
  'olt': () => `# OLT: Optical line terminal`,
  'customer-premise': () => `# Customer Premise: CPE equipment`,
  'idc': () => `# IDC: Internet data center`,

  // WAN
  'pe-router': () => `# PE Router: Provider edge router`,
  'p-router': () => `# P Router: Provider core router`,
  'mpls-network': () => `# MPLS Network: MPLS backbone`,
  'dedicated-line': () => `# Dedicated Line: Leased line`,
  'metro-ethernet': () => `# Metro Ethernet: Metro ethernet service`,
  'corporate-internet': () => `# Corporate Internet: Enterprise internet`,
  'vpn-service': () => `# VPN Service: MPLS VPN`,
  'sd-wan-service': () => `# SD-WAN Service: SD-WAN overlay`,
  'private-5g': () => `# Private 5G: Private 5G network`,
  'core-network': () => `# Core Network: Mobile core`,
  'upf': () => `# UPF: User plane function`,
  'ring-network': () => `# Ring Network: Ring topology`,
};
