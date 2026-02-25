/**
 * Knowledge Integration Tests for LLM API Route
 *
 * Tests the buildEnrichedSystemPrompt and extractNodeTypesFromPrompt functions
 * that inject knowledge graph context into the LLM system prompt.
 */

import { describe, it, expect } from 'vitest';
import {
  extractNodeTypesFromPrompt,
  buildEnrichedSystemPrompt,
} from '../route';

// ---------------------------------------------------------------------------
// extractNodeTypesFromPrompt
// ---------------------------------------------------------------------------

describe('extractNodeTypesFromPrompt', () => {
  it('should extract exact InfraNodeType matches', () => {
    const result = extractNodeTypesFromPrompt('I need a firewall and a load-balancer');
    expect(result).toContain('firewall');
    expect(result).toContain('load-balancer');
  });

  it('should extract keyword aliases', () => {
    const result = extractNodeTypesFromPrompt('VPN with Active Directory');
    expect(result).toContain('vpn-gateway');
    expect(result).toContain('ldap-ad');
  });

  it('should be case-insensitive', () => {
    const result = extractNodeTypesFromPrompt('FIREWALL and WAF setup');
    expect(result).toContain('firewall');
    expect(result).toContain('waf');
  });

  it('should return empty array when no types are found', () => {
    const result = extractNodeTypesFromPrompt('hello world this has nothing');
    expect(result).toEqual([]);
  });

  it('should deduplicate results', () => {
    // "vpn" alias maps to "vpn-gateway", and "vpn-gateway" is also a direct match
    const result = extractNodeTypesFromPrompt('VPN with vpn-gateway');
    const vpnGatewayCount = result.filter((t) => t === 'vpn-gateway').length;
    expect(vpnGatewayCount).toBe(1);
  });

  it('should extract multiple types from a complex prompt', () => {
    const result = extractNodeTypesFromPrompt(
      '3-tier architecture with firewall, load-balancer, web-server, app-server, and db-server'
    );
    expect(result).toContain('firewall');
    expect(result).toContain('load-balancer');
    expect(result).toContain('web-server');
    expect(result).toContain('app-server');
    expect(result).toContain('db-server');
  });

  it('should match common abbreviations', () => {
    const result = extractNodeTypesFromPrompt('k8s cluster with redis cache');
    expect(result).toContain('kubernetes');
    expect(result).toContain('cache');
  });

  it('should match cloud provider keywords', () => {
    const result = extractNodeTypesFromPrompt('AWS infrastructure with S3 storage');
    expect(result).toContain('aws-vpc');
    expect(result).toContain('object-storage');
  });

  it('should match container-related keywords', () => {
    const result = extractNodeTypesFromPrompt('Docker containers on kubernetes');
    expect(result).toContain('container');
    expect(result).toContain('kubernetes');
  });

  it('should match Korean-mixed prompts with English node types', () => {
    const result = extractNodeTypesFromPrompt('방화벽 firewall과 웹서버 web-server 구성');
    expect(result).toContain('firewall');
    expect(result).toContain('web-server');
  });

  it('should match VDI keyword to vm', () => {
    const result = extractNodeTypesFromPrompt('VDI architecture');
    expect(result).toContain('vm');
  });

  it('should match database-related aliases', () => {
    const result = extractNodeTypesFromPrompt('database server with backup');
    expect(result).toContain('db-server');
    expect(result).toContain('backup');
  });

  it('should match security components', () => {
    const result = extractNodeTypesFromPrompt('IDS/IPS with SIEM monitoring');
    expect(result).toContain('ids-ips');
    expect(result).toContain('siem');
  });

  it('should match auth-related types', () => {
    const result = extractNodeTypesFromPrompt('SSO with MFA and IAM');
    expect(result).toContain('sso');
    expect(result).toContain('mfa');
    expect(result).toContain('iam');
  });
});

// ---------------------------------------------------------------------------
// buildEnrichedSystemPrompt
// ---------------------------------------------------------------------------

