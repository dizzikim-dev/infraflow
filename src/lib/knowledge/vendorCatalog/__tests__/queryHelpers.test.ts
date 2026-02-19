import { describe, it, expect } from 'vitest';
import type { ProductNode } from '../types';
import {
  findNodeById,
  getNodePath,
  getLeafNodes,
  getAllNodes,
  getNodesByDepth,
  countLeafNodes,
  getMaxDepth,
  searchNodes,
  computeStats,
} from '../queryHelpers';

// ---------------------------------------------------------------------------
// Test fixture: Cisco-style networking product tree
// ---------------------------------------------------------------------------
//
// networking (depth 0)
// └── switches (depth 1, infraNodeTypes: ['switch-l2', 'switch-l3'])
//     └── catalyst-9000 (depth 2)
//         ├── catalyst-9200 (depth 3, leaf, specs: {throughput: '480 Gbps'})
//         └── catalyst-9300 (depth 3, leaf, specs: {throughput: '960 Gbps'})
// ---------------------------------------------------------------------------

const catalyst9200: ProductNode = {
  nodeId: 'PN-SW-9200',
  depth: 3,
  depthLabel: 'Model',
  depthLabelKo: '모델',
  name: 'Catalyst 9200',
  nameKo: '카탈리스트 9200',
  description: 'Entry-level fixed switches for branch deployments',
  descriptionKo: '지사 배포용 엔트리 레벨 고정형 스위치',
  sourceUrl: 'https://cisco.com/catalyst-9200',
  specs: { throughput: '480 Gbps' },
  children: [],
};

const catalyst9300: ProductNode = {
  nodeId: 'PN-SW-9300',
  depth: 3,
  depthLabel: 'Model',
  depthLabelKo: '모델',
  name: 'Catalyst 9300',
  nameKo: '카탈리스트 9300',
  description: 'Stackable switches for campus and branch',
  descriptionKo: '캠퍼스 및 지사용 스택형 스위치',
  sourceUrl: 'https://cisco.com/catalyst-9300',
  specs: { throughput: '960 Gbps' },
  children: [],
};

const catalyst9000: ProductNode = {
  nodeId: 'PN-SW-9000',
  depth: 2,
  depthLabel: 'Product Line',
  depthLabelKo: '제품 라인',
  name: 'Catalyst 9000 Series',
  nameKo: '카탈리스트 9000 시리즈',
  description: 'Next-generation switching platform',
  descriptionKo: '차세대 스위칭 플랫폼',
  sourceUrl: 'https://cisco.com/catalyst-9000',
  children: [catalyst9200, catalyst9300],
};

const switches: ProductNode = {
  nodeId: 'PN-SW',
  depth: 1,
  depthLabel: 'Sub-Category',
  depthLabelKo: '하위 카테고리',
  name: 'Switches',
  nameKo: '스위치',
  description: 'Enterprise switching solutions',
  descriptionKo: '엔터프라이즈 스위칭 솔루션',
  sourceUrl: 'https://cisco.com/switches',
  infraNodeTypes: ['switch-l2', 'switch-l3'],
  children: [catalyst9000],
};

const networking: ProductNode = {
  nodeId: 'PN-NET',
  depth: 0,
  depthLabel: 'Category',
  depthLabelKo: '카테고리',
  name: 'Networking',
  nameKo: '네트워킹',
  description: 'Network infrastructure products',
  descriptionKo: '네트워크 인프라 제품',
  sourceUrl: 'https://cisco.com/networking',
  children: [switches],
};

