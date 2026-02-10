/**
 * useCloudCatalog Hook
 *
 * Provides cloud service catalog data and deprecation warnings via server-side API.
 * Data processing runs server-side to reduce client bundle size.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { InfraSpec, InfraNodeType } from '@/types/infra';
import type {
  DeprecationWarning,
  ServiceComparison,
  CloudService,
  CloudProvider,
} from '@/lib/knowledge/cloudCatalog';

export interface UseCloudCatalogResult {
  deprecationWarnings: DeprecationWarning[];
  getServicesForType: (type: InfraNodeType, provider?: CloudProvider) => Promise<CloudService[]>;
  compareServicesForType: (type: InfraNodeType) => Promise<ServiceComparison | null>;
  isLoading: boolean;
}

export function useCloudCatalog(spec: InfraSpec | null): UseCloudCatalogResult {
  const [deprecationWarnings, setDeprecationWarnings] = useState<DeprecationWarning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!spec || spec.nodes.length === 0) {
      setDeprecationWarnings([]);
      return;
    }

    const currentId = ++requestIdRef.current;
    setIsLoading(true);

    fetch('/api/analyze/cloud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec, action: 'deprecations' }),
    })
      .then(res => res.json())
      .then(data => {
        if (currentId !== requestIdRef.current) return;
        setDeprecationWarnings(data.deprecationWarnings ?? []);
        setIsLoading(false);
      })
      .catch(() => {
        if (currentId !== requestIdRef.current) return;
        setIsLoading(false);
      });
  }, [spec]);

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
