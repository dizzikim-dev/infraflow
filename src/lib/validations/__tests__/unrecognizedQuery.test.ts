import { describe, it, expect } from 'vitest';
import {
  logUnrecognizedSchema,
  unrecognizedQuerySchema,
  createUnrecognizedQuerySchema,
  updateUnrecognizedQuerySchema,
} from '../unrecognizedQuery';

describe('logUnrecognizedSchema', () => {
  it('should accept valid log input', () => {
    const result = logUnrecognizedSchema.safeParse({
      query: 'CCTV 회선 설치',
      confidence: 0.3,
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional sessionId', () => {
    const result = logUnrecognizedSchema.safeParse({
      query: 'test query',
      confidence: 0.3,
      sessionId: 'session-123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty query', () => {
    const result = logUnrecognizedSchema.safeParse({
      query: '',
      confidence: 0.3,
    });
    expect(result.success).toBe(false);
  });

  it('should reject confidence > 1', () => {
    const result = logUnrecognizedSchema.safeParse({
      query: 'test',
      confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject confidence < 0', () => {
    const result = logUnrecognizedSchema.safeParse({
      query: 'test',
      confidence: -0.1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject query longer than 1000 chars', () => {
    const result = logUnrecognizedSchema.safeParse({
      query: 'x'.repeat(1001),
      confidence: 0.3,
    });
    expect(result.success).toBe(false);
  });
});

describe('unrecognizedQuerySchema', () => {
  it('should accept default query params', () => {
    const result = unrecognizedQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sortBy).toBe('createdAt');
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should accept isResolved filter', () => {
    const result = unrecognizedQuerySchema.safeParse({ isResolved: 'true' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid isResolved value', () => {
    const result = unrecognizedQuerySchema.safeParse({ isResolved: 'maybe' });
    expect(result.success).toBe(false);
  });
});

describe('createUnrecognizedQuerySchema', () => {
  it('should accept valid creation input', () => {
    const result = createUnrecognizedQuerySchema.safeParse({
      query: 'test query',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.confidence).toBe(0.3); // default
    }
  });
});

describe('updateUnrecognizedQuerySchema', () => {
  it('should accept admin notes update', () => {
    const result = updateUnrecognizedQuerySchema.safeParse({
      adminNotes: 'This should be a CCTV type',
      suggestedType: 'cctv-camera',
      isResolved: true,
    });
    expect(result.success).toBe(true);
  });

  it('should accept partial update', () => {
    const result = updateUnrecognizedQuerySchema.safeParse({
      isResolved: true,
    });
    expect(result.success).toBe(true);
  });

  it('should reject adminNotes longer than 2000 chars', () => {
    const result = updateUnrecognizedQuerySchema.safeParse({
      adminNotes: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
