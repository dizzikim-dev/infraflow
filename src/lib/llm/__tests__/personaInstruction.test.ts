// src/lib/llm/__tests__/personaInstruction.test.ts
import { describe, it, expect } from 'vitest';
import { PERSONA_PRESETS, buildPersonaInstruction } from '../personaInstruction';

describe('PERSONA_PRESETS', () => {
  it('has 10 presets matching P1-P10', () => {
    expect(PERSONA_PRESETS).toHaveLength(10);
  });

  it('each preset has all required fields', () => {
    for (const preset of PERSONA_PRESETS) {
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.nameKo).toBeDefined();
      expect(['summary', 'standard', 'detailed']).toContain(preset.depth);
      expect(['cost-schedule', 'security-compliance', 'operations-sre', 'learning']).toContain(preset.focus);
      expect(['consulting', 'learning']).toContain(preset.tone);
    }
  });
});

describe('buildPersonaInstruction', () => {
  it('returns empty string for undefined persona', () => {
    expect(buildPersonaInstruction(undefined)).toBe('');
  });

  it('includes depth instruction for CTO', () => {
    const cto = PERSONA_PRESETS.find(p => p.id === 'p1-cto')!;
    const instruction = buildPersonaInstruction(cto);
    expect(instruction).toContain('Depth');
    expect(instruction).toContain('standard');
  });

  it('includes security focus for CISO', () => {
    const ciso = PERSONA_PRESETS.find(p => p.id === 'p5-security')!;
    const instruction = buildPersonaInstruction(ciso);
    expect(instruction).toContain('보안');
  });

  it('includes learning tone for student', () => {
    const student = PERSONA_PRESETS.find(p => p.id === 'p8-student')!;
    const instruction = buildPersonaInstruction(student);
    expect(instruction).toContain('교육');
  });

  it('always includes the IMPORTANT guard clause', () => {
    const cto = PERSONA_PRESETS.find(p => p.id === 'p1-cto')!;
    const instruction = buildPersonaInstruction(cto);
    expect(instruction).toContain('Facts');
    expect(instruction).toContain('do NOT change');
  });
});
