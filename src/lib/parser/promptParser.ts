import { InfraSpec, InfraNodeSpec, ConnectionSpec } from '@/types';
import { infraTemplates, templateKeywords } from './templates';

export interface ParseResult {
  success: boolean;
  spec?: InfraSpec;
  templateUsed?: string;
  error?: string;
  confidence: number;
}

/**
 * Parse a natural language prompt and return an infrastructure specification.
 * Currently uses keyword matching; will be enhanced with LLM integration.
 */
export function parsePrompt(prompt: string): ParseResult {
  const normalizedPrompt = prompt.toLowerCase().trim();

  // Try to match templates by keywords
  for (const [templateId, keywords] of Object.entries(templateKeywords)) {
    for (const keyword of keywords) {
      if (normalizedPrompt.includes(keyword.toLowerCase())) {
        const template = infraTemplates[templateId];
        if (template) {
          return {
            success: true,
            spec: template,
            templateUsed: templateId,
            confidence: 0.8,
          };
        }
      }
    }
  }

  // If no template matched, try to parse components from the prompt
  const parsedSpec = parseCustomPrompt(normalizedPrompt);
  if (parsedSpec) {
    return {
      success: true,
      spec: parsedSpec,
      confidence: 0.5,
    };
  }

  // Default fallback - simple architecture
  return {
    success: true,
    spec: infraTemplates['simple-waf'],
    templateUsed: 'simple-waf',
    confidence: 0.3,
  };
}

/**
 * Parse custom prompts by detecting component keywords
 */
function parseCustomPrompt(prompt: string): InfraSpec | null {
  const nodes: InfraNodeSpec[] = [];
  const connections: ConnectionSpec[] = [];

  // Component detection patterns
  const componentPatterns: Array<{
    pattern: RegExp;
    type: string;
    label: string;
  }> = [
    { pattern: /user|사용자|유저/i, type: 'user', label: 'User' },
    { pattern: /firewall|방화벽|fw/i, type: 'firewall', label: 'Firewall' },
    { pattern: /waf|웹방화벽/i, type: 'waf', label: 'WAF' },
    { pattern: /load ?balancer|로드밸런서|lb/i, type: 'load-balancer', label: 'Load Balancer' },
    { pattern: /web ?server|웹서버/i, type: 'web-server', label: 'Web Server' },
    { pattern: /app ?server|앱서버|애플리케이션/i, type: 'app-server', label: 'App Server' },
    { pattern: /database|db|데이터베이스|디비/i, type: 'db-server', label: 'Database' },
    { pattern: /cdn/i, type: 'cdn', label: 'CDN' },
    { pattern: /vpn/i, type: 'vpn-gateway', label: 'VPN Gateway' },
    { pattern: /router|라우터/i, type: 'router', label: 'Router' },
    { pattern: /switch|스위치/i, type: 'switch-l3', label: 'Switch' },
    { pattern: /ldap|ad|active ?directory/i, type: 'ldap-ad', label: 'LDAP/AD' },
    { pattern: /container|컨테이너|docker/i, type: 'container', label: 'Container' },
    { pattern: /kubernetes|k8s|쿠버네티스/i, type: 'kubernetes', label: 'Kubernetes' },
    { pattern: /storage|스토리지|저장소/i, type: 'storage', label: 'Storage' },
    { pattern: /cache|캐시|redis/i, type: 'cache', label: 'Cache' },
  ];

  // Detect components
  let nodeIndex = 0;
  for (const { pattern, type, label } of componentPatterns) {
    if (pattern.test(prompt)) {
      nodes.push({
        id: `${type}-${nodeIndex}`,
        type: type as InfraNodeSpec['type'],
        label,
      });
      nodeIndex++;
    }
  }

  // If no components detected, return null
  if (nodes.length === 0) {
    return null;
  }

  // Always add a user node at the start if not present
  if (!nodes.some((n) => n.type === 'user')) {
    nodes.unshift({ id: 'user', type: 'user', label: 'User' });
  }

  // Create sequential connections
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({
      source: nodes[i].id,
      target: nodes[i + 1].id,
      flowType: 'request',
    });
  }

  return { nodes, connections };
}

/**
 * Get a list of available template names
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(infraTemplates);
}

/**
 * Get a specific template by name
 */
export function getTemplate(name: string): InfraSpec | null {
  return infraTemplates[name] || null;
}
