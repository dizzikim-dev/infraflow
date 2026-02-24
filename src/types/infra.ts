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
  | 'wan'
  | 'ai-compute'
  | 'ai-service';

// Security Devices
export type SecurityNodeType =
  | 'firewall'
  | 'waf'
  | 'ids-ips'
  | 'vpn-gateway'
  | 'nac'
  | 'dlp'
  | 'sase-gateway'     // SASE 게이트웨이
  | 'ztna-broker'      // ZTNA 브로커
  | 'casb'             // Cloud Access Security Broker
  | 'siem'             // Security Information & Event Management
  | 'soar'             // Security Orchestration, Automation & Response
  | 'cctv-camera'      // CCTV 카메라
  | 'nvr'              // 네트워크 비디오 레코더 (NVR)
  | 'video-server'     // 영상관제 서버 (VMS)
  | 'access-control';  // 출입통제 시스템

// Network Equipment
export type NetworkNodeType =
  | 'router'
  | 'switch-l2'
  | 'switch-l3'
  | 'load-balancer'
  | 'api-gateway'        // API 게이트웨이
  | 'sd-wan'
  | 'dns'
  | 'cdn'
  | 'wireless-ap';       // 무선 액세스 포인트 (Wi-Fi AP)

// Compute/Server
export type ComputeNodeType =
  | 'web-server'
  | 'app-server'
  | 'db-server'
  | 'container'
  | 'vm'
  | 'kubernetes'
  | 'kafka'              // Apache Kafka 메시지 브로커
  | 'rabbitmq'           // RabbitMQ 메시지 큐
  | 'prometheus'         // Prometheus 모니터링
  | 'grafana';           // Grafana 대시보드

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
  | 'elasticsearch'      // Elasticsearch 검색엔진
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

// AI Compute Infrastructure
export type AIComputeNodeType =
  | 'gpu-server'         // GPU 서버 (NVIDIA DGX 등)
  | 'ai-accelerator'     // AI 가속기 (NPU, TPU)
  | 'edge-device'        // 엣지 AI 디바이스 (맥미니, 노트북, Jetson)
  | 'mobile-device'      // 모바일 AI 디바이스 (스마트폰 온디바이스 AI)
  | 'ai-cluster'         // AI 클러스터 (다중 GPU 노드)
  | 'model-registry';    // 모델 레지스트리

// AI Service/Platform
export type AIServiceNodeType =
  | 'inference-engine'   // 추론 엔진 (Ollama, vLLM, TGI)
  | 'vector-db'          // 벡터 DB (ChromaDB, Milvus)
  | 'ai-gateway'         // AI 게이트웨이 (LiteLLM)
  | 'ai-orchestrator'    // AI 오케스트레이터 (LangChain, CrewAI)
  | 'embedding-service'  // 임베딩 서비스
  | 'training-platform'  // 학습 플랫폼 (MLflow, W&B)
  | 'prompt-manager'     // 프롬프트 관리 (LangSmith)
  | 'ai-monitor';        // AI 모니터링 (Evidently)

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
  | AIComputeNodeType
  | AIServiceNodeType
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
  /** Selected vendor ID (e.g., 'cisco', 'fortinet', 'paloalto', 'arista') */
  vendorId?: string;
  /** Selected cloud provider (e.g., 'aws', 'azure', 'gcp') */
  cloudProvider?: string;
  /** Display name of the selected product/service */
  productName?: string;
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
  | 'tunnel'        // VPN/MPLS 터널 (이중선)
  | 'inference'     // 추론 요청/응답 (오렌지, 점선 + ⚡)
  | 'model-sync'    // 모델 동기화/배포 (보라, 양방향 점선)
  | 'embedding';    // 임베딩 데이터 흐름 (시안, 얇은 선)

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
  vendorId?: string;
  cloudProvider?: string;
  productName?: string;
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
