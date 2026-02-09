'use client';

import { useEffect, useState } from 'react';
import { DiagramGrid } from '@/components/dashboard/DiagramGrid';
import { NewDiagramButton } from '@/components/dashboard/NewDiagramButton';

interface DiagramSummary {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [diagrams, setDiagrams] = useState<DiagramSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDiagrams() {
      try {
        const res = await fetch('/api/diagrams');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setDiagrams(data.diagrams);
      } catch {
        setError('다이어그램을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    }
    fetchDiagrams();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('이 다이어그램을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDiagrams((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">내 다이어그램</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {diagrams.length}개의 다이어그램
          </p>
        </div>
        <NewDiagramButton />
      </div>

      {loading && (
        <div className="text-center py-12 text-zinc-400">불러오는 중...</div>
      )}

      {error && (
        <div className="text-center py-12 text-red-400">{error}</div>
      )}

      {!loading && !error && (
        <DiagramGrid diagrams={diagrams} onDelete={handleDelete} />
      )}
    </div>
  );
}
