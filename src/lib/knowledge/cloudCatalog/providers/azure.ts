/**
 * Azure Cloud Services
 */

import type { CloudService } from '../types';
import { svcTrust } from '../types';

export const AZURE_SERVICES: CloudService[] = [
  // ========== Firewall ==========
  { id: 'CS-FW-AZ-001', provider: 'azure', componentType: 'firewall', serviceName: 'Azure Firewall', serviceNameKo: 'Azure 방화벽', status: 'active', features: ['L3-L7 filtering', 'Threat intelligence', 'FQDN filtering'], featuresKo: ['L3-L7 필터링', '위협 인텔리전스', 'FQDN 필터링'], pricingTier: 'high', trust: svcTrust('azure') },

  // ========== WAF ==========
  { id: 'CS-WAF-AZ-001', provider: 'azure', componentType: 'waf', serviceName: 'Azure WAF', serviceNameKo: 'Azure WAF', status: 'active', features: ['OWASP CRS', 'Custom rules', 'Bot protection'], featuresKo: ['OWASP CRS', '커스텀 규칙', '봇 보호'], pricingTier: 'medium', trust: svcTrust('azure') },

  // ========== Load Balancer ==========
  { id: 'CS-LB-AZ-001', provider: 'azure', componentType: 'load-balancer', serviceName: 'Azure Load Balancer', serviceNameKo: 'Azure 로드 밸런서', status: 'active', features: ['L4 load balancing', 'HA ports', 'Zone redundant'], featuresKo: ['L4 로드 밸런싱', 'HA 포트', '영역 중복'], pricingTier: 'low', trust: svcTrust('azure') },
  { id: 'CS-LB-AZ-002', provider: 'azure', componentType: 'load-balancer', serviceName: 'Azure Application Gateway', serviceNameKo: 'Azure 애플리케이션 게이트웨이', status: 'active', features: ['L7 routing', 'WAF integrated', 'SSL offloading'], featuresKo: ['L7 라우팅', 'WAF 통합', 'SSL 오프로딩'], pricingTier: 'medium', trust: svcTrust('azure') },

  // ========== Web Server ==========
  { id: 'CS-WEB-AZ-001', provider: 'azure', componentType: 'web-server', serviceName: 'Azure App Service', serviceNameKo: 'Azure App Service', status: 'active', features: ['PaaS', 'Auto-scale', 'CI/CD integration'], featuresKo: ['PaaS', '자동 확장', 'CI/CD 통합'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== App Server ==========
  { id: 'CS-APP-AZ-001', provider: 'azure', componentType: 'app-server', serviceName: 'Azure Container Apps', serviceNameKo: 'Azure Container Apps', status: 'active', features: ['Serverless containers', 'KEDA scaling', 'Dapr'], featuresKo: ['서버리스 컨테이너', 'KEDA 스케일링', 'Dapr'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== Database ==========
  { id: 'CS-DB-AZ-001', provider: 'azure', componentType: 'db-server', serviceName: 'Azure SQL Database', serviceNameKo: 'Azure SQL 데이터베이스', status: 'active', features: ['Intelligent performance', 'Hyperscale', 'Serverless'], featuresKo: ['지능형 성능', '하이퍼스케일', '서버리스'], pricingTier: 'medium', trust: svcTrust('azure') },

  // ========== DNS ==========
  { id: 'CS-DNS-AZ-001', provider: 'azure', componentType: 'dns', serviceName: 'Azure DNS', serviceNameKo: 'Azure DNS', status: 'active', features: ['Anycast', 'Private zones', 'Alias records'], featuresKo: ['애니캐스트', '프라이빗 존', '별칭 레코드'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== CDN ==========
  { id: 'CS-CDN-AZ-001', provider: 'azure', componentType: 'cdn', serviceName: 'Azure Front Door', serviceNameKo: 'Azure Front Door', status: 'active', features: ['Global load balancing', 'WAF', 'Private Link'], featuresKo: ['글로벌 로드 밸런싱', 'WAF', 'Private Link'], pricingTier: 'medium', trust: svcTrust('azure') },
  { id: 'CS-CDN-AZ-002', provider: 'azure', componentType: 'cdn', serviceName: 'Azure CDN (Classic)', serviceNameKo: 'Azure CDN (클래식)', status: 'deprecated', successor: 'Azure Front Door', successorKo: 'Azure Front Door', features: ['Static caching', 'Basic rules'], featuresKo: ['정적 캐싱', '기본 규칙'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== Kubernetes ==========
  { id: 'CS-K8S-AZ-001', provider: 'azure', componentType: 'kubernetes', serviceName: 'Azure Kubernetes Service', serviceNameKo: 'Azure Kubernetes Service', status: 'active', features: ['Free control plane', 'KEDA', 'Azure Arc'], featuresKo: ['무료 컨트롤 플레인', 'KEDA', 'Azure Arc'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== Container ==========
  { id: 'CS-CONT-AZ-001', provider: 'azure', componentType: 'container', serviceName: 'Azure Container Instances', serviceNameKo: 'Azure Container Instances', status: 'active', features: ['Serverless', 'Per-second billing', 'GPU support'], featuresKo: ['서버리스', '초당 과금', 'GPU 지원'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== Cache ==========
  { id: 'CS-CACHE-AZ-001', provider: 'azure', componentType: 'cache', serviceName: 'Azure Cache for Redis', serviceNameKo: 'Azure Cache for Redis', status: 'active', features: ['Enterprise tier', 'Geo-replication', 'Flash storage'], featuresKo: ['엔터프라이즈 티어', '지오 복제', '플래시 스토리지'], pricingTier: 'medium', trust: svcTrust('azure') },

  // ========== Object Storage ==========
  { id: 'CS-OBJ-AZ-001', provider: 'azure', componentType: 'object-storage', serviceName: 'Azure Blob Storage', serviceNameKo: 'Azure Blob Storage', status: 'active', features: ['Hot/Cool/Archive tiers', 'Immutable storage', 'Lifecycle management'], featuresKo: ['핫/쿨/아카이브 티어', '불변 스토리지', '수명주기 관리'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== Backup ==========
  { id: 'CS-BK-AZ-001', provider: 'azure', componentType: 'backup', serviceName: 'Azure Backup', serviceNameKo: 'Azure Backup', status: 'active', features: ['Multi-workload', 'Instant restore', 'Soft delete'], featuresKo: ['다중 워크로드', '즉시 복원', '소프트 삭제'], pricingTier: 'low', trust: svcTrust('azure') },

  // ========== VPN Gateway ==========
  { id: 'CS-VPN-AZ-001', provider: 'azure', componentType: 'vpn-gateway', serviceName: 'Azure VPN Gateway', serviceNameKo: 'Azure VPN 게이트웨이', status: 'active', features: ['Site-to-site', 'Point-to-site', 'VPN over ExpressRoute'], featuresKo: ['사이트간', '포인트투사이트', 'ExpressRoute VPN'], pricingTier: 'medium', trust: svcTrust('azure') },

  // ========== IAM ==========
  { id: 'CS-IAM-AZ-001', provider: 'azure', componentType: 'iam', serviceName: 'Microsoft Entra ID', serviceNameKo: 'Microsoft Entra ID', status: 'active', features: ['SSO', 'Conditional access', 'PIM'], featuresKo: ['SSO', '조건부 접근', 'PIM'], pricingTier: 'free', trust: svcTrust('azure') },
  { id: 'CS-IAM-AZ-002', provider: 'azure', componentType: 'iam', serviceName: 'Azure Active Directory', serviceNameKo: 'Azure Active Directory', status: 'deprecated', successor: 'Microsoft Entra ID', successorKo: 'Microsoft Entra ID', features: ['Identity management', 'MFA', 'SSPR'], featuresKo: ['ID 관리', 'MFA', 'SSPR'], pricingTier: 'free', trust: svcTrust('azure') },

  // ========== SIEM ==========
  { id: 'CS-SIEM-AZ-001', provider: 'azure', componentType: 'siem', serviceName: 'Microsoft Sentinel', serviceNameKo: 'Microsoft Sentinel', status: 'active', features: ['Cloud-native SIEM', 'SOAR built-in', 'Fusion ML'], featuresKo: ['클라우드 네이티브 SIEM', 'SOAR 내장', 'Fusion ML'], pricingTier: 'high', trust: svcTrust('azure') },

  // ========== IDS/IPS ==========
  { id: 'CS-IDS-AZ-001', provider: 'azure', componentType: 'ids-ips', serviceName: 'Azure Firewall Premium IDS/IPS', serviceNameKo: 'Azure Firewall Premium IDS/IPS', status: 'active', features: ['Signature-based', 'TLS inspection', '58K+ signatures'], featuresKo: ['시그니처 기반', 'TLS 검사', '58K+ 시그니처'], pricingTier: 'high', trust: svcTrust('azure') },

  // ========== SD-WAN ==========
  { id: 'CS-SDWAN-AZ-001', provider: 'azure', componentType: 'sd-wan', serviceName: 'Azure Virtual WAN', serviceNameKo: 'Azure Virtual WAN', status: 'active', features: ['Hub-spoke', 'SD-WAN integration', 'ExpressRoute'], featuresKo: ['허브-스포크', 'SD-WAN 통합', 'ExpressRoute'], pricingTier: 'high', trust: svcTrust('azure') },

  // ========== MFA ==========
  { id: 'CS-MFA-AZ-001', provider: 'azure', componentType: 'mfa', serviceName: 'Entra ID MFA', serviceNameKo: 'Entra ID MFA', status: 'active', features: ['Push notification', 'Number matching', 'Passwordless'], featuresKo: ['푸시 알림', '번호 매칭', '패스워드리스'], pricingTier: 'free', trust: svcTrust('azure') },
];
