import { describe, it, expect } from 'vitest';
import { CreateDiagramSchema, UpdateDiagramSchema } from '@/lib/validations/diagram';

describe('CreateDiagramSchema', () => {
  const validInput = {
    title: 'My Diagram',
    spec: { nodes: [], connections: [] },
  };

  it('should accept valid input', () => {
    const result = CreateDiagramSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should accept input with optional fields', () => {
    const result = CreateDiagramSchema.safeParse({
      ...validInput,
      description: 'A test diagram',
      nodesJson: [{ id: '1', type: 'default' }],
      edgesJson: [{ id: 'e1', source: '1', target: '2' }],
      isPublic: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = CreateDiagramSchema.safeParse({ ...validInput, title: '' });
    expect(result.success).toBe(false);
  });

  it('should reject title exceeding 200 chars', () => {
    const result = CreateDiagramSchema.safeParse({ ...validInput, title: 'A'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('should reject missing spec', () => {
    const result = CreateDiagramSchema.safeParse({ title: 'Test' });
    expect(result.success).toBe(false);
  });

  it('should default isPublic to false', () => {
    const result = CreateDiagramSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isPublic).toBe(false);
    }
  });
});

describe('UpdateDiagramSchema', () => {
  it('should accept partial updates', () => {
    const result = UpdateDiagramSchema.safeParse({ title: 'New Title' });
    expect(result.success).toBe(true);
  });

  it('should accept spec-only update', () => {
    const result = UpdateDiagramSchema.safeParse({ spec: { nodes: [] } });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = UpdateDiagramSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept nullable fields', () => {
    const result = UpdateDiagramSchema.safeParse({
      description: null,
      thumbnail: null,
      nodesJson: null,
      edgesJson: null,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid title', () => {
    const result = UpdateDiagramSchema.safeParse({ title: '' });
    expect(result.success).toBe(false);
  });
});
