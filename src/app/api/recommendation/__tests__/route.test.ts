/**
 * Vendor Recommendation API Route Tests
 *
 * Tests the POST /api/recommendation endpoint for matching vendor products
 * to infrastructure specifications, and the GET status endpoint.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { clearAllRateLimits } from '@/lib/middleware/rateLimiter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/recommendation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin: 'http://localhost:3000',
      host: 'localhost:3000',
    },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/recommendation', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  // ── Valid requests ──

  it('should return recommendations for a spec with a firewall node', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'Primary Firewall', tier: 'dmz' },
        ],
        connections: [],
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.nodeRecommendations).toBeDefined();
    expect(Array.isArray(data.data.nodeRecommendations)).toBe(true);
    expect(typeof data.data.totalProductsEvaluated).toBe('number');
    expect(typeof data.data.totalMatches).toBe('number');
    expect(Array.isArray(data.data.unmatchedNodes)).toBe(true);
  });

  it('should return empty results for an empty nodes array', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [],
        connections: [],
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.nodeRecommendations).toHaveLength(0);
    expect(data.data.totalProductsEvaluated).toBe(0);
    expect(data.data.totalMatches).toBe(0);
    expect(data.data.unmatchedNodes).toHaveLength(0);
  });

  it('should default connections to empty array when omitted', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'Firewall' },
        ],
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  // ── Filtering options ──

  it('should filter results by vendorId', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'Firewall', tier: 'dmz' },
        ],
        connections: [],
      },
      vendorId: 'cisco',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // If there are recommendations, they should all be from cisco
    if (data.data.nodeRecommendations.length > 0) {
      for (const nodeRec of data.data.nodeRecommendations) {
        for (const rec of nodeRec.recommendations) {
          expect(rec.vendorId).toBe('cisco');
        }
      }
    }
  });

  it('should filter results by minScore', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'Firewall', tier: 'dmz' },
        ],
        connections: [],
      },
      minScore: 80,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // All returned recommendations should have score >= 80
    if (data.data.nodeRecommendations.length > 0) {
      for (const nodeRec of data.data.nodeRecommendations) {
        for (const rec of nodeRec.recommendations) {
          expect(rec.score.overall).toBeGreaterThanOrEqual(80);
        }
      }
    }
  });

  it('should limit results with maxPerNode', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'Firewall', tier: 'dmz' },
        ],
        connections: [],
      },
      maxPerNode: 2,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    if (data.data.nodeRecommendations.length > 0) {
      for (const nodeRec of data.data.nodeRecommendations) {
        expect(nodeRec.recommendations.length).toBeLessThanOrEqual(2);
      }
    }
  });

  // ── Response structure ──

  it('should return correct response structure with all required fields', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [
          { id: 'fw-1', type: 'firewall', label: 'Firewall', tier: 'dmz' },
          { id: 'sw-1', type: 'switch-l3', label: 'Core Switch', tier: 'internal' },
        ],
        connections: [
          { source: 'fw-1', target: 'sw-1' },
        ],
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('nodeRecommendations');
    expect(data.data).toHaveProperty('totalProductsEvaluated');
    expect(data.data).toHaveProperty('totalMatches');
    expect(data.data).toHaveProperty('unmatchedNodes');

    // Check nodeRecommendation structure if present
    if (data.data.nodeRecommendations.length > 0) {
      const nodeRec = data.data.nodeRecommendations[0];
      expect(nodeRec).toHaveProperty('nodeId');
      expect(nodeRec).toHaveProperty('nodeType');
      expect(nodeRec).toHaveProperty('nodeLabel');
      expect(nodeRec).toHaveProperty('recommendations');

      if (nodeRec.recommendations.length > 0) {
        const rec = nodeRec.recommendations[0];
        expect(rec).toHaveProperty('product');
        expect(rec).toHaveProperty('vendorId');
        expect(rec).toHaveProperty('vendorName');
        expect(rec).toHaveProperty('path');
        expect(rec).toHaveProperty('score');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('reasonKo');

        // Score breakdown
        expect(rec.score).toHaveProperty('overall');
        expect(rec.score).toHaveProperty('breakdown');
        expect(rec.score.breakdown).toHaveProperty('typeMatch');
        expect(rec.score.breakdown).toHaveProperty('architectureRoleFit');
        expect(rec.score.breakdown).toHaveProperty('useCaseOverlap');
        expect(rec.score.breakdown).toHaveProperty('haFeatureMatch');
      }
    }
  });

  it('should add nodes to unmatchedNodes when no products match', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [
          { id: 'ldap-1', type: 'ldap-ad', label: 'Active Directory' },
        ],
        connections: [],
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.unmatchedNodes.length).toBeGreaterThanOrEqual(1);

    const unmatched = data.data.unmatchedNodes.find(
      (n: { nodeId: string }) => n.nodeId === 'ldap-1',
    );
    if (unmatched) {
      expect(unmatched.nodeType).toBe('ldap-ad');
      expect(unmatched.nodeLabel).toBe('Active Directory');
    }
  });

  // ── Error handling ──

  it('should return 400 for invalid request body (missing spec)', async () => {
    const request = makePostRequest({
      vendorId: 'cisco',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should return 400 for invalid spec shape (nodes not array)', async () => {
    const request = makePostRequest({
      spec: {
        nodes: 'not-an-array',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.details).toBeDefined();
    expect(Array.isArray(data.details)).toBe(true);
  });

  it('should return 400 for invalid spec node (missing required fields)', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [{ id: 'fw-1' }], // missing type and label
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for invalid minScore range', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }],
      },
      minScore: 150, // exceeds max of 100
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for invalid maxPerNode (less than 1)', async () => {
    const request = makePostRequest({
      spec: {
        nodes: [{ id: 'fw-1', type: 'firewall', label: 'FW' }],
      },
      maxPerNode: 0,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should return 400 for completely invalid JSON body', async () => {
    const request = new NextRequest('http://localhost:3000/api/recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'http://localhost:3000',
        host: 'localhost:3000',
      },
      body: 'not valid json{{{',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid JSON');
  });
});

// ---------------------------------------------------------------------------
// GET /api/recommendation
// ---------------------------------------------------------------------------

describe('GET /api/recommendation', () => {
  it('should return status information', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.available).toBe(true);
    expect(data.description).toBeDefined();
    expect(data.usage).toBeDefined();
  });
});
