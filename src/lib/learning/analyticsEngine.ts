/**
 * Analytics Engine — Pure analysis functions for learning data
 *
 * All functions are pure: they take data in and return insights out.
 * No side effects, no storage access.
 */

import type { InfraNodeType } from '@/types/infra';
import type {
  FeedbackRecord,
  UsageEvent,
  CoOccurrenceInsight,
  PatternFrequencyInsight,
  FailedPromptInsight,
  PlacementCorrection,
  RelationshipSuggestion,
} from './types';
import type { ComponentRelationship } from '@/lib/knowledge/types';

// ─── Co-Occurrence Analysis ────────────────────────────────────────────

/**
 * Analyze which components are frequently used together.
 * Uses association rule mining: P(B|A) = count(A∧B) / count(A)
 *
 * @param feedbacks - Array of feedback records with specs
 * @param minSupport - Minimum number of co-occurrences
 * @param minConfidence - Minimum conditional probability
 */
export function analyzeCoOccurrences(
  feedbacks: FeedbackRecord[],
  minSupport = 5,
  minConfidence = 0.6
): CoOccurrenceInsight[] {
  // Count occurrences and co-occurrences
  const typeCounts = new Map<InfraNodeType, number>();
  const pairCounts = new Map<string, number>();

  for (const fb of feedbacks) {
    const types = new Set(fb.originalSpec.nodes.map((n) => n.type));
    const typeArr = [...types];

    for (const t of typeArr) {
      typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
    }

    // Count all pairs (unordered)
    for (let i = 0; i < typeArr.length; i++) {
      for (let j = i + 1; j < typeArr.length; j++) {
        const key = pairKey(typeArr[i], typeArr[j]);
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  }

  const insights: CoOccurrenceInsight[] = [];

  for (const [key, coCount] of pairCounts) {
    if (coCount < minSupport) continue;

    const [typeA, typeB] = key.split('|') as [InfraNodeType, InfraNodeType];
    const countA = typeCounts.get(typeA) || 0;
    const countB = typeCounts.get(typeB) || 0;

    // P(B|A) = count(A∧B) / count(A)
    const confidence = countA > 0 ? coCount / countA : 0;
    if (confidence < minConfidence) continue;

    insights.push({
      typeA,
      typeB,
      coOccurrenceCount: coCount,
      totalA: countA,
      totalB: countB,
      confidence,
      support: coCount,
      isExistingRelationship: false, // Will be enriched by suggestNewRelationships
    });
  }

  return insights.sort((a, b) => b.confidence - a.confidence);
}

function pairKey(a: InfraNodeType, b: InfraNodeType): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// ─── Pattern Frequency Analysis ────────────────────────────────────────

/**
 * Analyze how often each architecture pattern is detected/used.
 *
 * @param events - Usage events
 * @param feedbacks - Feedback records (for rating data)
 * @param patternLookup - Map of pattern ID to name/nameKo
 */
export function analyzePatternFrequency(
  events: UsageEvent[],
  feedbacks: FeedbackRecord[],
  patternLookup: Map<string, { name: string; nameKo: string }>
): PatternFrequencyInsight[] {
  const patternCounts = new Map<string, { count: number; lastUsed: string }>();

  // Count from usage events
  for (const event of events) {
    for (const patId of event.patternIds) {
      const existing = patternCounts.get(patId);
      patternCounts.set(patId, {
        count: (existing?.count || 0) + 1,
        lastUsed: existing && existing.lastUsed > event.timestamp
          ? existing.lastUsed
          : event.timestamp,
      });
    }
  }

  // Compute average ratings from feedback
  const patternRatings = new Map<string, number[]>();
  for (const fb of feedbacks) {
    if (fb.userRating != null) {
      for (const patId of fb.patternsDetected) {
        const ratings = patternRatings.get(patId) || [];
        ratings.push(fb.userRating);
        patternRatings.set(patId, ratings);
      }
    }
  }

  const insights: PatternFrequencyInsight[] = [];

  for (const [patternId, data] of patternCounts) {
    const lookup = patternLookup.get(patternId);
    const ratings = patternRatings.get(patternId);
    const avgRating = ratings && ratings.length > 0
      ? ratings.reduce((s, r) => s + r, 0) / ratings.length
      : null;

    insights.push({
      patternId,
      patternName: lookup?.name || patternId,
      patternNameKo: lookup?.nameKo || patternId,
      count: data.count,
      averageRating: avgRating,
      lastUsed: data.lastUsed,
    });
  }

  return insights.sort((a, b) => b.count - a.count);
}

// ─── Failed Prompt Analysis ────────────────────────────────────────────

/**
 * Analyze prompts that frequently fail, grouped by keywords.
 *
 * @param events - Usage events with success/failure info
 * @param minFailures - Minimum failure count to report
 */
export function analyzeFailedPrompts(
  events: UsageEvent[],
  minFailures = 3
): FailedPromptInsight[] {
  const keywordStats = new Map<string, { failures: number; total: number; samples: string[] }>();

  for (const event of events) {
    if (!event.prompt) continue;

    const keywords = extractKeywords(event.prompt);
    for (const keyword of keywords) {
      const stats = keywordStats.get(keyword) || { failures: 0, total: 0, samples: [] };
      stats.total++;
      if (!event.success) {
        stats.failures++;
        if (stats.samples.length < 5) {
          stats.samples.push(event.prompt);
        }
      }
      keywordStats.set(keyword, stats);
    }
  }

  const insights: FailedPromptInsight[] = [];

  for (const [keyword, stats] of keywordStats) {
    if (stats.failures < minFailures) continue;

    insights.push({
      keyword,
      failureCount: stats.failures,
      totalAttempts: stats.total,
      failureRate: stats.total > 0 ? stats.failures / stats.total : 0,
      samplePrompts: stats.samples,
    });
  }

  return insights.sort((a, b) => b.failureRate - a.failureRate);
}

/**
 * Extract meaningful keywords from a prompt for grouping.
 * Filters out common stop words and short tokens.
 */
function extractKeywords(prompt: string): string[] {
  const stopWords = new Set([
    '해줘', '보여줘', '만들어줘', '추가', '생성', '구성',
    'the', 'a', 'an', 'and', 'or', 'with', 'for', 'to', 'in',
    '에', '을', '를', '이', '가', '은', '는', '의', '로', '으로',
  ]);

  return prompt
    .toLowerCase()
    .split(/[\s,+]+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w))
    .slice(0, 5); // Max 5 keywords per prompt
}

// ─── Placement Correction Analysis ─────────────────────────────────────

/**
 * Analyze which placement corrections users make most often.
 * Helps identify where the AI places nodes incorrectly.
 */
export function analyzePlacementCorrections(
  feedbacks: FeedbackRecord[]
): PlacementCorrection[] {
  const corrections = new Map<string, { count: number; total: number }>();

  // Count total node-type occurrences and corrections
  const nodeTypeTotals = new Map<string, number>();

  for (const fb of feedbacks) {
    // Count each node type in original spec
    for (const node of fb.originalSpec.nodes) {
      nodeTypeTotals.set(node.type, (nodeTypeTotals.get(node.type) || 0) + 1);
    }

    // Count placement corrections
    for (const change of fb.placementChanges) {
      if (!change.originalTier || !change.newTier) continue;
      const key = `${change.nodeType}|${change.originalTier}|${change.newTier}`;
      const existing = corrections.get(key) || { count: 0, total: 0 };
      existing.count++;
      corrections.set(key, existing);
    }
  }

  // Compute correction rates
  const results: PlacementCorrection[] = [];

  for (const [key, data] of corrections) {
    const [nodeType, fromTier, toTier] = key.split('|');
    const total = nodeTypeTotals.get(nodeType) || 1;

    results.push({
      nodeType: nodeType as InfraNodeType,
      fromTier,
      toTier,
      count: data.count,
      correctionRate: data.count / total,
    });
  }

  return results.sort((a, b) => b.count - a.count);
}

// ─── Relationship Suggestion ───────────────────────────────────────────

/**
 * Suggest new relationships based on co-occurrence patterns,
 * filtering out those that already exist in the knowledge graph.
 */
export function suggestNewRelationships(
  coOccurrences: CoOccurrenceInsight[],
  existingRelationships: ComponentRelationship[]
): RelationshipSuggestion[] {
  // Build set of existing relationship pairs
  const existingPairs = new Set<string>();
  for (const rel of existingRelationships) {
    existingPairs.add(pairKey(rel.source, rel.target));
  }

  const suggestions: RelationshipSuggestion[] = [];

  for (const co of coOccurrences) {
    const key = pairKey(co.typeA, co.typeB);
    if (existingPairs.has(key)) {
      co.isExistingRelationship = true;
      continue;
    }

    suggestions.push({
      source: co.typeA,
      target: co.typeB,
      confidence: co.confidence,
      support: co.support,
      suggestedType: co.confidence >= 0.8 ? 'recommends' : 'complements',
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}
