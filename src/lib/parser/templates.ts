import { InfraSpec } from '@/types';

// Pre-defined infrastructure templates
export const infraTemplates: Record<string, InfraSpec> = {
  // 3-Tier Web Architecture
  '3tier': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'cdn', type: 'cdn', label: 'CDN', zone: 'external' },
      { id: 'firewall', type: 'firewall', label: 'Firewall', zone: 'dmz' },
      { id: 'waf', type: 'waf', label: 'WAF', zone: 'dmz' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', zone: 'dmz' },
      { id: 'web1', type: 'web-server', label: 'Web Server 1', zone: 'web' },
      { id: 'web2', type: 'web-server', label: 'Web Server 2', zone: 'web' },
      { id: 'app1', type: 'app-server', label: 'App Server 1', zone: 'app' },
      { id: 'app2', type: 'app-server', label: 'App Server 2', zone: 'app' },
      { id: 'db', type: 'db-server', label: 'Database', zone: 'db' },
    ],
    connections: [
      { source: 'user', target: 'cdn', flowType: 'request' },
      { source: 'cdn', target: 'firewall', flowType: 'request' },
      { source: 'firewall', target: 'waf', flowType: 'request' },
      { source: 'waf', target: 'lb', flowType: 'request' },
      { source: 'lb', target: 'web1', flowType: 'request' },
      { source: 'lb', target: 'web2', flowType: 'request' },
      { source: 'web1', target: 'app1', flowType: 'request' },
      { source: 'web2', target: 'app2', flowType: 'request' },
      { source: 'app1', target: 'db', flowType: 'request' },
      { source: 'app2', target: 'db', flowType: 'request' },
    ],
    zones: [
      { id: 'external', label: 'External', type: 'external' },
      { id: 'dmz', label: 'DMZ', type: 'dmz' },
      { id: 'web', label: 'Web Tier', type: 'internal' },
      { id: 'app', label: 'App Tier', type: 'internal' },
      { id: 'db', label: 'DB Tier', type: 'db' },
    ],
  },

  // VPN + Internal Network
  'vpn': {
    nodes: [
      { id: 'user', type: 'user', label: 'Remote User' },
      { id: 'internet', type: 'internet', label: 'Internet', zone: 'external' },
      { id: 'vpn', type: 'vpn-gateway', label: 'VPN Gateway', zone: 'dmz' },
      { id: 'firewall', type: 'firewall', label: 'Internal Firewall', zone: 'dmz' },
      { id: 'router', type: 'router', label: 'Core Router', zone: 'internal' },
      { id: 'server1', type: 'app-server', label: 'Internal Server 1', zone: 'internal' },
      { id: 'server2', type: 'app-server', label: 'Internal Server 2', zone: 'internal' },
      { id: 'ldap', type: 'ldap-ad', label: 'LDAP/AD', zone: 'internal' },
    ],
    connections: [
      { source: 'user', target: 'internet', flowType: 'encrypted' },
      { source: 'internet', target: 'vpn', flowType: 'encrypted' },
      { source: 'vpn', target: 'firewall', flowType: 'request' },
      { source: 'firewall', target: 'router', flowType: 'request' },
      { source: 'router', target: 'server1', flowType: 'request' },
      { source: 'router', target: 'server2', flowType: 'request' },
      { source: 'vpn', target: 'ldap', flowType: 'request', label: 'Auth' },
    ],
    zones: [
      { id: 'external', label: 'External', type: 'external' },
      { id: 'dmz', label: 'DMZ', type: 'dmz' },
      { id: 'internal', label: 'Internal Network', type: 'internal' },
    ],
  },

  // Kubernetes Cluster
  'k8s': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'ingress', type: 'load-balancer', label: 'Ingress Controller', zone: 'k8s' },
      { id: 'svc', type: 'kubernetes', label: 'Service', zone: 'k8s' },
      { id: 'pod1', type: 'container', label: 'Pod 1', zone: 'k8s' },
      { id: 'pod2', type: 'container', label: 'Pod 2', zone: 'k8s' },
      { id: 'pod3', type: 'container', label: 'Pod 3', zone: 'k8s' },
      { id: 'pv', type: 'storage', label: 'Persistent Volume', zone: 'storage' },
      { id: 'db', type: 'db-server', label: 'Database', zone: 'storage' },
    ],
    connections: [
      { source: 'user', target: 'ingress', flowType: 'request' },
      { source: 'ingress', target: 'svc', flowType: 'request' },
      { source: 'svc', target: 'pod1', flowType: 'request' },
      { source: 'svc', target: 'pod2', flowType: 'request' },
      { source: 'svc', target: 'pod3', flowType: 'request' },
      { source: 'pod1', target: 'pv', flowType: 'sync' },
      { source: 'pod2', target: 'db', flowType: 'request' },
    ],
    zones: [
      { id: 'k8s', label: 'Kubernetes Cluster', type: 'internal' },
      { id: 'storage', label: 'Storage Layer', type: 'db' },
    ],
  },

  // Simple WAF + LB + Web
  'simple-waf': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'waf', type: 'waf', label: 'WAF', zone: 'dmz' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', zone: 'dmz' },
      { id: 'web1', type: 'web-server', label: 'Web Server 1', zone: 'web' },
      { id: 'web2', type: 'web-server', label: 'Web Server 2', zone: 'web' },
    ],
    connections: [
      { source: 'user', target: 'waf', flowType: 'request' },
      { source: 'waf', target: 'lb', flowType: 'request' },
      { source: 'lb', target: 'web1', flowType: 'request' },
      { source: 'lb', target: 'web2', flowType: 'request' },
    ],
    zones: [
      { id: 'dmz', label: 'DMZ', type: 'dmz' },
      { id: 'web', label: 'Web Tier', type: 'internal' },
    ],
  },

  // Cloud Hybrid
  'hybrid': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'cdn', type: 'cdn', label: 'CDN' },
      { id: 'aws', type: 'aws-vpc', label: 'AWS VPC', zone: 'cloud' },
      { id: 'alb', type: 'load-balancer', label: 'ALB', zone: 'cloud' },
      { id: 'ec2', type: 'vm', label: 'EC2 Instance', zone: 'cloud' },
      { id: 'vpn', type: 'vpn-gateway', label: 'VPN Gateway', zone: 'hybrid' },
      { id: 'onprem-fw', type: 'firewall', label: 'On-Premise FW', zone: 'onprem' },
      { id: 'onprem-db', type: 'db-server', label: 'On-Premise DB', zone: 'onprem' },
    ],
    connections: [
      { source: 'user', target: 'cdn', flowType: 'request' },
      { source: 'cdn', target: 'alb', flowType: 'request' },
      { source: 'alb', target: 'ec2', flowType: 'request' },
      { source: 'ec2', target: 'vpn', flowType: 'encrypted' },
      { source: 'vpn', target: 'onprem-fw', flowType: 'encrypted' },
      { source: 'onprem-fw', target: 'onprem-db', flowType: 'request' },
    ],
    zones: [
      { id: 'cloud', label: 'AWS Cloud', type: 'external' },
      { id: 'hybrid', label: 'Hybrid Connection', type: 'dmz' },
      { id: 'onprem', label: 'On-Premise', type: 'internal' },
    ],
  },

  // Microservices Architecture
  'microservices': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'api-gw', type: 'load-balancer', label: 'API Gateway', zone: 'gateway' },
      { id: 'auth-svc', type: 'container', label: 'Auth Service', zone: 'services' },
      { id: 'user-svc', type: 'container', label: 'User Service', zone: 'services' },
      { id: 'order-svc', type: 'container', label: 'Order Service', zone: 'services' },
      { id: 'payment-svc', type: 'container', label: 'Payment Service', zone: 'services' },
      { id: 'msg-queue', type: 'cache', label: 'Message Queue', zone: 'infra' },
      { id: 'user-db', type: 'db-server', label: 'User DB', zone: 'data' },
      { id: 'order-db', type: 'db-server', label: 'Order DB', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'api-gw', flowType: 'request' },
      { source: 'api-gw', target: 'auth-svc', flowType: 'request' },
      { source: 'api-gw', target: 'user-svc', flowType: 'request' },
      { source: 'api-gw', target: 'order-svc', flowType: 'request' },
      { source: 'order-svc', target: 'msg-queue', flowType: 'sync' },
      { source: 'msg-queue', target: 'payment-svc', flowType: 'sync' },
      { source: 'user-svc', target: 'user-db', flowType: 'request' },
      { source: 'order-svc', target: 'order-db', flowType: 'request' },
    ],
    zones: [
      { id: 'gateway', label: 'Gateway', type: 'dmz' },
      { id: 'services', label: 'Services', type: 'internal' },
      { id: 'infra', label: 'Infrastructure', type: 'internal' },
      { id: 'data', label: 'Data Layer', type: 'db' },
    ],
  },

  // Zero Trust Architecture
  'zero-trust': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'idp', type: 'sso', label: 'Identity Provider', zone: 'identity' },
      { id: 'mfa', type: 'mfa', label: 'MFA', zone: 'identity' },
      { id: 'ztna', type: 'vpn-gateway', label: 'ZTNA Gateway', zone: 'access' },
      { id: 'policy', type: 'firewall', label: 'Policy Engine', zone: 'access' },
      { id: 'dlp', type: 'dlp', label: 'DLP', zone: 'security' },
      { id: 'app', type: 'app-server', label: 'Application', zone: 'workload' },
      { id: 'data', type: 'db-server', label: 'Data Store', zone: 'workload' },
    ],
    connections: [
      { source: 'user', target: 'idp', flowType: 'request', label: '1. Authenticate' },
      { source: 'idp', target: 'mfa', flowType: 'request', label: '2. MFA' },
      { source: 'mfa', target: 'ztna', flowType: 'encrypted', label: '3. Verify' },
      { source: 'ztna', target: 'policy', flowType: 'request', label: '4. Policy Check' },
      { source: 'policy', target: 'dlp', flowType: 'request', label: '5. DLP Scan' },
      { source: 'dlp', target: 'app', flowType: 'encrypted', label: '6. Access' },
      { source: 'app', target: 'data', flowType: 'encrypted' },
    ],
    zones: [
      { id: 'identity', label: 'Identity', type: 'external' },
      { id: 'access', label: 'Access Control', type: 'dmz' },
      { id: 'security', label: 'Security', type: 'dmz' },
      { id: 'workload', label: 'Workload', type: 'internal' },
    ],
  },

  // DR (Disaster Recovery) Architecture
  'dr': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'dns', type: 'dns', label: 'Global DNS', zone: 'global' },
      { id: 'lb-primary', type: 'load-balancer', label: 'Primary LB', zone: 'primary' },
      { id: 'app-primary', type: 'app-server', label: 'Primary App', zone: 'primary' },
      { id: 'db-primary', type: 'db-server', label: 'Primary DB', zone: 'primary' },
      { id: 'lb-dr', type: 'load-balancer', label: 'DR LB', zone: 'dr' },
      { id: 'app-dr', type: 'app-server', label: 'DR App', zone: 'dr' },
      { id: 'db-dr', type: 'db-server', label: 'DR DB', zone: 'dr' },
    ],
    connections: [
      { source: 'user', target: 'dns', flowType: 'request' },
      { source: 'dns', target: 'lb-primary', flowType: 'request', label: 'Active' },
      { source: 'dns', target: 'lb-dr', flowType: 'blocked', label: 'Standby' },
      { source: 'lb-primary', target: 'app-primary', flowType: 'request' },
      { source: 'app-primary', target: 'db-primary', flowType: 'request' },
      { source: 'lb-dr', target: 'app-dr', flowType: 'request' },
      { source: 'app-dr', target: 'db-dr', flowType: 'request' },
      { source: 'db-primary', target: 'db-dr', flowType: 'sync', label: 'Replication' },
    ],
    zones: [
      { id: 'global', label: 'Global', type: 'external' },
      { id: 'primary', label: 'Primary Site', type: 'internal' },
      { id: 'dr', label: 'DR Site', type: 'internal' },
    ],
  },

  // API Backend Architecture
  'api': {
    nodes: [
      { id: 'client', type: 'user', label: 'API Client' },
      { id: 'cdn', type: 'cdn', label: 'CDN/Edge', zone: 'edge' },
      { id: 'waf', type: 'waf', label: 'WAF', zone: 'security' },
      { id: 'rate-limit', type: 'firewall', label: 'Rate Limiter', zone: 'security' },
      { id: 'api-gw', type: 'load-balancer', label: 'API Gateway', zone: 'gateway' },
      { id: 'api-v1', type: 'app-server', label: 'API v1', zone: 'api' },
      { id: 'api-v2', type: 'app-server', label: 'API v2', zone: 'api' },
      { id: 'cache', type: 'cache', label: 'Redis Cache', zone: 'data' },
      { id: 'db', type: 'db-server', label: 'PostgreSQL', zone: 'data' },
    ],
    connections: [
      { source: 'client', target: 'cdn', flowType: 'request' },
      { source: 'cdn', target: 'waf', flowType: 'request' },
      { source: 'waf', target: 'rate-limit', flowType: 'request' },
      { source: 'rate-limit', target: 'api-gw', flowType: 'request' },
      { source: 'api-gw', target: 'api-v1', flowType: 'request' },
      { source: 'api-gw', target: 'api-v2', flowType: 'request' },
      { source: 'api-v1', target: 'cache', flowType: 'request' },
      { source: 'api-v2', target: 'cache', flowType: 'request' },
      { source: 'cache', target: 'db', flowType: 'request' },
    ],
    zones: [
      { id: 'edge', label: 'Edge', type: 'external' },
      { id: 'security', label: 'Security', type: 'dmz' },
      { id: 'gateway', label: 'Gateway', type: 'dmz' },
      { id: 'api', label: 'API Layer', type: 'internal' },
      { id: 'data', label: 'Data Layer', type: 'db' },
    ],
  },

  // IoT Architecture
  'iot': {
    nodes: [
      { id: 'device', type: 'user', label: 'IoT Device' },
      { id: 'gateway', type: 'router', label: 'IoT Gateway', zone: 'edge' },
      { id: 'mqtt', type: 'cache', label: 'MQTT Broker', zone: 'messaging' },
      { id: 'stream', type: 'app-server', label: 'Stream Processor', zone: 'processing' },
      { id: 'analytics', type: 'app-server', label: 'Analytics Engine', zone: 'processing' },
      { id: 'timeseries', type: 'db-server', label: 'TimeSeries DB', zone: 'data' },
      { id: 'storage', type: 'storage', label: 'Data Lake', zone: 'data' },
      { id: 'dashboard', type: 'web-server', label: 'Dashboard', zone: 'presentation' },
    ],
    connections: [
      { source: 'device', target: 'gateway', flowType: 'request' },
      { source: 'gateway', target: 'mqtt', flowType: 'sync' },
      { source: 'mqtt', target: 'stream', flowType: 'sync' },
      { source: 'stream', target: 'timeseries', flowType: 'request' },
      { source: 'stream', target: 'analytics', flowType: 'sync' },
      { source: 'analytics', target: 'storage', flowType: 'request' },
      { source: 'timeseries', target: 'dashboard', flowType: 'response' },
      { source: 'storage', target: 'dashboard', flowType: 'response' },
    ],
    zones: [
      { id: 'edge', label: 'Edge', type: 'external' },
      { id: 'messaging', label: 'Messaging', type: 'dmz' },
      { id: 'processing', label: 'Processing', type: 'internal' },
      { id: 'data', label: 'Data', type: 'db' },
      { id: 'presentation', label: 'Presentation', type: 'internal' },
    ],
  },

  // 경기도의회 VDI + OpenClaw 비서AI 아키텍처
  'vdi-openclaw': {
    nodes: [
      { id: 'member', type: 'user', label: '의원 (외부단말)' },
      { id: 'vpn-2fa', type: 'vpn-gateway', label: 'VPN + 2FA/DID', zone: 'access' },
      { id: 'vdi-gw', type: 'load-balancer', label: 'VDI Gateway', zone: 'dmz' },
      { id: 'vdi-session', type: 'vm', label: 'VDI 세션 (가상PC)', zone: 'vdi' },
      { id: 'openclaw', type: 'container', label: 'OpenClaw 비서AI', zone: 'vdi' },
      { id: 'llm', type: 'app-server', label: '내부망 LLM', zone: 'internal' },
      { id: 'rag', type: 'app-server', label: 'RAG Engine', zone: 'internal' },
      { id: 'vectordb', type: 'db-server', label: 'Vector DB', zone: 'data' },
      { id: 'docs', type: 'storage', label: '의정자료/회의록', zone: 'data' },
    ],
    connections: [
      { source: 'member', target: 'vpn-2fa', flowType: 'encrypted', label: 'VPN 접속' },
      { source: 'vpn-2fa', target: 'vdi-gw', flowType: 'encrypted', label: 'DID 인증' },
      { source: 'vdi-gw', target: 'vdi-session', flowType: 'request' },
      { source: 'vdi-session', target: 'openclaw', flowType: 'request', label: '비서AI 호출' },
      { source: 'openclaw', target: 'llm', flowType: 'request', label: 'LLM 추론' },
      { source: 'openclaw', target: 'rag', flowType: 'request', label: 'RAG 검색' },
      { source: 'rag', target: 'vectordb', flowType: 'request' },
      { source: 'rag', target: 'docs', flowType: 'request' },
    ],
    zones: [
      { id: 'access', label: '접근제어', type: 'external' },
      { id: 'dmz', label: 'DMZ', type: 'dmz' },
      { id: 'vdi', label: 'VDI 영역', type: 'internal' },
      { id: 'internal', label: '내부망', type: 'internal' },
      { id: 'data', label: '데이터', type: 'db' },
    ],
  },

  // 경기도의회 의원 다중PC 통합 VDI
  'assembly-vdi': {
    nodes: [
      { id: 'member', type: 'user', label: '의원' },
      { id: 'main-hall', type: 'user', label: '본회의장 PC' },
      { id: 'committee', type: 'user', label: '상임위 PC' },
      { id: 'office', type: 'user', label: '의원실 PC' },
      { id: 'local', type: 'user', label: '지역상담소 PC' },
      { id: 'laptop', type: 'user', label: '지급 노트북' },
      { id: 'vdi-portal', type: 'load-balancer', label: 'VDI 포털', zone: 'dmz' },
      { id: 'vdi-server', type: 'vm', label: 'VDI 서버팜', zone: 'vdi' },
      { id: 'profile', type: 'storage', label: '프로파일 동기화', zone: 'vdi' },
      { id: 'file-server', type: 'storage', label: '통합 파일서버', zone: 'data' },
    ],
    connections: [
      { source: 'main-hall', target: 'vdi-portal', flowType: 'request' },
      { source: 'committee', target: 'vdi-portal', flowType: 'request' },
      { source: 'office', target: 'vdi-portal', flowType: 'request' },
      { source: 'local', target: 'vdi-portal', flowType: 'encrypted' },
      { source: 'laptop', target: 'vdi-portal', flowType: 'encrypted' },
      { source: 'vdi-portal', target: 'vdi-server', flowType: 'request' },
      { source: 'vdi-server', target: 'profile', flowType: 'sync', label: '프로파일 로밍' },
      { source: 'vdi-server', target: 'file-server', flowType: 'request', label: '자료 동기화' },
    ],
    zones: [
      { id: 'dmz', label: 'DMZ', type: 'dmz' },
      { id: 'vdi', label: 'VDI 인프라', type: 'internal' },
      { id: 'data', label: '데이터 센터', type: 'db' },
    ],
  },

  // 망분리 환경 내부망 LLM 접근
  'network-separation-llm': {
    nodes: [
      { id: 'user', type: 'user', label: '사용자 (인터넷망)' },
      { id: 'internet-pc', type: 'web-server', label: '인터넷망 PC', zone: 'internet' },
      { id: 'firewall', type: 'firewall', label: '망분리 방화벽', zone: 'dmz' },
      { id: 'relay', type: 'app-server', label: 'API 중계서버', zone: 'dmz' },
      { id: 'dlp', type: 'dlp', label: 'DLP', zone: 'dmz' },
      { id: 'internal-pc', type: 'web-server', label: '내부망 PC', zone: 'internal' },
      { id: 'llm-server', type: 'app-server', label: 'LLM 서버', zone: 'internal' },
      { id: 'gpu', type: 'container', label: 'GPU 클러스터', zone: 'internal' },
      { id: 'knowledge', type: 'db-server', label: '지식베이스', zone: 'internal' },
    ],
    connections: [
      { source: 'user', target: 'internet-pc', flowType: 'request' },
      { source: 'internet-pc', target: 'firewall', flowType: 'blocked', label: '직접접근 차단' },
      { source: 'internet-pc', target: 'relay', flowType: 'request', label: 'API 호출' },
      { source: 'relay', target: 'dlp', flowType: 'request', label: '데이터 검사' },
      { source: 'dlp', target: 'llm-server', flowType: 'encrypted' },
      { source: 'llm-server', target: 'gpu', flowType: 'request', label: '추론' },
      { source: 'llm-server', target: 'knowledge', flowType: 'request', label: 'RAG' },
      { source: 'llm-server', target: 'internal-pc', flowType: 'response' },
    ],
    zones: [
      { id: 'internet', label: '인터넷망', type: 'external' },
      { id: 'dmz', label: 'DMZ (중계)', type: 'dmz' },
      { id: 'internal', label: '내부업무망', type: 'internal' },
    ],
  },

  // 하이브리드 클라우드 VDI (온프레미스 + 클라우드)
  'hybrid-vdi': {
    nodes: [
      { id: 'user', type: 'user', label: '원격 사용자' },
      { id: 'cloud-gw', type: 'load-balancer', label: '클라우드 VDI GW', zone: 'cloud' },
      { id: 'cloud-vdi', type: 'vm', label: '클라우드 VDI', zone: 'cloud' },
      { id: 'vpn', type: 'vpn-gateway', label: 'Site-to-Site VPN', zone: 'hybrid' },
      { id: 'onprem-gw', type: 'load-balancer', label: '온프레미스 VDI GW', zone: 'onprem' },
      { id: 'onprem-vdi', type: 'vm', label: '온프레미스 VDI', zone: 'onprem' },
      { id: 'ad', type: 'ldap-ad', label: 'AD/LDAP', zone: 'onprem' },
      { id: 'storage', type: 'storage', label: '통합 스토리지', zone: 'onprem' },
    ],
    connections: [
      { source: 'user', target: 'cloud-gw', flowType: 'request', label: '클라우드 접속' },
      { source: 'user', target: 'onprem-gw', flowType: 'encrypted', label: 'VPN 접속' },
      { source: 'cloud-gw', target: 'cloud-vdi', flowType: 'request' },
      { source: 'onprem-gw', target: 'onprem-vdi', flowType: 'request' },
      { source: 'cloud-vdi', target: 'vpn', flowType: 'encrypted' },
      { source: 'vpn', target: 'ad', flowType: 'request', label: '인증' },
      { source: 'vpn', target: 'storage', flowType: 'sync', label: '데이터 동기화' },
      { source: 'onprem-vdi', target: 'ad', flowType: 'request' },
      { source: 'onprem-vdi', target: 'storage', flowType: 'request' },
    ],
    zones: [
      { id: 'cloud', label: '퍼블릭 클라우드', type: 'external' },
      { id: 'hybrid', label: '하이브리드 연결', type: 'dmz' },
      { id: 'onprem', label: '온프레미스', type: 'internal' },
    ],
  },
};

