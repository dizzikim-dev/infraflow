import { describe, it, expect } from 'vitest';
import {
  generateFlowSequence,
  getAvailableScenarios,
  type ScenarioType,
} from '@/lib/animation/flowScenarios';
import type { InfraSpec } from '@/types';

// Helper: basic telecom spec with dedicated line topology
function createDedicatedLineSpec(): InfraSpec {
  return {
    nodes: [
      { id: 'cpe-1', type: 'customer-premise', label: 'Customer Premise' },
      { id: 'dl-1', type: 'dedicated-line', label: 'Dedicated Line' },
      { id: 'co-1', type: 'central-office', label: 'Central Office' },
      { id: 'pe-1', type: 'pe-router', label: 'PE Router' },
      { id: 'p-1', type: 'p-router', label: 'P Router' },
      { id: 'idc-1', type: 'idc', label: 'IDC' },
    ],
    connections: [
      { source: 'cpe-1', target: 'dl-1', flowType: 'wan-link' },
      { source: 'dl-1', target: 'co-1', flowType: 'wan-link' },
      { source: 'co-1', target: 'pe-1', flowType: 'wan-link' },
      { source: 'pe-1', target: 'p-1', flowType: 'tunnel' },
      { source: 'p-1', target: 'idc-1', flowType: 'wan-link' },
    ],
  };
}

// Helper: wireless/5G spec
function createWirelessSpec(): InfraSpec {
  return {
    nodes: [
      { id: 'bs-1', type: 'base-station', label: 'Base Station' },
      { id: 'co-1', type: 'central-office', label: 'Central Office' },
      { id: 'cn-1', type: 'core-network', label: 'Core Network' },
      { id: 'upf-1', type: 'upf', label: 'UPF' },
      { id: 'idc-1', type: 'idc', label: 'IDC' },
    ],
    connections: [
      { source: 'bs-1', target: 'co-1', flowType: 'wireless' },
      { source: 'co-1', target: 'cn-1', flowType: 'wan-link' },
      { source: 'cn-1', target: 'upf-1', flowType: 'wan-link' },
      { source: 'upf-1', target: 'idc-1', flowType: 'wan-link' },
    ],
  };
}

