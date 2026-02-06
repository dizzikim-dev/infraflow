'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { saveTemplate, TemplateCategory } from '@/lib/templates';
import { InfraSpec } from '@/types';

interface SaveTemplateDialogProps {
  spec: InfraSpec;
  onClose: () => void;
  onSaved: () => void;
}

const categories: Array<{ value: TemplateCategory; label: string; icon: string }> = [
  { value: 'web', label: '웹', icon: '🌐' },
  { value: 'security', label: '보안', icon: '🔐' },
  { value: 'cloud', label: '클라우드', icon: '☁️' },
  { value: 'network', label: '네트워크', icon: '📡' },
  { value: 'container', label: '컨테이너', icon: '📦' },
  { value: 'custom', label: '기타', icon: '📋' },
];

export function SaveTemplateDialog({ spec, onClose, onSaved }: SaveTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError('템플릿 이름을 입력해주세요');
      return;
    }

    try {
      saveTemplate(name.trim(), description.trim(), spec, category);
      onSaved();
      onClose();
    } catch (e) {
      setError('저장에 실패했습니다');
    }
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
        className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <h2 className="text-xl font-bold text-white">템플릿으로 저장</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              템플릿 이름 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="예: 내 웹 아키텍처"
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="템플릿에 대한 설명을 입력하세요"
              rows={3}
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              카테고리
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                    ${category === cat.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }
                  `}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spec Info */}
          <div className="bg-zinc-800 rounded-lg p-3">
            <div className="text-xs text-zinc-500 mb-1">저장될 구조</div>
            <div className="text-sm text-zinc-300">
              {spec.nodes.length} 노드 · {spec.connections.length} 연결
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm">
              ✕ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            저장
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
