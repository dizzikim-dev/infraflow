import { describe, it, expect } from 'vitest';
import { FALLBACK_TEMPLATES, matchFallbackTemplate } from '@/lib/llm/fallbackTemplates';

describe('FALLBACK_TEMPLATES', () => {
  it('should have 3tier template', () => {
    expect(FALLBACK_TEMPLATES['3tier']).toBeDefined();
    expect(FALLBACK_TEMPLATES['3tier'].nodes.length).toBeGreaterThan(0);
    expect(FALLBACK_TEMPLATES['3tier'].connections.length).toBeGreaterThan(0);
  });

  it('should have web-secure template', () => {
    expect(FALLBACK_TEMPLATES['web-secure']).toBeDefined();
    const types = FALLBACK_TEMPLATES['web-secure'].nodes.map(n => n.type);
    expect(types).toContain('firewall');
    expect(types).toContain('waf');
  });

  it('should have vdi template', () => {
    expect(FALLBACK_TEMPLATES['vdi']).toBeDefined();
    const types = FALLBACK_TEMPLATES['vdi'].nodes.map(n => n.type);
    expect(types).toContain('vpn-gateway');
  });

  it('should have default template', () => {
    expect(FALLBACK_TEMPLATES['default']).toBeDefined();
  });
});

describe('matchFallbackTemplate', () => {
  it('should match VDI prompt', () => {
    const result = matchFallbackTemplate('VDI architecture');
    expect(result).toBe(FALLBACK_TEMPLATES['vdi']);
  });

  it('should match 가상데스크톱 prompt', () => {
    const result = matchFallbackTemplate('가상데스크톱 환경');
    expect(result).toBe(FALLBACK_TEMPLATES['vdi']);
  });

  it('should match 3-tier prompt', () => {
    const result = matchFallbackTemplate('3-tier web app');
    expect(result).toBe(FALLBACK_TEMPLATES['3tier']);
  });

  it('should match 3티어 prompt', () => {
    const result = matchFallbackTemplate('3티어 아키텍처');
    expect(result).toBe(FALLBACK_TEMPLATES['3tier']);
  });

  it('should match three tier prompt', () => {
    const result = matchFallbackTemplate('three tier architecture');
    expect(result).toBe(FALLBACK_TEMPLATES['3tier']);
  });

  it('should match WAF prompt to web-secure', () => {
    const result = matchFallbackTemplate('web with WAF');
    expect(result).toBe(FALLBACK_TEMPLATES['web-secure']);
  });

  it('should match 보안 prompt to web-secure', () => {
    const result = matchFallbackTemplate('보안 아키텍처');
    expect(result).toBe(FALLBACK_TEMPLATES['web-secure']);
  });

  it('should match secure prompt to web-secure', () => {
    const result = matchFallbackTemplate('secure web application');
    expect(result).toBe(FALLBACK_TEMPLATES['web-secure']);
  });

  it('should fall back to default for unknown prompts', () => {
    const result = matchFallbackTemplate('something completely different');
    expect(result).toBe(FALLBACK_TEMPLATES['default']);
  });

  it('should be case-insensitive', () => {
    const result = matchFallbackTemplate('VDI Architecture');
    expect(result).toBe(FALLBACK_TEMPLATES['vdi']);
  });
});
