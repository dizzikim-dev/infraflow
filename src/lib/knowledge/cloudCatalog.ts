/**
 * Cloud Service Catalog - AWS/Azure/GCP service mappings for InfraNodeType
 *
 * Maps infrastructure component types to cloud provider services with
 * status tracking (active, deprecated, preview, end-of-life), successor
 * recommendations, and cost tier information.
 */

import type { InfraNodeType } from '@/types/infra';
import type { InfraSpec } from '@/types/infra';
import type { TrustMetadata, KnowledgeSource } from './types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CloudProvider = 'aws' | 'azure' | 'gcp';
export type ServiceStatus = 'active' | 'deprecated' | 'preview' | 'end-of-life';
export type PricingTier = 'free' | 'low' | 'medium' | 'high' | 'enterprise';

export interface CloudService {
  id: string;
  provider: CloudProvider;
  componentType: InfraNodeType;
  serviceName: string;
  serviceNameKo: string;
  status: ServiceStatus;
  successor?: string;
  successorKo?: string;
  features: string[];
  featuresKo: string[];
  pricingTier: PricingTier;
  trust: TrustMetadata;
}

export interface DeprecationWarning {
  service: CloudService;
  urgency: 'critical' | 'high' | 'medium';
  messageKo: string;
}

export interface ServiceComparison {
  componentType: InfraNodeType;
  services: CloudService[];
}

// ---------------------------------------------------------------------------
// Trust helper
// ---------------------------------------------------------------------------

const VENDOR_TRUST: TrustMetadata = {
  confidence: 0.85,
  sources: [{
    type: 'vendor' as const,
    title: 'Cloud Provider Service Catalog',
    url: 'https://aws.amazon.com/products/',
    accessedDate: '2026-02-10',
  }],
  lastReviewedAt: '2026-02-10',
  upvotes: 0,
  downvotes: 0,
};

function svcTrust(provider: CloudProvider): TrustMetadata {
  const urls: Record<CloudProvider, string> = {
    aws: 'https://aws.amazon.com/products/',
    azure: 'https://azure.microsoft.com/products/',
    gcp: 'https://cloud.google.com/products',
  };
  return {
    ...VENDOR_TRUST,
    sources: [{
      type: 'vendor' as const,
      title: `${provider.toUpperCase()} Service Catalog`,
      url: urls[provider],
      accessedDate: '2026-02-10',
    }],
  };
}

// ---------------------------------------------------------------------------
// Cloud Service Database (~70 entries)
// ---------------------------------------------------------------------------

