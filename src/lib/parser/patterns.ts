/**
 * Shared Parser Patterns
 * smartParser와 promptParser에서 공통으로 사용하는 패턴들
 * Single Source of Truth (SSoT)
 */

import { InfraNodeType } from '@/types';

/**
 * 노드 타입 감지 패턴
 * - pattern: 정규식 패턴
 * - type: InfraNodeType
 * - label: 표시 레이블
 * - labelKo: 한국어 레이블 (선택)
 */
export interface NodeTypePattern {
  pattern: RegExp;
  type: InfraNodeType;
  label: string;
  labelKo?: string;
}

/**
 * 인프라 컴포넌트 감지 패턴
 * 순서 중요: 더 specific한 패턴이 먼저 오도록 정렬
 */
export const nodeTypePatterns: NodeTypePattern[] = [
  // External
  { pattern: /user|사용자|유저|client|클라이언트/i, type: 'user', label: 'User', labelKo: '사용자' },
  { pattern: /internet|인터넷|외부망/i, type: 'internet', label: 'Internet', labelKo: '인터넷' },

  // Security - DMZ
  { pattern: /waf|웹방화벽|웹 ?애플리케이션 ?방화벽/i, type: 'waf', label: 'WAF', labelKo: '웹방화벽' },
  { pattern: /firewall|방화벽|fw(?!\w)/i, type: 'firewall', label: 'Firewall', labelKo: '방화벽' },
  { pattern: /ids|ips|침입.*탐지|침입.*방지|intrusion/i, type: 'ids-ips', label: 'IDS/IPS', labelKo: 'IDS/IPS' },
  { pattern: /vpn|가상사설망/i, type: 'vpn-gateway', label: 'VPN Gateway', labelKo: 'VPN 게이트웨이' },
  { pattern: /nac|네트워크.*접근.*제어/i, type: 'nac', label: 'NAC', labelKo: 'NAC' },
  { pattern: /dlp|데이터.*유출.*방지/i, type: 'dlp', label: 'DLP', labelKo: 'DLP' },

  // Network
  { pattern: /cdn|content.*delivery/i, type: 'cdn', label: 'CDN', labelKo: 'CDN' },
  { pattern: /load ?balancer|로드 ?밸런서|lb(?!\w)|부하분산/i, type: 'load-balancer', label: 'Load Balancer', labelKo: '로드밸런서' },
  { pattern: /router|라우터/i, type: 'router', label: 'Router', labelKo: '라우터' },
  { pattern: /switch.*l3|l3.*switch|레이어 ?3|스위치.*l3/i, type: 'switch-l3', label: 'L3 Switch', labelKo: 'L3 스위치' },
  { pattern: /switch|스위치/i, type: 'switch-l2', label: 'L2 Switch', labelKo: 'L2 스위치' },
  { pattern: /sd-?wan|software.*defined.*wan/i, type: 'sd-wan', label: 'SD-WAN', labelKo: 'SD-WAN' },
  { pattern: /dns|도메인.*네임/i, type: 'dns', label: 'DNS', labelKo: 'DNS' },

  // Compute
  { pattern: /web ?server|웹 ?서버/i, type: 'web-server', label: 'Web Server', labelKo: '웹서버' },
  { pattern: /app ?server|앱 ?서버|애플리케이션.*서버|was/i, type: 'app-server', label: 'App Server', labelKo: '앱서버' },
  { pattern: /db|database|데이터베이스|디비/i, type: 'db-server', label: 'Database', labelKo: '데이터베이스' },
  { pattern: /kubernetes|k8s|쿠버네티스/i, type: 'kubernetes', label: 'Kubernetes', labelKo: '쿠버네티스' },
  { pattern: /container|컨테이너|docker|도커/i, type: 'container', label: 'Container', labelKo: '컨테이너' },
  { pattern: /vm|virtual.*machine|가상.*머신|가상.*서버/i, type: 'vm', label: 'VM', labelKo: '가상머신' },

  // Cloud
  { pattern: /aws.*vpc|vpc.*aws/i, type: 'aws-vpc', label: 'AWS VPC', labelKo: 'AWS VPC' },
  { pattern: /azure.*vnet|vnet.*azure/i, type: 'azure-vnet', label: 'Azure VNet', labelKo: 'Azure VNet' },
  { pattern: /gcp|google.*cloud/i, type: 'gcp-network', label: 'GCP Network', labelKo: 'GCP 네트워크' },
  { pattern: /private.*cloud|사설.*클라우드/i, type: 'private-cloud', label: 'Private Cloud', labelKo: '프라이빗 클라우드' },

  // Storage
  { pattern: /san|nas|스토리지.*영역|네트워크.*스토리지/i, type: 'san-nas', label: 'SAN/NAS', labelKo: 'SAN/NAS' },
  { pattern: /object.*storage|오브젝트.*스토리지|s3/i, type: 'object-storage', label: 'Object Storage', labelKo: '오브젝트 스토리지' },
  { pattern: /backup|백업/i, type: 'backup', label: 'Backup', labelKo: '백업' },
  { pattern: /cache|캐시|redis|memcached/i, type: 'cache', label: 'Cache', labelKo: '캐시' },
  { pattern: /storage|스토리지|저장소/i, type: 'storage', label: 'Storage', labelKo: '스토리지' },

  // Auth
  { pattern: /ldap|ad|active.*directory|액티브.*디렉토리/i, type: 'ldap-ad', label: 'LDAP/AD', labelKo: 'LDAP/AD' },
  { pattern: /sso|single.*sign.*on|싱글.*사인온/i, type: 'sso', label: 'SSO', labelKo: 'SSO' },
  { pattern: /mfa|multi.*factor|다중.*인증/i, type: 'mfa', label: 'MFA', labelKo: 'MFA' },
  { pattern: /iam|identity.*access/i, type: 'iam', label: 'IAM', labelKo: 'IAM' },
];

