import { describe, it, expect } from 'vitest';
import { detectAllNodeTypes } from '@/lib/parser/patterns';
import { getCategoryForType, getTierForType, getLabelForType } from '@/lib/data';
import { specToFlow, flowToSpec } from '@/lib/layout/layoutEngine';
import { generateFlowSequence, getAvailableScenarios } from '@/lib/animation/flowScenarios';
import { containsTelecomKeywords, buildContext } from '@/lib/parser/contextBuilder';
import { enrichContext, buildKnowledgePromptSection } from '@/lib/knowledge/contextEnricher';
import { COMPONENT_RELATIONSHIPS } from '@/lib/knowledge/relationships';
import { ARCHITECTURE_PATTERNS } from '@/lib/knowledge/patterns';
import { ANTI_PATTERNS } from '@/lib/knowledge/antipatterns';
import { FAILURE_SCENARIOS } from '@/lib/knowledge/failures';
import { PERFORMANCE_PROFILES } from '@/lib/knowledge/performance';
import type { InfraSpec, InfraNodeData, InfraNodeType } from '@/types';

// ---------------------------------------------------------------------------
// Integration helper: simulate what the pipeline does for a given prompt
// ---------------------------------------------------------------------------

function simulateParsing(text: string) {
  const detected = detectAllNodeTypes(text);
  return detected.map((d) => ({
    type: d.type,
    label: d.label,
    category: getCategoryForType(d.type),
    tier: getTierForType(d.type),
  }));
}

function buildSpecFromDetected(
  detected: Array<{ type: string; label: string }>,
  connections: InfraSpec['connections'] = [],
): InfraSpec {
  return {
    nodes: detected.map((d, i) => ({
      id: `${d.type}-${i}`,
      type: d.type as InfraSpec['nodes'][0]['type'],
      label: d.label,
    })),
    connections,
  };
}

// ---------------------------------------------------------------------------
// 1. End-to-end: "본사-지사 전용회선 연결 구성"
// ---------------------------------------------------------------------------

