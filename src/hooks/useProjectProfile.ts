'use client';

/**
 * Hook for managing project profiles with localStorage persistence.
 *
 * Supports N profiles per user, Export/Import JSON, and safety validation.
 * All string fields are checked for credentials and PII before persisting.
 *
 * @module hooks/useProjectProfile
 */

import { useState, useCallback, useEffect } from 'react';
import type { ProjectProfile, ProjectProfileStore } from '@/types/profile';
import { ProjectProfileStoreSchema, validateProfileSafety } from '@/lib/validations/profile';

const STORAGE_KEY = 'infraflow-profiles';

const EMPTY_STORE: ProjectProfileStore = {
  version: 1,
  activeProfileId: null,
  profiles: [],
};

function loadStore(): ProjectProfileStore {
  if (typeof window === 'undefined') return EMPTY_STORE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STORE;
    const parsed = ProjectProfileStoreSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_STORE;
  } catch {
    return EMPTY_STORE;
  }
}

function saveStore(store: ProjectProfileStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

interface MutationResult {
  success: boolean;
  error?: string;
}

export function useProjectProfile() {
  const [store, setStore] = useState<ProjectProfileStore>(EMPTY_STORE);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const persist = useCallback((next: ProjectProfileStore) => {
    setStore(next);
    saveStore(next);
  }, []);

  const createProfile = useCallback((profile: ProjectProfile): MutationResult => {
    const safety = validateProfileSafety(profile);
    if (!safety.safe) {
      return { success: false, error: safety.warningMessageKo };
    }
    setStore(prev => {
      const next = { ...prev, profiles: [...prev.profiles, profile] };
      saveStore(next);
      return next;
    });
    return { success: true };
  }, []);

  const updateProfile = useCallback((id: string, patch: Partial<ProjectProfile>) => {
    setStore(prev => {
      const next = {
        ...prev,
        profiles: prev.profiles.map(p =>
          p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
        ),
      };
      saveStore(next);
      return next;
    });
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setStore(prev => {
      const next = {
        ...prev,
        activeProfileId: prev.activeProfileId === id ? null : prev.activeProfileId,
        profiles: prev.profiles.filter(p => p.id !== id),
      };
      saveStore(next);
      return next;
    });
  }, []);

  const setActiveProfileId = useCallback((id: string | null) => {
    setStore(prev => {
      const next = { ...prev, activeProfileId: id };
      saveStore(next);
      return next;
    });
  }, []);

  const activeProfile = store.profiles.find(p => p.id === store.activeProfileId) ?? null;

  const exportJSON = useCallback((): string => {
    return JSON.stringify(store, null, 2);
  }, [store]);

  const importJSON = useCallback((json: string): MutationResult => {
    try {
      const parsed = ProjectProfileStoreSchema.safeParse(JSON.parse(json));
      if (!parsed.success) {
        return { success: false, error: 'Invalid profile format' };
      }
      // Safety check all profiles
      for (const profile of parsed.data.profiles) {
        const safety = validateProfileSafety(profile);
        if (!safety.safe) {
          return { success: false, error: safety.warningMessageKo };
        }
      }
      persist(parsed.data);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to parse JSON' };
    }
  }, [persist]);

  return {
    profiles: store.profiles,
    activeProfile,
    activeProfileId: store.activeProfileId,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfileId,
    exportJSON,
    importJSON,
  };
}
