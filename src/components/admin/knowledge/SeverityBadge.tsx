'use client';

/**
 * 심각도/우선순위 배지 컴포넌트
 *
 * critical, high, medium, low 값에 따라 색상이 변하는 필 형태 배지
 */

interface SeverityBadgeProps {
  severity: string;
  size?: 'sm' | 'md';
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function SeverityBadge({ severity, size = 'sm' }: SeverityBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  const colorClasses = severityColors[severity.toLowerCase()] || 'bg-gray-100 text-gray-800';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full uppercase ${sizeClasses} ${colorClasses}`}
    >
      {severity}
    </span>
  );
}
