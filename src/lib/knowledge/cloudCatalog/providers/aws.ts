/**
 * AWS Cloud Services
 */

import type { CloudService } from '../types';
import { svcTrust } from '../types';

export const AWS_SERVICES: CloudService[] = [
  // ========== Firewall ==========
  { id: 'CS-FW-AWS-001', provider: 'aws', componentType: 'firewall', serviceName: 'AWS Network Firewall', serviceNameKo: 'AWS 네트워크 방화벽', status: 'active', features: ['Stateful inspection', 'IDS/IPS', 'Domain filtering'], featuresKo: ['상태 기반 검사', 'IDS/IPS', '도메인 필터링'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-FW-AWS-002', provider: 'aws', componentType: 'firewall', serviceName: 'AWS Security Groups', serviceNameKo: 'AWS 보안 그룹', status: 'active', features: ['Stateful L4 filtering', 'VPC-level', 'Free'], featuresKo: ['상태 기반 L4 필터링', 'VPC 수준', '무료'], pricingTier: 'free', trust: svcTrust('aws') },

  // ========== WAF ==========
  { id: 'CS-WAF-AWS-001', provider: 'aws', componentType: 'waf', serviceName: 'AWS WAF', serviceNameKo: 'AWS WAF', status: 'active', features: ['Rule groups', 'Bot control', 'Rate limiting'], featuresKo: ['규칙 그룹', '봇 제어', '속도 제한'], pricingTier: 'medium', trust: svcTrust('aws') },

  // ========== Load Balancer ==========
  { id: 'CS-LB-AWS-001', provider: 'aws', componentType: 'load-balancer', serviceName: 'Application Load Balancer', serviceNameKo: '애플리케이션 로드 밸런서', status: 'active', features: ['L7 routing', 'WebSocket', 'gRPC'], featuresKo: ['L7 라우팅', 'WebSocket', 'gRPC'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-LB-AWS-002', provider: 'aws', componentType: 'load-balancer', serviceName: 'Classic Load Balancer', serviceNameKo: '클래식 로드 밸런서', status: 'deprecated', successor: 'Application/Network Load Balancer', successorKo: '애플리케이션/네트워크 로드 밸런서', features: ['L4/L7 basic', 'Legacy'], featuresKo: ['L4/L7 기본', '레거시'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== Web Server ==========
  { id: 'CS-WEB-AWS-001', provider: 'aws', componentType: 'web-server', serviceName: 'Amazon EC2', serviceNameKo: 'Amazon EC2', status: 'active', features: ['Flexible instances', 'Auto Scaling', 'Spot instances'], featuresKo: ['유연한 인스턴스', '오토 스케일링', '스팟 인스턴스'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-WEB-AWS-002', provider: 'aws', componentType: 'web-server', serviceName: 'AWS Lightsail', serviceNameKo: 'AWS Lightsail', status: 'active', features: ['Simple VPS', 'Fixed pricing', 'Managed'], featuresKo: ['심플 VPS', '고정 가격', '관리형'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== App Server ==========
  { id: 'CS-APP-AWS-001', provider: 'aws', componentType: 'app-server', serviceName: 'AWS Elastic Beanstalk', serviceNameKo: 'AWS Elastic Beanstalk', status: 'active', features: ['Managed platform', 'Auto scaling', 'Multi-language'], featuresKo: ['관리형 플랫폼', '자동 확장', '다중 언어'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-APP-AWS-002', provider: 'aws', componentType: 'app-server', serviceName: 'AWS App Runner', serviceNameKo: 'AWS App Runner', status: 'active', features: ['Container-based', 'Auto-deploy', 'Simplified'], featuresKo: ['컨테이너 기반', '자동 배포', '단순화'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== Database ==========
  { id: 'CS-DB-AWS-001', provider: 'aws', componentType: 'db-server', serviceName: 'Amazon RDS', serviceNameKo: 'Amazon RDS', status: 'active', features: ['Multi-AZ', 'Read replicas', '6 engines'], featuresKo: ['다중 AZ', '읽기 복제본', '6개 엔진'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-DB-AWS-002', provider: 'aws', componentType: 'db-server', serviceName: 'Amazon Aurora', serviceNameKo: 'Amazon Aurora', status: 'active', features: ['MySQL/PostgreSQL compatible', '5x performance', 'Serverless v2'], featuresKo: ['MySQL/PostgreSQL 호환', '5배 성능', '서버리스 v2'], pricingTier: 'medium', trust: svcTrust('aws') },

  // ========== DNS ==========
  { id: 'CS-DNS-AWS-001', provider: 'aws', componentType: 'dns', serviceName: 'Amazon Route 53', serviceNameKo: 'Amazon Route 53', status: 'active', features: ['DNS + health checks', 'Traffic routing', 'Domain registration'], featuresKo: ['DNS + 상태 확인', '트래픽 라우팅', '도메인 등록'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== CDN ==========
  { id: 'CS-CDN-AWS-001', provider: 'aws', componentType: 'cdn', serviceName: 'Amazon CloudFront', serviceNameKo: 'Amazon CloudFront', status: 'active', features: ['Edge locations', 'Lambda@Edge', 'Real-time logs'], featuresKo: ['엣지 로케이션', 'Lambda@Edge', '실시간 로그'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== Kubernetes ==========
  { id: 'CS-K8S-AWS-001', provider: 'aws', componentType: 'kubernetes', serviceName: 'Amazon EKS', serviceNameKo: 'Amazon EKS', status: 'active', features: ['Managed control plane', 'Fargate integration', 'EKS Anywhere'], featuresKo: ['관리형 컨트롤 플레인', 'Fargate 통합', 'EKS Anywhere'], pricingTier: 'medium', trust: svcTrust('aws') },

  // ========== Container ==========
  { id: 'CS-CONT-AWS-001', provider: 'aws', componentType: 'container', serviceName: 'Amazon ECS', serviceNameKo: 'Amazon ECS', status: 'active', features: ['Docker native', 'Fargate serverless', 'EC2 launch type'], featuresKo: ['Docker 네이티브', 'Fargate 서버리스', 'EC2 실행 유형'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== Cache ==========
  { id: 'CS-CACHE-AWS-001', provider: 'aws', componentType: 'cache', serviceName: 'Amazon ElastiCache', serviceNameKo: 'Amazon ElastiCache', status: 'active', features: ['Redis/Memcached', 'Multi-AZ', 'Auto-failover'], featuresKo: ['Redis/Memcached', '다중 AZ', '자동 페일오버'], pricingTier: 'medium', trust: svcTrust('aws') },

  // ========== Object Storage ==========
  { id: 'CS-OBJ-AWS-001', provider: 'aws', componentType: 'object-storage', serviceName: 'Amazon S3', serviceNameKo: 'Amazon S3', status: 'active', features: ['11 9s durability', 'Storage classes', 'Event notifications'], featuresKo: ['11 9s 내구성', '스토리지 클래스', '이벤트 알림'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== Backup ==========
  { id: 'CS-BK-AWS-001', provider: 'aws', componentType: 'backup', serviceName: 'AWS Backup', serviceNameKo: 'AWS Backup', status: 'active', features: ['Cross-region', 'Policy-based', 'Vault Lock'], featuresKo: ['교차 리전', '정책 기반', '볼트 잠금'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== VPN Gateway ==========
  { id: 'CS-VPN-AWS-001', provider: 'aws', componentType: 'vpn-gateway', serviceName: 'AWS Site-to-Site VPN', serviceNameKo: 'AWS 사이트간 VPN', status: 'active', features: ['IPsec tunnels', 'Accelerated VPN', 'Private IP VPN'], featuresKo: ['IPsec 터널', '가속 VPN', '프라이빗 IP VPN'], pricingTier: 'low', trust: svcTrust('aws') },
  { id: 'CS-VPN-AWS-002', provider: 'aws', componentType: 'vpn-gateway', serviceName: 'AWS Client VPN', serviceNameKo: 'AWS 클라이언트 VPN', status: 'active', features: ['OpenVPN-based', 'MFA support', 'Split tunneling'], featuresKo: ['OpenVPN 기반', 'MFA 지원', '스플릿 터널링'], pricingTier: 'low', trust: svcTrust('aws') },

  // ========== IAM ==========
  { id: 'CS-IAM-AWS-001', provider: 'aws', componentType: 'iam', serviceName: 'AWS IAM', serviceNameKo: 'AWS IAM', status: 'active', features: ['Fine-grained policies', 'Roles', 'Identity Center'], featuresKo: ['세분화된 정책', '역할', 'Identity Center'], pricingTier: 'free', trust: svcTrust('aws') },

  // ========== SIEM ==========
  { id: 'CS-SIEM-AWS-001', provider: 'aws', componentType: 'siem', serviceName: 'Amazon Security Lake + OpenSearch', serviceNameKo: 'Amazon Security Lake + OpenSearch', status: 'active', features: ['OCSF format', 'Cross-account', 'ML insights'], featuresKo: ['OCSF 형식', '교차 계정', 'ML 인사이트'], pricingTier: 'high', trust: svcTrust('aws') },

  // ========== IDS/IPS ==========
  { id: 'CS-IDS-AWS-001', provider: 'aws', componentType: 'ids-ips', serviceName: 'AWS Network Firewall IPS', serviceNameKo: 'AWS 네트워크 방화벽 IPS', status: 'active', features: ['Suricata compatible', 'Managed rules', 'Stateful inspection'], featuresKo: ['Suricata 호환', '관리형 규칙', '상태 기반 검사'], pricingTier: 'medium', trust: svcTrust('aws') },
  { id: 'CS-IDS-AWS-002', provider: 'aws', componentType: 'ids-ips', serviceName: 'Amazon GuardDuty', serviceNameKo: 'Amazon GuardDuty', status: 'active', features: ['Threat detection', 'ML-based', 'VPC flow analysis'], featuresKo: ['위협 탐지', 'ML 기반', 'VPC 플로우 분석'], pricingTier: 'medium', trust: svcTrust('aws') },

  // ========== SD-WAN ==========
  { id: 'CS-SDWAN-AWS-001', provider: 'aws', componentType: 'sd-wan', serviceName: 'AWS Cloud WAN', serviceNameKo: 'AWS Cloud WAN', status: 'active', features: ['Global network', 'Policy-based', 'Transit Gateway integration'], featuresKo: ['글로벌 네트워크', '정책 기반', 'Transit Gateway 통합'], pricingTier: 'high', trust: svcTrust('aws') },

  // ========== MFA ==========
  { id: 'CS-MFA-AWS-001', provider: 'aws', componentType: 'mfa', serviceName: 'AWS IAM MFA', serviceNameKo: 'AWS IAM MFA', status: 'active', features: ['Virtual MFA', 'Hardware tokens', 'FIDO2'], featuresKo: ['가상 MFA', '하드웨어 토큰', 'FIDO2'], pricingTier: 'free', trust: svcTrust('aws') },
];
