/**
 * Prisma Client 싱글톤 인스턴스
 *
 * 개발 환경에서 핫 리로딩 시 Prisma 연결이 중복되지 않도록
 * 글로벌 변수에 저장합니다.
 */

import { PrismaClient } from '@/generated/prisma';

// 글로벌 타입 확장
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 개발 환경에서는 기존 인스턴스 재사용, 프로덕션에서는 새로 생성
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// 개발 환경에서 글로벌에 저장
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
