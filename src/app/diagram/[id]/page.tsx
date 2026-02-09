'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DiagramData {
  id: string;
  title: string;
  description: string | null;
  spec: Record<string, unknown>;
  nodesJson: Record<string, unknown>[] | null;
  edgesJson: Record<string, unknown>[] | null;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">불러오는 중...</p>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || '다이어그램을 찾을 수 없습니다'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="text-lg font-medium text-white">{diagram.title}</h1>
          {diagram.isPublic && (
            <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
              공개
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500">
          마지막 수정: {new Date(diagram.updatedAt).toLocaleString('ko-KR')}
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm text-zinc-400">
          다이어그램 편집 기능은 메인 에디터와 통합 예정입니다.
        </p>
        <pre className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 overflow-auto max-h-96">
          {JSON.stringify(diagram.spec, null, 2)}
        </pre>
      </div>
    </div>
  );
}
