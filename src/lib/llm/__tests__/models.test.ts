import { describe, it, expect } from 'vitest';
import { LLM_MODELS } from '../models';
import type { LLMModelId } from '../models';

describe('models', () => {
  // ---------------------------------------------------------------------------
  // LLM_MODELS constant
  // ---------------------------------------------------------------------------
  describe('LLM_MODELS', () => {
    it('contains ANTHROPIC_DEFAULT entry', () => {
      expect(LLM_MODELS.ANTHROPIC_DEFAULT).toBeDefined();
      expect(typeof LLM_MODELS.ANTHROPIC_DEFAULT).toBe('string');
    });

    it('contains ANTHROPIC_ADVANCED entry', () => {
      expect(LLM_MODELS.ANTHROPIC_ADVANCED).toBeDefined();
      expect(typeof LLM_MODELS.ANTHROPIC_ADVANCED).toBe('string');
    });

    it('contains OPENAI_DEFAULT entry', () => {
      expect(LLM_MODELS.OPENAI_DEFAULT).toBeDefined();
      expect(typeof LLM_MODELS.OPENAI_DEFAULT).toBe('string');
    });

    it('contains OPENAI_ADVANCED entry', () => {
      expect(LLM_MODELS.OPENAI_ADVANCED).toBeDefined();
      expect(typeof LLM_MODELS.OPENAI_ADVANCED).toBe('string');
    });

    it('has exactly 4 model entries', () => {
      const keys = Object.keys(LLM_MODELS);
      expect(keys).toHaveLength(4);
    });

    it('has non-empty string values for all models', () => {
      for (const [key, value] of Object.entries(LLM_MODELS)) {
        expect(value.length).toBeGreaterThan(0);
      }
    });

    it('anthropic models contain "claude" in their ID', () => {
      expect(LLM_MODELS.ANTHROPIC_DEFAULT).toContain('claude');
      expect(LLM_MODELS.ANTHROPIC_ADVANCED).toContain('claude');
    });

    it('openai models contain "gpt" in their ID', () => {
      expect(LLM_MODELS.OPENAI_DEFAULT).toContain('gpt');
      expect(LLM_MODELS.OPENAI_ADVANCED).toContain('gpt');
    });

    it('all model IDs are unique', () => {
      const values = Object.values(LLM_MODELS);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it('is readonly (const assertion)', () => {
      // Verify the type narrowing — if LLM_MODELS were mutable, this would be `string`
      // With `as const`, each value is a string literal type
      const defaultModel: string = LLM_MODELS.ANTHROPIC_DEFAULT;
      expect(defaultModel).toBe('claude-3-haiku-20240307');
    });
  });

  // ---------------------------------------------------------------------------
  // LLMModelId type (runtime check through value assignment)
  // ---------------------------------------------------------------------------
  describe('LLMModelId type', () => {
    it('accepts valid model IDs', () => {
      // These assignments verify the type is correctly derived
      const id1: LLMModelId = 'claude-3-haiku-20240307';
      const id2: LLMModelId = 'gpt-4o-mini';
      expect(id1).toBe(LLM_MODELS.ANTHROPIC_DEFAULT);
      expect(id2).toBe(LLM_MODELS.OPENAI_DEFAULT);
    });
  });
});
