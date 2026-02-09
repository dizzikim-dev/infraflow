/**
 * Infrastructure Knowledge Graph - In-Memory Search Engine
 *
 * Provides full-text search across all knowledge entries (relationships,
 * patterns, anti-patterns, failures, performance profiles) with support
 * for both English and Korean queries.
 *
 * No external dependencies — uses a simple inverted index with TF-based
 * scoring, boosted by trust confidence.
 */

import type { InfraNodeType } from '@/types/infra';
import type {
  KnowledgeType,
  KnowledgeEntryBase,
  ComponentRelationship,
  ArchitecturePattern,
  AntiPattern,
  FailureScenario,
  PerformanceProfile,
} from './types';
import { RELATIONSHIPS } from './relationships';
import { PATTERNS } from './patterns';
import { ANTIPATTERNS } from './antipatterns';
import { FAILURES } from './failures';
import { PROFILES } from './performance';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SearchableType =
  | 'relationship'
  | 'pattern'
  | 'antipattern'
  | 'failure'
  | 'performance'
  | 'all';

export interface SearchOptions {
  /** Filter by knowledge type, default 'all' */
  types?: SearchableType[];
  /** Filter by component types */
  components?: string[];
  /** Filter by tags */
  tags?: string[];
  /** Max results, default 10 */
  limit?: number;
  /** Min relevance score 0-1, default 0.1 */
  minScore?: number;
}

export interface SearchResult {
  id: string;
  type: KnowledgeType;
  score: number; // 0.0 - 1.0 relevance
  title: string; // Human-readable title
  titleKo: string; // Korean title
  summary: string; // Brief summary
  summaryKo: string; // Korean summary
  tags: string[];
  confidence: number; // Trust confidence
  entry: KnowledgeEntryBase; // Original entry reference
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** A normalized knowledge entry used for indexing */
interface IndexedEntry {
  id: string;
  type: KnowledgeType;
  title: string;
  titleKo: string;
  summary: string;
  summaryKo: string;
  tags: string[];
  confidence: number;
  components: string[];
  /** All searchable tokens extracted from this entry */
  tokens: string[];
  /** Korean text fragments for substring matching */
  koreanTexts: string[];
  entry: KnowledgeEntryBase;
}

export interface SearchIndex {
  /** Inverted index: token -> set of entry IDs */
  invertedIndex: Map<string, Set<string>>;
  /** All indexed entries keyed by ID */
  entries: Map<string, IndexedEntry>;
  /** Component to entry IDs mapping */
  componentIndex: Map<string, Set<string>>;
  /** Tag to entry IDs mapping */
  tagIndex: Map<string, Set<string>>;
  /** Total number of indexed entries */
  size: number;
}

// ---------------------------------------------------------------------------
// Module-level lazy singleton
// ---------------------------------------------------------------------------

let _index: SearchIndex | null = null;

function getIndex(): SearchIndex {
  if (_index === null) {
    _index = buildSearchIndex();
  }
  return _index;
}

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

/** Lowercase and remove punctuation for English tokens */
function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z0-9가-힣\-]/g, '');
}

/** Tokenize a string: split by whitespace, hyphens, slashes, commas */
function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[\s,/()]+/)
    .map(normalizeToken)
    .filter((t) => t.length > 0);
}

