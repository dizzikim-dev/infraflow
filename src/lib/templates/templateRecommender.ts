/**
 * InfraFlow - Template Recommender
 *
 * 사용자 프롬프트 기반 템플릿 추천
 */

import { builtInTemplates, type Template } from './templateManager';

export interface TemplateRecommendation {
  template: Template;
  score: number;
  matchedKeywords: string[];
  reason: string;
}

// Keyword mappings for templates
const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  '3tier': [
    '3티어', '3-tier', '웹', 'web', 'cdn', '로드밸런서', 'load balancer',
    '웹서버', '앱서버', 'db', '데이터베이스', '표준', 'standard', '프로덕션',
  ],
  'vpn': [
    'vpn', '내부망', '사설망', 'private', '보안 접속', 'secure access',
    '원격 접속', 'remote', '터널', 'tunnel',
  ],
  'k8s': [
    'kubernetes', '쿠버네티스', 'k8s', '컨테이너', 'container', 'pod',
    '클러스터', 'cluster', 'ingress', '오케스트레이션', 'orchestration',
  ],
  'simple-waf': [
    'waf', 'simple', '간단', '웹 방화벽', 'web firewall', '기본',
  ],
  'hybrid': [
    '하이브리드', 'hybrid', 'aws', '클라우드', 'cloud', '온프레미스',
    'on-premise', 'on-prem', '연결', 'connect',
  ],
  'microservices': [
    'msa', '마이크로서비스', 'microservice', 'api gateway', '서비스 메시',
    'service mesh', '메시지 큐', 'message queue', 'kafka', 'rabbit',
  ],
  'zero-trust': [
    '제로 트러스트', 'zero trust', 'ztna', 'mfa', 'dlp', '보안',
    '인증', 'authentication', '무신뢰', 'never trust',
  ],
  'dr': [
    '재해복구', 'dr', 'disaster recovery', 'ha', '고가용성',
    'high availability', '이중화', 'redundancy', 'failover', 'standby',
  ],
  'api': [
    'api', 'rest', 'restful', '백엔드', 'backend', 'rate limit',
    '캐시', 'cache', 'redis',
  ],
  'iot': [
    'iot', '센서', 'sensor', 'mqtt', '시계열', 'time series',
    'influxdb', '데이터 수집', 'telemetry',
  ],
  'vdi-openclaw': [
    'vdi', 'openclaw', '비서', 'ai', 'llm', 'rag', '의회',
    '경기도', '가상 데스크톱', 'virtual desktop',
  ],
  'assembly-vdi': [
    '의원', '본회의장', '상임위', '의원실', '지역상담소', '다중 pc',
    '통합', '동기화', 'sync', '의회',
  ],
  'network-separation-llm': [
    '망분리', '네트워크 분리', 'network separation', 'llm',
    '내부망 llm', 'api 중계', 'proxy', 'dlp',
  ],
  'hybrid-vdi': [
    '하이브리드 vdi', 'hybrid vdi', '클라우드 vdi', '온프레미스 vdi',
    'site-to-site', 's2s vpn',
  ],
};

// Additional context keywords
const CONTEXT_KEYWORDS: Record<string, string[]> = {
  security: ['보안', 'security', '방화벽', 'firewall', '암호화', 'encryption', '인증', 'auth'],
  performance: ['성능', 'performance', '빠른', 'fast', '캐시', 'cache', '부하', 'load'],
  scalability: ['확장', 'scale', 'scalable', '대용량', 'large', '많은', 'many'],
  compliance: ['규정', 'compliance', 'isms', 'iso', 'pci', '감사', 'audit'],
  cost: ['비용', 'cost', '저렴', 'cheap', '절약', 'save', '효율', 'efficient'],
};

/**
 * Recommend templates based on user prompt
 */
export function recommendTemplates(
  prompt: string,
  maxResults: number = 5
): TemplateRecommendation[] {
  const normalizedPrompt = prompt.toLowerCase();
  const recommendations: TemplateRecommendation[] = [];

  for (const template of builtInTemplates) {
    const keywords = TEMPLATE_KEYWORDS[template.id] || [];
    const matchedKeywords: string[] = [];
    let score = 0;

    // Check keyword matches
    for (const keyword of keywords) {
      if (normalizedPrompt.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        score += 10;
      }
    }

    // Check tag matches
    for (const tag of template.tags) {
      if (normalizedPrompt.includes(tag.toLowerCase())) {
        matchedKeywords.push(tag);
        score += 5;
      }
    }

    // Check name matches
    if (normalizedPrompt.includes(template.name.toLowerCase())) {
      score += 15;
    }

    // Check description matches
    const descWords = template.description.toLowerCase().split(/\s+/);
    const promptWords = normalizedPrompt.split(/\s+/);
    for (const word of promptWords) {
      if (word.length > 2 && descWords.includes(word)) {
        score += 2;
      }
    }

    // Bonus for context keyword matches
    for (const [context, contextKeywords] of Object.entries(CONTEXT_KEYWORDS)) {
      const contextMatches = contextKeywords.filter((k) => normalizedPrompt.includes(k));
      if (contextMatches.length > 0) {
        // Check if template is relevant to this context
        const templateText = `${template.name} ${template.description} ${template.tags.join(' ')}`.toLowerCase();
        if (contextMatches.some((k) => templateText.includes(k))) {
          score += 3 * contextMatches.length;
        }
      }
    }

    if (score > 0) {
      recommendations.push({
        template,
        score,
        matchedKeywords: [...new Set(matchedKeywords)],
        reason: generateReason(template, matchedKeywords),
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, maxResults);
}

/**
 * Generate recommendation reason
 */
function generateReason(template: Template, matchedKeywords: string[]): string {
  if (matchedKeywords.length === 0) {
    return `${template.name}은(는) 요청하신 아키텍처와 유사합니다.`;
  }

  const keywordList = matchedKeywords.slice(0, 3).join(', ');
  return `'${keywordList}' 키워드와 일치하여 추천드립니다.`;
}

/**
 * Get template suggestions for empty state
 */
export function getPopularTemplates(): Template[] {
  const popularIds = ['3tier', 'vdi-openclaw', 'k8s', 'microservices', 'zero-trust'];
  return builtInTemplates.filter((t) => popularIds.includes(t.id));
}

/**
 * Get templates by use case
 */
export function getTemplatesByUseCase(useCase: string): Template[] {
  const useCaseKeywords: Record<string, string[]> = {
    web: ['3tier', 'simple-waf', 'api'],
    security: ['zero-trust', 'vpn', 'network-separation-llm'],
    cloud: ['hybrid', 'hybrid-vdi', 'k8s'],
    vdi: ['vdi-openclaw', 'assembly-vdi', 'hybrid-vdi'],
    ai: ['vdi-openclaw', 'network-separation-llm'],
  };

  const templateIds = useCaseKeywords[useCase.toLowerCase()] || [];
  return builtInTemplates.filter((t) => templateIds.includes(t.id));
}

/**
 * Find similar templates to current spec
 */
export function findSimilarTemplates(
  currentNodeTypes: string[],
  maxResults: number = 3
): Template[] {
  const scores: Array<{ template: Template; score: number }> = [];

  for (const template of builtInTemplates) {
    const templateNodeTypes = template.spec.nodes.map((n) => n.type as string);
    const commonTypes = currentNodeTypes.filter((t) => templateNodeTypes.includes(t));
    const score = commonTypes.length / Math.max(currentNodeTypes.length, templateNodeTypes.length);

    if (score > 0.2 && score < 0.9) { // Not too similar, not too different
      scores.push({ template, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, maxResults).map((s) => s.template);
}
