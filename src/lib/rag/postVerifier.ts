/**
 * Post-Verification Module
 *
 * Compares LLM-generated InfraSpec against the ontology knowledge graph
 * to detect missing required components, missing recommendations,
 * conflicts, and unused RAG knowledge.
 *
 * Reuses: getMandatoryDependencies, getRecommendations, getConflicts
 * from src/lib/knowledge/relationships/index.ts
 */

import type { InfraSpec, InfraNodeType } from '@/types/infra';
import type {
  ReasoningTrace,
  PostVerification,
  VerifiedRelationship,
  TracedDocument,
} from './types';
import {
  getMandatoryDependencies,
  getRecommendations,
  getConflicts,
} from '@/lib/knowledge/relationships';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Verify an LLM-generated InfraSpec against the ontology knowledge graph.
 *
 * Checks:
 * 1. Required dependencies (requires relationships) — are all targets present?
 * 2. Recommendations — which recommended components are missing?
 * 3. Conflicts — are conflicting components both present?
 * 4. Unused knowledge — high-score RAG documents not reflected in output
 * 5. Verification score — (satisfied / (satisfied + missingRequired)) * 100
 */
export function verifyAgainstOntology(
  outputSpec: InfraSpec,
  trace: ReasoningTrace,
): PostVerification {
  // Extract node types from the output spec
  const outputTypes = new Set<InfraNodeType>(
    (outputSpec.nodes ?? []).map((n) => n.type as InfraNodeType),
  );

  const satisfied: VerifiedRelationship[] = [];
  const missingRequired: VerifiedRelationship[] = [];
  const missingRecommended: VerifiedRelationship[] = [];
  const conflicts: VerifiedRelationship[] = [];

  // Check each output type against ontology
  for (const nodeType of outputTypes) {
    // 1. Required dependencies
    const mandatoryDeps = getMandatoryDependencies(nodeType);
    for (const rel of mandatoryDeps) {
      const verified: VerifiedRelationship = {
        relationshipId: rel.id,
        source: rel.source,
        target: rel.target,
        type: rel.relationshipType,
        reasonKo: rel.reasonKo,
        status: outputTypes.has(rel.target) ? 'satisfied' : 'missing',
      };
      if (verified.status === 'satisfied') {
        satisfied.push(verified);
      } else {
        missingRequired.push(verified);
      }
    }

    // 2. Recommendations
    const recs = getRecommendations(nodeType);
    for (const rel of recs) {
      if (!outputTypes.has(rel.target)) {
        missingRecommended.push({
          relationshipId: rel.id,
          source: rel.source,
          target: rel.target,
          type: rel.relationshipType,
          reasonKo: rel.reasonKo,
          status: 'missing',
        });
      }
    }

    // 3. Conflicts
    const conflictRels = getConflicts(nodeType);
    for (const rel of conflictRels) {
      if (outputTypes.has(rel.target)) {
        conflicts.push({
          relationshipId: rel.id,
          source: rel.source,
          target: rel.target,
          type: rel.relationshipType,
          reasonKo: rel.reasonKo,
          status: 'conflict',
        });
      }
    }
  }

  // 4. Unused knowledge: high-score RAG docs not reflected in output
  const UNUSED_THRESHOLD = 0.7;
  const unusedKnowledge: TracedDocument[] = trace.ragSearch.documents
    .filter((doc) => doc.score >= UNUSED_THRESHOLD)
    .filter((doc) => {
      // Check if the document's category/title maps to any output type
      const docCategory = doc.category.toLowerCase();
      const docTitle = doc.title.toLowerCase();
      return ![...outputTypes].some(
        (t) => docCategory.includes(t) || docTitle.includes(t),
      );
    });

  // 5. Verification score
  const totalRequired = satisfied.length + missingRequired.length;
  const verificationScore = totalRequired > 0
    ? Math.round((satisfied.length / totalRequired) * 100)
    : 100; // No requirements = perfect score

  return {
    satisfied,
    missingRequired,
    missingRecommended,
    conflicts,
    unusedKnowledge,
    verificationScore,
  };
}
