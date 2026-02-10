/**
 * NodeFactory Tests
 *
 * Tests for the node factory pattern implementation
 */

import { describe, it, expect } from 'vitest';
import {
  nodeConfigs,
  getNodeConfig,
  getNodeConfigsByCategory,
  nodeConfigMap,
} from '@/components/nodes/nodeConfig';
import {
  nodeTypes,
  generatedNodeComponents,
  getNodeComponent,
  FirewallNode,
  RouterNode,
  WebServerNode,
  UserNode,
} from '@/components/nodes/NodeFactory';

describe('nodeConfig', () => {
  describe('nodeConfigs', () => {
    it('should have all expected node types', () => {
      expect(nodeConfigs.length).toBeGreaterThanOrEqual(27);
    });

    it('should have required properties for each config', () => {
      nodeConfigs.forEach((config) => {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('category');
        expect(config).toHaveProperty('color');
        expect(config).toHaveProperty('icon');
      });
    });

    it('should have unique IDs', () => {
      const ids = nodeConfigs.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getNodeConfig', () => {
    it('should return config for valid ID', () => {
      const config = getNodeConfig('firewall');
      expect(config).toBeDefined();
      expect(config?.id).toBe('firewall');
      expect(config?.category).toBe('security');
    });

    it('should return undefined for invalid ID', () => {
      const config = getNodeConfig('non-existent');
      expect(config).toBeUndefined();
    });
  });

  describe('getNodeConfigsByCategory', () => {
    it('should return security nodes', () => {
      const securityNodes = getNodeConfigsByCategory('security');
      expect(securityNodes.length).toBeGreaterThanOrEqual(6);
      securityNodes.forEach((node) => {
        expect(node.category).toBe('security');
      });
    });

    it('should return network nodes', () => {
      const networkNodes = getNodeConfigsByCategory('network');
      expect(networkNodes.length).toBeGreaterThanOrEqual(7);
      networkNodes.forEach((node) => {
        expect(node.category).toBe('network');
      });
    });

    it('should return compute nodes', () => {
      const computeNodes = getNodeConfigsByCategory('compute');
      expect(computeNodes.length).toBeGreaterThanOrEqual(6);
      computeNodes.forEach((node) => {
        expect(node.category).toBe('compute');
      });
    });

    it('should return empty array for non-existent category', () => {
      const nodes = getNodeConfigsByCategory('non-existent' as any);
      expect(nodes).toEqual([]);
    });
  });

  describe('nodeConfigMap', () => {
    it('should provide quick lookup by ID', () => {
      expect(nodeConfigMap['firewall']).toBeDefined();
      expect(nodeConfigMap['router']).toBeDefined();
      expect(nodeConfigMap['web-server']).toBeDefined();
    });

    it('should have same count as nodeConfigs', () => {
      expect(Object.keys(nodeConfigMap).length).toBe(nodeConfigs.length);
    });
  });
});

describe('NodeFactory', () => {
  describe('generatedNodeComponents', () => {
    it('should generate components for all configs', () => {
      nodeConfigs.forEach((config) => {
        expect(generatedNodeComponents[config.id]).toBeDefined();
        expect(typeof generatedNodeComponents[config.id]).toBe('object'); // memo returns object
      });
    });
  });

  describe('nodeTypes', () => {
    it('should include all generated components', () => {
      nodeConfigs.forEach((config) => {
        expect(nodeTypes[config.id]).toBeDefined();
      });
    });

    it('should include legacy aliases', () => {
      // Legacy camelCase aliases
      expect(nodeTypes['webServer']).toBeDefined();
      expect(nodeTypes['appServer']).toBeDefined();
      expect(nodeTypes['dbServer']).toBeDefined();
    });

    it('should have same component for alias and original', () => {
      expect(nodeTypes['webServer']).toBe(nodeTypes['web-server']);
      expect(nodeTypes['appServer']).toBe(nodeTypes['app-server']);
      expect(nodeTypes['dbServer']).toBe(nodeTypes['db-server']);
    });
  });

  describe('getNodeComponent', () => {
    it('should return component for valid ID', () => {
      const component = getNodeComponent('firewall');
      expect(component).toBeDefined();
    });

    it('should return component for legacy alias', () => {
      const component = getNodeComponent('webServer');
      expect(component).toBeDefined();
    });

    it('should return undefined for invalid ID', () => {
      const component = getNodeComponent('non-existent');
      expect(component).toBeUndefined();
    });
  });

  describe('named exports', () => {
    it('should export FirewallNode', () => {
      expect(FirewallNode).toBeDefined();
      expect(FirewallNode).toBe(generatedNodeComponents['firewall']);
    });

    it('should export RouterNode', () => {
      expect(RouterNode).toBeDefined();
      expect(RouterNode).toBe(generatedNodeComponents['router']);
    });

    it('should export WebServerNode', () => {
      expect(WebServerNode).toBeDefined();
      expect(WebServerNode).toBe(generatedNodeComponents['web-server']);
    });

    it('should export UserNode', () => {
      expect(UserNode).toBeDefined();
      expect(UserNode).toBe(generatedNodeComponents['user']);
    });
  });
});

describe('Node Configuration Integrity', () => {
  it('should have valid category for all nodes', () => {
    const validCategories = ['security', 'network', 'compute', 'cloud', 'storage', 'auth', 'external', 'zone', 'telecom', 'wan'];
    nodeConfigs.forEach((config) => {
      expect(validCategories).toContain(config.category);
    });
  });

  it('should have security nodes with red color', () => {
    const securityNodes = getNodeConfigsByCategory('security');
    securityNodes.forEach((node) => {
      expect(node.color).toBe('red');
    });
  });

  it('should have network nodes with blue color', () => {
    const networkNodes = getNodeConfigsByCategory('network');
    networkNodes.forEach((node) => {
      expect(node.color).toBe('blue');
    });
  });

  it('should have compute nodes with green color', () => {
    const computeNodes = getNodeConfigsByCategory('compute');
    computeNodes.forEach((node) => {
      expect(node.color).toBe('green');
    });
  });
});
