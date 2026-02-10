/**
 * Knowledge Data Source Factory
 *
 * Returns the appropriate data source based on the KNOWLEDGE_SOURCE env var.
 * Default is 'static' — existing behavior unchanged.
 */

import type { KnowledgeDataSource } from './dataSource';
import { StaticDataSource } from './staticDataSource';

let cachedSource: KnowledgeDataSource | null = null;

/**
 * Get the configured knowledge data source.
 * - `KNOWLEDGE_SOURCE=static` (default): reads from TypeScript arrays
 * - `KNOWLEDGE_SOURCE=db`: reads from PostgreSQL via Prisma
 */
export function getKnowledgeSource(): KnowledgeDataSource {
  if (cachedSource) return cachedSource;

  const sourceType = process.env.KNOWLEDGE_SOURCE ?? 'static';

  if (sourceType === 'db') {
    // Dynamic import to avoid pulling Prisma into client bundles
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaDataSource } = require('./prismaDataSource');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { prisma } = require('../db/prisma');
    cachedSource = new PrismaDataSource(prisma);
  } else {
    cachedSource = new StaticDataSource();
  }

  return cachedSource!;
}

/**
 * Reset the cached source (useful for testing).
 */
export function resetKnowledgeSource(): void {
  cachedSource = null;
}
