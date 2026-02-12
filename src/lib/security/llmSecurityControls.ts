/**
 * LLM Security Controls - OWASP LLM Top 10 v1.1 Mapping
 *
 * Central registry of security controls for InfraFlow's LLM integrations.
 * Maps each OWASP LLM Top 10 threat to InfraFlow-specific mitigations,
 * identifies gaps, and provides utility functions for input sanitization
 * and output validation.
 *
 * @module security/llmSecurityControls
 */

// ============================================================
// Types
// ============================================================

export type ControlStatus = 'implemented' | 'partial' | 'planned' | 'not-applicable';
export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface SecurityControl {
  /** Control identifier, e.g. 'LLM01' */
  id: string;
  /** OWASP LLM Top 10 identifier, e.g. 'LLM01:2025' */
  owaspId: string;
  /** English name */
  name: string;
  /** Korean name */
  nameKo: string;
  /** English description */
  description: string;
  /** Korean description */
  descriptionKo: string;
  /** Severity for InfraFlow specifically */
  severity: ThreatSeverity;
  /** Implementation status */
  status: ControlStatus;
  /** Implemented mitigations */
  mitigations: Mitigation[];
  /** Known gaps to address */
  gaps: SecurityGap[];
}

export interface Mitigation {
  /** Mitigation identifier, e.g. 'MIT-01-1' */
  id: string;
  /** Korean description of the mitigation */
  descriptionKo: string;
  /** File path where the mitigation is implemented */
  implementedIn?: string;
  /** Type of mitigation */
  type: 'prevention' | 'detection' | 'response';
}

export interface SecurityGap {
  /** Gap identifier, e.g. 'GAP-01-1' */
  id: string;
  /** Korean description of the gap */
  descriptionKo: string;
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
  /** Korean description of suggested fix */
  suggestedFixKo: string;
}

export interface SecurityAuditResult {
  /** Total number of controls */
  totalControls: number;
  /** Number of implemented controls */
  implemented: number;
  /** Number of partially implemented controls */
  partial: number;
  /** Number of planned controls */
  planned: number;
  /** Number of not-applicable controls */
  notApplicable: number;
  /** High-priority gaps across all controls */
  criticalGaps: SecurityGap[];
  /** Overall security score (0-100) */
  overallScore: number;
  /** ISO 8601 timestamp of audit generation */
  generatedAt: string;
}

// ============================================================
// Constants
// ============================================================

/** Maximum allowed user input length */
const MAX_INPUT_LENGTH = 2000;

/** Consecutive spaces/tabs threshold for whitespace collapsing */
const EXCESSIVE_WHITESPACE_THRESHOLD = 4;

/** Consecutive newlines threshold for newline collapsing */
const EXCESSIVE_NEWLINES_THRESHOLD = 3;

/**
 * Patterns considered dangerous in user input.
 * Each entry contains a regex and a short description for diagnostics.
 */
