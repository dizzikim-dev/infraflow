'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const DEMO_USER = {
  id: 'demo-admin',
  name: 'Demo Admin',
  email: 'admin@infraflow.dev',
  role: 'ADMIN' as const,
};

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = isDemoMode ? DEMO_USER : session?.user;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        로그인
      </Link>
    );
  }

  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity"
        aria-label="User menu"
      >
        {!isDemoMode && session?.user?.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-zinc-700">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              대시보드
            </Link>
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                관리자
              </Link>
            )}
          </div>

          {!isDemoMode && (
            <div className="border-t border-zinc-700 py-1">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