export const CLOUD_SERVICES: CloudService[] = [
  // ========== Firewall ==========
  { id: 'CS-FW-AWS-001', provider: 'aws', componentType: 'firewall', serviceName: 'AWS Network Firewall', serviceNameKo: 'AWS 네트워크 방화벽', status: 'active', features: ['Stateful inspection', 'IDS/IPS', 'Domain filtering'], featuresKo: ['상태 기반 검사', 'IDS/IPS', '도메인 필터링'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-FW-AWS-002', provider: 'aws', componentType: 'firewall', serviceName: 'AWS Security Groups', serviceNameKo: 'AWS 보안 그룹', status: 'active', features: ['Stateful L4 filtering', 'VPC-level', 'Free'], featuresKo: ['상태 기반 L4 필터링', 'VPC 수준', '무료'], pricingTier: 'free', trust: svcTrust('aws') },
  { id: 'CS-FW-AZ-001', provider: 'azure', componentType: 'firewall', serviceName: 'Azure Firewall', serviceNameKo: 'Azure 방화벽', status: 'active', features: ['L3-L7 filtering', 'Threat intelligence', 'FQDN filtering'], featuresKo: ['L3-L7 필터링', '위협 인텔리전스', 'FQDN 필터링'], pricingTier: 'high', trust: svcTrust('azure') },
  { id: 'CS-FW-GCP-001', provider: 'gcp', componentType: 'firewall', serviceName: 'Cloud Armor + VPC Firewall', serviceNameKo: 'Cloud Armor + VPC 방화벽', status: 'active', features: ['DDoS protection', 'WAF integration', 'Hierarchical rules'], featuresKo: ['DDoS 보호', 'WAF 통합', '계층적 규칙'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== WAF ==========
  { id: 'CS-WAF-AWS-001', provider: 'aws', componentType: 'waf', serviceName: 'AWS WAF', serviceNameKo: 'AWS WAF', status: 'active', features: ['Rule groups', 'Bot control', 'Rate limiting'], featuresKo: ['규칙 그룹', '봇 제어', '속도 제한'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-WAF-AZ-001', provider: 'azure', componentType: 'waf', serviceName: 'Azure WAF', serviceNameKo: 'Azure WAF', status: 'active', features: ['OWASP CRS', 'Custom rules', 'Bot protection'], featuresKo: ['OWASP CRS', '커스텀 규칙', '봇 보호'], pricingTier: 'medium', trust: svcTrust('azure') },
  { id: 'CS-WAF-GCP-001', provider: 'gcp', componentType: 'waf', serviceName: 'Cloud Armor WAF', serviceNameKo: 'Cloud Armor WAF', status: 'active', features: ['Pre-configured rules', 'Adaptive protection', 'Edge security'], featuresKo: ['사전 구성된 규칙', '적응형 보호', '엣지 보안'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== Load Balancer ==========
  { id: 'CS-LB-AWS-001', provider: 'aws', componentType: 'load-balancer', serviceName: 'Application Load Balancer', serviceNameKo: '애플리케이션 로드 밸런서', status: 'active', features: ['L7 routing', 'WebSocket', 'gRPC'], featuresKo: ['L7 라우팅', 'WebSocket', 'gRPC'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-LB-AWS-002', provider: 'aws', componentType: 'load-balancer', serviceName: 'Classic Load Balancer', serviceNameKo: '클래식 로드 밸런서', status: 'deprecated', successor: 'Application/Network Load Balancer', successorKo: '애플리케이션/네트워크 로드 밸런서', features: ['L4/L7 basic', 'Legacy'], featuresKo: ['L4/L7 기본', '레거시'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-LB-AZ-001', provider: 'azure', componentType: 'load-balancer', serviceName: 'Azure Load Balancer', serviceNameKo: 'Azure 로드 밸런서', status: 'active', features: ['L4 load balancing', 'HA ports', 'Zone redundant'], featuresKo: ['L4 로드 밸런싱', 'HA 포트', '영역 중복'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-LB-AZ-002', provider: 'azure', componentType: 'load-balancer', serviceName: 'Azure Application Gateway', serviceNameKo: 'Azure 애플리케이션 게이트웨이', status: 'active', features: ['L7 routing', 'WAF integrated', 'SSL offloading'], featuresKo: ['L7 라우팅', 'WAF 통합', 'SSL 오프로딩'], pricingTier: 'medium', trust: svcTrust('azure') },
  { id: 'CS-LB-GCP-001', provider: 'gcp', componentType: 'load-balancer', serviceName: 'Cloud Load Balancing', serviceNameKo: '클라우드 로드 밸런싱', status: 'active', features: ['Global anycast', 'L4/L7', 'Auto-scaling'], featuresKo: ['글로벌 애니캐스트', 'L4/L7', '자동 확장'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Web Server ==========
  { id: 'CS-WEB-AWS-001', provider: 'aws', componentType: 'web-server', serviceName: 'Amazon EC2', serviceNameKo: 'Amazon EC2', status: 'active', features: ['Flexible instances', 'Auto Scaling', 'Spot instances'], featuresKo: ['유연한 인스턴스', '오토 스케일링', '스팟 인스턴스'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-WEB-AWS-002', provider: 'aws', componentType: 'web-server', serviceName: 'AWS Lightsail', serviceNameKo: 'AWS Lightsail', status: 'active', features: ['Simple VPS', 'Fixed pricing', 'Managed'], featuresKo: ['심플 VPS', '고정 가격', '관리형'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-WEB-AZ-001', provider: 'azure', componentType: 'web-server', serviceName: 'Azure App Service', serviceNameKo: 'Azure App Service', status: 'active', features: ['PaaS', 'Auto-scale', 'CI/CD integration'], featuresKo: ['PaaS', '자동 확장', 'CI/CD 통합'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-WEB-GCP-001', provider: 'gcp', componentType: 'web-server', serviceName: 'Compute Engine', serviceNameKo: 'Compute Engine', status: 'active', features: ['Custom machine types', 'Preemptible VMs', 'Live migration'], featuresKo: ['커스텀 머신 유형', '선점형 VM', '라이브 마이그레이션'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== App Server ==========
  { id: 'CS-APP-AWS-001', provider: 'aws', componentType: 'app-server', serviceName: 'AWS Elastic Beanstalk', serviceNameKo: 'AWS Elastic Beanstalk', status: 'active', features: ['Managed platform', 'Auto scaling', 'Multi-language'], featuresKo: ['관리형 플랫폼', '자동 확장', '다중 언어'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-APP-AWS-002', provider: 'aws', componentType: 'app-server', serviceName: 'AWS App Runner', serviceNameKo: 'AWS App Runner', status: 'active', features: ['Container-based', 'Auto-deploy', 'Simplified'], featuresKo: ['컨테이너 기반', '자동 배포', '단순화'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-APP-AZ-001', provider: 'azure', componentType: 'app-server', serviceName: 'Azure Container Apps', serviceNameKo: 'Azure Container Apps', status: 'active', features: ['Serverless containers', 'KEDA scaling', 'Dapr'], featuresKo: ['서버리스 컨테이너', 'KEDA 스케일링', 'Dapr'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-APP-GCP-001', provider: 'gcp', componentType: 'app-server', serviceName: 'Cloud Run', serviceNameKo: 'Cloud Run', status: 'active', features: ['Serverless containers', 'Pay-per-use', 'gRPC support'], featuresKo: ['서버리스 컨테이너', '사용량 기반 과금', 'gRPC 지원'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Database ==========
  { id: 'CS-DB-AWS-001', provider: 'aws', componentType: 'db-server', serviceName: 'Amazon RDS', serviceNameKo: 'Amazon RDS', status: 'active', features: ['Multi-AZ', 'Read replicas', '6 engines'], featuresKo: ['다중 AZ', '읽기 복제본', '6개 엔진'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-DB-AWS-002', provider: 'aws', componentType: 'db-server', serviceName: 'Amazon Aurora', serviceNameKo: 'Amazon Aurora', status: 'active', features: ['MySQL/PostgreSQL compatible', '5x performance', 'Serverless v2'], featuresKo: ['MySQL/PostgreSQL 호환', '5배 성능', '서버리스 v2'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-DB-AZ-001', provider: 'azure', componentType: 'db-server', serviceName: 'Azure SQL Database', serviceNameKo: 'Azure SQL 데이터베이스', status: 'active', features: ['Intelligent performance', 'Hyperscale', 'Serverless'], featuresKo: ['지능형 성능', '하이퍼스케일', '서버리스'], pricingTier: 'medium', trust: svcTrust('azure') },
  { id: 'CS-DB-GCP-001', provider: 'gcp', componentType: 'db-server', serviceName: 'Cloud SQL', serviceNameKo: 'Cloud SQL', status: 'active', features: ['Managed MySQL/PostgreSQL/SQL Server', 'HA', 'Encryption'], featuresKo: ['관리형 MySQL/PostgreSQL/SQL Server', '고가용성', '암호화'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== DNS ==========
  { id: 'CS-DNS-AWS-001', provider: 'aws', componentType: 'dns', serviceName: 'Amazon Route 53', serviceNameKo: 'Amazon Route 53', status: 'active', features: ['DNS + health checks', 'Traffic routing', 'Domain registration'], featuresKo: ['DNS + 상태 확인', '트래픽 라우팅', '도메인 등록'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-DNS-AZ-001', provider: 'azure', componentType: 'dns', serviceName: 'Azure DNS', serviceNameKo: 'Azure DNS', status: 'active', features: ['Anycast', 'Private zones', 'Alias records'], featuresKo: ['애니캐스트', '프라이빗 존', '별칭 레코드'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-DNS-GCP-001', provider: 'gcp', componentType: 'dns', serviceName: 'Cloud DNS', serviceNameKo: 'Cloud DNS', status: 'active', features: ['100% SLA', 'DNSSEC', 'Private zones'], featuresKo: ['100% SLA', 'DNSSEC', '프라이빗 존'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== CDN ==========
  { id: 'CS-CDN-AWS-001', provider: 'aws', componentType: 'cdn', serviceName: 'Amazon CloudFront', serviceNameKo: 'Amazon CloudFront', status: 'active', features: ['Edge locations', 'Lambda@Edge', 'Real-time logs'], featuresKo: ['엣지 로케이션', 'Lambda@Edge', '실시간 로그'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-CDN-AZ-001', provider: 'azure', componentType: 'cdn', serviceName: 'Azure Front Door', serviceNameKo: 'Azure Front Door', status: 'active', features: ['Global load balancing', 'WAF', 'Private Link'], featuresKo: ['글로벌 로드 밸런싱', 'WAF', 'Private Link'], pricingTier: 'medium', trust: svcTrust('azure') },
  { id: 'CS-CDN-AZ-002', provider: 'azure', componentType: 'cdn', serviceName: 'Azure CDN (Classic)', serviceNameKo: 'Azure CDN (클래식)', status: 'deprecated', successor: 'Azure Front Door', successorKo: 'Azure Front Door', features: ['Static caching', 'Basic rules'], featuresKo: ['정적 캐싱', '기본 규칙'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-CDN-GCP-001', provider: 'gcp', componentType: 'cdn', serviceName: 'Cloud CDN', serviceNameKo: 'Cloud CDN', status: 'active', features: ['Global caching', 'HTTP/3', 'Signed URLs'], featuresKo: ['글로벌 캐싱', 'HTTP/3', '서명된 URL'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Kubernetes ==========
  { id: 'CS-K8S-AWS-001', provider: 'aws', componentType: 'kubernetes', serviceName: 'Amazon EKS', serviceNameKo: 'Amazon EKS', status: 'active', features: ['Managed control plane', 'Fargate integration', 'EKS Anywhere'], featuresKo: ['관리형 컨트롤 플레인', 'Fargate 통합', 'EKS Anywhere'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-K8S-AZ-001', provider: 'azure', componentType: 'kubernetes', serviceName: 'Azure Kubernetes Service', serviceNameKo: 'Azure Kubernetes Service', status: 'active', features: ['Free control plane', 'KEDA', 'Azure Arc'], featuresKo: ['무료 컨트롤 플레인', 'KEDA', 'Azure Arc'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-K8S-GCP-001', provider: 'gcp', componentType: 'kubernetes', serviceName: 'Google Kubernetes Engine', serviceNameKo: 'Google Kubernetes Engine', status: 'active', features: ['Autopilot mode', 'Multi-cluster', 'Anthos integration'], featuresKo: ['오토파일럿 모드', '다중 클러스터', 'Anthos 통합'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== Container ==========
  { id: 'CS-CONT-AWS-001', provider: 'aws', componentType: 'container', serviceName: 'Amazon ECS', serviceNameKo: 'Amazon ECS', status: 'active', features: ['Docker native', 'Fargate serverless', 'EC2 launch type'], featuresKo: ['Docker 네이티브', 'Fargate 서버리스', 'EC2 실행 유형'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-CONT-AZ-001', provider: 'azure', componentType: 'container', serviceName: 'Azure Container Instances', serviceNameKo: 'Azure Container Instances', status: 'active', features: ['Serverless', 'Per-second billing', 'GPU support'], featuresKo: ['서버리스', '초당 과금', 'GPU 지원'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-CONT-GCP-001', provider: 'gcp', componentType: 'container', serviceName: 'Cloud Run', serviceNameKo: 'Cloud Run', status: 'active', features: ['Knative-based', 'Scale to zero', 'gRPC'], featuresKo: ['Knative 기반', '제로 스케일', 'gRPC'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Cache ==========
  { id: 'CS-CACHE-AWS-001', provider: 'aws', componentType: 'cache', serviceName: 'Amazon ElastiCache', serviceNameKo: 'Amazon ElastiCache', status: 'active', features: ['Redis/Memcached', 'Multi-AZ', 'Auto-failover'], featuresKo: ['Redis/Memcached', '다중 AZ', '자동 페일오버'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-CACHE-AZ-001', provider: 'azure', componentType: 'cache', serviceName: 'Azure Cache for Redis', serviceNameKo: 'Azure Cache for Redis', status: 'active', features: ['Enterprise tier', 'Geo-replication', 'Flash storage'], featuresKo: ['엔터프라이즈 티어', '지오 복제', '플래시 스토리지'], pricingTier: 'medium', trust: svcTrust('azure') },
  { id: 'CS-CACHE-GCP-001', provider: 'gcp', componentType: 'cache', serviceName: 'Memorystore', serviceNameKo: 'Memorystore', status: 'active', features: ['Redis/Memcached', 'Auto-failover', 'Sub-ms latency'], featuresKo: ['Redis/Memcached', '자동 페일오버', '서브ms 지연'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== Object Storage ==========
  { id: 'CS-OBJ-AWS-001', provider: 'aws', componentType: 'object-storage', serviceName: 'Amazon S3', serviceNameKo: 'Amazon S3', status: 'active', features: ['11 9s durability', 'Storage classes', 'Event notifications'], featuresKo: ['11 9s 내구성', '스토리지 클래스', '이벤트 알림'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-OBJ-AZ-001', provider: 'azure', componentType: 'object-storage', serviceName: 'Azure Blob Storage', serviceNameKo: 'Azure Blob Storage', status: 'active', features: ['Hot/Cool/Archive tiers', 'Immutable storage', 'Lifecycle management'], featuresKo: ['핫/쿨/아카이브 티어', '불변 스토리지', '수명주기 관리'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-OBJ-GCP-001', provider: 'gcp', componentType: 'object-storage', serviceName: 'Cloud Storage', serviceNameKo: 'Cloud Storage', status: 'active', features: ['Multi-regional', 'Object Lifecycle', 'Turbo Replication'], featuresKo: ['다중 리전', '객체 수명주기', '터보 복제'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== Backup ==========
  { id: 'CS-BK-AWS-001', provider: 'aws', componentType: 'backup', serviceName: 'AWS Backup', serviceNameKo: 'AWS Backup', status: 'active', features: ['Cross-region', 'Policy-based', 'Vault Lock'], featuresKo: ['교차 리전', '정책 기반', '볼트 잠금'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-BK-AZ-001', provider: 'azure', componentType: 'backup', serviceName: 'Azure Backup', serviceNameKo: 'Azure Backup', status: 'active', features: ['Multi-workload', 'Instant restore', 'Soft delete'], featuresKo: ['다중 워크로드', '즉시 복원', '소프트 삭제'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-BK-GCP-001', provider: 'gcp', componentType: 'backup', serviceName: 'Backup and DR Service', serviceNameKo: 'Backup and DR 서비스', status: 'active', features: ['Incremental backup', 'Mount and access', 'Crash-consistent'], featuresKo: ['증분 백업', '마운트 및 접근', '크래시 일관성'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== VPN Gateway ==========
  { id: 'CS-VPN-AWS-001', provider: 'aws', componentType: 'vpn-gateway', serviceName: 'AWS Site-to-Site VPN', serviceNameKo: 'AWS 사이트간 VPN', status: 'active', features: ['IPsec tunnels', 'Accelerated VPN', 'Private IP VPN'], featuresKo: ['IPsec 터널', '가속 VPN', '프라이빗 IP VPN'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-VPN-AWS-002', provider: 'aws', componentType: 'vpn-gateway', serviceName: 'AWS Client VPN', serviceNameKo: 'AWS 클라이언트 VPN', status: 'active', features: ['OpenVPN-based', 'MFA support', 'Split tunneling'], featuresKo: ['OpenVPN 기반', 'MFA 지원', '스플릿 터널링'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-VPN-AZ-001', provider: 'azure', componentType: 'vpn-gateway', serviceName: 'Azure VPN Gateway', serviceNameKo: 'Azure VPN 게이트웨이', status: 'active', features: ['Site-to-site', 'Point-to-site', 'VPN over ExpressRoute'], featuresKo: ['사이트간', '포인트투사이트', 'ExpressRoute VPN'], pricingTier: 'medium', trust: svcTrust('azure') },
  { id: 'CS-VPN-GCP-001', provider: 'gcp', componentType: 'vpn-gateway', serviceName: 'Cloud VPN', serviceNameKo: 'Cloud VPN', status: 'active', features: ['HA VPN', 'Classic VPN (deprecated)', 'Dynamic routing'], featuresKo: ['HA VPN', '클래식 VPN (폐기)', '동적 라우팅'], pricingTier: 'low', trust: svcTrust('gcp') },

  // ========== IAM ==========
  { id: 'CS-IAM-AWS-001', provider: 'aws', componentType: 'iam', serviceName: 'AWS IAM', serviceNameKo: 'AWS IAM', status: 'active', features: ['Fine-grained policies', 'Roles', 'Identity Center'], featuresKo: ['세분화된 정책', '역할', 'Identity Center'], pricingTier: 'free', trust: svcTrust('aws') },
  { id: 'CS-IAM-AZ-001', provider: 'azure', componentType: 'iam', serviceName: 'Microsoft Entra ID', serviceNameKo: 'Microsoft Entra ID', status: 'active', features: ['SSO', 'Conditional access', 'PIM'], featuresKo: ['SSO', '조건부 접근', 'PIM'], pricingTier: 'free', trust: svcTrust('azure') },
  { id: 'CS-IAM-AZ-002', provider: 'azure', componentType: 'iam', serviceName: 'Azure Active Directory', serviceNameKo: 'Azure Active Directory', status: 'deprecated', successor: 'Microsoft Entra ID', successorKo: 'Microsoft Entra ID', features: ['Identity management', 'MFA', 'SSPR'], featuresKo: ['ID 관리', 'MFA', 'SSPR'], pricingTier: 'free', trust: svcTrust('azure') },
  { id: 'CS-IAM-GCP-001', provider: 'gcp', componentType: 'iam', serviceName: 'Cloud IAM', serviceNameKo: 'Cloud IAM', status: 'active', features: ['Fine-grained access', 'Service accounts', 'Workload Identity'], featuresKo: ['세분화된 접근', '서비스 계정', '워크로드 Identity'], pricingTier: 'free', trust: svcTrust('gcp') },

  // ========== SIEM ==========
  { id: 'CS-SIEM-AWS-001', provider: 'aws', componentType: 'siem', serviceName: 'Amazon Security Lake + OpenSearch', serviceNameKo: 'Amazon Security Lake + OpenSearch', status: 'active', features: ['OCSF format', 'Cross-account', 'ML insights'], featuresKo: ['OCSF 형식', '교차 계정', 'ML 인사이트'], pricingTier: 'high', trust: svcTrust('aws') },
  { id: 'CS-SIEM-AZ-001', provider: 'azure', componentType: 'siem', serviceName: 'Microsoft Sentinel', serviceNameKo: 'Microsoft Sentinel', status: 'active', features: ['Cloud-native SIEM', 'SOAR built-in', 'Fusion ML'], featuresKo: ['클라우드 네이티브 SIEM', 'SOAR 내장', 'Fusion ML'], pricingTier: 'high', trust: svcTrust('azure') },
  { id: 'CS-SIEM-GCP-001', provider: 'gcp', componentType: 'siem', serviceName: 'Chronicle Security Operations', serviceNameKo: 'Chronicle 보안 운영', status: 'active', features: ['Petabyte scale', 'YARA-L rules', 'SOAR integration'], featuresKo: ['페타바이트 규모', 'YARA-L 규칙', 'SOAR 통합'], pricingTier: 'enterprise', trust: svcTrust('gcp') },

  // ========== IDS/IPS ==========
  { id: 'CS-IDS-AWS-001', provider: 'aws', componentType: 'ids-ips', serviceName: 'AWS Network Firewall IPS', serviceNameKo: 'AWS 네트워크 방화벽 IPS', status: 'active', features: ['Suricata compatible', 'Managed rules', 'Stateful inspection'], featuresKo: ['Suricata 호환', '관리형 규칙', '상태 기반 검사'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-IDS-AWS-002', provider: 'aws', componentType: 'ids-ips', serviceName: 'Amazon GuardDuty', serviceNameKo: 'Amazon GuardDuty', status: 'active', features: ['Threat detection', 'ML-based', 'VPC flow analysis'], featuresKo: ['위협 탐지', 'ML 기반', 'VPC 플로우 분석'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-IDS-AZ-001', provider: 'azure', componentType: 'ids-ips', serviceName: 'Azure Firewall Premium IDS/IPS', serviceNameKo: 'Azure Firewall Premium IDS/IPS', status: 'active', features: ['Signature-based', 'TLS inspection', '58K+ signatures'], featuresKo: ['시그니처 기반', 'TLS 검사', '58K+ 시그니처'], pricingTier: 'high', trust: svcTrust('azure') },
  { id: 'CS-IDS-GCP-001', provider: 'gcp', componentType: 'ids-ips', serviceName: 'Cloud IDS', serviceNameKo: 'Cloud IDS', status: 'active', features: ['Palo Alto-powered', 'Network threat detection', 'Packet mirroring'], featuresKo: ['Palo Alto 기반', '네트워크 위협 탐지', '패킷 미러링'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== SD-WAN ==========
  { id: 'CS-SDWAN-AWS-001', provider: 'aws', componentType: 'sd-wan', serviceName: 'AWS Cloud WAN', serviceNameKo: 'AWS Cloud WAN', status: 'active', features: ['Global network', 'Policy-based', 'Transit Gateway integration'], featuresKo: ['글로벌 네트워크', '정책 기반', 'Transit Gateway 통합'], pricingTier: 'high', trust: svcTrust('aws') },
  { id: 'CS-SDWAN-AZ-001', provider: 'azure', componentType: 'sd-wan', serviceName: 'Azure Virtual WAN', serviceNameKo: 'Azure Virtual WAN', status: 'active', features: ['Hub-spoke', 'SD-WAN integration', 'ExpressRoute'], featuresKo: ['허브-스포크', 'SD-WAN 통합', 'ExpressRoute'], pricingTier: 'high', trust: svcTrust('azure') },
  { id: 'CS-SDWAN-GCP-001', provider: 'gcp', componentType: 'sd-wan', serviceName: 'Network Connectivity Center', serviceNameKo: 'Network Connectivity Center', status: 'active', features: ['Hub-spoke', 'Partner SD-WAN', 'Multi-cloud'], featuresKo: ['허브-스포크', '파트너 SD-WAN', '멀티클라우드'], pricingTier: 'medium', trust: svcTrust('gcp') },

  // ========== MFA ==========
  { id: 'CS-MFA-AWS-001', provider: 'aws', componentType: 'mfa', serviceName: 'AWS IAM MFA', serviceNameKo: 'AWS IAM MFA', status: 'active', features: ['Virtual MFA', 'Hardware tokens', 'FIDO2'], featuresKo: ['가상 MFA', '하드웨어 토큰', 'FIDO2'], pricingTier: 'free', trust: svcTrust('aws') },
  { id: 'CS-MFA-AZ-001', provider: 'azure', componentType: 'mfa', serviceName: 'Entra ID MFA', serviceNameKo: 'Entra ID MFA', status: 'active', features: ['Push notification', 'Number matching', 'Passwordless'], featuresKo: ['푸시 알림', '번호 매칭', '패스워드리스'], pricingTier: 'free', trust: svcTrust('azure') },
  { id: 'CS-MFA-GCP-001', provider: 'gcp', componentType: 'mfa', serviceName: 'Cloud Identity MFA', serviceNameKo: 'Cloud Identity MFA', status: 'active', features: ['2-Step Verification', 'Security keys', 'Phone-based'], featuresKo: ['2단계 인증', '보안 키', '전화 기반'], pricingTier: 'free', trust: svcTrust('gcp') },
];

// ---------------------------------------------------------------------------
// Query Helpers
// ---------------------------------------------------------------------------

/** Get all cloud services for a specific component type */
export function getCloudServices(componentType: InfraNodeType, provider?: CloudProvider): CloudService[] {
  return CLOUD_SERVICES.filter(
    (s) => s.componentType === componentType && (!provider || s.provider === provider),
  );
}

/** Get deprecation warnings for services used in a spec */
export function getDeprecationWarnings(spec: InfraSpec): DeprecationWarning[] {
  const types = new Set(spec.nodes.map((n) => n.type));
  const warnings: DeprecationWarning[] = [];

  for (const svc of CLOUD_SERVICES) {
    if (!types.has(svc.componentType)) continue;
    if (svc.status === 'end-of-life') {
      warnings.push({
        service: svc,
        urgency: 'critical',
        messageKo: `${svc.serviceNameKo}은(는) 서비스가 종료되었습니다. ${svc.successorKo ? `${svc.successorKo}(으)로 마이그레이션하세요.` : '대체 서비스를 검토하세요.'}`,
      });
    } else if (svc.status === 'deprecated') {
      warnings.push({
        service: svc,
        urgency: 'high',
        messageKo: `${svc.serviceNameKo}은(는) 더 이상 사용되지 않습니다. ${svc.successorKo ? `${svc.successorKo}(으)로 전환을 권장합니다.` : '대체 서비스를 검토하세요.'}`,
      });
    }
  }

  return warnings.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.urgency] - order[b.urgency];
  });
}

/** Compare services across providers for a given component type */
export function compareServices(componentType: InfraNodeType): ServiceComparison {
  const services = CLOUD_SERVICES.filter(
    (s) => s.componentType === componentType && s.status === 'active',
  );
  return { componentType, services };
}

/** Get alternative services for a deprecated service */
export function getAlternatives(service: CloudService): CloudService[] {
  if (service.status === 'active') return [];
  // Find active services from the same provider and component type
  return CLOUD_SERVICES.filter(
    (s) =>
      s.provider === service.provider &&
      s.componentType === service.componentType &&
      s.status === 'active' &&
      s.id !== service.id,
  );
}
