'use client';

import Link from 'next/link';

interface DiagramCardProps {
  diagram: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    isPublic: boolean;
    updatedAt: string;
  };
  onDelete: () => void;
}

export function DiagramCard({ diagram, onDelete }: DiagramCardProps) {
  const updatedAt = new Date(diagram.updatedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
      <Link href={`/diagram/${diagram.id}`}>
        <div className="aspect-video bg-zinc-800 flex items-center justify-center">
          {diagram.thumbnail ? (
            <img
              src={diagram.thumbnail}
              alt={diagram.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-12 h-12 text-zinc-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <line x1="10" y1="6.5" x2="14" y2="6.5" />
              <line x1="6.5" y1="10" x2="6.5" y2="14" />
            </svg>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <Link href={`/diagram/${diagram.id}`}>
              <h3 className="text-sm font-medium text-white truncate hover:text-blue-400 transition-colors">
                {diagram.title}
              </h3>
            </Link>
            {diagram.description && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {diagram.description}
              </p>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="ml-2 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Delete diagram"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-zinc-500">{updatedAt}</span>
          {diagram.isPublic && (
            <span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
              공개
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
