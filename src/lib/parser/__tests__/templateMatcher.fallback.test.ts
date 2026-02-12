import { describe, it, expect } from 'vitest';
import { parsePromptLocal } from '../templateMatcher';

describe('templateMatcher fallback behavior', () => {
  it('should return isFallback: true for unrecognized input', () => {
    const result = parsePromptLocal('알 수 없는 장비 구축');
    expect(result.isFallback).toBe(true);
    expect(result.success).toBe(false);
    expect(result.confidence).toBe(0.3);
    expect(result.error).toBeDefined();
  });

  it('should include fallback spec for optional use', () => {
    const result = parsePromptLocal('전혀 모르는 시스템');
    expect(result.isFallback).toBe(true);
    expect(result.spec).toBeDefined();
    expect(result.spec?.nodes).toBeDefined();
  });

  it('should NOT set isFallback for recognized templates', () => {
    const result = parsePromptLocal('3티어 웹 아키텍처');
    expect(result.isFallback).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  it('should NOT set isFallback for component detection', () => {
    const result = parsePromptLocal('방화벽이랑 라우터 연결해줘');
    expect(result.isFallback).toBeUndefined();
    expect(result.success).toBe(true);
    expect(result.confidence).toBe(0.5);
  });

  it('should include error message in Korean', () => {
    const result = parsePromptLocal('무작위 텍스트');
    expect(result.isFallback).toBe(true);
    expect(result.error).toContain('인식');
  });

  it('should set templateUsed to simple-waf for fallback', () => {
    const result = parsePromptLocal('완전히 새로운 개념');
    expect(result.isFallback).toBe(true);
    expect(result.templateUsed).toBe('simple-waf');
  });
});
