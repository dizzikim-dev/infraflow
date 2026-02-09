import { InfraSpec } from '@/types';
import { infraTemplates } from '../parser/templates';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('TemplateManager');

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  spec: InfraSpec;
  tags: string[];
  isBuiltIn: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export type TemplateCategory =
  | 'web'
  | 'security'
  | 'cloud'
  | 'network'
  | 'container'
  | 'telecom'
  | 'custom';

// Built-in templates with metadata
export const builtInTemplates: Template[] = [
  {
    id: '3tier',
    name: '3-Tier 웹 아키텍처',
    description: 'CDN, WAF, 로드밸런서, 웹/앱/DB 서버로 구성된 표준 3계층 아키텍처',
    category: 'web',
    icon: '🌐',
    spec: infraTemplates['3tier'],
    tags: ['웹', '표준', '프로덕션'],
    isBuiltIn: true,
  },
  {
    id: 'vpn',
    name: 'VPN 내부망 접속',
    description: 'VPN 게이트웨이를 통한 안전한 내부망 접속 구조',
    category: 'security',
    icon: '🔐',
    spec: infraTemplates['vpn'],
    tags: ['보안', 'VPN', '내부망'],
    isBuiltIn: true,
  },
  {
    id: 'k8s',
    name: 'Kubernetes 클러스터',
    description: 'Ingress, Service, Pod로 구성된 쿠버네티스 클러스터',
    category: 'container',
    icon: '☸️',
    spec: infraTemplates['k8s'],
    tags: ['컨테이너', 'K8s', '오케스트레이션'],
    isBuiltIn: true,
  },
  {
    id: 'simple-waf',
    name: 'WAF + 로드밸런서',
    description: 'WAF와 로드밸런서를 포함한 간단한 웹 서버 구조',
    category: 'web',
    icon: '🛡️',
    spec: infraTemplates['simple-waf'],
    tags: ['웹', 'WAF', '간단'],
    isBuiltIn: true,
  },
  {
    id: 'hybrid',
    name: '하이브리드 클라우드',
    description: 'AWS 클라우드와 온프레미스를 VPN으로 연결한 하이브리드 구조',
    category: 'cloud',
    icon: '☁️',
    spec: infraTemplates['hybrid'],
    tags: ['클라우드', 'AWS', '하이브리드'],
    isBuiltIn: true,
  },
  {
    id: 'microservices',
    name: '마이크로서비스 아키텍처',
    description: 'API Gateway, 서비스 메시, 메시지 큐를 포함한 MSA 구조',
    category: 'container',
    icon: '🔗',
    spec: infraTemplates['microservices'],
    tags: ['MSA', '마이크로서비스', 'API Gateway'],
    isBuiltIn: true,
  },
  {
    id: 'zero-trust',
    name: '제로 트러스트 아키텍처',
    description: 'ZTNA, MFA, DLP를 활용한 제로 트러스트 보안 모델',
    category: 'security',
    icon: '🔒',
    spec: infraTemplates['zero-trust'],
    tags: ['보안', 'ZTNA', '제로트러스트'],
    isBuiltIn: true,
  },
  {
    id: 'dr',
    name: '재해복구(DR) 아키텍처',
    description: 'Active-Standby 구조의 재해복구 및 고가용성 아키텍처',
    category: 'cloud',
    icon: '🔄',
    spec: infraTemplates['dr'],
    tags: ['DR', '재해복구', 'HA', '이중화'],
    isBuiltIn: true,
  },
  {
    id: 'api',
    name: 'API 백엔드 아키텍처',
    description: 'WAF, Rate Limiter, API Gateway, 캐시를 포함한 API 서버 구조',
    category: 'web',
    icon: '🚀',
    spec: infraTemplates['api'],
    tags: ['API', 'REST', '백엔드'],
    isBuiltIn: true,
  },
  {
    id: 'iot',
    name: 'IoT 아키텍처',
    description: 'MQTT, 스트림 처리, 시계열 DB를 포함한 IoT 데이터 파이프라인',
    category: 'network',
    icon: '📡',
    spec: infraTemplates['iot'],
    tags: ['IoT', '센서', 'MQTT', '데이터'],
    isBuiltIn: true,
  },
  {
    id: 'vdi-openclaw',
    name: 'VDI + OpenClaw 비서AI',
    description: '경기도의회 VDI 환경에서 OpenClaw 비서AI가 내부망 LLM과 RAG를 활용하는 아키텍처',
    category: 'security',
    icon: '🤖',
    spec: infraTemplates['vdi-openclaw'],
    tags: ['VDI', 'OpenClaw', 'LLM', 'RAG', '의회'],
    isBuiltIn: true,
  },
  {
    id: 'assembly-vdi',
    name: '의원 다중PC 통합 VDI',
    description: '본회의장, 상임위, 의원실, 지역상담소 등 의원 155명의 다중 PC 환경을 VDI로 통합',
    category: 'cloud',
    icon: '🏛️',
    spec: infraTemplates['assembly-vdi'],
    tags: ['VDI', '의회', '의원', '통합', '동기화'],
    isBuiltIn: true,
  },
  {
    id: 'network-separation-llm',
    name: '망분리 환경 LLM 접근',
    description: '인터넷망에서 내부망 LLM을 안전하게 활용하는 망분리 아키텍처 (DLP, API 중계)',
    category: 'security',
    icon: '🔐',
    spec: infraTemplates['network-separation-llm'],
    tags: ['망분리', 'LLM', 'DLP', '보안', '내부망'],
    isBuiltIn: true,
  },
  {
    id: 'hybrid-vdi',
    name: '하이브리드 VDI',
    description: '퍼블릭 클라우드 VDI와 온프레미스 VDI를 Site-to-Site VPN으로 연결한 하이브리드 구조',
    category: 'cloud',
    icon: '☁️',
    spec: infraTemplates['hybrid-vdi'],
    tags: ['VDI', '하이브리드', '클라우드', '온프레미스'],
    isBuiltIn: true,
  },
  // ── 통신망 (Telecom) ──
  {
    id: 'dedicated-line',
    name: '기업 전용회선 접속',
    description: '고객 구내(CPE)에서 전용회선을 통해 국사, PE 라우터를 거쳐 IDC까지 연결하는 기본 통신망 구조',
    category: 'telecom',
    icon: '🔗',
    spec: infraTemplates['dedicated-line'],
    tags: ['전용회선', 'WAN', '국사', 'B2B'],
    isBuiltIn: true,
  },
  {
    id: 'dedicated-line-dual',
    name: '전용회선 이중화',
    description: '2개 국사, 2개 전용회선, 링 네트워크를 활용한 이중화 구성으로 회선 장애 시 자동 전환',
    category: 'telecom',
    icon: '🔀',
    spec: infraTemplates['dedicated-line-dual'],
    tags: ['전용회선', '이중화', '링', 'HA'],
    isBuiltIn: true,
  },
  {
    id: 'mpls-vpn',
    name: 'MPLS VPN 다지점',
    description: '본사-지사를 MPLS VPN으로 연결하는 Hub-Spoke 구조 (PE/P 라우터, VPN 서비스)',
    category: 'telecom',
    icon: '🌐',
    spec: infraTemplates['mpls-vpn'],
    tags: ['MPLS', 'VPN', '다지점', 'Hub-Spoke'],
    isBuiltIn: true,
  },
  {
    id: 'hybrid-wan',
    name: '하이브리드 WAN',
    description: '전용회선과 기업인터넷(KORNET)을 SD-WAN으로 통합한 하이브리드 WAN 구조',
    category: 'telecom',
    icon: '⚡',
    spec: infraTemplates['hybrid-wan'],
    tags: ['SD-WAN', '하이브리드', 'KORNET', 'WAN'],
    isBuiltIn: true,
  },
  {
    id: '5g-private',
    name: '5G 특화망',
    description: '기지국(gNB)에서 5G 코어, UPF를 거쳐 IDC 엣지 서버까지 연결하는 Private 5G 네트워크',
    category: 'telecom',
    icon: '📶',
    spec: infraTemplates['5g-private'],
    tags: ['5G', '특화망', 'gNB', 'UPF', '스마트팩토리'],
    isBuiltIn: true,
  },
  {
    id: 'idc-dual',
    name: 'IDC 이중화 접속',
    description: '2개 국사 경유 2개 IDC(주/DR) 이중화 구성, DB 리플리케이션 포함',
    category: 'telecom',
    icon: '🏢',
    spec: infraTemplates['idc-dual'],
    tags: ['IDC', '이중화', 'DR', '데이터센터'],
    isBuiltIn: true,
  },
];