const testTree: ProductNode[] = [networking];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('queryHelpers', () => {
  // -------------------------------------------------------------------------
  // findNodeById
  // -------------------------------------------------------------------------
  describe('findNodeById', () => {
    it('should find the root node by ID', () => {
      const result = findNodeById(testTree, 'PN-NET');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Networking');
    });

    it('should find a deeply nested node by ID', () => {
      const result = findNodeById(testTree, 'PN-SW-9300');
      expect(result).toBeDefined();
      expect(result!.name).toBe('Catalyst 9300');
    });

    it('should return undefined for an unknown ID', () => {
      const result = findNodeById(testTree, 'DOES-NOT-EXIST');
      expect(result).toBeUndefined();
    });

    it('should return undefined for an empty tree', () => {
      const result = findNodeById([], 'PN-NET');
      expect(result).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // getNodePath
  // -------------------------------------------------------------------------
  describe('getNodePath', () => {
    it('should return full path from root to a leaf node', () => {
      const path = getNodePath(testTree, 'PN-SW-9200');
      expect(path).toHaveLength(4);
      expect(path.map((n) => n.nodeId)).toEqual([
        'PN-NET',
        'PN-SW',
        'PN-SW-9000',
        'PN-SW-9200',
      ]);
    });

    it('should return single-element path for root node', () => {
      const path = getNodePath(testTree, 'PN-NET');
      expect(path).toHaveLength(1);
      expect(path[0].nodeId).toBe('PN-NET');
    });

    it('should return empty array for unknown ID', () => {
      const path = getNodePath(testTree, 'UNKNOWN');
      expect(path).toEqual([]);
    });

    it('should return empty array for empty tree', () => {
      const path = getNodePath([], 'PN-NET');
      expect(path).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // getLeafNodes
  // -------------------------------------------------------------------------
  describe('getLeafNodes', () => {
    it('should return only leaf nodes (nodes with empty children)', () => {
      const leaves = getLeafNodes(testTree);
      expect(leaves).toHaveLength(2);
      const ids = leaves.map((n) => n.nodeId).sort();
      expect(ids).toEqual(['PN-SW-9200', 'PN-SW-9300']);
    });

    it('should return empty array for empty tree', () => {
      expect(getLeafNodes([])).toEqual([]);
    });

    it('should treat a single root with no children as a leaf', () => {
      const singleNode: ProductNode = {
        ...networking,
        children: [],
      };
      const leaves = getLeafNodes([singleNode]);
      expect(leaves).toHaveLength(1);
      expect(leaves[0].nodeId).toBe('PN-NET');
    });
  });

  // -------------------------------------------------------------------------
  // getAllNodes
  // -------------------------------------------------------------------------
  describe('getAllNodes', () => {
    it('should flatten all nodes in the tree', () => {
      const all = getAllNodes(testTree);
      expect(all).toHaveLength(5);
      const ids = all.map((n) => n.nodeId).sort();
      expect(ids).toEqual([
        'PN-NET',
        'PN-SW',
        'PN-SW-9000',
        'PN-SW-9200',
        'PN-SW-9300',
      ]);
    });

    it('should return empty array for empty tree', () => {
      expect(getAllNodes([])).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // getNodesByDepth
  // -------------------------------------------------------------------------
  describe('getNodesByDepth', () => {
    it('should return nodes at depth 3', () => {
      const nodes = getNodesByDepth(testTree, 3);
      expect(nodes).toHaveLength(2);
      const ids = nodes.map((n) => n.nodeId).sort();
      expect(ids).toEqual(['PN-SW-9200', 'PN-SW-9300']);
    });

    it('should return single node at depth 0', () => {
      const nodes = getNodesByDepth(testTree, 0);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].nodeId).toBe('PN-NET');
    });

    it('should return empty array for non-existent depth', () => {
      const nodes = getNodesByDepth(testTree, 99);
      expect(nodes).toEqual([]);
    });

    it('should return empty array for empty tree', () => {
      expect(getNodesByDepth([], 0)).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // countLeafNodes
  // -------------------------------------------------------------------------
  describe('countLeafNodes', () => {
    it('should count 2 leaf nodes in the test tree', () => {
      expect(countLeafNodes(testTree)).toBe(2);
    });

    it('should return 0 for empty tree', () => {
      expect(countLeafNodes([])).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // getMaxDepth
  // -------------------------------------------------------------------------
  describe('getMaxDepth', () => {
    it('should return 3 for the test tree', () => {
      expect(getMaxDepth(testTree)).toBe(3);
    });

    it('should return 0 for empty tree', () => {
      expect(getMaxDepth([])).toBe(0);
    });

    it('should return 0 for a single root-only node', () => {
      const singleNode: ProductNode = { ...networking, children: [] };
      expect(getMaxDepth([singleNode])).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // searchNodes
  // -------------------------------------------------------------------------
  describe('searchNodes', () => {
    it('should find nodes by English name (case-insensitive)', () => {
      const results = searchNodes(testTree, 'catalyst');
      expect(results.length).toBeGreaterThanOrEqual(3);
      expect(results.some((n) => n.nodeId === 'PN-SW-9200')).toBe(true);
      expect(results.some((n) => n.nodeId === 'PN-SW-9300')).toBe(true);
      expect(results.some((n) => n.nodeId === 'PN-SW-9000')).toBe(true);
    });

    it('should find nodes by Korean name', () => {
      const results = searchNodes(testTree, '카탈리스트');
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should find nodes by nodeId', () => {
      const results = searchNodes(testTree, 'PN-SW-9300');
      expect(results).toHaveLength(1);
      expect(results[0].nodeId).toBe('PN-SW-9300');
    });

    it('should find nodes by description', () => {
      const results = searchNodes(testTree, 'branch');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find nodes by Korean description', () => {
      const results = searchNodes(testTree, '지사');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array when nothing matches', () => {
      const results = searchNodes(testTree, 'nonexistent-xyz-123');
      expect(results).toEqual([]);
    });

    it('should return empty array for empty tree', () => {
      expect(searchNodes([], 'anything')).toEqual([]);
    });

    it('should return empty array for empty query', () => {
      expect(searchNodes(testTree, '')).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // computeStats
  // -------------------------------------------------------------------------
  describe('computeStats', () => {
    it('should compute correct stats for the test tree', () => {
      const stats = computeStats(testTree);
      expect(stats.totalProducts).toBe(5);
      expect(stats.maxDepth).toBe(3);
      expect(stats.categoriesCount).toBe(1);
    });

    it('should return zeroed stats for empty tree', () => {
      const stats = computeStats([]);
      expect(stats.totalProducts).toBe(0);
      expect(stats.maxDepth).toBe(0);
      expect(stats.categoriesCount).toBe(0);
    });

    it('should count multiple root nodes as multiple categories', () => {
      const secondRoot: ProductNode = {
        ...networking,
        nodeId: 'PN-SEC',
        name: 'Security',
        nameKo: '보안',
        children: [],
      };
      const stats = computeStats([networking, secondRoot]);
      expect(stats.categoriesCount).toBe(2);
      expect(stats.totalProducts).toBe(6); // 5 from networking + 1 from security
    });
  });
});
