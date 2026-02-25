/**
 * Persona-based system prompt adaptation.
 *
 * Changes ONLY emphasis, depth, and terminology.
 * Facts, architecture, and recommendations are NEVER altered.
 */

import type { PersonaPreset } from '@/types/profile';

export const PERSONA_PRESETS: PersonaPreset[] = [
  { id: 'p1-cto',         name: 'Startup CTO',      nameKo: '스타트업 CTO',      depth: 'standard', focus: 'cost-schedule',       tone: 'consulting' },
  { id: 'p2-consultant',  name: 'SI Consultant',     nameKo: 'SI 컨설턴트',       depth: 'detailed', focus: 'cost-schedule',       tone: 'consulting' },
  { id: 'p3-it-manager',  name: 'SMB IT Manager',    nameKo: '중소기업 IT관리자',  depth: 'standard', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p4-architect',   name: 'Cloud Architect',   nameKo: '클라우드 아키텍트',  depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p5-security',    name: 'Security/CISO',     nameKo: '보안/CISO',         depth: 'detailed', focus: 'security-compliance', tone: 'consulting' },
  { id: 'p6-ai-ml',       name: 'AI/ML Engineer',    nameKo: 'AI/ML 엔지니어',    depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p7-sre',         name: 'DevOps/SRE',        nameKo: 'DevOps/SRE',        depth: 'detailed', focus: 'operations-sre',      tone: 'consulting' },
  { id: 'p8-student',     name: 'Student/Educator',  nameKo: '학생/교육자',        depth: 'standard', focus: 'learning',            tone: 'learning'   },
  { id: 'p9-public',      name: 'Public Sector',     nameKo: '공공기관',           depth: 'standard', focus: 'security-compliance', tone: 'consulting' },
  { id: 'p10-msp',        name: 'MSP/Reseller',      nameKo: 'MSP/리셀러',        depth: 'standard', focus: 'cost-schedule',       tone: 'consulting' },
];

const DEPTH_MAP: Record<string, string> = {
  summary: '핵심만 간결하게. 3~5줄 요약 중심.',
  standard: '표준 깊이. 요약 + 핵심 설명 + 다음 단계.',
  detailed: '상세 분석. 트레이드오프, 대안, 운영 고려사항 포함.',
};

const FOCUS_MAP: Record<string, string> = {
  'cost-schedule': '비용과 일정을 최우선으로 강조.',
  'security-compliance': '보안 통제, 컴플라이언스 증빙, 위험 분석을 최우선으로.',
  'operations-sre': '운영 안정성, 관측성, 장애 대응을 최우선으로.',
  learning: '개념 설명 중심. 용어를 풀어서 설명하고 예시를 많이 사용.',
};

const TONE_MAP: Record<string, string> = {
  consulting: '전문 컨설턴트 톤. 근거 기반, 비교 분석 중심.',
  learning: '교육자 톤. 친절하게, 단계적으로, 배경지식 없어도 이해 가능하게.',
};

export function buildPersonaInstruction(persona: PersonaPreset | undefined): string {
  if (!persona) return '';

  return `\n\n[Response Style]
- Depth (${persona.depth}): ${DEPTH_MAP[persona.depth]}
- Focus: ${FOCUS_MAP[persona.focus]}
- Tone: ${TONE_MAP[persona.tone]}
- IMPORTANT: Facts, architecture, and recommendations do NOT change based on persona. Only emphasis, depth, and terminology change.`;
}
