/**
 * 새 컴포넌트 생성 페이지
 */

import ComponentForm from '@/components/admin/ComponentForm';

export default function NewComponentPage() {
  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 컴포넌트 추가</h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 인프라 컴포넌트를 생성합니다
        </p>
      </div>

      {/* 폼 */}
      <ComponentForm mode="create" />
    </div>
  );
}
