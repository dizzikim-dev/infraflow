'use client';

/**
 * 신뢰도 메타데이터 편집기
 *
 * confidence 슬라이더 + 소스 목록 관리 + 소스 추가 폼
 */

import { useState } from 'react';

type SourceType =
  | 'rfc'
  | 'nist'
  | 'cis'
  | 'owasp'
  | 'vendor'
  | 'academic'
  | 'industry'
  | 'user_verified'
  | 'user_unverified';

interface KnowledgeSourceInput {
  type: SourceType;
  title: string;
  url?: string;
  accessedDate: string;
}

export interface TrustMetadataInput {
  confidence: number;
  sources: KnowledgeSourceInput[];
}

interface TrustMetadataEditorProps {
  value: TrustMetadataInput;
  onChange: (value: TrustMetadataInput) => void;
  compact?: boolean;
}

const sourceTypeLabels: Record<SourceType, string> = {
  rfc: 'RFC',
  nist: 'NIST',
  cis: 'CIS',
  owasp: 'OWASP',
  vendor: 'Vendor',
  academic: 'Academic',
  industry: 'Industry',
  user_verified: '검증됨',
  user_unverified: '미검증',
};

const sourceTypeColors: Record<SourceType, string> = {
  rfc: 'bg-blue-100 text-blue-800',
  nist: 'bg-indigo-100 text-indigo-800',
  cis: 'bg-purple-100 text-purple-800',
  owasp: 'bg-orange-100 text-orange-800',
  vendor: 'bg-teal-100 text-teal-800',
  academic: 'bg-cyan-100 text-cyan-800',
  industry: 'bg-emerald-100 text-emerald-800',
  user_verified: 'bg-green-100 text-green-800',
  user_unverified: 'bg-gray-100 text-gray-800',
};

const sourceTypeOptions: SourceType[] = [
  'rfc',
  'nist',
  'cis',
  'owasp',
  'vendor',
  'academic',
  'industry',
  'user_verified',
  'user_unverified',
];

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600';
  if (confidence >= 0.5) return 'text-yellow-600';
  return 'text-red-600';
}

function getSliderBgClass(confidence: number): string {
  if (confidence >= 0.8) return 'accent-green-600';
  if (confidence >= 0.5) return 'accent-yellow-500';
  return 'accent-red-500';
}

const emptySource: KnowledgeSourceInput = {
  type: 'vendor',
  title: '',
  url: '',
  accessedDate: new Date().toISOString().slice(0, 10),
};

export default function TrustMetadataEditor({
  value,
  onChange,
  compact = false,
}: TrustMetadataEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState<KnowledgeSourceInput>({ ...emptySource });

  const handleConfidenceChange = (confidence: number) => {
    onChange({ ...value, confidence });
  };

  const handleRemoveSource = (index: number) => {
    const sources = value.sources.filter((_, i) => i !== index);
    onChange({ ...value, sources });
  };

  const handleAddSource = () => {
    if (!newSource.title.trim()) return;
    onChange({
      ...value,
      sources: [...value.sources, { ...newSource, title: newSource.title.trim() }],
    });
    setNewSource({ ...emptySource });
    setShowAddForm(false);
  };

  // 컴팩트 모드: confidence + 소스 개수만 표시, 클릭하면 확장
  if (compact && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className={`font-semibold ${getConfidenceColor(value.confidence)}`}>
          {value.confidence.toFixed(2)}
        </span>
        <span className="text-gray-400">|</span>
        <span>소스 {value.sources.length}개</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      {/* 헤더 (컴팩트 모드에서 확장 시 접기 버튼) */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">신뢰도 메타데이터</h4>
        {compact && expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Confidence 슬라이더 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500">신뢰도 (Confidence)</label>
          <span className={`text-sm font-bold ${getConfidenceColor(value.confidence)}`}>
            {value.confidence.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={value.confidence}
          onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-lg cursor-pointer ${getSliderBgClass(value.confidence)}`}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0.00</span>
          <span>0.50</span>
          <span>1.00</span>
        </div>
      </div>

      {/* 소스 목록 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-500">소스 목록 ({value.sources.length}개)</label>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAddForm ? '취소' : '+ 소스 추가'}
          </button>
        </div>

        {value.sources.length === 0 && !showAddForm && (
          <p className="text-xs text-gray-400 py-2">등록된 소스가 없습니다.</p>
        )}

        <div className="space-y-2">
          {value.sources.map((source, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 text-sm"
            >
              <span
                className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded ${
                  sourceTypeColors[source.type]
                }`}
              >
                {sourceTypeLabels[source.type]}
              </span>
              <span className="flex-1 truncate text-gray-700" title={source.title}>
                {source.title}
              </span>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 flex-shrink-0"
                  title={source.url}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
              <button
                type="button"
                onClick={() => handleRemoveSource(index)}
                className="text-gray-400 hover:text-red-600 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* 소스 추가 폼 */}
        {showAddForm && (
          <div className="mt-3 border border-gray-200 rounded-md p-3 space-y-3 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">유형</label>
                <select
                  value={newSource.type}
                  onChange={(e) =>
                    setNewSource({ ...newSource, type: e.target.value as SourceType })
                  }
                  className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sourceTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {sourceTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">접근일</label>
                <input
                  type="date"
                  value={newSource.accessedDate}
                  onChange={(e) =>
                    setNewSource({ ...newSource, accessedDate: e.target.value })
                  }
                  className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">제목</label>
              <input
                type="text"
                value={newSource.title}
                onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                placeholder="예: NIST SP 800-41 Rev.1"
                className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL (선택)</label>
              <input
                type="url"
                value={newSource.url || ''}
                onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                placeholder="https://..."
                className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddSource}
                disabled={!newSource.title.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
