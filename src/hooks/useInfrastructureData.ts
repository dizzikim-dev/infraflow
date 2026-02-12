/**
 * 인프라 데이터 훅
 *
 * 데이터베이스에서 인프라 컴포넌트를 가져오고 캐싱합니다.
 * 정적 데이터를 폴백으로 사용하여 DB 연결 실패 시에도 작동합니다.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchComponents, fetchComponent } from '@/lib/data/componentService';
import { infrastructureDB, InfraComponent } from '@/lib/data/infrastructureDB';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('InfrastructureData');

/**
 * 모든 인프라 컴포넌트 훅
 *
 * @example
 * ```tsx
 * const { infrastructureDB, isLoading, error, refresh } = useInfrastructureData();
 * ```
 */
export function useInfrastructureData() {
  // Static infrastructureDB is already loaded in-memory — use it directly.
  // API fetch is only attempted when explicitly refreshed (e.g., after DB seeding).
  const [data, setData] = useState<Record<string, InfraComponent>>(infrastructureDB);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchComponents();
      setData(result);
      setError(null);
    } catch {
      // DB not available — silently use static fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    infrastructureDB: data,
    isLoading,
    error,
    refresh,
    isFromDB: data !== infrastructureDB && !error,
  };
}

/**
 * 단일 인프라 컴포넌트 훅
 *
 * @example
 * ```tsx
 * const { component, isLoading, error } = useInfraComponent('firewall');
 * ```
 */
export function useInfraComponent(componentId: string | null) {
  const localData = componentId ? infrastructureDB[componentId] ?? null : null;
  const [data, setData] = useState<InfraComponent | null>(localData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update from local DB when componentId changes
  useEffect(() => {
    setData(componentId ? infrastructureDB[componentId] ?? null : null);
  }, [componentId]);

  const refresh = useCallback(async () => {
    if (!componentId) return;
    setIsLoading(true);
    try {
      const result = await fetchComponent(componentId);
      setData(result);
      setError(null);
    } catch {
      // DB not available — silently use static fallback
    } finally {
      setIsLoading(false);
    }
  }, [componentId]);

  return {
    component: data || localData,
    isLoading,
    error,
    refresh,
  };
}

export default useInfrastructureData;
