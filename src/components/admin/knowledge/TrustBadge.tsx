'use client';

/**
 * 신뢰도 배지 컴포넌트
 *
 * confidence 값에 따라 색상이 변하는 작은 배지
 */

import { useState } from 'react';

interface TrustBadgeProps {
  confidence: number;
  size?: 'sm' | 'md';
}

function getColorClasses(confidence: number): string {
  if (confidence >= 0.8) {
    return 'bg-green-100 text-green-800';
  }
  if (confidence >= 0.5) {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-red-100 text-red-800';
}

export default function TrustBadge({ confidence, size = 'sm' }: TrustBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';
  const colorClasses = getColorClasses(confidence);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`inline-flex items-center font-semibold rounded-full ${sizeClasses} ${colorClasses}`}
      >
        {confidence.toFixed(2)}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap z-10">
          신뢰도: {confidence.toFixed(2)}
        </span>
      )}
    </span>
  );
}
