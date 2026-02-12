/**
 * Shared Parser Patterns
 * UnifiedParser에서 사용하는 공통 패턴들
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
  { pattern: /sase.*gateway|sase.*게이트웨이|sase\s*gw/i, type: 'sase-gateway', label: 'SASE Gateway', labelKo: 'SASE 게이트웨이' },
  { pattern: /ztna|zero\s*trust\s*network\s*access|제로\s*트러스트\s*접근/i, type: 'ztna-broker', label: 'ZTNA Broker', labelKo: 'ZTNA 브로커' },
  { pattern: /casb|cloud\s*access\s*security/i, type: 'casb', label: 'CASB', labelKo: 'CASB' },
  { pattern: /siem(?!\w)|보안\s*정보.*관리|보안.*이벤트.*관리/i, type: 'siem', label: 'SIEM', labelKo: 'SIEM' },
  { pattern: /soar(?!\w)|보안.*자동화.*대응|보안.*오케스트레이션/i, type: 'soar', label: 'SOAR', labelKo: 'SOAR' },

  // Physical Security
  { pattern: /cctv|씨씨티비|폐쇄회로|감시.*카메라|방범.*카메라|보안.*카메라/i, type: 'cctv-camera', label: 'CCTV Camera', labelKo: 'CCTV 카메라' },
  { pattern: /nvr|네트워크.*비디오.*레코더|영상.*녹화/i, type: 'nvr', label: 'NVR', labelKo: 'NVR' },
  { pattern: /vms|영상.*관제|비디오.*관리|video.*management/i, type: 'video-server', label: 'Video Server', labelKo: '영상관제 서버' },
  { pattern: /출입.*통제|access.*control.*system|출입.*관리|카드.*리더/i, type: 'access-control', label: 'Access Control', labelKo: '출입통제' },

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

  // Telecom
  { pattern: /국사|central\s*office|co(?:\s|$)|pop(?:\s|$)|point\s*of\s*presence/i, type: 'central-office', label: 'Central Office', labelKo: '국사' },
  { pattern: /기지국|base\s*station|gnb|enb|bts/i, type: 'base-station', label: 'Base Station', labelKo: '기지국' },
  { pattern: /olt|광선로\s*단말|optical\s*line\s*terminal/i, type: 'olt', label: 'OLT', labelKo: 'OLT' },
  { pattern: /고객\s*구내|cpe|customer\s*premise/i, type: 'customer-premise', label: 'Customer Premise', labelKo: '고객 구내' },
  { pattern: /idc|인터넷\s*데이터\s*센터|데이터\s*센터/i, type: 'idc', label: 'IDC', labelKo: 'IDC' },

  // WAN
  { pattern: /pe\s*라우터|pe[-\s]*router|provider\s*edge/i, type: 'pe-router', label: 'PE Router', labelKo: 'PE 라우터' },
  { pattern: /p\s*라우터|p[-\s]*router|provider\s*core\s*router/i, type: 'p-router', label: 'P Router', labelKo: 'P 라우터' },
  { pattern: /mpls|엠피엘에스/i, type: 'mpls-network', label: 'MPLS Network', labelKo: 'MPLS 망' },
  { pattern: /전용회선|dedicated\s*line|leased\s*line|전용선/i, type: 'dedicated-line', label: 'Dedicated Line', labelKo: '전용회선' },
  { pattern: /메트로\s*이더넷|metro[-\s]*ethernet|mef\s*서비스/i, type: 'metro-ethernet', label: 'Metro Ethernet', labelKo: '메트로 이더넷' },
  { pattern: /기업\s*인터넷|kornet|코넷|corporate\s*internet/i, type: 'corporate-internet', label: 'Corporate Internet', labelKo: '기업인터넷' },
  { pattern: /vpn\s*서비스|vpn\s*service|mpls\s*vpn/i, type: 'vpn-service', label: 'VPN Service', labelKo: 'VPN 서비스' },
  { pattern: /sd[-\s]*wan\s*서비스|sd[-\s]*wan\s*service/i, type: 'sd-wan-service', label: 'SD-WAN Service', labelKo: 'SD-WAN 서비스' },
  { pattern: /5g\s*특화|private\s*5g|사설\s*5g/i, type: 'private-5g', label: 'Private 5G', labelKo: '5G 특화망' },
  { pattern: /코어\s*망|core\s*network|5gc|5g\s*core/i, type: 'core-network', label: 'Core Network', labelKo: '코어망' },
  { pattern: /upf|user\s*plane\s*function/i, type: 'upf', label: 'UPF', labelKo: 'UPF' },
  { pattern: /링\s*네트워크|ring\s*network|이중화\s*링/i, type: 'ring-network', label: 'Ring Network', labelKo: '링 네트워크' },
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
  | 'query'       // 질문/정보 요청
  | 'llm-modify'  // LLM 기반 다이어그램 수정
  | 'template';   // 템플릿 선택

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

// ============================================================
// Performance Optimization: Caching & Pre-filtering
// ============================================================

/**
 * 캐시 설정
 */
