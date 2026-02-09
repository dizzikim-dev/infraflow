'use client';

import { useRouter } from 'next/navigation';
import { InfraEditor } from '@/components/editor/InfraEditor';

export default function Home() {
  const router = useRouter();

  return (
    <InfraEditor
      onFirstSave={(id) => router.push(`/diagram/${id}`)}
    />
  );
}
