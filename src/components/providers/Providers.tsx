'use client';

import { SessionProvider } from 'next-auth/react';
import { AnimationProvider } from '@/contexts/AnimationContext';
import { PluginProvider } from '@/contexts/PluginContext';

/** Mock session for demo mode (DB-free test deployment) */
const DEMO_SESSION = {
  user: { id: 'demo-admin', name: 'Demo Admin', email: 'admin@infraflow.dev', role: 'ADMIN' as const },
  expires: '2099-12-31T23:59:59.999Z',
};

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers - Wraps the application with all necessary context providers
 * This is a Client Component to enable client-side context in the app
 *
 * - SessionProvider: NextAuth.js 세션 관리 (demo mode시 mock admin 세션 주입)
 * - PluginProvider: 플러그인 시스템 초기화 및 관리
 * - AnimationProvider: 애니메이션 컨텍스트
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider session={isDemoMode ? DEMO_SESSION : undefined}>
      <PluginProvider autoInitialize={true}>
        <AnimationProvider>
          {children}
        </AnimationProvider>
      </PluginProvider>
    </SessionProvider>
  );
}
