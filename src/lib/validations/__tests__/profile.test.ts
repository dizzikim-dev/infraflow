import { describe, it, expect } from 'vitest';
import { ProjectProfileStoreSchema, validateProfileSafety } from '../profile';
import type { ProjectProfile, ProjectProfileStore } from '@/types/profile';

describe('ProjectProfileStoreSchema', () => {
  it('validates a minimal profile store', () => {
    const store: ProjectProfileStore = {
      version: 1,
      activeProfileId: null,
      profiles: [],
    };
    const result = ProjectProfileStoreSchema.safeParse(store);
    expect(result.success).toBe(true);
  });

  it('validates a store with one profile', () => {
    const store: ProjectProfileStore = {
      version: 1,
      activeProfileId: 'prof-1',
      profiles: [{
        id: 'prof-1',
        name: '금융권 프로젝트',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        industry: 'finance',
        companySize: 'enterprise',
      }],
    };
    const result = ProjectProfileStoreSchema.safeParse(store);
    expect(result.success).toBe(true);
  });

  it('rejects invalid version', () => {
    const store = { version: 99, activeProfileId: null, profiles: [] };
    const result = ProjectProfileStoreSchema.safeParse(store);
    expect(result.success).toBe(false);
  });
});

describe('validateProfileSafety', () => {
  it('passes for safe profile', () => {
    const profile: ProjectProfile = {
      id: 'p1', name: 'Test', createdAt: 0, updatedAt: 0,
      industry: 'finance', companySize: 'enterprise',
    };
    const result = validateProfileSafety(profile);
    expect(result.safe).toBe(true);
  });

  it('fails if name contains API key', () => {
    const profile: ProjectProfile = {
      id: 'p1', name: 'sk-proj-abc123def456ghi789jkl012mno', createdAt: 0, updatedAt: 0,
      industry: 'finance', companySize: 'enterprise',
    };
    const result = validateProfileSafety(profile);
    expect(result.safe).toBe(false);
  });
});
