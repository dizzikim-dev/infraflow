'use client';

/**
 * Knowledge 검색 및 필터 컴포넌트
 *
 * 텍스트 검색 + 동적 필터 드롭다운 + 활성 필터 칩
 */

import { useState, useEffect } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  options: FilterOption[];
}

interface KnowledgeSearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (key: string, value: string) => void;
  filters: FilterDef[];
  values: Record<string, string>;
  search: string;
}

export default function KnowledgeSearchFilter({
  onSearch,
  onFilterChange,
  filters,
  values,
  search,
}: KnowledgeSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState(search);

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      onSearch('');
    }
  };

  const activeFilters = filters.filter((f) => values[f.key]);

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 검색 */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="검색..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* 동적 필터 드롭다운 */}
        {filters.map((filter) => (
          <div key={filter.key} className="md:w-48">
            <select
              value={values[filter.key] || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">전체 {filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* 활성 필터 칩 */}
      {(searchQuery || activeFilters.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
              검색: {searchQuery}
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSearch('');
                }}
                className="text-blue-600 hover:text-blue-800"
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
            </span>
          )}
          {activeFilters.map((filter) => {
            const selectedOption = filter.options.find(
              (o) => o.value === values[filter.key]
            );
            return (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md"
              >
                {filter.label}: {selectedOption?.label || values[filter.key]}
                <button
                  onClick={() => onFilterChange(filter.key, '')}
                  className="text-green-600 hover:text-green-800"
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
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
