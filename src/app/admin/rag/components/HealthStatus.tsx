/**
 * HealthCard + SystemConfigCard — ChromaDB 상태 및 시스템 설정 표시
 */

import type { HealthData } from '../types';

// ---------------------------------------------------------------------------
// Status dot
// ---------------------------------------------------------------------------

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${
        active ? 'bg-green-500' : 'bg-red-500'
      }`}
    />
  );
}

// ---------------------------------------------------------------------------
// Health Card
// ---------------------------------------------------------------------------

export function HealthCard({ health, onRefresh }: { health: HealthData | null; onRefresh: () => void }) {
  if (!health) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <StatusDot active={health.connected} />
          ChromaDB 상태
        </h2>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800 transition"
        >
          새로고침
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{health.totalDocuments}</p>
          <p className="text-xs text-gray-500">총 문서</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">{health.collections.length}</p>
          <p className="text-xs text-gray-500">컬렉션</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className={`text-2xl font-bold ${health.connected ? 'text-green-600' : 'text-red-600'}`}>
            {health.connected ? 'Online' : 'Offline'}
          </p>
          <p className="text-xs text-gray-500">연결 상태</p>
        </div>
      </div>

      {health.collections.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">컬렉션별 문서 수</h3>
          {health.collections.map((col) => (
            <div key={col.name} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-mono text-xs truncate max-w-[70%]">{col.name}</span>
              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {col.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// System Config Card
// ---------------------------------------------------------------------------

export function SystemConfigCard({ config }: { config: HealthData['config'] | null }) {
  if (!config) return null;

  const items = [
    { label: '최대 콘텐츠 크기', value: `${(config.maxBytes / 1024).toFixed(0)}KB`, desc: 'maxBytes' },
    { label: '캐시 TTL', value: `${config.ttlSeconds / 3600}시간`, desc: 'ttlSeconds' },
    { label: '신뢰도 임계값', value: config.confidenceThreshold.toString(), desc: 'confidenceThreshold' },
    { label: 'Live Augment 타임아웃', value: `${config.timeoutMs}ms`, desc: 'timeoutMs' },
    { label: '임베딩 모델', value: config.embeddingModel, desc: 'embeddingModel' },
    { label: '기본 Top-K', value: config.defaultTopK.toString(), desc: 'defaultTopK' },
    { label: '유사도 임계값', value: config.similarityThreshold.toString(), desc: 'similarityThreshold' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">시스템 설정</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.desc} className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="ml-2 text-xs text-gray-400 font-mono">{item.desc}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