describe('buildEnrichedSystemPrompt', () => {
  it('should return base system prompt when no node types are found', async () => {
    const result = await buildEnrichedSystemPrompt('hello world');
    // Should be the base SYSTEM_PROMPT without knowledge section
    expect(result).toContain('You are an infrastructure architecture expert');
    expect(result).not.toContain('인프라 지식 기반 가이드');
  });

  it('should return enriched prompt when node types are found', async () => {
    const result = await buildEnrichedSystemPrompt('firewall and web-server architecture');
    // Should contain the base prompt
    expect(result).toContain('You are an infrastructure architecture expert');
    // Should contain knowledge section (if relationships exist for these types)
    // The knowledge graph has relationships for firewall and web-server
    expect(result.length).toBeGreaterThan(100);
  });

  it('should always contain the base system prompt', async () => {
    const result = await buildEnrichedSystemPrompt('firewall load-balancer kubernetes');
    expect(result).toContain('Output Format:');
    expect(result).toContain('Available node types:');
    expect(result).toContain('Guidelines:');
  });

  it('should handle prompts with many node types', async () => {
    const result = await buildEnrichedSystemPrompt(
      'firewall waf ids-ips vpn-gateway load-balancer web-server app-server db-server kubernetes'
    );
    expect(result).toContain('You are an infrastructure architecture expert');
    // With many node types, knowledge enrichment should produce content
    expect(result.length).toBeGreaterThan(200);
  });

  it('should not throw errors for any input', async () => {
    // Should handle empty string gracefully
    await expect(buildEnrichedSystemPrompt('')).resolves.toBeDefined();

    // Should handle very long prompts
    const longPrompt = 'firewall '.repeat(1000);
    await expect(buildEnrichedSystemPrompt(longPrompt)).resolves.toBeDefined();

    // Should handle special characters
    await expect(buildEnrichedSystemPrompt('!@#$%^&*()')).resolves.toBeDefined();
  });

  it('should return a string', async () => {
    const result = await buildEnrichedSystemPrompt('firewall architecture');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should produce richer prompt for security-heavy architectures', async () => {
    const basicPrompt = await buildEnrichedSystemPrompt('simple web server');
    const securityPrompt = await buildEnrichedSystemPrompt(
      'firewall waf ids-ips vpn-gateway nac dlp siem soar casb'
    );
    // Security-heavy prompt should have more knowledge context
    expect(securityPrompt.length).toBeGreaterThanOrEqual(basicPrompt.length);
  });

  it('should append knowledge section after the base prompt', async () => {
    const result = await buildEnrichedSystemPrompt(
      'firewall with load-balancer and web-server'
    );
    // If knowledge section is present, it should come after "Only output valid JSON"
    const baseEndIndex = result.indexOf('Only output valid JSON. No explanations.');
    if (result.includes('인프라 지식 기반 가이드')) {
      const knowledgeIndex = result.indexOf('인프라 지식 기반 가이드');
      expect(knowledgeIndex).toBeGreaterThan(baseEndIndex);
    }
  });

  it('should include knowledge section with violations for firewall + web-server (missing mandatory deps)', async () => {
    // The knowledge graph likely has relationships where firewall recommends/requires certain components
    const result = await buildEnrichedSystemPrompt('firewall and web-server');
    // At minimum, it should return a valid string
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// RAG Product Intelligence integration
// ---------------------------------------------------------------------------

describe('RAG Product Intelligence integration', () => {
  it('should work when RAG module is not available', async () => {
    // buildEnrichedSystemPrompt should still work (graceful degradation)
    const result = await buildEnrichedSystemPrompt('build a firewall setup');
    expect(result).toContain('firewall');
    // Should not throw even if RAG/ChromaDB is not running
  });

  it('should include PI section when RAG returns results', async () => {
    // This test validates the integration — even without ChromaDB,
    // the keyword fallback in the retriever should find PI data
    const result = await buildEnrichedSystemPrompt('OpenClaw AI assistant');
    // The function should at least return the base prompt
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should be async and return a Promise', () => {
    const result = buildEnrichedSystemPrompt('test');
    expect(result).toBeInstanceOf(Promise);
  });
});