/** Extract all searchable text fields from an entry into tokens and Korean texts */
function extractFromEntry(entry: KnowledgeEntryBase): { tokens: string[]; koreanTexts: string[]; components: string[] } {
  const tokens: string[] = [];
  const koreanTexts: string[] = [];
  const components: string[] = [];

  // Always add tags and ID
  tokens.push(...entry.tags.map(normalizeToken));
  tokens.push(normalizeToken(entry.id));

  switch (entry.type) {
    case 'relationship': {
      const r = entry as ComponentRelationship;
      tokens.push(...tokenize(r.reason));
      tokens.push(normalizeToken(r.source));
      tokens.push(normalizeToken(r.target));
      tokens.push(normalizeToken(r.relationshipType));
      tokens.push(normalizeToken(r.strength));
      koreanTexts.push(r.reasonKo);
      components.push(r.source, r.target);
      break;
    }
    case 'pattern': {
      const p = entry as ArchitecturePattern;
      tokens.push(...tokenize(p.name));
      tokens.push(...tokenize(p.description));
      koreanTexts.push(p.nameKo, p.descriptionKo);
      koreanTexts.push(...p.bestForKo);
      koreanTexts.push(...p.notSuitableForKo);
      for (const rc of p.requiredComponents) {
        tokens.push(normalizeToken(rc.type));
        components.push(rc.type);
      }
      for (const oc of p.optionalComponents) {
        tokens.push(normalizeToken(oc.type));
        components.push(oc.type);
      }
      break;
    }
    case 'antipattern': {
      const ap = entry as AntiPattern;
      tokens.push(...tokenize(ap.name));
      koreanTexts.push(ap.nameKo, ap.problemKo, ap.impactKo, ap.solutionKo, ap.detectionDescriptionKo);
      break;
    }
    case 'failure': {
      const f = entry as FailureScenario;
      tokens.push(...tokenize(f.component));
      koreanTexts.push(f.titleKo, f.scenarioKo);
      koreanTexts.push(...f.preventionKo);
      koreanTexts.push(...f.mitigationKo);
      components.push(f.component);
      components.push(...f.affectedComponents);
      break;
    }
    case 'performance': {
      const pp = entry as PerformanceProfile;
      tokens.push(normalizeToken(pp.component));
      tokens.push(...pp.bottleneckIndicators.flatMap(tokenize));
      koreanTexts.push(pp.nameKo);
      koreanTexts.push(...pp.bottleneckIndicatorsKo);
      koreanTexts.push(...pp.optimizationTipsKo);
      components.push(pp.component);
      break;
    }
  }

  // Deduplicate tokens
  const uniqueTokens = [...new Set(tokens.filter((t) => t.length > 0))];
  const uniqueComponents = [...new Set(components)];

  return { tokens: uniqueTokens, koreanTexts, components: uniqueComponents };
}

/** Build the title for a SearchResult */
function buildTitle(entry: KnowledgeEntryBase): string {
  switch (entry.type) {
    case 'relationship': {
      const r = entry as ComponentRelationship;
      return `${r.source} ${r.relationshipType} ${r.target}`;
    }
    case 'pattern':
      return (entry as ArchitecturePattern).name;
    case 'antipattern':
      return (entry as AntiPattern).name;
    case 'failure':
      return `${(entry as FailureScenario).component} failure`;
    case 'performance':
      return `${(entry as PerformanceProfile).component} performance`;
    default:
      return entry.id;
  }
}

/** Build Korean title */
function buildTitleKo(entry: KnowledgeEntryBase): string {
  switch (entry.type) {
    case 'relationship': {
      const r = entry as ComponentRelationship;
      return `${r.source} ${r.relationshipType} ${r.target}`;
    }
    case 'pattern':
      return (entry as ArchitecturePattern).nameKo;
    case 'antipattern':
      return (entry as AntiPattern).nameKo;
    case 'failure':
      return (entry as FailureScenario).titleKo;
    case 'performance':
      return (entry as PerformanceProfile).nameKo;
    default:
      return entry.id;
  }
}

/** Build English summary */
function buildSummary(entry: KnowledgeEntryBase): string {
  switch (entry.type) {
    case 'relationship':
      return (entry as ComponentRelationship).reason;
    case 'pattern':
      return (entry as ArchitecturePattern).description;
    case 'antipattern':
      return (entry as AntiPattern).name;
    case 'failure':
      return `${(entry as FailureScenario).component}: ${(entry as FailureScenario).impact} (${(entry as FailureScenario).likelihood} likelihood)`;
    case 'performance':
      return `${(entry as PerformanceProfile).component}: ${(entry as PerformanceProfile).throughputRange.typical}`;
    default:
      return '';
  }
}

