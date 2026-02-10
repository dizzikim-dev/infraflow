/**
 * useCloudCatalog Hook
 *
 * Provides cloud service catalog data and deprecation warnings
 * for the current InfraSpec.
 */

import { useMemo, useCallback } from 'react';
import type { InfraSpec, InfraNodeType } from '@/types/infra';
import {
  getDeprecationWarnings,
  compareServices,
  getCloudServices,
  type DeprecationWarning,
  type ServiceComparison,
  type CloudService,
  type CloudProvider,
} from '@/lib/knowledge/cloudCatalog';

export interface UseCloudCatalogResult {
  deprecationWarnings: DeprecationWarning[];
  getServicesForType: (type: InfraNodeType, provider?: CloudProvider) => CloudService[];
  compareServicesForType: (type: InfraNodeType) => ServiceComparison;
}

export function useCloudCatalog(spec: InfraSpec | null): UseCloudCatalogResult {
  const deprecationWarnings = useMemo(() => {
    if (!spec || spec.nodes.length === 0) return [];
    return getDeprecationWarnings(spec);
  }, [spec]);

  const getServicesForType = useCallback(
    (type: InfraNodeType, provider?: CloudProvider) => getCloudServices(type, provider),
    [],
  );

  const compareServicesForType = useCallback(
    (type: InfraNodeType) => compareServices(type),
    [],
  );

  return {
    deprecationWarnings,
    getServicesForType,
    compareServicesForType,
  };
}
