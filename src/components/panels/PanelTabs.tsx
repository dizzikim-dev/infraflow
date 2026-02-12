'use client';

/**
 * PanelTabs — generic tab bar for side-panel components.
 *
 * Used by VulnerabilityPanel, CloudCatalogPanel, HealthCheckPanel,
 * SecurityAuditPanel, etc.
 *
 * Active-state classes are passed as full strings so that Tailwind's JIT
 * compiler can detect them statically (dynamic template literals like
 * `text-${color}-400` are NOT supported by JIT).
 */

interface Tab<T extends string> {
  key: T;
  label: string;
  count?: number;
  /** Optional icon component rendered before the label. */
  icon?: React.ComponentType<{ className?: string }>;
}

interface PanelTabsProps<T extends string> {
  tabs: Tab<T>[];
  active: T;
  onChange: (key: T) => void;
  /**
   * Full Tailwind className applied to the active tab button.
   * Example: "text-red-400 border-b-2 border-red-400 bg-red-500/10"
   * Defaults to blue: "text-blue-400 border-b-2 border-blue-400 bg-blue-500/10"
   */
  activeClassName?: string;
  /**
   * Full Tailwind className applied to the active tab badge.
   * Example: "bg-red-500/20 text-red-300"
   * Defaults to blue: "bg-blue-500/20 text-blue-300"
   */
  activeBadgeClassName?: string;
}

export function PanelTabs<T extends string>({
  tabs,
  active,
  onChange,
  activeClassName = 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10',
  activeBadgeClassName = 'bg-blue-500/20 text-blue-300',
}: PanelTabsProps<T>) {
  return (
    <div className="flex border-b border-white/10">
      {tabs.map(({ key, label, count, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${
              isActive
                ? activeClassName
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              {Icon && <Icon className="w-4 h-4" />}
              <span>{label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? activeBadgeClassName
                      : 'bg-white/10 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
