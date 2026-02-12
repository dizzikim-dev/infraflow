'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('AdminUserDetail');

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count: { diagrams: number };
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        logger.error('Failed to fetch user', err instanceof Error ? err : undefined, { userId: id });
        setError('사용자를 불러오지 못했습니다');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  async function handleRoleChange(newRole: 'USER' | 'ADMIN') {
    if (!user) return;
    setUpdating(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '역할 변경에 실패했습니다');
        return;
      }

      setUser({ ...user, role: newRole });
      setMessage('역할이 변경되었습니다');
    } catch (err) {
      logger.error('Failed to change user role', err instanceof Error ? err : undefined, { userId: id, newRole });
      setError('역할 변경에 실패했습니다');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <div className="text-gray-500">불러오는 중...</div>;
  }

  if (error && !user) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; 사용자 목록
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">사용자 상세</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">이름</label>
            <p className="text-gray-900">{user.name || '이름 없음'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">이메일</label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">역할</label>
            <div className="flex items-center gap-3 mt-1">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value as 'USER' | 'ADMIN')}
                disabled={updating}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {updating && <span className="text-sm text-gray-500">변경 중...</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">다이어그램 수</label>
            <p className="text-gray-900">{user._count.diagrams}개</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">가입일</label>
            <p className="text-gray-900">
              {new Date(user.createdAt).toLocaleString('ko-KR')}
            </p>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
