'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function NewDiagramButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleCreate() {
    setError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/diagrams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Untitled Diagram',
            spec: { nodes: [], connections: [] },
          }),
        });

        if (!res.ok) {
          setError('생성에 실패했습니다');
          return;
        }

        const data = await res.json();
        router.push(`/diagram/${data.diagram.id}`);
      } catch {
        setError('생성에 실패했습니다');
      }
    });
  }

  return (
    <div>
      <button
        onClick={handleCreate}
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {isPending ? '생성 중...' : '새 다이어그램'}
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
