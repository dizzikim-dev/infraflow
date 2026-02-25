'use client';

/**
 * ExternalContentTable — 외부 콘텐츠 목록, 선택 삭제, 페이지네이션
 */

import { useState } from 'react';
import type { ExternalContentData } from '../types';

// ---------------------------------------------------------------------------
// ExternalContentTable
// ---------------------------------------------------------------------------

export function ExternalContentTable({
  data,
  loading,
  onDelete,
  onPageChange,
}: {
  data: ExternalContentData | null;
  loading: boolean;
  onDelete: (ids: string[]) => void;
  onPageChange: (offset: number) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!data) return;
    if (selected.size === data.items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.items.map((item) => item.id)));
    }
  }

  function handleDelete() {
    if (selected.size === 0) return;
    onDelete(Array.from(selected));
    setSelected(new Set());
  }

  function formatDate(ts: number): string {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          외부 콘텐츠 ({data?.total ?? 0})
        </h2>
        {selected.size > 0 && (
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            선택 삭제 ({selected.size})
          </button>
        )}
      </div>

      {!data || data.items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          인덱싱된 외부 콘텐츠가 없습니다
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === data.items.length && data.items.length > 0}
                      onChange={toggleAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">제목</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">타입</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">크기</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">등록일</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-500">태그</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-medium text-gray-900 truncate max-w-[200px]">
                        {item.title || item.id}
                      </div>
                      {item.sourceUrl && (
                        <div className="text-xs text-gray-400 truncate max-w-[200px]">
                          {item.sourceUrl}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        item.sourceType === 'github-readme'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}>
                        {item.sourceType === 'github-readme' ? 'GitHub' : 'Web'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {item.contentLength > 1024
                        ? `${(item.contentLength / 1024).toFixed(1)}KB`
                        : `${item.contentLength}B`}
                    </td>
                    <td className="py-2 px-2 text-gray-600 text-xs">
                      {formatDate(item.fetchedAt as number)}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total > data.limit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {data.offset + 1}~{Math.min(data.offset + data.limit, data.total)} / {data.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(Math.max(0, data.offset - data.limit))}
                  disabled={data.offset === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  이전
                </button>
                <button
                  onClick={() => onPageChange(data.offset + data.limit)}
                  disabled={data.offset + data.limit >= data.total}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
