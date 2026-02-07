/**
 * Admin 레이아웃
 */

import { ReactNode } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'InfraFlow Admin',
  description: '인프라 컴포넌트 관리 시스템',
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