/** Build Korean summary */
function buildSummaryKo(entry: KnowledgeEntryBase): string {
  switch (entry.type) {
    case 'relationship':
      return (entry as ComponentRelationship).reasonKo;
    case 'pattern':
      return (entry as ArchitecturePattern).descriptionKo;
    case 'antipattern':
      return (entry as AntiPattern).problemKo;
    case 'failure':
      return (entry as FailureScenario).scenarioKo;
    case 'performance':
      return (entry as PerformanceProfile).nameKo;
    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Index builder
// ---------------------------------------------------------------------------

/**
 * Builds an inverted index from all knowledge data.
 * Call this explicitly to pre-warm the index, or it will be lazily built on first search.
 */
export function buildSearchIndex(): SearchIndex {
  const invertedIndex = new Map<string, Set<string>>();
  const entries = new Map<string, IndexedEntry>();
  const componentIndex = new Map<string, Set<string>>();
  const tagIndex = new Map<string, Set<string>>();

  const allEntries: KnowledgeEntryBase[] = [
    ...(RELATIONSHIPS as unknown as KnowledgeEntryBase[]),
    ...(PATTERNS as unknown as KnowledgeEntryBase[]),
    ...(ANTIPATTERNS as unknown as KnowledgeEntryBase[]),
    ...(FAILURES as unknown as KnowledgeEntryBase[]),
    ...(PROFILES as unknown as KnowledgeEntryBase[]),
  ];

  for (const entry of allEntries) {
    const { tokens, koreanTexts, components } = extractFromEntry(entry);

    const indexed: IndexedEntry = {
      id: entry.id,
      type: entry.type,
      title: buildTitle(entry),
      titleKo: buildTitleKo(entry),
      summary: buildSummary(entry),
      summaryKo: buildSummaryKo(entry),
      tags: [...entry.tags],
      confidence: entry.trust.confidence,
      components,
      tokens,
      koreanTexts,
      entry,
    };

    entries.set(entry.id, indexed);

    // Build inverted index
    for (const token of tokens) {
      if (!invertedIndex.has(token)) {
        invertedIndex.set(token, new Set());
      }
      invertedIndex.get(token)!.add(entry.id);
    }

    // Build component index
    for (const comp of components) {
      if (!componentIndex.has(comp)) {
        componentIndex.set(comp, new Set());
      }
      componentIndex.get(comp)!.add(entry.id);
    }

    // Build tag index
    for (const tag of entry.tags) {
      const normalizedTag = normalizeToken(tag);
      if (!tagIndex.has(normalizedTag)) {
        tagIndex.set(normalizedTag, new Set());
      }
      tagIndex.get(normalizedTag)!.add(entry.id);
    }
  }

  const index: SearchIndex = Object.freeze({
    invertedIndex,
    entries,
    componentIndex,
    tagIndex,
    size: entries.size,
  }) as SearchIndex;

  _index = index;
  return index;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

const EXACT_TOKEN_WEIGHT = 3.0;
const PARTIAL_TOKEN_WEIGHT = 1.5;
const KOREAN_SUBSTRING_WEIGHT = 2.0;
const TAG_MATCH_WEIGHT = 2.5;
const CONFIDENCE_BOOST_FACTOR = 0.3;

/** Check if text contains Korean characters */
function hasKorean(text: string): boolean {
  return /[가-힣]/.test(text);
}

function scoreEntry(indexed: IndexedEntry, queryTokens: string[], rawQuery: string): number {
  let score = 0;
  const queryIsKorean = hasKorean(rawQuery);

  // Token-based scoring (English + component names)
  for (const qt of queryTokens) {
    // Exact token match
    if (indexed.tokens.includes(qt)) {
      score += EXACT_TOKEN_WEIGHT;
      continue;
    }

    // Partial match: query token is a substring of an indexed token or vice versa
    // Require minimum 3 characters for both sides to avoid spurious matches
    const hasPartial = indexed.tokens.some(
      (t) => (t.length >= 3 && qt.length >= 3 && (t.includes(qt) || qt.includes(t))),
    );
    if (hasPartial) {
      score += PARTIAL_TOKEN_WEIGHT;
    }
  }

  // Tag match scoring
  for (const qt of queryTokens) {
    const normalizedQt = normalizeToken(qt);
    if (indexed.tags.some((tag) => normalizeToken(tag) === normalizedQt)) {
      score += TAG_MATCH_WEIGHT;
    }
  }

  // Korean substring matching
  if (queryIsKorean) {
    // Try matching the raw Korean query (trimmed) as a substring of Korean texts
    const trimmedQuery = rawQuery.trim();
    // Also split Korean query by spaces for multi-word Korean queries
    const koreanFragments = trimmedQuery.split(/\s+/).filter((f) => hasKorean(f));

    for (const koreanText of indexed.koreanTexts) {
      if (!koreanText) continue;
      // Full query substring match
      if (koreanText.includes(trimmedQuery)) {
        score += KOREAN_SUBSTRING_WEIGHT * 2;
      } else {
        // Individual fragment matches
        for (const fragment of koreanFragments) {
          if (koreanText.includes(fragment)) {
            score += KOREAN_SUBSTRING_WEIGHT;
          }
        }
      }
    }
  }

  // Boost by confidence
  if (score > 0) {
    score *= 1 + indexed.confidence * CONFIDENCE_BOOST_FACTOR;
  }

  return score;
}

/** Normalize score to 0-1 range */
function normalizeScore(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.min(1.0, score / maxScore);
}

// ---------------------------------------------------------------------------
// Type mapping helpers
// ---------------------------------------------------------------------------

/** Map SearchableType to KnowledgeType for filtering */
function mapSearchableToKnowledge(searchable: SearchableType): KnowledgeType | null {
  switch (searchable) {
    case 'relationship':
      return 'relationship';
    case 'pattern':
      return 'pattern';
    case 'antipattern':
      return 'antipattern';
    case 'failure':
      return 'failure';
    case 'performance':
      return 'performance';
    case 'all':
      return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Main search function.
 *
 * Tokenizes the query and matches against all indexed knowledge entries.
 * Supports both English and Korean queries.
 *
 * @param query - Search query (English or Korean)
 * @param options - Search options (type filter, component filter, tag filter, limit, minScore)
 * @returns Sorted array of SearchResult (highest relevance first)
 */
export function searchKnowledge(
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const index = getIndex();
  const {
    types = ['all'],
    components,
    tags,
    limit = 10,
    minScore = 0.1,
  } = options;

  if (!query || query.trim().length === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  const rawQuery = query;

  // Determine which knowledge types to include
  const includeAll = types.includes('all');
  const allowedTypes = new Set<KnowledgeType>();
  if (!includeAll) {
    for (const t of types) {
      const mapped = mapSearchableToKnowledge(t);
      if (mapped) allowedTypes.add(mapped);
    }
  }

  // Pre-filter candidates based on components/tags if specified
  let candidateIds: Set<string> | null = null;

  if (components && components.length > 0) {
    candidateIds = new Set<string>();
    for (const comp of components) {
      const ids = index.componentIndex.get(comp);
      if (ids) {
        for (const id of ids) candidateIds.add(id);
      }
    }
  }

  if (tags && tags.length > 0) {
    const tagCandidates = new Set<string>();
    for (const tag of tags) {
      const normalizedTag = normalizeToken(tag);
      const ids = index.tagIndex.get(normalizedTag);
      if (ids) {
        for (const id of ids) tagCandidates.add(id);
      }
    }
    if (candidateIds) {
      // Intersect with existing candidates
      candidateIds = new Set([...candidateIds].filter((id) => tagCandidates.has(id)));
    } else {
      candidateIds = tagCandidates;
    }
  }

  // Score all (or filtered) entries
  const scored: { indexed: IndexedEntry; rawScore: number }[] = [];
  let maxScore = 0;

  const entriesToScore = candidateIds
    ? [...candidateIds].map((id) => index.entries.get(id)).filter(Boolean) as IndexedEntry[]
    : [...index.entries.values()];

  for (const indexed of entriesToScore) {
    // Type filter
    if (!includeAll && !allowedTypes.has(indexed.type)) continue;

    const rawScore = scoreEntry(indexed, queryTokens, rawQuery);
    if (rawScore > 0) {
      scored.push({ indexed, rawScore });
      if (rawScore > maxScore) maxScore = rawScore;
    }
  }

  // Normalize scores and apply minScore filter
  const results: SearchResult[] = scored
    .map(({ indexed, rawScore }) => ({
      id: indexed.id,
      type: indexed.type,
      score: normalizeScore(rawScore, maxScore),
      title: indexed.title,
      titleKo: indexed.titleKo,
      summary: indexed.summary,
      summaryKo: indexed.summaryKo,
      tags: indexed.tags,
      confidence: indexed.confidence,
      entry: indexed.entry,
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}

/**
 * Get all knowledge entries related to a specific infrastructure component.
 *
 * @param component - Infrastructure node type (e.g. 'firewall', 'web-server')
 * @returns Array of SearchResult sorted by confidence
 */
export function searchByComponent(component: InfraNodeType): SearchResult[] {
  const index = getIndex();
  const ids = index.componentIndex.get(component);

  if (!ids || ids.size === 0) {
    return [];
  }

  const results: SearchResult[] = [];
  for (const id of ids) {
    const indexed = index.entries.get(id);
    if (!indexed) continue;

    results.push({
      id: indexed.id,
      type: indexed.type,
      score: indexed.confidence, // Use confidence as score for component lookups
      title: indexed.title,
      titleKo: indexed.titleKo,
      summary: indexed.summary,
      summaryKo: indexed.summaryKo,
      tags: indexed.tags,
      confidence: indexed.confidence,
      entry: indexed.entry,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get all knowledge entries that have a specific tag.
 *
 * @param tag - Tag string to search for
 * @returns Array of SearchResult sorted by confidence
 */
export function searchByTag(tag: string): SearchResult[] {
  const index = getIndex();
  const normalizedTag = normalizeToken(tag);
  const ids = index.tagIndex.get(normalizedTag);

  if (!ids || ids.size === 0) {
    return [];
  }

  const results: SearchResult[] = [];
  for (const id of ids) {
    const indexed = index.entries.get(id);
    if (!indexed) continue;

    results.push({
      id: indexed.id,
      type: indexed.type,
      score: indexed.confidence,
      title: indexed.title,
      titleKo: indexed.titleKo,
      summary: indexed.summary,
      summaryKo: indexed.summaryKo,
      tags: indexed.tags,
      confidence: indexed.confidence,
      entry: indexed.entry,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get knowledge entries related to a given entry (sharing components or tags).
 *
 * @param entryId - The ID of the knowledge entry to find related entries for
 * @returns Array of SearchResult sorted by relevance (number of shared attributes)
 */
export function getRelatedKnowledge(entryId: string): SearchResult[] {
  const index = getIndex();
  const source = index.entries.get(entryId);

  if (!source) {
    return [];
  }

  // Collect related entry IDs with overlap counts
  const overlapCount = new Map<string, number>();

  // Shared components
  for (const comp of source.components) {
    const ids = index.componentIndex.get(comp);
    if (!ids) continue;
    for (const id of ids) {
      if (id === entryId) continue;
      overlapCount.set(id, (overlapCount.get(id) ?? 0) + 2); // Components weighted higher
    }
  }

  // Shared tags
  for (const tag of source.tags) {
    const normalizedTag = normalizeToken(tag);
    const ids = index.tagIndex.get(normalizedTag);
    if (!ids) continue;
    for (const id of ids) {
      if (id === entryId) continue;
      overlapCount.set(id, (overlapCount.get(id) ?? 0) + 1);
    }
  }

  if (overlapCount.size === 0) {
    return [];
  }

  const maxOverlap = Math.max(...overlapCount.values());

  const results: SearchResult[] = [];
  for (const [id, count] of overlapCount) {
    const indexed = index.entries.get(id);
    if (!indexed) continue;

    results.push({
      id: indexed.id,
      type: indexed.type,
      score: maxOverlap > 0 ? count / maxOverlap : 0,
      title: indexed.title,
      titleKo: indexed.titleKo,
      summary: indexed.summary,
      summaryKo: indexed.summaryKo,
      tags: indexed.tags,
      confidence: indexed.confidence,
      entry: indexed.entry,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
