/**
 * GCP Cloud Services
 */

import type { CloudService } from '../types';
import { svcTrust } from '../types';

export const GCP_SERVICES: CloudService[] = [
  // ========== Firewall ==========
  { id: 'CS-FW-GCP-001', provider: 'gcp', componentType: 'firewall', serviceName: 'Cloud Armor + VPC Firewall', serviceNameKo: 'Cloud Armor + VPC 방화벽', status: 'active', features: ['DDoS protection', 'WAF integration', 'Hierarchical rules'], featuresKo: ['DDoS 보호', 'WAF 통합', '계층적 규칙'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== WAF ==========
  { id: 'CS-WAF-GCP-001', provider: 'gcp', componentType: 'waf', serviceName: 'Cloud Armor WAF', serviceNameKo: 'Cloud Armor WAF', status: 'active', features: ['Pre-configured rules', 'Adaptive protection', 'Edge security'], featuresKo: ['사전 구성된 규칙', '적응형 보호', '엣지 보안'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== Load Balancer ==========
  { id: 'CS-LB-GCP-001', provider: 'gcp', componentType: 'load-balancer', serviceName: 'Cloud Load Balancing', serviceNameKo: '클라우드 로드 밸런싱', status: 'active', features: ['Global anycast', 'L4/L7', 'Auto-scaling'], featuresKo: ['글로벌 애니캐스트', 'L4/L7', '자동 확장'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Web Server ==========
  { id: 'CS-WEB-GCP-001', provider: 'gcp', componentType: 'web-server', serviceName: 'Compute Engine', serviceNameKo: 'Compute Engine', status: 'active', features: ['Custom machine types', 'Preemptible VMs', 'Live migration'], featuresKo: ['커스텀 머신 유형', '선점형 VM', '라이브 마이그레이션'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== App Server ==========
  { id: 'CS-APP-GCP-001', provider: 'gcp', componentType: 'app-server', serviceName: 'Cloud Run', serviceNameKo: 'Cloud Run', status: 'active', features: ['Serverless containers', 'Pay-per-use', 'gRPC support'], featuresKo: ['서버리스 컨테이너', '사용량 기반 과금', 'gRPC 지원'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Database ==========
  { id: 'CS-DB-GCP-001', provider: 'gcp', componentType: 'db-server', serviceName: 'Cloud SQL', serviceNameKo: 'Cloud SQL', status: 'active', features: ['Managed MySQL/PostgreSQL/SQL Server', 'HA', 'Encryption'], featuresKo: ['관리형 MySQL/PostgreSQL/SQL Server', '고가용성', '암호화'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== DNS ==========
  { id: 'CS-DNS-GCP-001', provider: 'gcp', componentType: 'dns', serviceName: 'Cloud DNS', serviceNameKo: 'Cloud DNS', status: 'active', features: ['100% SLA', 'DNSSEC', 'Private zones'], featuresKo: ['100% SLA', 'DNSSEC', '프라이빗 존'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== CDN ==========
  { id: 'CS-CDN-GCP-001', provider: 'gcp', componentType: 'cdn', serviceName: 'Cloud CDN', serviceNameKo: 'Cloud CDN', status: 'active', features: ['Global caching', 'HTTP/3', 'Signed URLs'], featuresKo: ['글로벌 캐싱', 'HTTP/3', '서명된 URL'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Kubernetes ==========
  { id: 'CS-K8S-GCP-001', provider: 'gcp', componentType: 'kubernetes', serviceName: 'Google Kubernetes Engine', serviceNameKo: 'Google Kubernetes Engine', status: 'active', features: ['Autopilot mode', 'Multi-cluster', 'Anthos integration'], featuresKo: ['오토파일럿 모드', '다중 클러스터', 'Anthos 통합'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== Container ==========
  { id: 'CS-CONT-GCP-001', provider: 'gcp', componentType: 'container', serviceName: 'Cloud Run', serviceNameKo: 'Cloud Run', status: 'active', features: ['Knative-based', 'Scale to zero', 'gRPC'], featuresKo: ['Knative 기반', '제로 스케일', 'gRPC'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Cache ==========
  { id: 'CS-CACHE-GCP-001', provider: 'gcp', componentType: 'cache', serviceName: 'Memorystore', serviceNameKo: 'Memorystore', status: 'active', features: ['Redis/Memcached', 'Auto-failover', 'Sub-ms latency'], featuresKo: ['Redis/Memcached', '자동 페일오버', '서브ms 지연'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== Object Storage ==========
  { id: 'CS-OBJ-GCP-001', provider: 'gcp', componentType: 'object-storage', serviceName: 'Cloud Storage', serviceNameKo: 'Cloud Storage', status: 'active', features: ['Multi-regional', 'Object Lifecycle', 'Turbo Replication'], featuresKo: ['다중 리전', '객체 수명주기', '터보 복제'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Backup ==========
  { id: 'CS-BK-GCP-001', provider: 'gcp', componentType: 'backup', serviceName: 'Backup and DR Service', serviceNameKo: 'Backup and DR 서비스', status: 'active', features: ['Incremental backup', 'Mount and access', 'Crash-consistent'], featuresKo: ['증분 백업', '마운트 및 접근', '크래시 일관성'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== VPN Gateway ==========
  { id: 'CS-VPN-GCP-001', provider: 'gcp', componentType: 'vpn-gateway', serviceName: 'Cloud VPN', serviceNameKo: 'Cloud VPN', status: 'active', features: ['HA VPN', 'Classic VPN (deprecated)', 'Dynamic routing'], featuresKo: ['HA VPN', '클래식 VPN (폐기)', '동적 라우팅'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== IAM ==========
  { id: 'CS-IAM-GCP-001', provider: 'gcp', componentType: 'iam', serviceName: 'Cloud IAM', serviceNameKo: 'Cloud IAM', status: 'active', features: ['Fine-grained access', 'Service accounts', 'Workload Identity'], featuresKo: ['세분화된 접근', '서비스 계정', '워크로드 Identity'], pricingTier: 'free', trust: svcTrust('gcp') },

  // ========== SIEM ==========
  { id: 'CS-SIEM-GCP-001', provider: 'gcp', componentType: 'siem', serviceName: 'Chronicle Security Operations', serviceNameKo: 'Chronicle 보안 운영', status: 'active', features: ['Petabyte scale', 'YARA-L rules', 'SOAR integration'], featuresKo: ['페타바이트 규모', 'YARA-L 규칙', 'SOAR 통합'], pricingTier: 'enterprise', trust: svcTrust('gcp') },

  // ========== IDS/IPS ==========
  { id: 'CS-IDS-GCP-001', provider: 'gcp', componentType: 'ids-ips', serviceName: 'Cloud IDS', serviceNameKo: 'Cloud IDS', status: 'active', features: ['Palo Alto-powered', 'Network threat detection', 'Packet mirroring'], featuresKo: ['Palo Alto 기반', '네트워크 위협 탐지', '패킷 미러링'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== SD-WAN ==========
  { id: 'CS-SDWAN-GCP-001', provider: 'gcp', componentType: 'sd-wan', serviceName: 'Network Connectivity Center', serviceNameKo: 'Network Connectivity Center', status: 'active', features: ['Hub-spoke', 'Partner SD-WAN', 'Multi-cloud'], featuresKo: ['허브-스포크', '파트너 SD-WAN', '멀티클라우드'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== MFA ==========
  { id: 'CS-MFA-GCP-001', provider: 'gcp', componentType: 'mfa', serviceName: 'Cloud Identity MFA', serviceNameKo: 'Cloud Identity MFA', status: 'active', features: ['2-Step Verification', 'Security keys', 'Phone-based'], featuresKo: ['2단계 인증', '보안 키', '전화 기반'], pricingTier: 'free', trust: svcTrust('gcp') },
];
