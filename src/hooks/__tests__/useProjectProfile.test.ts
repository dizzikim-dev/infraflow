import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectProfile } from '../useProjectProfile';
import type { ProjectProfile } from '@/types/profile';

const makeProfile = (id: string, name: string): ProjectProfile => ({
  id, name, createdAt: Date.now(), updatedAt: Date.now(),
  industry: 'finance', companySize: 'enterprise',
});

describe('useProjectProfile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty state', () => {
    const { result } = renderHook(() => useProjectProfile());
    expect(result.current.profiles).toEqual([]);
    expect(result.current.activeProfile).toBeNull();
  });

  it('creates a profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
    });
    expect(result.current.profiles).toHaveLength(1);
    expect(result.current.profiles[0].name).toBe('금융권');
  });

  it('sets active profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
      result.current.setActiveProfileId('p1');
    });
    expect(result.current.activeProfile?.id).toBe('p1');
  });

  it('updates a profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
      result.current.updateProfile('p1', { name: '보험업' });
    });
    expect(result.current.profiles[0].name).toBe('보험업');
  });

  it('deletes a profile', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
      result.current.deleteProfile('p1');
    });
    expect(result.current.profiles).toHaveLength(0);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
    });
    const stored = JSON.parse(localStorage.getItem('infraflow-profiles') || '{}');
    expect(stored.profiles).toHaveLength(1);
  });

  it('exports profiles as JSON', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      result.current.createProfile(makeProfile('p1', '금융권'));
    });
    const json = result.current.exportJSON();
    expect(json).toContain('"version": 1');
    expect(json).toContain('금융권');
  });

  it('imports profiles from JSON', () => {
    const { result } = renderHook(() => useProjectProfile());
    const json = JSON.stringify({
      version: 1,
      activeProfileId: 'p1',
      profiles: [makeProfile('p1', 'Imported')],
    });
    act(() => {
      const importResult = result.current.importJSON(json);
      expect(importResult.success).toBe(true);
    });
    expect(result.current.profiles).toHaveLength(1);
    expect(result.current.profiles[0].name).toBe('Imported');
  });

  it('rejects import with sensitive data', () => {
    const { result } = renderHook(() => useProjectProfile());
    const json = JSON.stringify({
      version: 1,
      activeProfileId: null,
      profiles: [makeProfile('p1', 'sk-proj-abc123def456ghi789jkl012mno')],
    });
    act(() => {
      const importResult = result.current.importJSON(json);
      expect(importResult.success).toBe(false);
    });
  });

  it('rejects profile creation with sensitive data', () => {
    const { result } = renderHook(() => useProjectProfile());
    act(() => {
      const createResult = result.current.createProfile(
        makeProfile('p1', 'password=secret123')
      );
      expect(createResult.success).toBe(false);
    });
    expect(result.current.profiles).toHaveLength(0);
  });
});
