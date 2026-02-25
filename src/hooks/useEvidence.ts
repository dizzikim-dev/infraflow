'use client';

import { useState, useEffect, useMemo } from 'react';
import type { InfraNodeType, InfraSpec } from '@/types/infra';
import type {
  ComponentRelationship,
  AntiPattern,
  KnowledgeSource,
  VulnerabilityEntry,
  ComplianceGap,
} from '@/lib/knowledge/types';
import {
  RELATIONSHIPS,
  ANTI_PATTERNS,
  FAILURES,
  VULNERABILITIES,
} from '@/lib/knowledge';
import { enrichContext } from '@/lib/knowledge/contextEnricher';
import type { DiagramContext } from '@/lib/parser/prompts';
import { matchVendorProducts } from '@/lib/recommendation/matcher';
import type { ProductRecommendation } from '@/lib/recommendation/types';
import { getCategoryForType } from '@/lib/data/infrastructureDB';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Best product per vendor for cross-vendor comparison */
export interface VendorGroup {
  vendorId: string;
  vendorName: string;
  best: ProductRecommendation;
  alternatives: ProductRecommendation[];
}

export interface EvidenceData {
  relationships: ComponentRelationship[];
  suggestions: ComponentRelationship[];
  recommendations: ProductRecommendation[];
  vendorGrouped: VendorGroup[];
  violations: AntiPattern[];
  vulnerabilities: VulnerabilityEntry[];
  complianceGaps: ComplianceGap[];
  sources: KnowledgeSource[];
  counts: {
    relationships: number;
    recommendations: number;
    vendors: number;
    validationIssues: number;
    sources: number;
  };
}

// ---------------------------------------------------------------------------
// Helper: build DiagramContext from InfraSpec
// ---------------------------------------------------------------------------

function buildDiagramContext(spec: InfraSpec): DiagramContext {
  // Build connection maps for connectedTo/connectedFrom
  const connectedTo = new Map<string, string[]>();
  const connectedFrom = new Map<string, string[]>();
  for (const c of spec.connections ?? []) {
    connectedTo.set(c.source, [...(connectedTo.get(c.source) ?? []), c.target]);
    connectedFrom.set(c.target, [...(connectedFrom.get(c.target) ?? []), c.source]);
  }

  return {
    nodes: spec.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      label: n.label,
      category: getCategoryForType(n.type),
      zone: n.zone ?? '',
      connectedTo: connectedTo.get(n.id) ?? [],
      connectedFrom: connectedFrom.get(n.id) ?? [],
    })),
    connections: (spec.connections ?? []).map((c) => ({
      source: c.source,
      target: c.target,
      label: c.label,
    })),
    summary: `Infrastructure with ${spec.nodes.length} components`,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Aggregates evidence data for a selected node from knowledge graph
 * and recommendation engine.
 */
export function useEvidence(
  nodeId: string | null,
  nodeType: InfraNodeType | null,
  spec: InfraSpec | null,
): EvidenceData | null {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);

  // Async: load vendor recommendations
  useEffect(() => {
    if (!nodeId || !nodeType || !spec) {
      setRecommendations([]);
      return;
    }
    let cancelled = false;
    matchVendorProducts(spec)
      .then((result) => {
        if (cancelled) return;
        const nodeRec = result.nodeRecommendations.find(
          (nr) => nr.nodeId === nodeId || nr.nodeType === nodeType,
        );
        setRecommendations(nodeRec?.recommendations ?? []);
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      });
    return () => { cancelled = true; };
  }, [nodeId, nodeType, spec]);

  // Sync: compute knowledge-graph evidence
  return useMemo(() => {
    if (!nodeId || !nodeType || !spec) return null;

    // Build diagram context from spec
    const context = buildDiagramContext(spec);

    // Get enriched knowledge
    const enriched = enrichContext(context, [...RELATIONSHIPS], {
      spec,
      antiPatterns: [...ANTI_PATTERNS],
      failureScenarios: [...FAILURES],
      vulnerabilities: [...VULNERABILITIES],
    });

    // Filter relationships involving this node type
    const relationships = enriched.relationships.filter(
      (r) => r.source === nodeType || r.target === nodeType,
    );
    const suggestions = enriched.suggestions.filter(
      (r) => r.source === nodeType || r.target === nodeType,
    );

    // Violations are already detected for the full spec; keep all for display
    const violations = enriched.violations;

    const vulnerabilities = (enriched.vulnerabilities ?? []).filter((v) =>
      v.affectedComponents.includes(nodeType),
    );

    const complianceGaps = enriched.complianceGaps ?? [];

    // Group recommendations by vendor (best per vendor + alternatives)
    const vendorMap = new Map<string, ProductRecommendation[]>();
    for (const rec of recommendations) {
      const list = vendorMap.get(rec.vendorId) ?? [];
      list.push(rec);
      vendorMap.set(rec.vendorId, list);
    }
    const vendorGrouped: VendorGroup[] = [...vendorMap.entries()]
      .map(([vendorId, recs]) => ({
        vendorId,
        vendorName: recs[0].vendorName,
        best: recs[0], // Already sorted by score desc from matchVendorProducts
        alternatives: recs.slice(1),
      }))
      .sort((a, b) => b.best.score.overall - a.best.score.overall);

    // Aggregate all sources (deduplicated by title+url)
    const sourceMap = new Map<string, KnowledgeSource>();
    const addSources = (trust: { sources: KnowledgeSource[] } | undefined) => {
      if (!trust?.sources) return;
      for (const src of trust.sources) {
        const key = `${src.title}::${src.url ?? ''}`;
        if (!sourceMap.has(key)) sourceMap.set(key, src);
      }
    };

    for (const r of relationships) addSources(r.trust);
    for (const r of suggestions) addSources(r.trust);
    for (const v of violations) addSources(v.trust);
    for (const v of vulnerabilities) addSources(v.trust);

    const sources = [...sourceMap.values()].sort((a, b) =>
      a.type.localeCompare(b.type),
    );

    const validationIssues =
      violations.length + vulnerabilities.length + complianceGaps.length;

    return {
      relationships,
      suggestions,
      recommendations,
      vendorGrouped,
      violations,
      vulnerabilities,
      complianceGaps,
      sources,
      counts: {
        relationships: relationships.length + suggestions.length,
        recommendations: recommendations.length,
        vendors: vendorGrouped.length,
        validationIssues,
        sources: sources.length,
      },
    };
  }, [nodeId, nodeType, spec, recommendations]);
}