const CACHE_CONFIG = {
  maxSize: 1000,  // 최대 캐시 항목 수
  keyMaxLength: 100,  // 캐시 키 최대 길이
} as const;

/**
 * 패턴 매칭 결과 캐시
 * LRU 방식으로 관리 (Map의 순서 활용)
 */
interface PatternCache {
  cache: Map<string, NodeTypePattern[]>;
  hits: number;
  misses: number;
}

const patternCache: PatternCache = {
  cache: new Map(),
  hits: 0,
  misses: 0,
};

/**
 * 캐시 키 생성 (정규화된 입력의 앞부분)
 */
function createCacheKey(text: string): string {
  return text.toLowerCase().trim().slice(0, CACHE_CONFIG.keyMaxLength);
}

/**
 * 캐시에서 결과 조회 (LRU 갱신)
 */
function getFromCache(key: string): NodeTypePattern[] | undefined {
  const cached = patternCache.cache.get(key);
  if (cached) {
    // LRU: 조회된 항목을 끝으로 이동
    patternCache.cache.delete(key);
    patternCache.cache.set(key, cached);
    patternCache.hits++;
    return cached;
  }
  patternCache.misses++;
  return undefined;
}

/**
 * 캐시에 결과 저장 (크기 제한 적용)
 */
function setToCache(key: string, value: NodeTypePattern[]): void {
  // 캐시 크기 초과 시 가장 오래된 항목 제거 (LRU)
  if (patternCache.cache.size >= CACHE_CONFIG.maxSize) {
    const firstKey = patternCache.cache.keys().next().value;
    if (firstKey) {
      patternCache.cache.delete(firstKey);
    }
  }
  patternCache.cache.set(key, value);
}

/**
 * 캐시 초기화
 */
export function clearPatternCache(): void {
  patternCache.cache.clear();
  patternCache.hits = 0;
  patternCache.misses = 0;
}

/**
 * 캐시 통계 조회
 */
export function getPatternCacheStats(): {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRatio: number;
} {
  const total = patternCache.hits + patternCache.misses;
  return {
    size: patternCache.cache.size,
    maxSize: CACHE_CONFIG.maxSize,
    hits: patternCache.hits,
    misses: patternCache.misses,
    hitRatio: total > 0 ? patternCache.hits / total : 0,
  };
}

/**
 * 키워드 사전 필터링을 위한 빠른 키워드 세트
 * 정규식 패턴에서 주요 키워드 추출
 */