/**
 * 명령어 타입
 */
export type CommandType =
  | 'create'      // 새로운 아키텍처 생성
  | 'add'         // 노드/연결 추가
  | 'remove'      // 노드/연결 제거
  | 'modify'      // 노드 속성 수정
  | 'connect'     // 연결 추가
  | 'disconnect'  // 연결 제거
  | 'query';      // 질문/정보 요청

/**
 * 명령어 감지 패턴
 */
export interface CommandPattern {
  pattern: RegExp;
  type: CommandType;
}

export const commandPatterns: CommandPattern[] = [
  // Add commands
  { pattern: /^(추가|붙여|넣어|더해|add|insert)/i, type: 'add' },
  { pattern: /(추가해줘|추가해|붙여줘|넣어줘|더해줘)$/i, type: 'add' },
  { pattern: /앞에|뒤에|사이에|위에|아래에/i, type: 'add' },

  // Remove commands
  { pattern: /^(삭제|제거|없애|빼|remove|delete)/i, type: 'remove' },
  { pattern: /(삭제해줘|삭제해|제거해줘|제거해|없애줘|빼줘)$/i, type: 'remove' },

  // Modify commands
  { pattern: /^(수정|변경|바꿔|modify|change|update)/i, type: 'modify' },
  { pattern: /(수정해|변경해|바꿔줘)$/i, type: 'modify' },

  // Connect commands
  { pattern: /연결|connect|link/i, type: 'connect' },

  // Disconnect commands
  { pattern: /연결.*해제|끊어|disconnect|unlink/i, type: 'disconnect' },

  // Query commands
  { pattern: /\?$|뭐야|뭔가요|알려줘|설명해/i, type: 'query' },
];

/**
 * 노드 타입으로 패턴 찾기
 */
export function findPatternByType(type: InfraNodeType): NodeTypePattern | undefined {
  return nodeTypePatterns.find(p => p.type === type);
}

/**
 * 텍스트에서 노드 타입 감지
 */
export function detectNodeType(text: string): NodeTypePattern | undefined {
  const normalized = text.toLowerCase();
  return nodeTypePatterns.find(p => p.pattern.test(normalized));
}

/**
 * 텍스트에서 모든 노드 타입 감지
 */
export function detectAllNodeTypes(text: string): NodeTypePattern[] {
  const normalized = text.toLowerCase();
  return nodeTypePatterns.filter(p => p.pattern.test(normalized));
}

/**
 * 텍스트에서 명령어 타입 감지
 */
export function detectCommandType(text: string): CommandType {
  const normalized = text.toLowerCase();

  for (const { pattern, type } of commandPatterns) {
    if (pattern.test(normalized)) {
      return type;
    }
  }

  return 'create'; // 기본값: 새 아키텍처 생성
}
