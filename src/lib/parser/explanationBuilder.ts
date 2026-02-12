/**
 * Explanation Builder
 *
 * Generates human-readable explanations for why a particular
 * infrastructure diagram was created from the user's prompt.
 */

import type { InfraSpec } from '@/types';
import { infraTemplates } from './templates';
import { getLabelForType } from '@/lib/data/infrastructureDB';

/**
 * Build an explanation for the generated infrastructure.
 *
 * Scenarios:
 * 1. Template matched: uses template name + description
 * 2. Component detection: lists detected node types
 * 3. No spec / error: returns null
 */
export function buildExplanation(
  prompt: string,
  spec: InfraSpec | undefined,
  templateUsed?: string,
): string | undefined {
  if (!spec || !spec.nodes || spec.nodes.length === 0) {
    return undefined;
  }

  if (templateUsed) {
    return buildTemplateExplanation(spec, templateUsed);
  }

  return buildComponentExplanation(spec);
}

/**
 * Template-based explanation.
 */
function buildTemplateExplanation(spec: InfraSpec, templateId: string): string {
  const template = infraTemplates[templateId];
  const name = (template as InfraSpec & { name?: string })?.name || templateId;
  const description = (template as InfraSpec & { description?: string })?.description;

  const componentLabels = getUniqueLabels(spec);
  const lines: string[] = [];

  lines.push(`「${name}」 템플릿이 적용되었습니다.`);

  if (description) {
    lines.push(description);
  }

  if (componentLabels.length > 0) {
    lines.push(`구성: ${componentLabels.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Component-detection explanation (no template matched).
 */
function buildComponentExplanation(spec: InfraSpec): string {
  const componentLabels = getUniqueLabels(spec);
  const lines: string[] = [];

  lines.push('요청하신 내용에서 다음 구성요소를 감지하여 인프라를 생성했습니다.');

  if (componentLabels.length > 0) {
    lines.push(`구성: ${componentLabels.join(', ')} (${componentLabels.length}개 컴포넌트)`);
  }

  return lines.join('\n');
}

/**
 * Extract unique display labels from spec nodes.
 * Uses getLabelForType for user/external types, otherwise uses node label.
 */
function getUniqueLabels(spec: InfraSpec): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const node of spec.nodes) {
    const label = node.label || getLabelForType(node.type);
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }

  return labels;
}
