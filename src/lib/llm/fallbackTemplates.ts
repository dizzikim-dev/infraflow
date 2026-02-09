/**
 * Fallback templates for common infrastructure architecture patterns.
 *
 * These templates are used when LLM is unavailable or fails, providing
 * predefined infrastructure specifications for common request patterns.
 *
 * @module lib/llm/fallbackTemplates
 */

import type { InfraSpec } from '@/types';

/**
 * Predefined templates for common architecture patterns.
 *
 * Available templates:
 * - `3tier`: Standard 3-tier web architecture with LB, web, app, and DB layers
 * - `web-secure`: Secure web architecture with firewall and WAF
 * - `vdi`: Virtual Desktop Infrastructure with VPN and AD
 * - `default`: Basic firewall-protected server setup
 */
export const FALLBACK_TEMPLATES: Record<string, InfraSpec> = {
  '3tier': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', zone: 'dmz' },
      { id: 'web', type: 'web-server', label: 'Web Server', zone: 'internal' },
      { id: 'app', type: 'app-server', label: 'App Server', zone: 'internal' },
      { id: 'db', type: 'db-server', label: 'DB Server', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'lb' },
      { source: 'lb', target: 'web' },
      { source: 'web', target: 'app' },
      { source: 'app', target: 'db' },
    ],
  },
  'web-secure': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'fw', type: 'firewall', label: 'Firewall', zone: 'dmz' },
      { id: 'waf', type: 'waf', label: 'WAF', zone: 'dmz' },
      { id: 'lb', type: 'load-balancer', label: 'Load Balancer', zone: 'dmz' },
      { id: 'web', type: 'web-server', label: 'Web Server', zone: 'internal' },
      { id: 'db', type: 'db-server', label: 'DB Server', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'fw' },
      { source: 'fw', target: 'waf' },
      { source: 'waf', target: 'lb' },
      { source: 'lb', target: 'web' },
      { source: 'web', target: 'db' },
    ],
  },
  'vdi': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'vpn', type: 'vpn-gateway', label: 'VPN Gateway', zone: 'dmz' },
      { id: 'fw', type: 'firewall', label: 'Firewall', zone: 'internal' },
      { id: 'vdi', type: 'vm', label: 'VDI Server', zone: 'internal' },
      { id: 'ad', type: 'ldap-ad', label: 'Active Directory', zone: 'internal' },
      { id: 'storage', type: 'storage', label: 'Storage', zone: 'data' },
    ],
    connections: [
      { source: 'user', target: 'vpn' },
      { source: 'vpn', target: 'fw' },
      { source: 'fw', target: 'vdi' },
      { source: 'vdi', target: 'ad' },
      { source: 'vdi', target: 'storage' },
    ],
  },
  'default': {
    nodes: [
      { id: 'user', type: 'user', label: 'User' },
      { id: 'fw', type: 'firewall', label: 'Firewall', zone: 'dmz' },
      { id: 'server', type: 'web-server', label: 'Server', zone: 'internal' },
    ],
    connections: [
      { source: 'user', target: 'fw' },
      { source: 'fw', target: 'server' },
    ],
  },
};

/**
 * Matches a prompt to the most appropriate fallback template.
 *
 * Uses keyword matching to determine which template best fits
 * the user's request when LLM is unavailable.
 *
 * @param prompt - The user's infrastructure description
 * @returns The matching template specification
 */
export function matchFallbackTemplate(prompt: string): InfraSpec {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('vdi') || lowerPrompt.includes('가상데스크톱')) {
    return FALLBACK_TEMPLATES['vdi'];
  }

  if (
    lowerPrompt.includes('3티어') ||
    lowerPrompt.includes('3-tier') ||
    lowerPrompt.includes('three tier')
  ) {
    return FALLBACK_TEMPLATES['3tier'];
  }

  if (
    lowerPrompt.includes('waf') ||
    lowerPrompt.includes('보안') ||
    lowerPrompt.includes('secure')
  ) {
    return FALLBACK_TEMPLATES['web-secure'];
  }

  return FALLBACK_TEMPLATES['default'];
}
