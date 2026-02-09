// InfraFlow - Infrastructure Types

// Node Categories
export type NodeCategory =
  | 'security'
  | 'network'
  | 'compute'
  | 'cloud'
  | 'storage'
  | 'auth'
  | 'telecom'
  | 'wan';

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

// Telecom Infrastructure
export type TelecomNodeType =
  | 'central-office'       // 국사/POP
  | 'base-station'         // 기지국 (gNB/eNB)
  | 'olt'                  // 광선로 단말 (OLT)
  | 'customer-premise'     // 고객 구내 (CPE)
  | 'idc';                 // IDC/데이터센터

// WAN Services/Transport
export type WanNodeType =
  | 'pe-router'            // Provider Edge 라우터
  | 'p-router'             // Provider Core 라우터
  | 'mpls-network'         // MPLS 망
  | 'dedicated-line'       // 전용회선
  | 'metro-ethernet'       // 메트로 이더넷
  | 'corporate-internet'   // 기업인터넷 (KORNET)
  | 'vpn-service'          // VPN 서비스
  | 'sd-wan-service'       // SD-WAN 서비스
  | 'private-5g'           // 5G 특화망
  | 'core-network'         // 모바일 코어망
  | 'upf'                  // 5G UPF
  | 'ring-network';        // 링 네트워크 (이중화)

// Generic Node Types
export type InfraNodeType =
  | SecurityNodeType
  | NetworkNodeType
  | ComputeNodeType
  | CloudNodeType
  | StorageNodeType
  | AuthNodeType
  | TelecomNodeType
  | WanNodeType
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
  | 'encrypted'    // 암호화 (굵은 실선)
  | 'wan-link'     // WAN 전용회선 (청록색, 굵은 선)
  | 'wireless'     // 무선 구간 (점선 + 안테나)
  | 'tunnel';      // VPN/MPLS 터널 (이중선)

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
  type: 'dmz' | 'internal' | 'external' | 'db' | 'custom'
    | 'access'       // 접속 계층
    | 'aggregation'  // 집선 계층
    | 'backbone'     // 백본
    | 'core-dc';     // 코어/IDC
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