const quickMatchKeywords: Set<string> = new Set([
  // English keywords (lowercase)
  'user', 'client', 'internet', 'waf', 'firewall', 'fw', 'ids', 'ips', 'intrusion',
  'vpn', 'nac', 'dlp', 'cdn', 'content', 'delivery', 'load', 'balancer', 'lb',
  'router', 'switch', 'l3', 'l2', 'sd-wan', 'sdwan', 'dns', 'web', 'server',
  'app', 'was', 'db', 'database', 'kubernetes', 'k8s', 'container', 'docker',
  'vm', 'virtual', 'machine', 'aws', 'vpc', 'azure', 'vnet', 'gcp', 'google',
  'cloud', 'private', 'san', 'nas', 'object', 'storage', 's3', 'backup',
  'cache', 'redis', 'memcached', 'ldap', 'ad', 'active', 'directory',
  'sso', 'single', 'sign', 'mfa', 'multi', 'factor', 'iam', 'identity', 'access',
  // Telecom/WAN English keywords
  'central', 'office', 'pop', 'base', 'station', 'gnb', 'enb', 'bts',
  'olt', 'optical', 'cpe', 'premise', 'idc',
  'pe', 'mpls', 'dedicated', 'line', 'leased', 'metro', 'ethernet', 'mef',
  'kornet', 'corporate', '5g', 'upf', 'ring', 'core',
  // Physical Security English keywords
  'cctv', 'nvr', 'vms', 'video',
  // Korean keywords
  '씨씨티비', '폐쇄회로', '감시', '방범', '영상', '녹화', '관제', '출입', '통제', '카드',
  '사용자', '유저', '클라이언트', '인터넷', '외부망', '웹방화벽', '방화벽',
  '침입', '탐지', '방지', '가상사설망', '네트워크', '접근', '제어',
  '데이터', '유출', '로드', '밸런서', '부하분산', '라우터', '스위치',
  '레이어', '도메인', '네임', '웹', '서버', '앱', '애플리케이션',
  '데이터베이스', '디비', '쿠버네티스', '컨테이너', '도커', '가상', '머신',
  '사설', '클라우드', '스토리지', '영역', '오브젝트', '백업', '캐시',
  '액티브', '디렉토리', '싱글', '사인온', '다중', '인증',
  // Telecom/WAN Korean keywords
  '국사', '기지국', '광선로', '고객', '구내', '전용회선', '전용선',
  '메트로', '이더넷', '기업', '코넷', '코어', '특화',
  '링', '이중화',
]);

/**
 * 빠른 키워드 존재 확인
 * 입력 텍스트에 매칭 가능한 키워드가 있는지 빠르게 확인
 */
function hasAnyKeyword(text: string): boolean {
  const words = text.toLowerCase().split(/[\s,.\-_:;!?'"()[\]{}]+/);
  for (const word of words) {
    if (word.length >= 2 && quickMatchKeywords.has(word)) {
      return true;
    }
  }
  // 한국어 키워드는 단어 분리가 어려우므로 직접 검색
  for (const keyword of quickMatchKeywords) {
    if (keyword.length >= 2 && text.includes(keyword)) {
      return true;
    }
  }
  return false;
}

/**
 * 최적화된 모든 노드 타입 감지
 * - 캐싱: 동일 입력에 대한 중복 계산 방지
 * - 키워드 사전 필터링: 관련 없는 입력에 대한 빠른 반환
 */
export function detectAllNodeTypesOptimized(text: string): NodeTypePattern[] {
  // 빈 문자열 처리
  if (!text || text.trim().length === 0) {
    return [];
  }

  const cacheKey = createCacheKey(text);

  // 캐시 조회
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  const normalized = text.toLowerCase();

  // 키워드 사전 필터링: 관련 키워드가 없으면 빈 배열 반환
  if (!hasAnyKeyword(normalized)) {
    const emptyResult: NodeTypePattern[] = [];
    setToCache(cacheKey, emptyResult);
    return emptyResult;
  }

  // 실제 패턴 매칭
  const result = nodeTypePatterns.filter(p => p.pattern.test(normalized));

  // 결과 캐싱
  setToCache(cacheKey, result);

  return result;
}
