'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllTemplates,
  searchTemplates,
  deleteTemplate,
  Template,
  TemplateCategory,
} from '@/lib/templates';

interface TemplateGalleryProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
  onSaveCurrent?: () => void;
  hasCurrentSpec?: boolean;
}

const categoryInfo: Record<TemplateCategory, { label: string; icon: string }> = {
  web: { label: '웹', icon: '🌐' },
  security: { label: '보안', icon: '🔐' },
  cloud: { label: '클라우드', icon: '☁️' },
  network: { label: '네트워크', icon: '📡' },
  container: { label: '컨테이너', icon: '📦' },
  telecom: { label: '통신망', icon: '🔗' },
  custom: { label: '사용자 정의', icon: '📋' },
};

export function TemplateGallery({
  onSelect,
  onClose,
  onSaveCurrent,
  hasCurrentSpec,
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const templates = useMemo(() => {
    let results = searchQuery ? searchTemplates(searchQuery) : getAllTemplates();
    if (selectedCategory !== 'all') {
      results = results.filter((t) => t.category === selectedCategory);
    }
    return results;
  }, [searchQuery, selectedCategory]);

  const categories: Array<TemplateCategory | 'all'> = ['all', 'web', 'security', 'cloud', 'network', 'container', 'telecom', 'custom'];

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setConfirmDelete(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-bold text-white">템플릿 갤러리</h2>
          </div>
          <div className="flex items-center gap-2">
            {hasCurrentSpec && onSaveCurrent && (
              <button
                onClick={onSaveCurrent}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                현재 구조 저장
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="템플릿 검색..."
                className="w-full bg-zinc-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-colors
                    ${selectedCategory === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }
                  `}
                >
                  {cat === 'all' ? '전체' : categoryInfo[cat].icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-zinc-400">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group"
                >
                  <div
                    onClick={() => onSelect(template)}
                    className="bg-zinc-800 rounded-xl p-4 cursor-pointer border border-zinc-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                  >
                    {/* Icon & Category */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{template.icon}</span>
                      <span className={`
                        px-2 py-0.5 rounded text-xs
                        ${template.isBuiltIn
                          ? 'bg-zinc-700 text-zinc-400'
                          : 'bg-blue-500/20 text-blue-400'
                        }
                      `}>
                        {template.isBuiltIn ? '기본' : '사용자'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-white font-medium mb-1">{template.name}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                      {template.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-zinc-700 text-zinc-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Node Count */}
                    <div className="mt-3 text-xs text-zinc-500">
                      {template.spec.nodes.length} 노드 · {template.spec.connections.length} 연결
                    </div>
                  </div>

                  {/* Delete Button (custom templates only) */}
                  {!template.isBuiltIn && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(template.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-zinc-800 rounded-xl p-6 max-w-sm mx-4"
              >
                <h3 className="text-white font-medium mb-2">템플릿 삭제</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