describe('Telecom Pipeline Integration', () => {
  describe('본사-지사 전용회선 연결 구성', () => {
    const prompt = '본사와 지사를 전용회선으로 연결하고 PE 라우터를 통해 MPLS 망에 접속하는 구성을 보여줘';

    it('should detect telecom keywords in prompt', () => {
      expect(containsTelecomKeywords(prompt)).toBe(true);
    });

    it('should detect telecom components from Korean prompt', () => {
      const detected = simulateParsing(prompt);
      const types = detected.map((d) => d.type);

      expect(types).toContain('dedicated-line');
      expect(types).toContain('pe-router');
      expect(types).toContain('mpls-network');
    });

    it('should assign correct categories to detected components', () => {
      const detected = simulateParsing(prompt);
      const dedicatedLine = detected.find((d) => d.type === 'dedicated-line');
      const peRouter = detected.find((d) => d.type === 'pe-router');

      expect(dedicatedLine?.category).toBe('wan');
      expect(peRouter?.category).toBe('wan');
    });

    it('should assign correct tiers to detected components', () => {
      const detected = simulateParsing(prompt);
      const dedicatedLine = detected.find((d) => d.type === 'dedicated-line');
      const peRouter = detected.find((d) => d.type === 'pe-router');
      const mplsNetwork = detected.find((d) => d.type === 'mpls-network');

      expect(dedicatedLine?.tier).toBe('dmz');
      expect(peRouter?.tier).toBe('dmz');
      expect(mplsNetwork?.tier).toBe('internal');
    });

    it('should convert spec to React Flow nodes with proper tiers', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE (본사)' },
          { id: 'dl-1', type: 'dedicated-line', label: '전용회선' },
          { id: 'co-1', type: 'central-office', label: '국사' },
          { id: 'pe-1', type: 'pe-router', label: 'PE 라우터' },
          { id: 'p-1', type: 'p-router', label: 'P 라우터' },
          { id: 'pe-2', type: 'pe-router', label: 'PE 라우터 (지사)' },
          { id: 'cpe-2', type: 'customer-premise', label: 'CPE (지사)' },
        ],
        connections: [
          { source: 'cpe-1', target: 'dl-1', flowType: 'wan-link' },
          { source: 'dl-1', target: 'co-1', flowType: 'wan-link' },
          { source: 'co-1', target: 'pe-1', flowType: 'wan-link' },
          { source: 'pe-1', target: 'p-1', flowType: 'tunnel' },
          { source: 'p-1', target: 'pe-2', flowType: 'tunnel' },
          { source: 'pe-2', target: 'cpe-2', flowType: 'wan-link' },
        ],
      };

      const { nodes, edges } = specToFlow(spec);

      expect(nodes).toHaveLength(7);
      expect(edges).toHaveLength(6);

      // Verify tier assignments via node data
      const cpe = nodes.find((n) => n.id === 'cpe-1');
      expect((cpe?.data as InfraNodeData).tier).toBe('external');

      const pe = nodes.find((n) => n.id === 'pe-1');
      expect((pe?.data as InfraNodeData).tier).toBe('dmz');

      const pRouter = nodes.find((n) => n.id === 'p-1');
      expect((pRouter?.data as InfraNodeData).tier).toBe('internal');
    });

    it('should generate dedicated-line-flow animation', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
          { id: 'dl-1', type: 'dedicated-line', label: 'Dedicated Line' },
          { id: 'co-1', type: 'central-office', label: 'CO' },
          { id: 'pe-1', type: 'pe-router', label: 'PE' },
        ],
        connections: [
          { source: 'cpe-1', target: 'dl-1', flowType: 'wan-link' },
          { source: 'dl-1', target: 'co-1', flowType: 'wan-link' },
          { source: 'co-1', target: 'pe-1', flowType: 'wan-link' },
        ],
      };

      const sequence = generateFlowSequence(spec, 'dedicated-line-flow');
      expect(sequence.steps.length).toBeGreaterThan(0);

      const wanSteps = sequence.steps.filter((s) => s.type === 'wan-link');
      expect(wanSteps.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. "5G 특화망으로 공장 모니터링"
  // ---------------------------------------------------------------------------

  describe('5G 특화망으로 공장 모니터링', () => {
    const prompt = '5G 특화망을 이용한 스마트 공장 모니터링 시스템을 구성해줘';

    it('should detect telecom keywords in prompt', () => {
      expect(containsTelecomKeywords(prompt)).toBe(true);
    });

    it('should detect 5G components from Korean prompt', () => {
      const detected = simulateParsing(prompt);
      const types = detected.map((d) => d.type);

      expect(types).toContain('private-5g');
    });

    it('should generate 5g-private-network animation', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'bs-1', type: 'base-station', label: 'gNB' },
          { id: 'cn-1', type: 'core-network', label: '5G Core' },
          { id: 'upf-1', type: 'upf', label: 'UPF' },
          { id: 'p5g-1', type: 'private-5g', label: 'Private 5G' },
          { id: 'idc-1', type: 'idc', label: 'IDC' },
        ],
        connections: [
          { source: 'bs-1', target: 'cn-1', flowType: 'wireless' },
          { source: 'cn-1', target: 'upf-1', flowType: 'wan-link' },
          { source: 'upf-1', target: 'p5g-1', flowType: 'wan-link' },
          { source: 'p5g-1', target: 'idc-1', flowType: 'wan-link' },
        ],
      };

      const sequence = generateFlowSequence(spec, '5g-private-network');
      expect(sequence.steps.length).toBeGreaterThan(0);

      // First step should be wireless
      expect(sequence.steps[0].type).toBe('wireless');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. "3티어 웹 아키텍처" → 통신 컴포넌트 미포함 확인 (핵심!)
  // ---------------------------------------------------------------------------

  describe('3티어 웹 아키텍처 — 통신 컴포넌트 비포함', () => {
    const prompt = '3티어 웹 아키텍처를 구성해줘';

    it('should NOT detect telecom keywords in standard infra prompt', () => {
      expect(containsTelecomKeywords(prompt)).toBe(false);
    });

    it('should NOT detect telecom/wan components from standard infra prompt', () => {
      const detected = simulateParsing(prompt);
      const telecomTypes = [
        'central-office', 'base-station', 'olt', 'customer-premise', 'idc',
        'pe-router', 'p-router', 'mpls-network', 'dedicated-line', 'metro-ethernet',
        'corporate-internet', 'vpn-service', 'sd-wan-service', 'private-5g',
        'core-network', 'upf', 'ring-network',
      ];

      for (const type of detected.map((d) => d.type)) {
        expect(telecomTypes).not.toContain(type);
      }
    });

    it('should detect standard infra components', () => {
      // Common patterns for "3티어" or "web server" etc.
      const webDetected = detectAllNodeTypes('웹 서버');
      const webTypes = webDetected.map((d) => d.type);
      expect(webTypes).toContain('web-server');

      const fwDetected = detectAllNodeTypes('방화벽');
      const fwTypes = fwDetected.map((d) => d.type);
      expect(fwTypes).toContain('firewall');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. "IDC 이중화 구성" → 이중 경로 생성
  // ---------------------------------------------------------------------------

  describe('IDC 이중화 구성', () => {
    const prompt = 'IDC 이중화 접속 구성을 보여줘';

    it('should detect telecom keywords', () => {
      expect(containsTelecomKeywords(prompt)).toBe(true);
    });

    it('should detect IDC component', () => {
      const detected = detectAllNodeTypes('IDC');
      const types = detected.map((d) => d.type);
      expect(types).toContain('idc');
    });

    it('should have dual-homing-failover animation scenario available', () => {
      const scenarios = getAvailableScenarios();
      const dualHoming = scenarios.find((s) => s.type === 'dual-homing-failover');
      expect(dualHoming).toBeDefined();
      expect(dualHoming!.category).toBe('telecom');
    });
  });

  // ---------------------------------------------------------------------------
  // 5. "하이브리드 WAN 구성" → 전용회선 + 인터넷 병렬 경로
  // ---------------------------------------------------------------------------

  describe('하이브리드 WAN 구성', () => {
    const prompt = 'SD-WAN을 활용한 하이브리드 WAN 구성을 보여줘';

    it('should detect telecom keywords', () => {
      expect(containsTelecomKeywords(prompt)).toBe(true);
    });

    it('should detect SD-WAN from prompt', () => {
      const detected = detectAllNodeTypes(prompt);
      const types = detected.map((d) => d.type);
      // "SD-WAN" matches the general sd-wan pattern; "SD-WAN 서비스" matches sd-wan-service
      expect(types.some((t) => t === 'sd-wan' || t === 'sd-wan-service')).toBe(true);
    });

    it('should generate hybrid-wan animation with dual paths', () => {
      const spec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
          { id: 'dl-1', type: 'dedicated-line', label: 'Dedicated Line' },
          { id: 'co-1', type: 'central-office', label: 'CO' },
          { id: 'ci-1', type: 'corporate-internet', label: 'Internet' },
          { id: 'sdwan-1', type: 'sd-wan-service', label: 'SD-WAN' },
        ],
        connections: [
          { source: 'cpe-1', target: 'dl-1', flowType: 'wan-link' },
          { source: 'dl-1', target: 'co-1', flowType: 'wan-link' },
          { source: 'cpe-1', target: 'ci-1', flowType: 'encrypted' },
          { source: 'ci-1', target: 'sdwan-1', flowType: 'encrypted' },
        ],
      };

      const sequence = generateFlowSequence(spec, 'hybrid-wan-balancing');
      expect(sequence.steps.length).toBeGreaterThan(0);

      const wanSteps = sequence.steps.filter((s) => s.type === 'wan-link');
      const encSteps = sequence.steps.filter((s) => s.type === 'encrypted');
      expect(wanSteps.length).toBeGreaterThan(0);
      expect(encSteps.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. SSoT integration: all telecom/wan types have proper metadata
  // ---------------------------------------------------------------------------

  describe('SSoT integration for all telecom/wan types', () => {
    const telecomTypes: InfraNodeType[] = ['central-office', 'base-station', 'olt', 'customer-premise', 'idc'];
    const wanTypes: InfraNodeType[] = [
      'pe-router', 'p-router', 'mpls-network', 'dedicated-line', 'metro-ethernet',
      'corporate-internet', 'vpn-service', 'sd-wan-service', 'private-5g',
      'core-network', 'upf', 'ring-network',
    ];

    it('should return telecom category for all telecom types', () => {
      for (const type of telecomTypes) {
        expect(getCategoryForType(type)).toBe('telecom');
      }
    });

    it('should return wan category for all WAN types', () => {
      for (const type of wanTypes) {
        expect(getCategoryForType(type)).toBe('wan');
      }
    });

    it('should return display labels for all telecom/wan types', () => {
      for (const type of [...telecomTypes, ...wanTypes]) {
        const label = getLabelForType(type);
        expect(label).toBeTruthy();
        expect(label).not.toBe(type); // should be human-readable, not the type ID
      }
    });

    it('should return valid tiers for all telecom/wan types', () => {
      const validTiers = ['external', 'dmz', 'internal', 'data'];
      for (const type of [...telecomTypes, ...wanTypes]) {
        const tier = getTierForType(type);
        expect(validTiers).toContain(tier);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Knowledge graph integration: telecom content available
  // ---------------------------------------------------------------------------

  describe('Knowledge graph telecom integration', () => {
    it('should have telecom relationships in the knowledge graph', () => {
      const telecomRels = COMPONENT_RELATIONSHIPS.filter((r) => r.id.startsWith('REL-TEL-'));
      expect(telecomRels.length).toBe(20);
    });

    it('should have telecom patterns in the knowledge graph', () => {
      const telecomPats = ARCHITECTURE_PATTERNS.filter((p) => p.id.startsWith('PAT-TEL-'));
      expect(telecomPats.length).toBe(6);
    });

    it('should have telecom antipatterns in the knowledge graph', () => {
      const telecomAPs = ANTI_PATTERNS.filter((a) => a.id.startsWith('AP-TEL-'));
      expect(telecomAPs.length).toBe(6);
    });

    it('should have telecom failures in the knowledge graph', () => {
      const telecomFails = FAILURE_SCENARIOS.filter((f) => f.id.startsWith('FAIL-TEL-'));
      expect(telecomFails.length).toBe(8);
    });

    it('should have telecom performance profiles in the knowledge graph', () => {
      const telecomPerfs = PERFORMANCE_PROFILES.filter((p) => p.id.startsWith('PERF-TEL-'));
      expect(telecomPerfs.length).toBe(8);
    });

    it('should detect IDC single path antipattern', () => {
      const ap = ANTI_PATTERNS.find((a) => a.id === 'AP-TEL-001');
      expect(ap).toBeDefined();

      // Spec with IDC but only 1 central-office → should detect
      const badSpec: InfraSpec = {
        nodes: [
          { id: 'idc-1', type: 'idc', label: 'IDC' },
          { id: 'co-1', type: 'central-office', label: 'CO' },
        ],
        connections: [{ source: 'co-1', target: 'idc-1' }],
      };
      expect(ap!.detection(badSpec)).toBe(true);

      // Spec with IDC + 2 central offices → should NOT detect
      const goodSpec: InfraSpec = {
        nodes: [
          { id: 'idc-1', type: 'idc', label: 'IDC' },
          { id: 'co-1', type: 'central-office', label: 'CO A' },
          { id: 'co-2', type: 'central-office', label: 'CO B' },
        ],
        connections: [
          { source: 'co-1', target: 'idc-1' },
          { source: 'co-2', target: 'idc-1' },
        ],
      };
      expect(ap!.detection(goodSpec)).toBe(false);
    });

    it('should enrich context with telecom components', () => {
      const diagramContext = {
        nodes: [
          { id: 'pe-1', type: 'pe-router', label: 'PE Router', category: 'wan', zone: 'internal', connectedTo: ['p-1'], connectedFrom: [] },
          { id: 'p-1', type: 'p-router', label: 'P Router', category: 'wan', zone: 'internal', connectedTo: [], connectedFrom: ['pe-1'] },
        ],
        connections: [{ source: 'pe-1', target: 'p-1' }],
        summary: 'PE-P router telecom topology',
      };

      const enriched = enrichContext(diagramContext, [...COMPONENT_RELATIONSHIPS]);
      // Should include telecom-related relationships (pe-router→p-router is REL-TEL-002)
      expect(enriched.relationships.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Round-trip: specToFlow → flowToSpec
  // ---------------------------------------------------------------------------

  describe('Round-trip: specToFlow ↔ flowToSpec', () => {
    it('should round-trip telecom spec through layout engine', () => {
      const originalSpec: InfraSpec = {
        nodes: [
          { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
          { id: 'dl-1', type: 'dedicated-line', label: 'Dedicated Line' },
          { id: 'co-1', type: 'central-office', label: 'CO' },
        ],
        connections: [
          { source: 'cpe-1', target: 'dl-1', flowType: 'wan-link' },
          { source: 'dl-1', target: 'co-1', flowType: 'wan-link' },
        ],
      };

      const { nodes, edges } = specToFlow(originalSpec);
      const roundTripped = flowToSpec(nodes, edges);

      expect(roundTripped.nodes).toHaveLength(3);
      expect(roundTripped.connections).toHaveLength(2);

      // Node IDs preserved
      const ids = roundTripped.nodes.map((n) => n.id);
      expect(ids).toContain('cpe-1');
      expect(ids).toContain('dl-1');
      expect(ids).toContain('co-1');
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Animation scenarios: all telecom scenarios have valid structure
  // ---------------------------------------------------------------------------

  describe('Animation scenario structure', () => {
    it('should have 16 total scenarios (10 existing + 6 telecom)', () => {
      const scenarios = getAvailableScenarios();
      expect(scenarios).toHaveLength(16);
    });

    it('should have unique types across all scenarios', () => {
      const scenarios = getAvailableScenarios();
      const types = scenarios.map((s) => s.type);
      const uniqueTypes = new Set(types);
      expect(uniqueTypes.size).toBe(types.length);
    });

    it('should have 4 categories: basic, failure, performance, telecom', () => {
      const scenarios = getAvailableScenarios();
      const categories = new Set(scenarios.map((s) => s.category));
      expect(categories.size).toBe(4);
      expect(categories).toContain('basic');
      expect(categories).toContain('failure');
      expect(categories).toContain('performance');
      expect(categories).toContain('telecom');
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Total test/data counts validation
  // ---------------------------------------------------------------------------

  describe('Total data counts after telecom extension', () => {
    it('should have >= 69 relationships (49 + 20 telecom)', () => {
      expect(COMPONENT_RELATIONSHIPS.length).toBeGreaterThanOrEqual(69);
    });

    it('should have >= 24 architecture patterns (18 + 6 telecom)', () => {
      expect(ARCHITECTURE_PATTERNS.length).toBeGreaterThanOrEqual(24);
    });

    it('should have >= 28 antipatterns (22 + 6 telecom)', () => {
      expect(ANTI_PATTERNS.length).toBeGreaterThanOrEqual(28);
    });

    it('should have >= 43 failure scenarios (35 + 8 telecom)', () => {
      expect(FAILURE_SCENARIOS.length).toBeGreaterThanOrEqual(43);
    });

    it('should have >= 35 performance profiles (27 + 8 telecom)', () => {
      expect(PERFORMANCE_PROFILES.length).toBeGreaterThanOrEqual(35);
    });
  });
});