const STORAGE_KEY = 'infraflow-templates';

/**
 * Get all templates (built-in + custom)
 */
export function getAllTemplates(): Template[] {
  const customTemplates = getCustomTemplates();
  return [...builtInTemplates, ...customTemplates];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return getAllTemplates().filter((t) => t.category === category);
}

/**
 * Get custom templates from localStorage
 */
export function getCustomTemplates(): Template[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    logger.warn('Failed to load custom templates from localStorage', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Save a new custom template
 */
export function saveTemplate(
  name: string,
  description: string,
  spec: InfraSpec,
  category: TemplateCategory = 'custom'
): Template {
  const template: Template = {
    id: `custom-${Date.now()}`,
    name,
    description,
    category,
    icon: '📋',
    spec,
    tags: ['사용자 정의'],
    isBuiltIn: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const customTemplates = getCustomTemplates();
  customTemplates.push(template);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  }

  return template;
}

/**
 * Delete a custom template
 */
export function deleteTemplate(id: string): boolean {
  const customTemplates = getCustomTemplates();
  const index = customTemplates.findIndex((t) => t.id === id);

  if (index === -1) return false;

  customTemplates.splice(index, 1);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  }

  return true;
}

/**
 * Update a custom template
 */
export function updateTemplate(
  id: string,
  updates: Partial<Omit<Template, 'id' | 'isBuiltIn'>>
): Template | null {
  const customTemplates = getCustomTemplates();
  const index = customTemplates.findIndex((t) => t.id === id);

  if (index === -1) return null;

  customTemplates[index] = {
    ...customTemplates[index],
    ...updates,
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  }

  return customTemplates[index];
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): Template | null {
  return getAllTemplates().find((t) => t.id === id) || null;
}

/**
 * Search templates by name or tags
 */
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return getAllTemplates().filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Export template as JSON
 */
export function exportTemplate(template: Template): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Import template from JSON
 */
export function importTemplate(json: string): Template | null {
  try {
    const template = JSON.parse(json) as Template;

    // Validate required fields
    if (!template.name || !template.spec) {
      logger.warn('Invalid template import: missing required fields', {
        hasName: !!template.name,
        hasSpec: !!template.spec,
      });
      return null;
    }

    // Assign new ID and mark as custom
    return saveTemplate(
      template.name,
      template.description || '',
      template.spec,
      template.category || 'custom'
    );
  } catch (error) {
    logger.warn('Failed to import template: JSON parse error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Generate shareable link (base64 encoded)
 */
export function generateShareLink(template: Template): string {
  const data = {
    name: template.name,
    description: template.description,
    spec: template.spec,
  };
  const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
  return `${typeof window !== 'undefined' ? window.location.origin : ''}/share?t=${encoded}`;
}

/**
 * Parse shared template from URL
 */
export function parseShareLink(encoded: string): Partial<Template> | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch (error) {
    logger.warn('Failed to parse share link', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
