/**
 * 컴포넌트 수정 페이지
 */

import { prisma } from '@/lib/db/prisma';
import { PolicyRecommendation } from '@/generated/prisma';
import { notFound } from 'next/navigation';
import ComponentForm from '@/components/admin/ComponentForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getComponent(id: string) {
  const component = await prisma.infraComponent.findUnique({
    where: { id },
    include: {
      policies: true,
    },
  });

  return component;
}

export default async function EditComponentPage({ params }: PageProps) {
  const { id } = await params;
  const component = await getComponent(id);

  if (!component) {
    notFound();
  }

  // ComponentForm에 맞게 데이터 변환
  const formData = {
    id: component.id,
    componentId: component.componentId,
    name: component.name,
    nameKo: component.nameKo,
    category: component.category,
    tier: component.tier,
    description: component.description,
    descriptionKo: component.descriptionKo,
    functions: component.functions,
    functionsKo: component.functionsKo,
    features: component.features,
    featuresKo: component.featuresKo,
    ports: component.ports,
    protocols: component.protocols,
    vendors: component.vendors,
    policies: component.policies.map((p: PolicyRecommendation) => ({
      id: p.id,
      name: p.name,
      nameKo: p.nameKo,
      description: p.description,
      priority: p.priority as 'critical' | 'high' | 'medium' | 'low',
      category: p.category as 'access' | 'security' | 'monitoring' | 'compliance' | 'performance',
    })),
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">컴포넌트 수정</h1>
        <p className="mt-1 text-sm text-gray-500">
          {component.nameKo} ({component.name})
        </p>
      </div>

      {/* 폼 */}
      <ComponentForm mode="edit" initialData={formData} />
    </div>
  );
}
