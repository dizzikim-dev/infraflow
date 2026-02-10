'use client';

/**
 * JSON 필드 편집기
 *
 * 구조화된 JSON 필드를 스키마별 전용 UI로 편집
 */

import { useState } from 'react';

type SchemaType =
  | 'requiredComponents'
  | 'optionalComponents'
  | 'latencyRange'
  | 'throughputRange'
  | 'generic';

interface RequiredComponent {
  type: string;
  minCount: number;
}

interface OptionalComponent {
  type: string;
  benefit: string;
  benefitKo: string;
}

interface LatencyRange {
  min: number;
  max: number;
  unit: 'ms' | 'us';
}

interface ThroughputRange {
  typical: string;
  max: string;
}

interface JsonFieldEditorProps {
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  schema: SchemaType;
}

// ---------------------------------------------------------------------------
// Required Components Editor
// ---------------------------------------------------------------------------
function RequiredComponentsEditor({
  value,
  onChange,
}: {
  value: RequiredComponent[];
  onChange: (v: RequiredComponent[]) => void;
}) {
  const [newType, setNewType] = useState('');
  const [newCount, setNewCount] = useState(1);

  const handleAdd = () => {
    if (!newType.trim()) return;
    onChange([...value, { type: newType.trim(), minCount: newCount }]);
    setNewType('');
    setNewCount(1);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof RequiredComponent, v: string | number) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: v };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={item.type}
            onChange={(e) => handleUpdate(index, 'type', e.target.value)}
            className="flex-1 py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="컴포넌트 타입"
          />
          <input
            type="number"
            value={item.minCount}
            onChange={(e) => handleUpdate(index, 'minCount', parseInt(e.target.value) || 0)}
            min={0}
            className="w-20 py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="최소"
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-red-500 hover:text-red-700 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="flex-1 py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="새 컴포넌트 타입"
        />
        <input
          type="number"
          value={newCount}
          onChange={(e) => setNewCount(parseInt(e.target.value) || 0)}
          min={0}
          className="w-20 py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="최소"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newType.trim()}
          className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Optional Components Editor
// ---------------------------------------------------------------------------
function OptionalComponentsEditor({
  value,
  onChange,
}: {
  value: OptionalComponent[];
  onChange: (v: OptionalComponent[]) => void;
}) {
  const [newType, setNewType] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newBenefitKo, setNewBenefitKo] = useState('');

  const handleAdd = () => {
    if (!newType.trim()) return;
    onChange([
      ...value,
      { type: newType.trim(), benefit: newBenefit.trim(), benefitKo: newBenefitKo.trim() },
    ]);
    setNewType('');
    setNewBenefit('');
    setNewBenefitKo('');
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div key={index} className="flex items-start gap-2 bg-gray-50 rounded p-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-10">타입</span>
              <span className="text-sm font-mono text-gray-900">{item.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-10">영문</span>
              <span className="text-sm text-gray-700">{item.benefit}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-10">한국어</span>
              <span className="text-sm text-gray-700">{item.benefitKo}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="border border-dashed border-gray-300 rounded p-2 space-y-2">
        <input
          type="text"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="컴포넌트 타입"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Benefit (영문)"
          />
          <input
            type="text"
            value={newBenefitKo}
            onChange={(e) => setNewBenefitKo(e.target.value)}
            className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="이점 (한국어)"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newType.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Latency Range Editor
// ---------------------------------------------------------------------------
function LatencyRangeEditor({
  value,
  onChange,
}: {
  value: LatencyRange;
  onChange: (v: LatencyRange) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value.min}
        onChange={(e) => onChange({ ...value, min: parseFloat(e.target.value) || 0 })}
        min={0}
        className="w-24 py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="최소"
      />
      <span className="text-gray-400">~</span>
      <input
        type="number"
        value={value.max}
        onChange={(e) => onChange({ ...value, max: parseFloat(e.target.value) || 0 })}
        min={0}
        className="w-24 py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="최대"
      />
      <select
        value={value.unit}
        onChange={(e) => onChange({ ...value, unit: e.target.value as 'ms' | 'us' })}
        className="py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="ms">ms</option>
        <option value="us">us</option>
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Throughput Range Editor
// ---------------------------------------------------------------------------
function ThroughputRangeEditor({
  value,
  onChange,
}: {
  value: ThroughputRange;
  onChange: (v: ThroughputRange) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">일반</label>
        <input
          type="text"
          value={value.typical}
          onChange={(e) => onChange({ ...value, typical: e.target.value })}
          className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="예: 1Gbps"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-500 mb-1">최대</label>
        <input
          type="text"
          value={value.max}
          onChange={(e) => onChange({ ...value, max: e.target.value })}
          className="w-full py-1.5 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="예: 10Gbps"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic JSON Editor
// ---------------------------------------------------------------------------
function GenericJsonEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError('유효하지 않은 JSON 형식입니다.');
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        rows={6}
        className={`w-full font-mono text-sm py-2 px-3 border rounded focus:ring-2 focus:outline-none ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
        placeholder='{ "key": "value" }'
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function JsonFieldEditor({
  label,
  value,
  onChange,
  schema,
}: JsonFieldEditorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {schema === 'requiredComponents' && (
        <RequiredComponentsEditor
          value={(value as RequiredComponent[]) || []}
          onChange={onChange}
        />
      )}

      {schema === 'optionalComponents' && (
        <OptionalComponentsEditor
          value={(value as OptionalComponent[]) || []}
          onChange={onChange}
        />
      )}

      {schema === 'latencyRange' && (
        <LatencyRangeEditor
          value={(value as LatencyRange) || { min: 0, max: 0, unit: 'ms' }}
          onChange={onChange}
        />
      )}

      {schema === 'throughputRange' && (
        <ThroughputRangeEditor
          value={(value as ThroughputRange) || { typical: '', max: '' }}
          onChange={onChange}
        />
      )}

      {schema === 'generic' && (
        <GenericJsonEditor value={value} onChange={onChange} />
      )}
    </div>
  );
}
