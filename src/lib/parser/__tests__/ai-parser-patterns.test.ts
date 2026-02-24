import { describe, it, expect } from 'vitest';
import { nodeTypePatterns } from '../patterns';
import { infraTemplates, templateKeywords } from '../templates';

describe('AI Parser Patterns', () => {
  const aiNodeTypes = [
    'gpu-server', 'ai-accelerator', 'edge-device', 'mobile-device',
    'ai-cluster', 'model-registry', 'inference-engine', 'vector-db',
    'ai-gateway', 'ai-orchestrator', 'embedding-service',
    'training-platform', 'prompt-manager', 'ai-monitor',
  ];

  it('should have patterns for all AI node types', () => {
    const patternTypes = nodeTypePatterns.map(p => p.type);
    for (const type of aiNodeTypes) {
      expect(patternTypes).toContain(type);
    }
  });

  it('should match Korean prompts for GPU server', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'gpu-server');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('GPU 서버')).toBe(true);
    expect(pattern!.pattern.test('gpu server')).toBe(true);
  });

  it('should match Korean prompts for inference engine', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'inference-engine');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('추론 엔진')).toBe(true);
    expect(pattern!.pattern.test('Ollama')).toBe(true);
    expect(pattern!.pattern.test('vllm')).toBe(true);
  });

  it('should match Korean prompts for vector DB', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'vector-db');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('벡터 DB')).toBe(true);
    expect(pattern!.pattern.test('ChromaDB')).toBe(true);
  });

  it('should match Korean prompts for edge device', () => {
    const pattern = nodeTypePatterns.find(p => p.type === 'edge-device');
    expect(pattern).toBeDefined();
    expect(pattern!.pattern.test('엣지 디바이스')).toBe(true);
    expect(pattern!.pattern.test('맥미니')).toBe(true);
    expect(pattern!.pattern.test('jetson')).toBe(true);
  });

  it('should have bilingual labels on all AI patterns', () => {
    for (const type of aiNodeTypes) {
      const pattern = nodeTypePatterns.find(p => p.type === type);
      expect(pattern?.labelKo).toBeTruthy();
    }
  });

  // Templates
  it('should have personal-ai template', () => {
    expect(infraTemplates['personal-ai']).toBeDefined();
    expect(infraTemplates['personal-ai'].nodes.length).toBeGreaterThan(0);
  });

  it('should have rag-pipeline template', () => {
    expect(infraTemplates['rag-pipeline']).toBeDefined();
  });

  it('should have enterprise-ai template', () => {
    expect(infraTemplates['enterprise-ai']).toBeDefined();
  });

  it('should have keywords for AI templates', () => {
    expect(templateKeywords['personal-ai']).toBeDefined();
    expect(templateKeywords['rag-pipeline']).toBeDefined();
    expect(templateKeywords['enterprise-ai']).toBeDefined();
  });
});
