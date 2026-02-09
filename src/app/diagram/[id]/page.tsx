'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { InfraEditor } from '@/components/editor/InfraEditor';
import type { InfraSpec } from '@/types';
import type { Node, Edge } from '@xyflow/react';

interface DiagramData {
  id: string;
  title: string;
  description: string | null;
  spec: InfraSpec;
  nodesJson: Node[] | null;
  edgesJson: Edge[] | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DiagramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDiagram() {
      try {
        const res = await fetch(`/api/diagrams/${id}`);
        if (res.status === 404) {
          setError('다이어그램을 찾을 수 없습니다');
          return;
        }
        if (res.status === 401) {
          setError('로그인이 필요합니다');
          return;
        }
        if (res.status === 403) {
          setError('접근 권한이 없습니다');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setDiagram(data.diagram);
      } catch {
        setError('다이어그램을 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    }
    fetchDiagram();
  }, [id]);

  const handleTitleChange = useCallback(async (newTitle: string) => {
    if (!diagram) return;
    setDiagram(prev => prev ? { ...prev, title: newTitle } : null);
    try {
      await fetch(`/api/diagrams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch {
      // Revert on failure
      setDiagram(prev => prev ? { ...prev, title: diagram.title } : null);
    }
  }, [id, diagram]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">다이어그램 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="w-screen h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || '다이어그램을 찾을 수 없습니다'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <InfraEditor
      diagramId={id}
      initialSpec={diagram.spec}
      initialNodes={diagram.nodesJson ?? undefined}
      initialEdges={diagram.edgesJson ?? undefined}
      title={diagram.title}
      onTitleChange={handleTitleChange}
    />
  );
}
