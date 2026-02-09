'use client';

import { SessionProvider } from 'next-auth/react';
import { AnimationProvider } from '@/contexts/AnimationContext';
import { PluginProvider } from '@/contexts/PluginContext';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers - Wraps the application with all necessary context providers
 * This is a Client Component to enable client-side context in the app
 *
 * - SessionProvider: NextAuth.js 세션 관리
 * - PluginProvider: 플러그인 시스템 초기화 및 관리
 * - AnimationProvider: 애니메이션 컨텍스트
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PluginProvider autoInitialize={true}>
        <AnimationProvider>
          {children}
        </AnimationProvider>
      </PluginProvider>
    </SessionProvider>
  );
}