// Template keywords for matching
export const templateKeywords: Record<string, string[]> = {
  '3tier': ['3티어', '3-tier', '3tier', '웹 아키텍처', 'web architecture', '3계층'],
  'vpn': ['vpn', '내부망', 'internal network', '원격 접속', 'remote access', '사내망'],
  'k8s': ['kubernetes', 'k8s', '쿠버네티스', 'container', '컨테이너', 'pod'],
  'simple-waf': ['waf', '로드밸런서', 'load balancer', '웹서버', 'web server'],
  'hybrid': ['hybrid', '하이브리드', 'cloud', '클라우드', 'aws', 'azure', 'on-premise'],
  'microservices': ['마이크로서비스', 'microservice', 'msa', 'api gateway', '서비스 메시'],
  'zero-trust': ['제로트러스트', 'zero trust', 'ztna', '제로 트러스트', 'identity'],
  'dr': ['dr', 'disaster recovery', '재해복구', '이중화', 'failover', 'ha', 'high availability'],
  'api': ['api', 'rest', 'backend', '백엔드', 'restful', 'graphql'],
  'iot': ['iot', '사물인터넷', 'mqtt', 'sensor', '센서', 'edge'],
  'vdi-openclaw': ['openclaw', '오픈클로', '비서ai', '의회 ai', 'vdi llm', '의정 ai', '클로드봇', '몰트봇'],
  'assembly-vdi': ['의원 vdi', '다중 pc', '의회 vdi', '의원실', '본회의장', '상임위', '지역상담소', '의원 업무환경'],
  'network-separation-llm': ['망분리 llm', '내부망 llm', '인터넷망 llm', '망분리 ai', '중계서버'],
  'hybrid-vdi': ['하이브리드 vdi', '클라우드 vdi', '온프레미스 vdi', 'vdi 통합'],
};
