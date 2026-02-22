/**
 * GraphStatsPanel — Badge sub-components for the Knowledge Graph admin page.
 *
 * Small utility badge components used in the detail panel.
 */

// ---------------------------------------------------------------------------
// Badge sub-components
// ---------------------------------------------------------------------------

export function ImpactBadge({ impact }: { impact: string }) {
  const styles: Record<string, string> = {
    'service-down': 'bg-red-100 text-red-700',
    'degraded': 'bg-yellow-100 text-yellow-700',
    'data-loss': 'bg-orange-100 text-orange-700',
    'security-breach': 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${styles[impact] || 'bg-gray-100 text-gray-600'}`}>
      {impact}
    </span>
  );
}

export function LikelihoodBadge({ likelihood }: { likelihood: string }) {
  const styles: Record<string, string> = {
    high: 'bg-red-50 text-red-600',
    medium: 'bg-yellow-50 text-yellow-600',
    low: 'bg-green-50 text-green-600',
  };
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${styles[likelihood] || 'bg-gray-100 text-gray-600'}`}>
      {likelihood}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${styles[severity] || 'bg-gray-100 text-gray-600'}`}>
      {severity}
    </span>
  );
}
