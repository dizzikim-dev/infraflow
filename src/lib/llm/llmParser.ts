import { InfraSpec, InfraNodeSpec, ConnectionSpec } from '@/types';

export interface LLMConfig {
  provider: 'claude' | 'openai';
  apiKey: string;
  model?: string;
}

export interface LLMParseResult {
  success: boolean;
  spec?: InfraSpec;
  error?: string;
  rawResponse?: string;
}

const SYSTEM_PROMPT = `You are an infrastructure architecture expert. Parse the user's natural language description and convert it into a structured JSON specification.

Output Format:
{
  "nodes": [
    { "id": "unique-id", "type": "node-type", "label": "Display Name", "zone": "optional-zone" }
  ],
  "connections": [
    { "source": "node-id", "target": "node-id", "flowType": "request|response|sync|blocked|encrypted", "label": "optional" }
  ],
  "zones": [
    { "id": "zone-id", "label": "Zone Name", "type": "dmz|internal|external|db|custom" }
  ]
}

Available node types:
- Security: firewall, waf, ids-ips, vpn-gateway, nac, dlp
- Network: router, switch-l2, switch-l3, load-balancer, sd-wan, dns, cdn
- Compute: web-server, app-server, db-server, container, vm, kubernetes
- Cloud: aws-vpc, azure-vnet, gcp-network, private-cloud
- Storage: san-nas, object-storage, backup, cache, storage
- Auth: ldap-ad, sso, mfa, iam
- External: user, internet

Guidelines:
1. Always start with a "user" node for client-facing architectures
2. Use logical flow from left to right (user -> security -> compute -> database)
3. Include appropriate security layers (firewall, WAF) for web architectures
4. Use descriptive labels in Korean when the input is in Korean
5. Create realistic connection flows based on the architecture type

Only output valid JSON. No explanations.`;

/**
 * Parse prompt using Claude API
 */
export async function parseWithClaude(
  prompt: string,
  apiKey: string,
  model: string = 'claude-3-haiku-20240307'
): Promise<LLMParseResult> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Convert this infrastructure description to JSON:\n\n${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `API Error: ${response.status} - ${error}`,
      };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return {
        success: false,
        error: 'No response from API',
      };
    }

    // Parse JSON from response
    const spec = parseJSONResponse(content);

    if (!spec) {
      return {
        success: false,
        error: 'Failed to parse JSON response',
        rawResponse: content,
      };
    }

    return {
      success: true,
      spec,
      rawResponse: content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse prompt using OpenAI API
 */
export async function parseWithOpenAI(
  prompt: string,
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<LLMParseResult> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Convert this infrastructure description to JSON:\n\n${prompt}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `API Error: ${response.status} - ${error}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: 'No response from API',
      };
    }

    const spec = parseJSONResponse(content);

    if (!spec) {
      return {
        success: false,
        error: 'Failed to parse JSON response',
        rawResponse: content,
      };
    }

    return {
      success: true,
      spec,
      rawResponse: content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
function parseJSONResponse(content: string): InfraSpec | null {
  try {
    // Try direct parse first
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        return null;
      }
    }

    // Try to find JSON object in response
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        return null;
      }
    }

    return null;
  }
}

/**
 * Unified LLM parser
 */
export async function parseWithLLM(
  prompt: string,
  config: LLMConfig
): Promise<LLMParseResult> {
  switch (config.provider) {
    case 'claude':
      return parseWithClaude(prompt, config.apiKey, config.model);
    case 'openai':
      return parseWithOpenAI(prompt, config.apiKey, config.model);
    default:
      return {
        success: false,
        error: `Unknown provider: ${config.provider}`,
      };
  }
}

/**
 * Check if LLM is configured
 */
export function isLLMConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
    process.env.NEXT_PUBLIC_OPENAI_API_KEY
  );
}

/**
 * Get default LLM config from environment
 */
export function getDefaultLLMConfig(): LLMConfig | null {
  if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
    return {
      provider: 'claude',
      apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      model: 'claude-3-haiku-20240307',
    };
  }

  if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      model: 'gpt-4o-mini',
    };
  }

  return null;
}
