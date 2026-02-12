/**
 * useCloudCatalog Hook
 *
 * Provides cloud service catalog data and deprecation warnings via server-side API.
 * Data processing runs server-side to reduce client bundle size.
 */

import { useCallback } from 'react';
import type { InfraSpec, InfraNodeType } from '@/types/infra';
import type {
  DeprecationWarning,
  ServiceComparison,
  CloudService,
  CloudProvider,
} from '@/lib/knowledge/cloudCatalog';
import { useFetchAnalysis } from './useFetchAnalysis';

export interface UseCloudCatalogResult {
  deprecationWarnings: DeprecationWarning[];
  getServicesForType: (type: InfraNodeType, provider?: CloudProvider) => Promise<CloudService[]>;
  compareServicesForType: (type: InfraNodeType) => Promise<ServiceComparison | null>;
  isLoading: boolean;
}

export function useCloudCatalog(spec: InfraSpec | null): UseCloudCatalogResult {
  const { result: deprecationWarnings, isLoading } = useFetchAnalysis<DeprecationWarning[]>(
    spec,
    {
      endpoint: '/api/analyze/cloud',
      buildBody: () => ({ spec, action: 'deprecations' }),
      extractResult: (data) => (data.deprecationWarnings as DeprecationWarning[]) ?? [],
      defaultResult: [],
    },
  );

  const getServicesForType = useCallback(
    async (type: InfraNodeType, provider?: CloudProvider): Promise<CloudService[]> => {
      try {
        const res = await fetch('/api/analyze/cloud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'services', componentType: type, provider }),
        });
        const data = await res.json();
        return data.services ?? [];
      } catch {
        return [];
      }
    },
    [],
  );

  const compareServicesForType = useCallback(
    async (type: InfraNodeType): Promise<ServiceComparison | null> => {
      try {
        const res = await fetch('/api/analyze/cloud', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'compare', componentType: type }),
        });
        const data = await res.json();
        return data.comparison ?? null;
      } catch {
        return null;
      }
    },
    [],
  );

  return { deprecationWarnings, getServicesForType, compareServicesForType, isLoading };
}
