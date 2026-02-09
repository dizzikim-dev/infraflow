import { describe, it, expect } from 'vitest';
import { inferTier, buildContext, contextToString } from '@/lib/parser/contextBuilder';
import type { Node, Edge } from '@xyflow/react';
import type { InfraNodeData } from '@/types/infra';

describe('contextBuilder', () => {
  describe('inferTier', () => {
    it('should return "dmz" for firewall', () => {
      expect(inferTier('firewall')).toBe('dmz');
    });

    it('should return "dmz" for waf', () => {
      expect(inferTier('waf')).toBe('dmz');
    });

    it('should return "dmz" for load-balancer', () => {
      expect(inferTier('load-balancer')).toBe('dmz');
    });

    it('should return "data" for db-server', () => {
      expect(inferTier('db-server')).toBe('data');
    });

    it('should return "data" for san-nas', () => {
      expect(inferTier('san-nas')).toBe('data');
    });

    it('should return "data" for cache', () => {
      expect(inferTier('cache')).toBe('data');
    });

    it('should return "external" for user', () => {
      expect(inferTier('user')).toBe('external');
    });

    it('should return "external" for internet', () => {
      expect(inferTier('internet')).toBe('external');
    });

    it('should return "internal" for web-server', () => {
      expect(inferTier('web-server')).toBe('internal');
    });

    it('should return "internal" for app-server', () => {
      expect(inferTier('app-server')).toBe('internal');
    });

    it('should return "internal" for kubernetes', () => {
      expect(inferTier('kubernetes')).toBe('internal');
    });

    it('should return "internal" for unknown types', () => {
      expect(inferTier('unknown-device')).toBe('internal');
    });

    it('should return "internal" for empty string', () => {
      expect(inferTier('')).toBe('internal');
    });
  });

  describe('buildContext', () => {
    function makeNode(
      id: string,
      nodeType: string,
      category: string,
      label?: string,
      tier?: string
    ): Node<InfraNodeData> {
      return {
        id,
        position: { x: 0, y: 0 },
        data: {
          label: label || id,
          category: category as InfraNodeData['category'],
          nodeType: nodeType as InfraNodeData['nodeType'],
          tier: tier as InfraNodeData['tier'],
        },
        type: nodeType,
      };
    }

    function makeEdge(source: string, target: string, label?: string): Edge {
      return {
        id: `${source}-${target}`,
        source,
        target,
        data: label ? { label } : undefined,
      };
    }

    it('should correctly map nodes to NodeContext', () => {
      const nodes = [
        makeNode('fw-1', 'firewall', 'security', 'Firewall', 'dmz'),
        makeNode('web-1', 'web-server', 'compute', 'Web Server', 'internal'),
      ];
      const edges: Edge[] = [makeEdge('fw-1', 'web-1')];

      const context = buildContext(nodes, edges);

      expect(context.nodes).toHaveLength(2);
      expect(context.nodes[0]).toEqual({
        id: 'fw-1',
        type: 'firewall',
        label: 'Firewall',
        category: 'security',
        zone: 'dmz',
        connectedTo: ['web-1'],
        connectedFrom: [],
      });
      expect(context.nodes[1]).toEqual({
        id: 'web-1',
        type: 'web-server',
        label: 'Web Server',
        category: 'compute',
        zone: 'internal',
        connectedTo: [],
        connectedFrom: ['fw-1'],
      });
    });

    it('should correctly map edges to ConnectionContext', () => {
      const nodes = [
        makeNode('a', 'firewall', 'security'),
        makeNode('b', 'web-server', 'compute'),
      ];
      const edges = [makeEdge('a', 'b', 'HTTPS')];

      const context = buildContext(nodes, edges);

      expect(context.connections).toHaveLength(1);
      expect(context.connections[0]).toEqual({
        source: 'a',
        target: 'b',
        label: 'HTTPS',
      });
    });

    it('should infer tier from nodeType when tier is not provided', () => {
      const nodes: Node<InfraNodeData>[] = [
        {
          id: 'fw-1',
          position: { x: 0, y: 0 },
          data: {
            label: 'Firewall',
            category: 'security',
            nodeType: 'firewall',
            // tier is not set
          },
          type: 'firewall',
        },
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.nodes[0].zone).toBe('dmz');
    });

    it('should return empty summary text for empty nodes', () => {
      const context = buildContext([], []);

      expect(context.nodes).toHaveLength(0);
      expect(context.connections).toHaveLength(0);
      expect(context.summary).toBe('빈 다이어그램');
    });

    it('should generate summary with category and zone counts', () => {
      const nodes = [
        makeNode('fw-1', 'firewall', 'security', 'Firewall', 'dmz'),
        makeNode('web-1', 'web-server', 'compute', 'Web Server', 'internal'),
        makeNode('app-1', 'app-server', 'compute', 'App Server', 'internal'),
        makeNode('db-1', 'db-server', 'compute', 'Database', 'data'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('총 4개 노드');
      expect(context.summary).toContain('security: 1개');
      expect(context.summary).toContain('compute: 3개');
      expect(context.summary).toContain('dmz: 1개');
      expect(context.summary).toContain('internal: 2개');
      expect(context.summary).toContain('data: 1개');
    });

    it('should detect 3-tier architecture in summary', () => {
      const nodes = [
        makeNode('web-1', 'web-server', 'compute', 'Web Server', 'internal'),
        makeNode('app-1', 'app-server', 'compute', 'App Server', 'internal'),
        makeNode('db-1', 'db-server', 'compute', 'Database', 'data'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('3티어 웹 아키텍처');
    });

    it('should detect 2-tier architecture in summary', () => {
      const nodes = [
        makeNode('web-1', 'web-server', 'compute', 'Web Server', 'internal'),
        makeNode('db-1', 'db-server', 'compute', 'Database', 'data'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('2티어 웹 아키텍처');
    });

    it('should detect container-based architecture in summary', () => {
      const nodes = [
        makeNode('k8s-1', 'kubernetes', 'compute', 'K8s Cluster', 'internal'),
        makeNode('cont-1', 'container', 'compute', 'Container', 'internal'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('컨테이너 기반 아키텍처');
    });

    it('should detect security-focused architecture in summary', () => {
      const nodes = [
        makeNode('fw-1', 'firewall', 'security', 'Firewall', 'dmz'),
        makeNode('waf-1', 'waf', 'security', 'WAF', 'dmz'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('보안 중심 아키텍처');
    });

    it('should detect load-balancing architecture in summary', () => {
      const nodes = [
        makeNode('lb-1', 'load-balancer', 'network', 'LB', 'dmz'),
        makeNode('web-1', 'web-server', 'compute', 'Web Server', 'internal'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('로드밸런싱 아키텍처');
    });

    it('should fall back to default architecture label for unrecognized patterns', () => {
      const nodes = [
        makeNode('dns-1', 'dns', 'network', 'DNS', 'internal'),
        makeNode('iam-1', 'iam', 'auth', 'IAM', 'internal'),
      ];
      const edges: Edge[] = [];

      const context = buildContext(nodes, edges);

      expect(context.summary).toContain('인프라 다이어그램');
    });

    it('should handle nodes with multiple connections', () => {
      const nodes = [
        makeNode('a', 'firewall', 'security', 'A', 'dmz'),
        makeNode('b', 'web-server', 'compute', 'B', 'internal'),
        makeNode('c', 'app-server', 'compute', 'C', 'internal'),
      ];
      const edges = [makeEdge('a', 'b'), makeEdge('a', 'c')];

      const context = buildContext(nodes, edges);

      expect(context.nodes[0].connectedTo).toEqual(['b', 'c']);
      expect(context.nodes[1].connectedFrom).toEqual(['a']);
      expect(context.nodes[2].connectedFrom).toEqual(['a']);
    });
  });

  describe('contextToString', () => {
    it('should produce readable output with nodes and summary', () => {
      const context = {
        nodes: [
          {
            id: 'fw-1',
            type: 'firewall',
            label: 'Firewall',
            category: 'security',
            zone: 'dmz',
            connectedTo: ['web-1'],
            connectedFrom: [],
          },
          {
            id: 'web-1',
            type: 'web-server',
            label: 'Web Server',
            category: 'compute',
            zone: 'internal',
            connectedTo: [],
            connectedFrom: ['fw-1'],
          },
        ],
        connections: [{ source: 'fw-1', target: 'web-1' }],
        summary: '보안 중심 아키텍처 (총 2개 노드)',
      };

      const result = contextToString(context);

      expect(result).toContain('Nodes:');
      expect(result).toContain('fw-1 (firewall) [dmz] -> [web-1]');
      expect(result).toContain('web-1 (web-server) [internal] -> []');
      expect(result).toContain('Summary: 보안 중심 아키텍처 (총 2개 노드)');
    });

    it('should handle empty context', () => {
      const context = {
        nodes: [],
        connections: [],
        summary: '빈 다이어그램',
      };

      const result = contextToString(context);

      expect(result).toContain('Nodes:');
      expect(result).toContain('Summary: 빈 다이어그램');
    });

    it('should list multiple connected targets', () => {
      const context = {
        nodes: [
          {
            id: 'lb-1',
            type: 'load-balancer',
            label: 'LB',
            category: 'network',
            zone: 'dmz',
            connectedTo: ['web-1', 'web-2', 'web-3'],
            connectedFrom: [],
          },
        ],
        connections: [],
        summary: 'test',
      };

      const result = contextToString(context);

      expect(result).toContain('lb-1 (load-balancer) [dmz] -> [web-1, web-2, web-3]');
    });
  });
});
