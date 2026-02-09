/**
 * Context Enricher - Enriches diagram context with infrastructure knowledge
 *
 * Analyzes the current diagram state against the knowledge graph to surface
 * relevant relationships, missing dependencies, recommendations, and conflicts.
 * The output can be injected into LLM prompts to produce more informed responses.
 */

import type { AntiPattern, ComponentRelationship, EnrichedKnowledge, FailureScenario } from './types';
import type { DiagramContext } from '../parser/prompts';
import type { InfraSpec, InfraNodeType } from '@/types/infra';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MIN_CONFIDENCE = 0.5;
const OFFICIAL_CONFIDENCE_THRESHOLD = 0.85;

// ---------------------------------------------------------------------------
// enrichContext
// ---------------------------------------------------------------------------

/**
 * Analyze a diagram and return relevant knowledge.
 *
 * @param context - The existing diagram context from contextBuilder
 * @param relationships - All available component relationships
 * @returns EnrichedKnowledge with relevant relationships, suggestions, and conflicts
 */
export function enrichContext(
  context: DiagramContext,
  relationships: ComponentRelationship[],
  options?: { spec?: InfraSpec; antiPatterns?: AntiPattern[]; failureScenarios?: FailureScenario[] },
): EnrichedKnowledge {
  // 1. Extract all unique component types present in the diagram
  const presentTypes = new Set(context.nodes.map((n) => n.type));

  // 2. Find all relationships relevant to the current diagram components
  const relevantRelationships = findRelevantRelationships(presentTypes, relationships);

  // 3. Identify missing mandatory dependencies and recommended companions
  const suggestions = findSuggestions(presentTypes, relationships);

  // 4. Identify conflicts (both components in a "conflicts" relationship are present)
  const conflicts = findConflicts(presentTypes, relationships);

  // 5. Detect anti-pattern violations if spec and antiPatterns are provided
  const violations = detectViolations(options?.spec, options?.antiPatterns);

  // 6. Find relevant failure scenarios for present component types
  const risks = findRelevantFailures(presentTypes, options?.failureScenarios);

  // Combine conflicts and suggestions into a single list for the output.
  // Conflicts are surfaced as relationships in the main relationships array as well.
  const allRelevant = [...relevantRelationships, ...conflicts];

  return {
    relationships: dedup(allRelevant),
    violations,
    suggestions: sortSuggestions(dedup(suggestions)),
    risks,
    tips: [], // Quick tips are handled separately (Phase 4)
  };
}

// ---------------------------------------------------------------------------
// buildKnowledgePromptSection
// ---------------------------------------------------------------------------

/**
 * Build a knowledge section string for injection into the LLM system prompt.
 *
 * Filters by confidence >= minConfidence (default 0.5).
 * Groups entries by trust level: official standards, verified practices, user tips.
 * Each entry includes the source title for transparency.
 *
 * @param enriched - The enriched knowledge from enrichContext
 * @param minConfidence - Minimum confidence threshold (default 0.5)
 * @returns Formatted string section for injection into LLM prompts
 */
