import { InfraSpec } from '@/types';
import { infraTemplates } from '../parser/templates';

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
  } catch {
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
      return null;
    }

    // Assign new ID and mark as custom
    return saveTemplate(
      template.name,
      template.description || '',
      template.spec,
      template.category || 'custom'
    );
  } catch {
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
  } catch {
    return null;
  }
}
