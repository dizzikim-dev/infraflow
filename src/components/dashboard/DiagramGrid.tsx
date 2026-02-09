'use client';

import { DiagramCard } from './DiagramCard';

interface DiagramSummary {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DiagramGridProps {
  diagrams: DiagramSummary[];
  onDelete: (id: string) => void;
}

export function DiagramGrid({ diagrams, onDelete }: DiagramGridProps) {
  if (diagrams.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400 text-lg mb-2">아직 다이어그램이 없습니다</p>
        <p className="text-zinc-500 text-sm">
          새 다이어그램을 만들어 인프라를 시각화해 보세요
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {diagrams.map((diagram) => (
        <DiagramCard
          key={diagram.id}
          diagram={diagram}
          onDelete={() => onDelete(diagram.id)}
        />
      ))}
    </div>
  );
}
