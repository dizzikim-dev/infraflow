import { describe, it, expect } from 'vitest';
import {
  smartParse,
  createContext,
  updateContext,
  ConversationContext,
} from '@/lib/parser/UnifiedParser';
import { InfraSpec } from '@/types';

describe('UnifiedParser (smartParse)', () => {
  describe('smartParse', () => {
    it('should create new architecture when no context', () => {
      const context = createContext();
      const result = smartParse('3티어 웹 아키텍처', context);

      expect(result.success).toBe(true);
      expect(result.commandType).toBe('create');
      expect(result.spec).toBeDefined();
    });

    it('should detect add command', () => {
      const baseSpec: InfraSpec = {
        nodes: [
          { id: 'user', type: 'user', label: 'User' },
          { id: 'firewall', type: 'firewall', label: 'Firewall' },
        ],
        connections: [{ source: 'user', target: 'firewall' }],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      const result = smartParse('WAF 추가해줘', context);

      expect(result.commandType).toBe('add');
      expect(result.success).toBe(true);
      expect(result.spec?.nodes.length).toBeGreaterThan(baseSpec.nodes.length);
    });

    it('should detect remove command', () => {
      const baseSpec: InfraSpec = {
        nodes: [
          { id: 'user', type: 'user', label: 'User' },
          { id: 'waf', type: 'waf', label: 'WAF' },
          { id: 'web', type: 'web-server', label: 'Web Server' },
        ],
        connections: [
          { source: 'user', target: 'waf' },
          { source: 'waf', target: 'web' },
        ],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      const result = smartParse('WAF 삭제해줘', context);

      expect(result.commandType).toBe('remove');
      expect(result.success).toBe(true);
      expect(result.spec?.nodes.length).toBeLessThan(baseSpec.nodes.length);
    });

    it('should handle connect command', () => {
      const baseSpec: InfraSpec = {
        nodes: [
          { id: 'firewall', type: 'firewall', label: 'Firewall' },
          { id: 'web', type: 'web-server', label: 'Web Server' },
        ],
        connections: [],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      const result = smartParse('방화벽과 웹서버 연결해줘', context);

      expect(result.commandType).toBe('connect');
      expect(result.success).toBe(true);
      expect(result.spec?.connections.length).toBe(1);
    });

    it('should handle disconnect command', () => {
      const baseSpec: InfraSpec = {
        nodes: [
          { id: 'firewall', type: 'firewall', label: 'Firewall' },
          { id: 'web', type: 'web-server', label: 'Web Server' },
        ],
        connections: [{ source: 'firewall', target: 'web' }],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      // Pattern: /연결.*해제|끊어|disconnect|unlink/i
      const result = smartParse('방화벽과 웹서버 끊어줘', context);

      expect(result.commandType).toBe('disconnect');
      expect(result.success).toBe(true);
      expect(result.spec?.connections.length).toBe(0);
    });

    it('should return error when add without context', () => {
      const context = createContext();
      const result = smartParse('WAF 추가해줘', context);

      // Without currentSpec, should fallback to create
      expect(result.commandType).toBe('create');
    });

    it('should handle query command', () => {
      const baseSpec: InfraSpec = {
        nodes: [{ id: 'user', type: 'user', label: 'User' }],
        connections: [],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      const result = smartParse('현재 아키텍처에 뭐가 있어?', context);

      expect(result.commandType).toBe('query');
      expect(result.success).toBe(true);
    });

    it('should handle modify command', () => {
      const baseSpec: InfraSpec = {
        nodes: [{ id: 'firewall', type: 'firewall', label: 'Firewall' }],
        connections: [],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      // Pattern: /^(수정|변경|바꿔|modify|change|update)/i
      const result = smartParse('수정해줘 방화벽 이름을', context);

      expect(result.commandType).toBe('modify');
      expect(result.success).toBe(true);
      expect(result.modifications).toBeDefined();
    });

    it('should handle Korean add keywords', () => {
      const baseSpec: InfraSpec = {
        nodes: [{ id: 'user', type: 'user', label: 'User' }],
        connections: [],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      // Pattern: /(추가해줘|추가해|붙여줘|넣어줘|더해줘)$/i
      const prompts = ['방화벽 추가해줘', '방화벽 붙여줘', '방화벽 넣어줘', '방화벽 더해줘'];
      for (const prompt of prompts) {
        const result = smartParse(prompt, context);
        expect(result.commandType).toBe('add');
      }
    });

    it('should handle Korean remove keywords', () => {
      const baseSpec: InfraSpec = {
        nodes: [{ id: 'firewall', type: 'firewall', label: 'Firewall' }],
        connections: [],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: baseSpec,
      };

      // Pattern: /(삭제해줘|삭제해|제거해줘|제거해|없애줘|빼줘)$/i
      const prompts = ['방화벽 삭제해줘', '방화벽 제거해줘', '방화벽 없애줘', '방화벽 빼줘'];
      for (const prompt of prompts) {
        const result = smartParse(prompt, context);
        expect(result.commandType).toBe('remove');
      }
    });
  });

  describe('createContext', () => {
    it('should create empty context', () => {
      const context = createContext();

      expect(context.history).toEqual([]);
      expect(context.currentSpec).toBeNull();
    });
  });

  describe('updateContext', () => {
    it('should add result to history', () => {
      const context = createContext();
      const result = smartParse('3티어 아키텍처', context);

      const updatedContext = updateContext(context, '3티어 아키텍처', result);

      expect(updatedContext.history.length).toBe(1);
      expect(updatedContext.history[0].prompt).toBe('3티어 아키텍처');
    });

    it('should update currentSpec', () => {
      const context = createContext();
      const result = smartParse('3티어 아키텍처', context);

      const updatedContext = updateContext(context, '3티어 아키텍처', result);

      expect(updatedContext.currentSpec).toBeDefined();
      expect(updatedContext.currentSpec).toBe(result.spec);
    });

    it('should keep only last 10 history items', () => {
      let context = createContext();

      // Add 15 items
      for (let i = 0; i < 15; i++) {
        const result = smartParse(`prompt ${i}`, context);
        context = updateContext(context, `prompt ${i}`, result);
      }

      expect(context.history.length).toBe(10);
      // Should keep the most recent ones
      expect(context.history[0].prompt).toBe('prompt 5');
      expect(context.history[9].prompt).toBe('prompt 14');
    });

    it('should preserve currentSpec if result has no spec', () => {
      const existingSpec: InfraSpec = {
        nodes: [{ id: 'user', type: 'user', label: 'User' }],
        connections: [],
      };

      const context: ConversationContext = {
        history: [],
        currentSpec: existingSpec,
      };

      const result = smartParse('현재 아키텍처 뭐야?', context);
      const updatedContext = updateContext(context, '현재 아키텍처 뭐야?', result);

      // query command doesn't change spec
      expect(updatedContext.currentSpec).toBe(existingSpec);
    });
  });
});