// Helper: dual homing spec with redundant paths
function createDualHomingSpec(): InfraSpec {
  return {
    nodes: [
      { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
      { id: 'dl-1', type: 'dedicated-line', label: 'Primary Line' },
      { id: 'rn-1', type: 'ring-network', label: 'Ring Network' },
      { id: 'co-1', type: 'central-office', label: 'Central Office A' },
      { id: 'co-2', type: 'central-office', label: 'Central Office B' },
      { id: 'pe-1', type: 'pe-router', label: 'PE Router A' },
      { id: 'pe-2', type: 'pe-router', label: 'PE Router B' },
    ],
    connections: [
      { source: 'cpe-1', target: 'dl-1', flowType: 'wan-link' },
      { source: 'dl-1', target: 'co-1', flowType: 'wan-link' },
      { source: 'co-1', target: 'pe-1', flowType: 'wan-link' },
      { source: 'cpe-1', target: 'rn-1', flowType: 'wan-link' },
      { source: 'rn-1', target: 'co-2', flowType: 'wan-link' },
      { source: 'co-2', target: 'pe-2', flowType: 'wan-link' },
    ],
  };
}

// Helper: MPLS VPN spec
function createMplsVpnSpec(): InfraSpec {
  return {
    nodes: [
      { id: 'pe-1', type: 'pe-router', label: 'PE Router (Site A)' },
      { id: 'p-1', type: 'p-router', label: 'P Router' },
      { id: 'mpls-1', type: 'mpls-network', label: 'MPLS Network' },
      { id: 'pe-2', type: 'pe-router', label: 'PE Router (Site B)' },
    ],
    connections: [
      { source: 'pe-1', target: 'p-1', flowType: 'tunnel' },
      { source: 'p-1', target: 'mpls-1', flowType: 'tunnel' },
      { source: 'mpls-1', target: 'pe-2', flowType: 'tunnel' },
    ],
  };
}

// Helper: hybrid WAN spec
function createHybridWanSpec(): InfraSpec {
  return {
    nodes: [
      { id: 'cpe-1', type: 'customer-premise', label: 'CPE' },
      { id: 'dl-1', type: 'dedicated-line', label: 'Dedicated Line' },
      { id: 'co-1', type: 'central-office', label: 'Central Office' },
      { id: 'ci-1', type: 'corporate-internet', label: 'Corporate Internet' },
      { id: 'sdwan-1', type: 'sd-wan-service', label: 'SD-WAN' },
    ],
    connections: [
      { source: 'cpe-1', target: 'dl-1', flowType: 'wan-link' },
      { source: 'dl-1', target: 'co-1', flowType: 'wan-link' },
      { source: 'cpe-1', target: 'ci-1', flowType: 'encrypted' },
      { source: 'ci-1', target: 'sdwan-1', flowType: 'encrypted' },
    ],
  };
}

// Helper: 5G private network spec
function create5GPrivateSpec(): InfraSpec {
  return {
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
}

const TELECOM_SCENARIOS: ScenarioType[] = [
  'dedicated-line-flow',
  'wireless-to-server',
  'dual-homing-failover',
  'mpls-vpn-multisite',
  'hybrid-wan-balancing',
  '5g-private-network',
];

describe('Telecom Animation Scenarios', () => {
  describe('getAvailableScenarios', () => {
    it('should include all 6 telecom scenarios', () => {
      const scenarios = getAvailableScenarios();
      const telecomScenarios = scenarios.filter((s) => s.category === 'telecom');
      expect(telecomScenarios).toHaveLength(6);
    });

    it('should have correct category for each telecom scenario', () => {
      const scenarios = getAvailableScenarios();
      for (const type of TELECOM_SCENARIOS) {
        const scenario = scenarios.find((s) => s.type === type);
        expect(scenario).toBeDefined();
        expect(scenario!.category).toBe('telecom');
      }
    });

    it('should have non-empty name, description, icon for telecom scenarios', () => {
      const scenarios = getAvailableScenarios();
      const telecomScenarios = scenarios.filter((s) => s.category === 'telecom');
      for (const s of telecomScenarios) {
        expect(s.name).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect(s.icon).toBeTruthy();
      }
    });

    it('should still include basic, failure, and performance scenarios', () => {
      const scenarios = getAvailableScenarios();
      const categories = new Set(scenarios.map((s) => s.category));
      expect(categories).toContain('basic');
      expect(categories).toContain('failure');
      expect(categories).toContain('performance');
      expect(categories).toContain('telecom');
    });

    it('should have total of 16 scenarios (10 existing + 6 telecom)', () => {
      const scenarios = getAvailableScenarios();
      expect(scenarios).toHaveLength(16);
    });
  });

  describe('dedicated-line-flow', () => {
    it('should generate sequence with wan-link flow type', () => {
      const spec = createDedicatedLineSpec();
      const sequence = generateFlowSequence(spec, 'dedicated-line-flow');

      expect(sequence.steps.length).toBeGreaterThan(0);
      expect(sequence.name).toBe('전용회선 흐름');

      // Forward steps should use wan-link
      const forwardSteps = sequence.steps.filter((s) => s.type === 'wan-link');
      expect(forwardSteps.length).toBeGreaterThan(0);
    });

    it('should include response path back', () => {
      const spec = createDedicatedLineSpec();
      const sequence = generateFlowSequence(spec, 'dedicated-line-flow');

      const responseSteps = sequence.steps.filter((s) => s.type === 'response');
      expect(responseSteps.length).toBeGreaterThan(0);
    });

    it('should have first step labeled as 전용회선 데이터', () => {
      const spec = createDedicatedLineSpec();
      const sequence = generateFlowSequence(spec, 'dedicated-line-flow');

      const firstStep = sequence.steps[0];
      expect(firstStep.label).toBe('전용회선 데이터');
    });

    it('should produce sequence id containing scenario type', () => {
      const spec = createDedicatedLineSpec();
      const sequence = generateFlowSequence(spec, 'dedicated-line-flow');

      expect(sequence.id).toContain('dedicated-line-flow');
      expect(sequence.id).toMatch(/^scenario-dedicated-line-flow-\d+$/);
    });
  });

  describe('wireless-to-server', () => {
    it('should generate sequence with wireless first hop', () => {
      const spec = createWirelessSpec();
      const sequence = generateFlowSequence(spec, 'wireless-to-server');

      expect(sequence.steps.length).toBeGreaterThan(0);
      expect(sequence.name).toBe('무선→서버 경로');

      // First step should be wireless
      const firstStep = sequence.steps[0];
      expect(firstStep.type).toBe('wireless');
    });

    it('should use wan-link for non-wireless hops', () => {
      const spec = createWirelessSpec();
      const sequence = generateFlowSequence(spec, 'wireless-to-server');

      const wanSteps = sequence.steps.filter(
        (s) => s.type === 'wan-link' && s.from !== sequence.steps[0].from,
      );
      expect(wanSteps.length).toBeGreaterThan(0);
    });

    it('should have response path with wireless last hop', () => {
      const spec = createWirelessSpec();
      const sequence = generateFlowSequence(spec, 'wireless-to-server');

      const wirelessSteps = sequence.steps.filter((s) => s.type === 'wireless');
      // At least 2 wireless steps (forward + return)
      expect(wirelessSteps.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('dual-homing-failover', () => {
    it('should generate sequence with blocked step', () => {
      const spec = createDualHomingSpec();
      const sequence = generateFlowSequence(spec, 'dual-homing-failover');

      expect(sequence.steps.length).toBeGreaterThan(0);
      expect(sequence.name).toBe('이중화 전환');

      const blockedSteps = sequence.steps.filter((s) => s.type === 'blocked');
      expect(blockedSteps.length).toBeGreaterThan(0);
    });

    it('should have sync step for failover transition', () => {
      const spec = createDualHomingSpec();
      const sequence = generateFlowSequence(spec, 'dual-homing-failover');

      const syncSteps = sequence.steps.filter((s) => s.type === 'sync');
      expect(syncSteps.length).toBeGreaterThan(0);
    });

    it('should label primary path failure', () => {
      const spec = createDualHomingSpec();
      const sequence = generateFlowSequence(spec, 'dual-homing-failover');

      const blockedStep = sequence.steps.find((s) => s.type === 'blocked');
      expect(blockedStep?.label).toBe('주 경로 장애');
    });
  });

  describe('mpls-vpn-multisite', () => {
    it('should generate sequence with tunnel flow type', () => {
      const spec = createMplsVpnSpec();
      const sequence = generateFlowSequence(spec, 'mpls-vpn-multisite');

      expect(sequence.steps.length).toBeGreaterThan(0);
      expect(sequence.name).toBe('MPLS VPN 다지점');

      const tunnelSteps = sequence.steps.filter((s) => s.type === 'tunnel');
      expect(tunnelSteps.length).toBeGreaterThan(0);
    });

    it('should have both forward and reverse tunnel paths', () => {
      const spec = createMplsVpnSpec();
      const sequence = generateFlowSequence(spec, 'mpls-vpn-multisite');

      // All steps should be tunnel type (forward + reverse)
      const tunnelSteps = sequence.steps.filter((s) => s.type === 'tunnel');
      expect(tunnelSteps.length).toBeGreaterThanOrEqual(4); // 3 forward + at least 1 reverse
    });

    it('should label Site A → B and Site B → A', () => {
      const spec = createMplsVpnSpec();
      const sequence = generateFlowSequence(spec, 'mpls-vpn-multisite');

      const forwardLabel = sequence.steps.find(
        (s) => s.label && s.label.includes('Site A → B'),
      );
      const reverseLabel = sequence.steps.find(
        (s) => s.label && s.label.includes('Site B → A'),
      );
      expect(forwardLabel).toBeDefined();
      expect(reverseLabel).toBeDefined();
    });
  });

  describe('hybrid-wan-balancing', () => {
    it('should generate sequence with both wan-link and encrypted types', () => {
      const spec = createHybridWanSpec();
      const sequence = generateFlowSequence(spec, 'hybrid-wan-balancing');

      expect(sequence.steps.length).toBeGreaterThan(0);
      expect(sequence.name).toBe('하이브리드 WAN');

      const wanSteps = sequence.steps.filter((s) => s.type === 'wan-link');
      const encryptedSteps = sequence.steps.filter((s) => s.type === 'encrypted');
      expect(wanSteps.length).toBeGreaterThan(0);
      expect(encryptedSteps.length).toBeGreaterThan(0);
    });

    it('should label dedicated line as primary', () => {
      const spec = createHybridWanSpec();
      const sequence = generateFlowSequence(spec, 'hybrid-wan-balancing');

      const primaryStep = sequence.steps.find(
        (s) => s.label && s.label.includes('전용회선'),
      );
      expect(primaryStep).toBeDefined();
    });

    it('should label internet path as secondary', () => {
      const spec = createHybridWanSpec();
      const sequence = generateFlowSequence(spec, 'hybrid-wan-balancing');

      const secondaryStep = sequence.steps.find(
        (s) => s.label && s.label.includes('인터넷'),
      );
      expect(secondaryStep).toBeDefined();
    });
  });

  describe('5g-private-network', () => {
    it('should generate sequence with wireless first hop', () => {
      const spec = create5GPrivateSpec();
      const sequence = generateFlowSequence(spec, '5g-private-network');

      expect(sequence.steps.length).toBeGreaterThan(0);
      expect(sequence.name).toBe('5G 특화망');

      const firstStep = sequence.steps[0];
      expect(firstStep.type).toBe('wireless');
    });

    it('should label first step as 5G NR', () => {
      const spec = create5GPrivateSpec();
      const sequence = generateFlowSequence(spec, '5g-private-network');

      const firstStep = sequence.steps[0];
      expect(firstStep.label).toBe('5G NR');
    });

    it('should have response path back', () => {
      const spec = create5GPrivateSpec();
      const sequence = generateFlowSequence(spec, '5g-private-network');

      const responseSteps = sequence.steps.filter((s) => s.type === 'response');
      expect(responseSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback behavior', () => {
    it('should fall back to connectionPath when telecom nodes are absent', () => {
      const genericSpec: InfraSpec = {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'Firewall' },
          { id: 'ws-1', type: 'web-server', label: 'Web Server' },
        ],
        connections: [
          { source: 'fw-1', target: 'ws-1' },
        ],
      };

      // Should not throw, should fall back to connectionPath
      const sequence = generateFlowSequence(genericSpec, 'dedicated-line-flow');
      expect(sequence.steps.length).toBeGreaterThan(0);
    });

    it('should handle empty spec gracefully', () => {
      const emptySpec: InfraSpec = { nodes: [], connections: [] };

      for (const type of TELECOM_SCENARIOS) {
        const sequence = generateFlowSequence(emptySpec, type);
        expect(sequence.steps).toEqual([]);
      }
    });
  });

  describe('Scenario options', () => {
    it('should respect custom stepDuration', () => {
      const spec = createDedicatedLineSpec();
      const sequence = generateFlowSequence(spec, 'dedicated-line-flow', {
        stepDuration: 1200,
      });

      const step = sequence.steps[0];
      expect(step.duration).toBe(1200);
    });

    it('should respect custom stepDelay', () => {
      const spec = createDedicatedLineSpec();
      const sequence = generateFlowSequence(spec, 'dedicated-line-flow', {
        stepDelay: 500,
      });

      // Second step should have 500ms delay
      if (sequence.steps.length > 1) {
        expect(sequence.steps[1].delay).toBe(500);
      }
    });

    it('should respect loop option', () => {
      const spec = createDedicatedLineSpec();
      const seqLoop = generateFlowSequence(spec, 'dedicated-line-flow', { loop: true });
      const seqNoLoop = generateFlowSequence(spec, 'dedicated-line-flow', { loop: false });

      expect(seqLoop.loop).toBe(true);
      expect(seqNoLoop.loop).toBe(false);
    });
  });
});
