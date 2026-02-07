import { describe, it, expect } from 'vitest';
import {
  parseIntentResponse,
  applyIntentToSpec,
  type IntentAnalysis,
  INTENT_ANALYSIS_PROMPT,
} from '@/lib/parser/intelligentParser';
import type { ConversationContext } from '@/lib/parser/UnifiedParser';
import type { InfraSpec } from '@/types';

describe('intelligentParser', () => {
  describe('parseIntentResponse', () => {
    it('should parse valid JSON directly', () => {
      const input = JSON.stringify({
        intent: 'create',
        confidence: 0.9,
        components: [
          { type: 'firewall', label: '방화벽' },
        ],
      });

      const result = parseIntentResponse(input);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('create');
      expect(result?.confidence).toBe(0.9);
      expect(result?.components).toHaveLength(1);
    });

    it('should extract JSON from markdown code block', () => {
      const input = `여기 분석 결과입니다:
\`\`\`json
{
  "intent": "add",
  "confidence": 0.85,
  "components": [{ "type": "waf", "label": "WAF" }]
}
\`\`\`
이렇게 추가하면 됩니다.`;

      const result = parseIntentResponse(input);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('add');
    });

    it('should extract JSON from code block without language', () => {
      const input = `\`\`\`
{
  "intent": "remove",
  "confidence": 0.75,
  "components": [{ "type": "firewall", "label": "방화벽" }]
}
\`\`\``;

      const result = parseIntentResponse(input);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('remove');
    });

    it('should find JSON object in mixed text', () => {
      const input = `분석 결과는 다음과 같습니다: {"intent": "modify", "confidence": 0.8, "components": []} 입니다.`;

      const result = parseIntentResponse(input);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('modify');
    });

    it('should return null for invalid JSON', () => {
      const input = 'This is not JSON at all';

      const result = parseIntentResponse(input);

      expect(result).toBeNull();
    });

    it('should return null for JSON missing required fields', () => {
      const input = JSON.stringify({
        intent: 'create',
        // missing confidence and components
      });

      const result = parseIntentResponse(input);

      expect(result).toBeNull();
    });

    it('should return null for invalid intent type', () => {
      const input = JSON.stringify({
        intent: 'invalid_intent',
        confidence: 0.5,
        components: [],
      });

      const result = parseIntentResponse(input);

      expect(result).toBeNull();
    });

    it('should parse all valid intent types', () => {
      const intents = ['create', 'add', 'remove', 'modify', 'connect', 'disconnect', 'query'];

      for (const intent of intents) {
        const input = JSON.stringify({
          intent,
          confidence: 0.9,
          components: [],
        });

        const result = parseIntentResponse(input);
        expect(result?.intent).toBe(intent);
      }
    });
  });

  describe('applyIntentToSpec', () => {
    const createContext = (currentSpec: InfraSpec | null = null): ConversationContext => ({
      currentSpec,
      history: [],
    });

    describe('create intent', () => {
      it('should create new spec with components', () => {
        const intent: IntentAnalysis = {
          intent: 'create',
          confidence: 0.95,
          components: [
            { type: 'firewall', label: '방화벽' },
            { type: 'web-server', label: '웹서버' },
          ],
        };

        const result = applyIntentToSpec(intent, createContext());

        expect(result.success).toBe(true);
        expect(result.spec?.nodes).toHaveLength(3); // user + firewall + web-server
        expect(result.spec?.connections.length).toBeGreaterThan(0);
      });

      it('should add user node automatically', () => {
        const intent: IntentAnalysis = {
          intent: 'create',
          confidence: 0.9,
          components: [{ type: 'firewall', label: '방화벽' }],
        };

        const result = applyIntentToSpec(intent, createContext());

        const hasUser = result.spec?.nodes.some((n) => n.type === 'user');
        expect(hasUser).toBe(true);
      });

      it('should create linear connections between nodes', () => {
        const intent: IntentAnalysis = {
          intent: 'create',
          confidence: 0.9,
          components: [
            { type: 'firewall', label: '방화벽' },
            { type: 'web-server', label: '웹서버' },
            { type: 'db-server', label: 'DB서버' },
          ],
        };

        const result = applyIntentToSpec(intent, createContext());

        // user -> firewall -> web-server -> db-server = 3 connections
        expect(result.spec?.connections.length).toBe(3);
      });
    });

    describe('add intent', () => {
      const existingSpec: InfraSpec = {
        nodes: [
          { id: 'firewall-1', type: 'firewall', label: '방화벽' },
          { id: 'web-1', type: 'web-server', label: '웹서버' },
        ],
        connections: [{ source: 'firewall-1', target: 'web-1' }],
      };

      it('should fail without existing spec', () => {
        const intent: IntentAnalysis = {
          intent: 'add',
          confidence: 0.9,
          components: [{ type: 'waf', label: 'WAF' }],
        };

        const result = applyIntentToSpec(intent, createContext());

        expect(result.success).toBe(false);
        expect(result.error).toContain('먼저');
      });

      it('should add component to existing spec', () => {
        const intent: IntentAnalysis = {
          intent: 'add',
          confidence: 0.9,
          components: [{ type: 'waf', label: 'WAF' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(true);
        expect(result.spec?.nodes.length).toBe(3);
        expect(result.modifications).toHaveLength(1);
      });

      it('should fail when no components specified', () => {
        const intent: IntentAnalysis = {
          intent: 'add',
          confidence: 0.9,
          components: [],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(false);
      });
    });

    describe('remove intent', () => {
      const existingSpec: InfraSpec = {
        nodes: [
          { id: 'firewall-1', type: 'firewall', label: '방화벽' },
          { id: 'web-1', type: 'web-server', label: '웹서버' },
        ],
        connections: [{ source: 'firewall-1', target: 'web-1' }],
      };

      it('should fail without existing spec', () => {
        const intent: IntentAnalysis = {
          intent: 'remove',
          confidence: 0.9,
          components: [{ type: 'firewall', label: '방화벽' }],
        };

        const result = applyIntentToSpec(intent, createContext());

        expect(result.success).toBe(false);
      });

      it('should remove component from existing spec', () => {
        const intent: IntentAnalysis = {
          intent: 'remove',
          confidence: 0.9,
          components: [{ type: 'firewall', label: '방화벽' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(true);
        expect(result.spec?.nodes.length).toBe(1);
        expect(result.spec?.nodes[0].type).toBe('web-server');
      });

      it('should remove connections when node is removed', () => {
        const intent: IntentAnalysis = {
          intent: 'remove',
          confidence: 0.9,
          components: [{ type: 'firewall', label: '방화벽' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.spec?.connections.length).toBe(0);
      });

      it('should fail when component not found', () => {
        const intent: IntentAnalysis = {
          intent: 'remove',
          confidence: 0.9,
          components: [{ type: 'waf', label: 'WAF' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(false);
      });
    });

    describe('modify intent', () => {
      const existingSpec: InfraSpec = {
        nodes: [
          { id: 'firewall-1', type: 'firewall', label: '방화벽' },
        ],
        connections: [],
      };

      it('should modify component in existing spec', () => {
        const intent: IntentAnalysis = {
          intent: 'modify',
          confidence: 0.9,
          components: [{ type: 'firewall', label: '새 방화벽', description: '업데이트됨' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(true);
        expect(result.spec?.nodes[0].label).toBe('새 방화벽');
        expect(result.spec?.nodes[0].description).toBe('업데이트됨');
      });

      it('should fail when component not found', () => {
        const intent: IntentAnalysis = {
          intent: 'modify',
          confidence: 0.9,
          components: [{ type: 'waf', label: 'WAF' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(false);
      });
    });

    describe('connect intent', () => {
      const existingSpec: InfraSpec = {
        nodes: [
          { id: 'firewall-1', type: 'firewall', label: '방화벽' },
          { id: 'web-1', type: 'web-server', label: '웹서버' },
        ],
        connections: [],
      };

      it('should connect two components', () => {
        const intent: IntentAnalysis = {
          intent: 'connect',
          confidence: 0.9,
          components: [
            { type: 'firewall', label: '방화벽' },
            { type: 'web-server', label: '웹서버' },
          ],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(true);
        expect(result.spec?.connections.length).toBe(1);
      });

      it('should fail with only one component', () => {
        const intent: IntentAnalysis = {
          intent: 'connect',
          confidence: 0.9,
          components: [{ type: 'firewall', label: '방화벽' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(false);
      });
    });

    describe('disconnect intent', () => {
      const existingSpec: InfraSpec = {
        nodes: [
          { id: 'firewall-1', type: 'firewall', label: '방화벽' },
          { id: 'web-1', type: 'web-server', label: '웹서버' },
        ],
        connections: [{ source: 'firewall-1', target: 'web-1' }],
      };

      it('should disconnect two components', () => {
        const intent: IntentAnalysis = {
          intent: 'disconnect',
          confidence: 0.9,
          components: [
            { type: 'firewall', label: '방화벽' },
            { type: 'web-server', label: '웹서버' },
          ],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(true);
        expect(result.spec?.connections.length).toBe(0);
      });

      it('should fail with only one component', () => {
        const intent: IntentAnalysis = {
          intent: 'disconnect',
          confidence: 0.9,
          components: [{ type: 'firewall', label: '방화벽' }],
        };

        const result = applyIntentToSpec(intent, createContext(existingSpec));

        expect(result.success).toBe(false);
      });
    });

    describe('query intent', () => {
      it('should return success with query info', () => {
        const intent: IntentAnalysis = {
          intent: 'query',
          confidence: 0.9,
          components: [],
          reasoning: '현재 아키텍처 정보 질의',
        };

        const result = applyIntentToSpec(intent, createContext());

        expect(result.success).toBe(true);
        expect(result.commandType).toBe('query');
      });
    });
  });

  describe('INTENT_ANALYSIS_PROMPT', () => {
    it('should contain all valid intent types', () => {
      expect(INTENT_ANALYSIS_PROMPT).toContain('create');
      expect(INTENT_ANALYSIS_PROMPT).toContain('add');
      expect(INTENT_ANALYSIS_PROMPT).toContain('remove');
      expect(INTENT_ANALYSIS_PROMPT).toContain('modify');
      expect(INTENT_ANALYSIS_PROMPT).toContain('connect');
      expect(INTENT_ANALYSIS_PROMPT).toContain('disconnect');
      expect(INTENT_ANALYSIS_PROMPT).toContain('query');
    });

    it('should contain component types', () => {
      expect(INTENT_ANALYSIS_PROMPT).toContain('firewall');
      expect(INTENT_ANALYSIS_PROMPT).toContain('waf');
      expect(INTENT_ANALYSIS_PROMPT).toContain('web-server');
      expect(INTENT_ANALYSIS_PROMPT).toContain('db-server');
    });
  });
});
