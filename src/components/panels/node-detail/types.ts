import type { InfraNodeType } from '@/types';
import type { InfraComponent } from '@/lib/data';

/** Panel tab identifiers */
export type TabType = 'overview' | 'technical' | 'products';

/** Category-based color tokens */
export interface CategoryColors {
  bg: string;
  border: string;
  text: string;
}

/** Props for the top-level NodeDetailPanel */
export interface NodeDetailPanelProps {
  nodeId: string;
  nodeName: string;
  nodeType: InfraNodeType;
  tier: string;
  zone?: string;
  description?: string;
  onClose: () => void;
  onOpenEvidence?: () => void;
  /** Called when user selects a product from the Products tab */
  onProductSelect?: (vendorId: string | undefined, cloudProvider: string | undefined, productName: string) => void;
}

/** Shared props passed to tab sub-components */
export interface TabProps {
  infraInfo: InfraComponent | null;
  colors: CategoryColors;
}