export function buildKnowledgePromptSection(
  enriched: EnrichedKnowledge,
  minConfidence: number = DEFAULT_MIN_CONFIDENCE,
): string {
  const allEntries = [...enriched.relationships, ...enriched.suggestions];

  // Filter by minimum confidence
  const filtered = allEntries.filter((entry) => entry.trust.confidence >= minConfidence);

  if (filtered.length === 0 && !hasViolations(enriched) && enriched.risks.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push('## 인프라 지식 기반 가이드\n');

  // Group by confidence level
  const official = filtered.filter((e) => e.trust.confidence >= OFFICIAL_CONFIDENCE_THRESHOLD);
  const verified = filtered.filter(
    (e) => e.trust.confidence >= minConfidence && e.trust.confidence < OFFICIAL_CONFIDENCE_THRESHOLD,
  );
  const userLevel = allEntries.filter((e) => e.trust.confidence < minConfidence);

  // Official standards section
  if (official.length > 0) {
    sections.push('### 공식 표준 (반드시 준수)');
    for (const entry of official) {
      const sourceTitle = getPrimarySourceTitle(entry);
      sections.push(`- ${entry.reasonKo} [${sourceTitle}]`);
    }
    sections.push('');
  }

  // Verified practices section
  if (verified.length > 0) {
    sections.push('### 검증된 실무 가이드');
    for (const entry of verified) {
      const percent = Math.round(entry.trust.confidence * 100);
      sections.push(`- ${entry.reasonKo} (신뢰도: ${percent}%)`);
    }
    sections.push('');
  }

  // User-contributed (below threshold, shown as reference only)
  if (userLevel.length > 0) {
    sections.push('### 참고: 사용자 기여 (미검증)');
    for (const entry of userLevel) {
      sections.push(`- ${entry.reasonKo} ⚠️ 미검증`);
    }
    sections.push('');
  }

  // Violations section: conflicts and missing mandatory dependencies
  const violationLines = buildViolationLines(enriched);
  if (violationLines.length > 0) {
    sections.push('### ⛔ 주의사항 및 위반 감지');
    for (const line of violationLines) {
      sections.push(line);
    }
    sections.push('');
  }

  // Failure risks section
  const riskLines = buildRiskLines(enriched);
  if (riskLines.length > 0) {
    sections.push('### 💥 잠재적 장애 시나리오');
    for (const line of riskLines) {
      sections.push(line);
    }
    sections.push('');
  }

  // Rules footer
  sections.push('### 우선순위 규칙');
  sections.push('1. 공식 표준 출처의 가이드를 최우선으로 적용하세요.');
  sections.push('2. 검증된 실무 가이드는 공식 표준과 충돌하지 않는 범위에서 참고하세요.');
  sections.push('3. 미검증 사용자 기여 내용은 참고만 하고, 의사결정의 근거로 사용하지 마세요.');

  return sections.join('\n');
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Find all relationships where at least one side (source or target) is present
 * in the diagram AND both sides are present (i.e., both components exist).
 * Only includes entries with confidence >= 0.5.
 */
function findRelevantRelationships(
  presentTypes: Set<string>,
  relationships: ComponentRelationship[],
): ComponentRelationship[] {
  return relationships.filter(
    (rel) =>
      rel.trust.confidence >= DEFAULT_MIN_CONFIDENCE &&
      rel.relationshipType !== 'conflicts' &&
      presentTypes.has(rel.source) &&
      presentTypes.has(rel.target),
  );
}

/**
 * Find missing mandatory dependencies and recommended companions.
 *
 * If component A "requires" component B but B is not in the diagram, suggest B.
 * If component A "recommends" component B but B is not in the diagram, suggest B.
 */
function findSuggestions(
  presentTypes: Set<string>,
  relationships: ComponentRelationship[],
): ComponentRelationship[] {
  const suggestions: ComponentRelationship[] = [];

  for (const rel of relationships) {
    if (rel.trust.confidence < DEFAULT_MIN_CONFIDENCE) {
      continue;
    }

    const isRequires = rel.relationshipType === 'requires';
    const isRecommends = rel.relationshipType === 'recommends';

    if (!isRequires && !isRecommends) {
      continue;
    }

    // Source is present but target is missing
    if (presentTypes.has(rel.source) && !presentTypes.has(rel.target)) {
      suggestions.push(rel);
    }

    // For bidirectional relationships, also check the reverse
    if (
      rel.direction === 'bidirectional' &&
      presentTypes.has(rel.target) &&
      !presentTypes.has(rel.source)
    ) {
      suggestions.push(rel);
    }
  }

  return suggestions;
}

/**
 * Find conflicts where both components in a "conflicts" relationship
 * exist in the diagram.
 */
function findConflicts(
  presentTypes: Set<string>,
  relationships: ComponentRelationship[],
): ComponentRelationship[] {
  return relationships.filter(
    (rel) =>
      rel.trust.confidence >= DEFAULT_MIN_CONFIDENCE &&
      rel.relationshipType === 'conflicts' &&
      presentTypes.has(rel.source) &&
      presentTypes.has(rel.target),
  );
}

/**
 * Sort suggestions: mandatory first, then by confidence descending.
 */
function sortSuggestions(suggestions: ComponentRelationship[]): ComponentRelationship[] {
  return [...suggestions].sort((a, b) => {
    // Mandatory (requires) first
    const aIsMandatory = a.relationshipType === 'requires' ? 0 : 1;
    const bIsMandatory = b.relationshipType === 'requires' ? 0 : 1;

    if (aIsMandatory !== bIsMandatory) {
      return aIsMandatory - bIsMandatory;
    }

    // Then by confidence descending
    return b.trust.confidence - a.trust.confidence;
  });
}

/**
 * Deduplicate relationships by their ID.
 */
function dedup(entries: ComponentRelationship[]): ComponentRelationship[] {
  const seen = new Set<string>();
  const result: ComponentRelationship[] = [];

  for (const entry of entries) {
    if (!seen.has(entry.id)) {
      seen.add(entry.id);
      result.push(entry);
    }
  }

  return result;
}

/**
 * Get the title of the primary (first) source for display.
 */
function getPrimarySourceTitle(entry: ComponentRelationship): string {
  if (entry.trust.sources.length > 0) {
    return entry.trust.sources[0].title;
  }
  return '출처 미상';
}

/**
 * Find failure scenarios relevant to the present component types.
 * Returns high/medium likelihood scenarios for present components, sorted by impact.
 */
function findRelevantFailures(
  presentTypes: Set<string>,
  failureScenarios?: FailureScenario[],
): FailureScenario[] {
  if (!failureScenarios || failureScenarios.length === 0) {
    return [];
  }
  const impactOrder: Record<string, number> = {
    'service-down': 0,
    'data-loss': 1,
    'security-breach': 2,
    'degraded': 3,
  };
  return failureScenarios
    .filter((f) => presentTypes.has(f.component))
    .sort((a, b) => (impactOrder[a.impact] ?? 9) - (impactOrder[b.impact] ?? 9));
}

/**
 * Run anti-pattern detection if spec and antiPatterns are provided.
 */
function detectViolations(
  spec?: InfraSpec,
  antiPatterns?: AntiPattern[],
): AntiPattern[] {
  if (!spec || !antiPatterns || antiPatterns.length === 0) {
    return [];
  }
  return antiPatterns.filter((ap) => {
    try {
      return ap.detection(spec);
    } catch {
      return false;
    }
  });
}

/**
 * Check if there are any violations (conflicts, missing mandatory items, or anti-patterns).
 */
function hasViolations(enriched: EnrichedKnowledge): boolean {
  const hasConflicts = enriched.relationships.some(
    (r) => r.relationshipType === 'conflicts',
  );
  const hasMissingMandatory = enriched.suggestions.some(
    (s) => s.relationshipType === 'requires',
  );
  const hasAntiPatterns = enriched.violations.length > 0;
  return hasConflicts || hasMissingMandatory || hasAntiPatterns;
}

/**
 * Build violation description lines for conflicts, missing mandatory, and anti-patterns.
 */
function buildViolationLines(enriched: EnrichedKnowledge): string[] {
  const lines: string[] = [];

  // Anti-pattern violations (severity-sorted: critical first)
  const severityOrder = { critical: 0, high: 1, medium: 2 };
  const sortedViolations = [...enriched.violations].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );
  for (const violation of sortedViolations) {
    const icon = violation.severity === 'critical' ? '🔴' : violation.severity === 'high' ? '🟠' : '🟡';
    lines.push(
      `- ${icon} [${violation.severity.toUpperCase()}] ${violation.nameKo}: ${violation.problemKo}`,
    );
    lines.push(`  해결: ${violation.solutionKo}`);
  }

  // Conflicts detected in the diagram
  const conflicts = enriched.relationships.filter(
    (r) => r.relationshipType === 'conflicts',
  );
  for (const conflict of conflicts) {
    lines.push(
      `- ⚠️ 충돌: "${conflict.source}" ↔ "${conflict.target}" — ${conflict.reasonKo}`,
    );
  }

  // Missing mandatory dependencies
  const missingMandatory = enriched.suggestions.filter(
    (s) => s.relationshipType === 'requires',
  );
  for (const missing of missingMandatory) {
    lines.push(
      `- 🔴 필수 누락: "${missing.source}"은(는) "${missing.target}"이(가) 필요합니다 — ${missing.reasonKo}`,
    );
  }

  return lines;
}

/**
 * Build risk description lines for failure scenarios.
 * Limits to top 5 most impactful scenarios to avoid prompt bloat.
 */
function buildRiskLines(enriched: EnrichedKnowledge): string[] {
  const MAX_RISKS = 5;
  const lines: string[] = [];

  const topRisks = enriched.risks.slice(0, MAX_RISKS);
  for (const risk of topRisks) {
    const impactIcon =
      risk.impact === 'service-down' ? '🔴' :
      risk.impact === 'data-loss' ? '🟣' :
      risk.impact === 'security-breach' ? '🔶' : '🟡';
    lines.push(
      `- ${impactIcon} [${risk.impact}] ${risk.titleKo} (MTTR: ${risk.estimatedMTTR})`,
    );
    if (risk.preventionKo.length > 0) {
      lines.push(`  예방: ${risk.preventionKo[0]}`);
    }
  }

  return lines;
}
