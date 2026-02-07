// InfraFlow - Infrastructure Types

// Node Categories
export type NodeCategory =
  | 'security'
  | 'network'
  | 'compute'
  | 'cloud'
  | 'storage'
  | 'auth';

// Security Devices
export type SecurityNodeType =
  | 'firewall'
  | 'waf'
  | 'ids-ips'
  | 'vpn-gateway'
  | 'nac'
  | 'dlp';

// Network Equipment
export type NetworkNodeType =
  | 'router'
  | 'switch-l2'
  | 'switch-l3'
  | 'load-balancer'
  | 'sd-wan'
  | 'dns'
  | 'cdn';

// Compute/Server
export type ComputeNodeType =
  | 'web-server'
  | 'app-server'
  | 'db-server'
  | 'container'
  | 'vm'
  | 'kubernetes';

// Cloud Services
export type CloudNodeType =
  | 'aws-vpc'
  | 'azure-vnet'
  | 'gcp-network'
  | 'private-cloud';

// Storage
export type StorageNodeType =
  | 'san-nas'
  | 'object-storage'
  | 'backup'
  | 'cache'
  | 'storage';

// Auth/Access
export type AuthNodeType =
  | 'ldap-ad'
  | 'sso'
  | 'mfa'
  | 'iam';

// Generic Node Types
export type InfraNodeType =
  | SecurityNodeType
  | NetworkNodeType
  | ComputeNodeType
  | CloudNodeType
  | StorageNodeType
  | AuthNodeType
  | 'user'
  | 'internet'
  | 'zone';

// Tier Types
export type TierType = 'external' | 'dmz' | 'internal' | 'data';

// Node Data
export interface InfraNodeData {
  label: string;
  category: NodeCategory | 'external' | 'zone';
  nodeType: InfraNodeType;
  description?: string;
  tier?: TierType;
  zone?: string;
  policies?: PolicyRule[];
  metadata?: Record<string, unknown>;
  [key: string]: unknown; // Index signature for React Flow compatibility
}

// Policy Rules
export interface PolicyRule {
  id: string;
  name: string;
  type: 'allow' | 'deny' | 'rate-limit';
  source?: string;
  destination?: string;
  port?: string | number;
  protocol?: string;
  description?: string;
}

// Edge/Connection Types
export type EdgeFlowType =
  | 'request'      // 요청 (파란색)
  | 'response'     // 응답 (녹색)
  | 'sync'         // 동기화 (주황색)
  | 'blocked'      // 차단 (빨간색)
  | 'encrypted';   // 암호화 (굵은 실선)

export interface InfraEdgeData {
  flowType: EdgeFlowType;
  label?: string;
  animated?: boolean;
  bandwidth?: string;
  latency?: string;
  [key: string]: unknown; // Index signature for React Flow compatibility
}

// Parsed Infrastructure Spec (from LLM)
export interface InfraSpec {
  name?: string;
  description?: string;
  nodes: InfraNodeSpec[];
  connections: ConnectionSpec[];
  zones?: ZoneSpec[];
  policies?: PolicyRule[];
}

export interface InfraNodeSpec {
  id: string;
  type: InfraNodeType;
  label: string;
  tier?: TierType;
  zone?: string;
  description?: string;
}

export interface ConnectionSpec {
  source: string;
  target: string;
  flowType?: EdgeFlowType;
  label?: string;
  bidirectional?: boolean;
}

export interface ZoneSpec {
  id: string;
  label: string;
  type: 'dmz' | 'internal' | 'external' | 'db' | 'custom';
  color?: string;
}

// Animation Sequence
export interface AnimationStep {
  from: string;
  to: string;
  delay: number;
  duration: number;
  type: EdgeFlowType;
  label?: string;
}

export interface AnimationSequence {
  id: string;
  name: string;
  description?: string;
  steps: AnimationStep[];
  loop?: boolean;
}
