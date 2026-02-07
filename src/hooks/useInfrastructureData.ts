/**
 * 인프라 데이터 SWR 훅
 *
 * 데이터베이스에서 인프라 컴포넌트를 가져오고 캐싱합니다.
 * 정적 데이터를 폴백으로 사용하여 DB 연결 실패 시에도 작동합니다.
 */

'use client';

import useSWR from 'swr';
import { fetchComponents, fetchComponent } from '@/lib/data/componentService';
import { infrastructureDB, InfraComponent } from '@/lib/data/infrastructureDB';

// SWR 캐시 키
const INFRASTRUCTURE_KEY = 'infrastructure-components';

/**
 * 모든 인프라 컴포넌트 훅
 *
 * @example
 * ```tsx
 * const { infrastructureDB, isLoading, error, refresh } = useInfrastructureData();
 * ```
 */
export function useInfrastructureData() {
  const { data, error, isLoading, mutate } = useSWR<Record<string, InfraComponent>>(
    INFRASTRUCTURE_KEY,
    fetchComponents,
    {
      // 정적 데이터를 폴백으로 사용
      fallbackData: infrastructureDB,
      // 포커스 시 자동 갱신 비활성화 (성능)
      revalidateOnFocus: false,
      // 중복 요청 방지 (1분)
      dedupingInterval: 60000,
      // 에러 시 재시도
      errorRetryCount: 3,
      // 재시도 간격
      errorRetryInterval: 5000,
      // 에러 시에도 기존 데이터 유지
      keepPreviousData: true,
    }
  );

  return {
    // DB 데이터 또는 정적 폴백
    infrastructureDB: data || infrastructureDB,
    isLoading,
    error,
    // 수동 갱신 함수
    refresh: mutate,
    // DB 데이터 사용 여부
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
  const { data, error, isLoading, mutate } = useSWR<InfraComponent | null>(
    componentId ? `component-${componentId}` : null,
    componentId ? () => fetchComponent(componentId) : null,
    {
      // 정적 데이터에서 폴백
      fallbackData: componentId ? infrastructureDB[componentId] || null : null,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }
  );

  return {
    component: data || (componentId ? infrastructureDB[componentId] : null),
    isLoading,
    error,
    refresh: mutate,
  };
}

/**
 * 인프라 데이터 캐시 무효화
 *
 * Admin에서 데이터 수정 후 호출하여 캐시를 갱신합니다.
 */
export function invalidateInfrastructureCache() {
  // SWR 글로벌 뮤테이트를 사용하여 캐시 무효화
  const { mutate } = useSWR(INFRASTRUCTURE_KEY);
  mutate();
}

export default useInfrastructureData;