const DANGEROUS_INPUT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /<script[\s>]/gi, label: 'script-tag' },
  { pattern: /<\/script>/gi, label: 'script-close-tag' },
  { pattern: /javascript:/gi, label: 'javascript-protocol' },
  { pattern: /on\w+\s*=/gi, label: 'event-handler-attr' },
  // System prompt override attempts
  { pattern: /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, label: 'ignore-instructions' },
  { pattern: /system\s*:\s*/gi, label: 'system-role-injection' },
  { pattern: /you\s+are\s+now\s+/gi, label: 'role-override' },
  { pattern: /disregard\s+(all\s+)?(previous|above|prior)/gi, label: 'disregard-instructions' },
  { pattern: /forget\s+(all\s+)?(previous|above|prior)\s+(instructions?|context)/gi, label: 'forget-instructions' },
  // Markdown code block injection (attempts to close/reopen code blocks to inject)
  { pattern: /```\s*(system|assistant|user)\b/gi, label: 'markdown-role-injection' },
];

/**
 * Patterns considered dangerous in LLM output.
 */
const DANGEROUS_OUTPUT_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /<script[\s>]/gi, label: 'script-tag-in-output' },
  { pattern: /<\/script>/gi, label: 'script-close-tag-in-output' },
  { pattern: /\beval\s*\(/gi, label: 'eval-call' },
  { pattern: /\bexec\s*\(/gi, label: 'exec-call' },
  { pattern: /\bFunction\s*\(/gi, label: 'function-constructor' },
  { pattern: /\bchild_process\b/gi, label: 'child-process-reference' },
  { pattern: /\b(rm\s+-rf|del\s+\/[sf]|format\s+[a-z]:)/gi, label: 'system-command' },
  { pattern: /\b(sudo|chmod|chown)\s+/gi, label: 'privilege-escalation' },
  { pattern: /process\.env\b/gi, label: 'env-access' },
  { pattern: /require\s*\(\s*['"](?:child_process|fs|os|net|http)/gi, label: 'dangerous-require' },
  { pattern: /import\s+.*(?:child_process|fs|os|net|http)/gi, label: 'dangerous-import' },
];

// ============================================================
// Security Controls Data
// ============================================================

const controls: SecurityControl[] = [
  // LLM01: Prompt Injection
  {
    id: 'LLM01',
    owaspId: 'LLM01:2025',
    name: 'Prompt Injection',
    nameKo: '프롬프트 인젝션',
    description: 'Attacker crafts inputs that manipulate the LLM into executing unintended actions, bypassing safety measures, or revealing sensitive information.',
    descriptionKo: '공격자가 LLM을 조작하여 의도하지 않은 동작을 실행하거나 안전 장치를 우회하거나 민감한 정보를 노출하도록 입력을 조작합니다.',
    severity: 'high',
    status: 'partial',
    mitigations: [
      {
        id: 'MIT-01-1',
        descriptionKo: 'XML 태그(<user_request>)를 사용하여 사용자 입력과 시스템 프롬프트를 분리하고, 사용자 입력 내 XML 태그를 이스케이프합니다.',
        implementedIn: 'src/lib/parser/prompts.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-01-2',
        descriptionKo: '시스템 프롬프트에 명시적인 보안 규칙을 포함하여 태그 외부의 지시사항 무시를 지시합니다.',
        implementedIn: 'src/lib/parser/prompts.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-01-3',
        descriptionKo: '구조화된 컨텍스트 빌더를 통해 사용자 입력을 정형화된 형식으로 변환하여 LLM에 전달합니다.',
        implementedIn: 'src/lib/parser/contextBuilder.ts',
        type: 'prevention',
      },
    ],
    gaps: [
      {
        id: 'GAP-01-1',
        descriptionKo: '간접 프롬프트 인젝션 탐지 메커니즘 부재 (다이어그램 노드 라벨에 악의적 프롬프트 삽입 가능)',
        priority: 'high',
        suggestedFixKo: '노드 라벨/설명 필드에 대한 추가 입력 검증 로직 구현 및 LLM 응답에서 의도하지 않은 동작 패턴 탐지 로직 추가',
      },
      {
        id: 'GAP-01-2',
        descriptionKo: '사용자 입력에 대한 사전 필터링(위험 패턴 탐지) 미적용 상태',
        priority: 'medium',
        suggestedFixKo: 'sanitizeUserInput 유틸리티를 API 라우트에서 호출하여 위험 패턴 사전 필터링 적용',
      },
    ],
  },

  // LLM02: Insecure Output Handling
  {
    id: 'LLM02',
    owaspId: 'LLM02:2025',
    name: 'Insecure Output Handling',
    nameKo: '안전하지 않은 출력 처리',
    description: 'LLM outputs are used without proper validation, leading to XSS, SSRF, or code execution when rendered or processed downstream.',
    descriptionKo: 'LLM 출력이 적절한 검증 없이 사용되어 렌더링 또는 후속 처리 시 XSS, SSRF, 코드 실행 등의 취약점이 발생합니다.',
    severity: 'high',
    status: 'implemented',
    mitigations: [
      {
        id: 'MIT-02-1',
        descriptionKo: 'Zod 스키마를 사용하여 LLM 응답 구조를 엄격하게 검증합니다. 허용된 작업 타입과 필드만 통과합니다.',
        implementedIn: 'src/lib/parser/responseValidator.ts',
        type: 'detection',
      },
      {
        id: 'MIT-02-2',
        descriptionKo: '검증된 작업만 안전한 노드 조작 함수(applyOperations)를 통해 적용합니다. 임의 코드 실행이 불가능합니다.',
        implementedIn: 'src/lib/parser/diffApplier.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-02-3',
        descriptionKo: 'LLM 응답에서 JSON을 추출할 때 균형 잡힌 괄호 카운팅으로 안전하게 파싱합니다.',
        implementedIn: 'src/lib/parser/responseValidator.ts',
        type: 'prevention',
      },
    ],
    gaps: [],
  },

  // LLM03: Training Data Poisoning
  {
    id: 'LLM03',
    owaspId: 'LLM03:2025',
    name: 'Training Data Poisoning',
    nameKo: '학습 데이터 오염',
    description: 'Manipulation of training data to introduce vulnerabilities, backdoors, or biases into the model.',
    descriptionKo: '학습 데이터를 조작하여 모델에 취약점, 백도어 또는 편향을 주입합니다.',
    severity: 'low',
    status: 'not-applicable',
    mitigations: [
      {
        id: 'MIT-03-1',
        descriptionKo: 'InfraFlow는 자체 모델을 학습하지 않으며, 외부 LLM API(Claude/OpenAI)만 사용합니다. 학습 데이터 관리는 해당 제공자의 책임입니다.',
        type: 'prevention',
      },
    ],
    gaps: [],
  },

  // LLM04: Model Denial of Service
  {
    id: 'LLM04',
    owaspId: 'LLM04:2025',
    name: 'Model Denial of Service',
    nameKo: '모델 서비스 거부',
    description: 'Attacker causes excessive resource consumption through crafted inputs, leading to degraded service quality or high costs.',
    descriptionKo: '공격자가 조작된 입력으로 과도한 리소스 소비를 유발하여 서비스 품질 저하 또는 높은 비용을 초래합니다.',
    severity: 'medium',
    status: 'partial',
    mitigations: [
      {
        id: 'MIT-04-1',
        descriptionKo: '분당/일일 API 호출 횟수를 제한하는 Rate Limiter가 구현되어 있습니다.',
        implementedIn: 'src/app/api/llm/route.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-04-2',
        descriptionKo: 'API 요청에 AbortController 기반의 타임아웃(30초)이 설정되어 있습니다.',
        implementedIn: 'src/app/api/modify/route.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-04-3',
        descriptionKo: '프롬프트 최대 길이(2000자), 노드 수(100개), 엣지 수(200개) 제한이 적용되어 있습니다.',
        implementedIn: 'src/app/api/modify/route.ts',
        type: 'prevention',
      },
    ],
    gaps: [
      {
        id: 'GAP-04-1',
        descriptionKo: 'LLM 응답의 최대 토큰 수에 대한 동적 제어가 부재합니다. 현재 고정값(2048) 사용 중입니다.',
        priority: 'medium',
        suggestedFixKo: '요청 복잡도에 따라 max_tokens를 동적으로 조정하고, 비정상적으로 긴 응답을 탐지하는 로직 추가',
      },
      {
        id: 'GAP-04-2',
        descriptionKo: '사용자별 비용 추적 및 예산 제한이 구현되어 있지 않습니다.',
        priority: 'low',
        suggestedFixKo: '사용자별 토큰 사용량 추적 및 일일/월간 예산 제한 메커니즘 구현',
      },
    ],
  },

  // LLM05: Supply Chain Vulnerabilities
  {
    id: 'LLM05',
    owaspId: 'LLM05:2025',
    name: 'Supply Chain Vulnerabilities',
    nameKo: '공급망 취약점',
    description: 'Vulnerabilities in third-party components, plugins, or pre-trained models that could compromise the LLM application.',
    descriptionKo: '서드파티 구성요소, 플러그인 또는 사전 학습 모델의 취약점이 LLM 애플리케이션을 손상시킬 수 있습니다.',
    severity: 'medium',
    status: 'planned',
    mitigations: [
      {
        id: 'MIT-05-1',
        descriptionKo: '플러그인 검증기를 통해 플러그인 구조와 메타데이터를 검증합니다.',
        implementedIn: 'src/lib/plugins/validator.ts',
        type: 'detection',
      },
    ],
    gaps: [
      {
        id: 'GAP-05-1',
        descriptionKo: 'npm 의존성에 대한 자동 보안 감사(audit) 파이프라인이 구성되어 있지 않습니다.',
        priority: 'medium',
        suggestedFixKo: 'CI/CD에 npm audit 및 Dependabot/Snyk 등 SCA 도구 통합',
      },
      {
        id: 'GAP-05-2',
        descriptionKo: 'LLM 모델 버전 고정(pinning) 정책이 없어 API 제공자의 모델 변경에 취약합니다.',
        priority: 'medium',
        suggestedFixKo: '사용 중인 LLM 모델 버전을 환경변수로 명시적으로 고정하고 변경 시 알림 설정',
      },
    ],
  },

  // LLM06: Sensitive Information Disclosure
  {
    id: 'LLM06',
    owaspId: 'LLM06:2025',
    name: 'Sensitive Information Disclosure',
    nameKo: '민감 정보 노출',
    description: 'LLM may inadvertently reveal sensitive information, proprietary data, or PII through its responses.',
    descriptionKo: 'LLM이 응답을 통해 민감한 정보, 독점 데이터 또는 개인정보를 실수로 노출할 수 있습니다.',
    severity: 'medium',
    status: 'partial',
    mitigations: [
      {
        id: 'MIT-06-1',
        descriptionKo: 'API 키를 서버사이드 환경변수(process.env)에만 저장하고, NEXT_PUBLIC_ 접두사를 사용하지 않아 클라이언트 노출을 방지합니다.',
        implementedIn: 'src/app/api/llm/route.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-06-2',
        descriptionKo: 'LLM에 전송되는 컨텍스트를 다이어그램 구조 정보로 한정하여 불필요한 데이터 노출을 방지합니다.',
        implementedIn: 'src/lib/parser/contextBuilder.ts',
        type: 'prevention',
      },
    ],
    gaps: [
      {
        id: 'GAP-06-1',
        descriptionKo: 'LLM 응답에 포함될 수 있는 민감 정보(API 키 패턴, 개인정보 등)에 대한 출력 필터링이 없습니다.',
        priority: 'high',
        suggestedFixKo: 'LLM 응답에서 API 키 패턴, 이메일, IP 주소 등 민감 정보 탐지 및 마스킹 로직 구현',
      },
      {
        id: 'GAP-06-2',
        descriptionKo: 'LLM API 호출 시 전송되는 데이터에 대한 로깅 정책이 명확하지 않습니다.',
        priority: 'medium',
        suggestedFixKo: '프로덕션 환경에서 LLM 요청/응답 로깅 시 민감 정보 마스킹 정책 수립',
      },
    ],
  },

  // LLM07: Insecure Plugin Design
  {
    id: 'LLM07',
    owaspId: 'LLM07:2025',
    name: 'Insecure Plugin Design',
    nameKo: '안전하지 않은 플러그인 설계',
    description: 'Plugins may grant excessive permissions, lack input validation, or introduce security vulnerabilities.',
    descriptionKo: '플러그인이 과도한 권한을 부여하거나, 입력 검증이 부족하거나, 보안 취약점을 도입할 수 있습니다.',
    severity: 'medium',
    status: 'implemented',
    mitigations: [
      {
        id: 'MIT-07-1',
        descriptionKo: '플러그인 검증기가 구조, 타입, 메타데이터, 확장을 체계적으로 검증합니다.',
        implementedIn: 'src/lib/plugins/validator.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-07-2',
        descriptionKo: '싱글톤 패턴의 플러그인 레지스트리를 통해 등록/활성화/비활성화 생명주기를 관리합니다.',
        implementedIn: 'src/lib/plugins/registry.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-07-3',
        descriptionKo: '플러그인 의존성 검증 및 중복 등록 방지 로직이 구현되어 있습니다.',
        implementedIn: 'src/lib/plugins/registry.ts',
        type: 'detection',
      },
    ],
    gaps: [],
  },

  // LLM08: Excessive Agency
  {
    id: 'LLM08',
    owaspId: 'LLM08:2025',
    name: 'Excessive Agency',
    nameKo: '과도한 자율성',
    description: 'LLM-based systems may take unintended, harmful, or excessive actions due to unconstrained agency.',
    descriptionKo: 'LLM 기반 시스템이 제한되지 않은 자율성으로 인해 의도하지 않은, 유해한 또는 과도한 작업을 수행할 수 있습니다.',
    severity: 'low',
    status: 'implemented',
    mitigations: [
      {
        id: 'MIT-08-1',
        descriptionKo: 'LLM은 다이어그램 노드/연결의 추가/수정/삭제만 가능하며, 실제 인프라에 대한 접근 권한이 없습니다.',
        type: 'prevention',
      },
      {
        id: 'MIT-08-2',
        descriptionKo: '허용된 작업 타입이 6가지(replace, add, remove, modify, connect, disconnect)로 제한되며 Zod 스키마로 검증됩니다.',
        implementedIn: 'src/lib/parser/responseValidator.ts',
        type: 'prevention',
      },
      {
        id: 'MIT-08-3',
        descriptionKo: '사용 가능한 노드 타입이 미리 정의된 목록으로 제한됩니다.',
        implementedIn: 'src/lib/parser/prompts.ts',
        type: 'prevention',
      },
    ],
    gaps: [],
  },

  // LLM09: Overreliance
  {
    id: 'LLM09',
    owaspId: 'LLM09:2025',
    name: 'Overreliance',
    nameKo: '과잉 의존',
    description: 'Users or systems may rely too heavily on LLM outputs without sufficient verification, leading to incorrect decisions.',
    descriptionKo: '사용자 또는 시스템이 충분한 검증 없이 LLM 출력에 과도하게 의존하여 잘못된 결정을 내릴 수 있습니다.',
    severity: 'medium',
    status: 'partial',
    mitigations: [
      {
        id: 'MIT-09-1',
        descriptionKo: 'IKG(인프라 지식 그래프) 기반 지식 베이스가 출처 기반 제안을 제공하여 LLM 출력의 근거를 보완합니다.',
        type: 'detection',
      },
      {
        id: 'MIT-09-2',
        descriptionKo: 'LLM 응답에 reasoning(추론 과정)을 포함시켜 사용자가 변경 이유를 확인할 수 있습니다.',
        implementedIn: 'src/lib/parser/responseValidator.ts',
        type: 'detection',
      },
    ],
    gaps: [
      {
        id: 'GAP-09-1',
        descriptionKo: 'LLM 생성 결과에 대한 신뢰도 점수 표시 기능이 없습니다.',
        priority: 'medium',
        suggestedFixKo: 'LLM 응답의 신뢰도를 평가하고 UI에 표시하는 기능 구현 (예: 확실/불확실 표시)',
      },
      {
        id: 'GAP-09-2',
        descriptionKo: '사용자에게 LLM 생성 결과의 한계를 알리는 면책 문구가 없습니다.',
        priority: 'low',
        suggestedFixKo: 'UI에 "AI 생성 결과이며 전문가 검토가 권장됩니다" 등의 면책 문구 표시',
      },
    ],
  },

  // LLM10: Model Theft
  {
    id: 'LLM10',
    owaspId: 'LLM10:2025',
    name: 'Model Theft',
    nameKo: '모델 탈취',
    description: 'Unauthorized access to or extraction of the LLM model, including model weights, parameters, or proprietary algorithms.',
    descriptionKo: 'LLM 모델에 대한 무단 접근 또는 모델 가중치, 매개변수, 독점 알고리즘의 추출입니다.',
    severity: 'low',
    status: 'not-applicable',
    mitigations: [
      {
        id: 'MIT-10-1',
        descriptionKo: 'InfraFlow는 자체 모델을 보유하지 않으며, 외부 LLM API만 호출합니다. 모델 보호는 API 제공자(Anthropic/OpenAI)의 책임입니다.',
        type: 'prevention',
      },
    ],
    gaps: [],
  },
];

// ============================================================
// Frozen Registry
// ============================================================

/**
 * Immutable registry of all 10 OWASP LLM Top 10 security controls.
 *
 * Each control maps to InfraFlow-specific mitigations and identifies gaps.
 * The array and its contents are frozen to prevent runtime modification.
 */
export const SECURITY_CONTROLS: readonly SecurityControl[] = Object.freeze(
  controls.map((control) =>
    Object.freeze({
      ...control,
      mitigations: Object.freeze(control.mitigations.map((m) => Object.freeze({ ...m }))),
      gaps: Object.freeze(control.gaps.map((g) => Object.freeze({ ...g }))),
    })
  )
) as readonly SecurityControl[];

// ============================================================
// Query Functions
// ============================================================

/**
 * Find a security control by its ID (e.g. 'LLM01').
 *
 * @param id - Control identifier
 * @returns The matching SecurityControl, or undefined if not found
 */
export function getControlById(id: string): SecurityControl | undefined {
  return SECURITY_CONTROLS.find((c) => c.id === id);
}

/**
 * Get all controls matching a given status.
 *
 * @param status - The ControlStatus to filter by
 * @returns Array of matching SecurityControls
 */
export function getControlsByStatus(status: ControlStatus): SecurityControl[] {
  return SECURITY_CONTROLS.filter((c) => c.status === status);
}

/**
 * Get all security gaps with priority 'high' across all controls.
 *
 * @returns Array of high-priority SecurityGaps
 */
export function getCriticalGaps(): SecurityGap[] {
  return SECURITY_CONTROLS.flatMap((c) => c.gaps).filter((g) => g.priority === 'high');
}

// ============================================================
// Audit Function
// ============================================================

/**
 * Generate a security audit summary.
 *
 * The overall score is calculated as:
 * - implemented: 100 points per control
 * - partial: 50 points per control
 * - planned: 10 points per control
 * - not-applicable: excluded from scoring denominator
 *
 * Score = (total points) / (applicable controls * 100) * 100
 *
 * @returns SecurityAuditResult with counts, gaps, and score
 */
export function runSecurityAudit(): SecurityAuditResult {
  const implemented = SECURITY_CONTROLS.filter((c) => c.status === 'implemented').length;
  const partial = SECURITY_CONTROLS.filter((c) => c.status === 'partial').length;
  const planned = SECURITY_CONTROLS.filter((c) => c.status === 'planned').length;
  const notApplicable = SECURITY_CONTROLS.filter((c) => c.status === 'not-applicable').length;

  const criticalGaps = getCriticalGaps();

  // Score calculation: exclude not-applicable from denominator
  const applicableCount = SECURITY_CONTROLS.length - notApplicable;
  let totalPoints = 0;
  totalPoints += implemented * 100;
  totalPoints += partial * 50;
  totalPoints += planned * 10;

  const overallScore =
    applicableCount > 0 ? Math.round((totalPoints / (applicableCount * 100)) * 100) : 100;

  return {
    totalControls: SECURITY_CONTROLS.length,
    implemented,
    partial,
    planned,
    notApplicable,
    criticalGaps,
    overallScore,
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Sanitize user input to strip potential injection patterns.
 *
 * This function is designed to be safe for normal infrastructure prompts
 * in both Korean and English. It removes dangerous patterns while
 * preserving legitimate infrastructure terminology.
 *
 * @param input - Raw user input string
 * @returns Sanitized string safe for inclusion in LLM prompts
 */
export function sanitizeUserInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Truncate to max length
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_INPUT_LENGTH);
  }

  // Remove dangerous patterns
  for (const { pattern } of DANGEROUS_INPUT_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Collapse excessive whitespace
  sanitized = sanitized.replace(new RegExp(`[ \\t]{${EXCESSIVE_WHITESPACE_THRESHOLD},}`, 'g'), '   ');
  sanitized = sanitized.replace(new RegExp(`\\n{${EXCESSIVE_NEWLINES_THRESHOLD},}`, 'g'), '\n\n');

  // Trim leading/trailing whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Validate the safety of LLM output.
 *
 * Checks for suspicious patterns in the output that could indicate
 * injection attempts, code execution vectors, or system command injection.
 *
 * @param output - Raw LLM output (can be any type)
 * @returns Object with `safe` boolean and list of `issues` found
 */
export function validateOutputSafety(output: unknown): { safe: boolean; issues: string[] } {
  const issues: string[] = [];

  if (output === null || output === undefined) {
    return { safe: true, issues: [] };
  }

  // Convert to inspectable string representation
  const outputStr = typeof output === 'string' ? output : JSON.stringify(output);

  if (!outputStr) {
    return { safe: true, issues: [] };
  }

  // Check each dangerous pattern
  for (const { pattern, label } of DANGEROUS_OUTPUT_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    if (pattern.test(outputStr)) {
      issues.push(label);
    }
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}
