'use client';

/**
 * Admin 레이아�트 컴포넌트
 *
 * 사이드바와 콘텐츠 영역을 포함하는 Admin 전용 레이아웃
 */

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

interface NavSection {
  label: string;
  icon: ReactNode;
  items: { href: string; label: string }[];
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: '대시보드',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '/admin/components',
    label: '컴포넌트 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: '사용자 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/plugins',
    label: '플러그인 관리',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
  },
];

const knowledgeSection: NavSection = {
  label: 'Knowledge DB',
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  items: [
    { href: '/admin/knowledge', label: '개요' },
    { href: '/admin/knowledge/relationships', label: '관계' },
    { href: '/admin/knowledge/patterns', label: '패턴' },
    { href: '/admin/knowledge/antipatterns', label: '안티패턴' },
    { href: '/admin/knowledge/failures', label: '장애 시나리오' },
    { href: '/admin/knowledge/performance', label: '성능 프로파일' },
    { href: '/admin/knowledge/vulnerabilities', label: '취약점' },
    { href: '/admin/knowledge/cloud-services', label: '클라우드 서비스' },
    { href: '/admin/knowledge/benchmarks', label: '벤치마크' },
    { href: '/admin/knowledge/industry-presets', label: '산업별 프리셋' },
    { href: '/admin/knowledge/sources', label: '출처 관리' },
  ],
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [knowledgeOpen, setKnowledgeOpen] = useState(
    pathname.startsWith('/admin/knowledge'),
  );

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    if (href === '/admin/knowledge') {
      return pathname === '/admin/knowledge';
    }
    return pathname.startsWith(href);
  };

  const isKnowledgeActive = pathname.startsWith('/admin/knowledge');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 사이드바 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* 로고 영역 */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          {sidebarOpen && (
            <Link href="/admin" className="text-xl font-bold text-blue-400">
              InfraFlow Admin
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarOpen ? 'M11 19l-7-7 7-7m8 14l-7-7 7-7' : 'M13 5l7 7-7 7M5 5l7 7-7 7'}
              />
            </svg>
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>

          {/* Knowledge DB 섹션 */}
          <div className="mt-4 px-2">
            {sidebarOpen && (
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Knowledge
              </div>
            )}
            <button
              onClick={() => setKnowledgeOpen(!knowledgeOpen)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isKnowledgeActive
                  ? 'bg-blue-600/20 text-blue-300'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {knowledgeSection.icon}
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{knowledgeSection.label}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${knowledgeOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>

            {sidebarOpen && knowledgeOpen && (
              <ul className="mt-1 space-y-0.5 pl-4">
                {knowledgeSection.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* 하단 링크 */}
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {sidebarOpen && <span>InfraFlow로 돌아가기</span>}
          </Link>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
