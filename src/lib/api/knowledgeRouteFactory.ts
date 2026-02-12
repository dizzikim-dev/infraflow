/**
 * Knowledge API Route Factory
 *
 * Generic factory for generating CRUD route handlers for knowledge resources.
 * Eliminates ~80% code duplication across 20 knowledge API route files.
 *
 * Usage:
 *   // route.ts (list)
 *   const config = { ... };
 *   export const { GET, POST } = createKnowledgeListRoute(config);
 *
 *   // [id]/route.ts (detail)
 *   const config = { ... };
 *   export const { GET, PUT, DELETE } = createKnowledgeDetailRoute(config);
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import type { z } from 'zod';

// ============================================
// Types
// ============================================

/** Filter configuration for a single query parameter */
interface FilterConfig {
  /** The query parameter name (e.g., 'severity', 'component') */
  param: string;
  /** The Prisma field name to filter on (defaults to param) */
  field?: string;
  /** Filter mode: 'exact' for equality, 'has' for array contains */
  mode?: 'exact' | 'has';
}

/**
 * Unique key configuration for duplicate checking.
 *
 * For simple unique keys (e.g., `vulnId`):
 *   { field: 'vulnId' }
 *
 * For composite unique keys (e.g., `componentType_trafficTier`):
 *   { compositeKey: 'componentType_trafficTier', fields: ['componentType', 'trafficTier'] }
 */
type UniqueKeyConfig =
  | { field: string; compositeKey?: never; fields?: never }
  | { compositeKey: string; fields: string[]; field?: never };

/**
 * Fields that need `as Prisma.InputJsonValue` cast when writing to Prisma.
 * These are JSON fields that Prisma requires explicit typing for.
 */
type JsonFieldName = string;

/** Configuration for a knowledge API resource */
interface KnowledgeRouteConfig {
  /** Prisma model name (e.g., 'knowledgeVulnerability') */
  modelName: string;

  /** Resource display name in Korean for error messages (e.g., '취약점') */
  resourceNameKo: string;

  /** Logger namespace (e.g., 'Vulnerabilities') */
  loggerName: string;

  /** Zod schema for query parameter validation (GET list) */
  querySchema: z.ZodType;

  /** Zod schema for create validation (POST) */
  createSchema: z.ZodType;

  /** Zod schema for update validation (PUT) */
  updateSchema: z.ZodType;

  /** Additional filters beyond the standard isActive/search/pagination */
  filters?: FilterConfig[];

  /** Fields to search across when `search` parameter is provided */
  searchFields: string[];

  /** Unique key configuration for duplicate checking */
  uniqueKey: UniqueKeyConfig;

  /**
   * Semantic ID field for fallback lookup in detail route.
   * If set, GET /[id] will first try by primary key `id`, then by this field.
   * Set to null/undefined to disable fallback.
   */
  semanticIdField?: string | null;

  /** Fields that require `as Prisma.InputJsonValue` cast */
  jsonFields?: JsonFieldName[];

  /**
   * Extra query parameters to extract from search params beyond the base schema.
   * Maps param name to the param name used in the Zod parse object.
   * This is used when the query schema has more fields than the base.
   */
  extraQueryParams?: string[];
}

// ============================================
// Helpers
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PrismaDelegate = any;

const ALLOWED_MODELS = [
  'knowledgeVulnerability',
  'knowledgePattern',
  'knowledgeAntipattern',
  'knowledgeFailure',
  'knowledgePerformance',
  'unrecognizedQuery',
  'knowledgeRelationship',
  'knowledgeSource',
  'knowledgeBenchmark',
  'knowledgeCloudService',
  'knowledgeIndustryPreset',
] as const;

function getModel(modelName: string): PrismaDelegate {
  if (!ALLOWED_MODELS.includes(modelName as (typeof ALLOWED_MODELS)[number])) {
    throw new Error(`Invalid Prisma model name: ${modelName}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[modelName];
}

/**
 * Build Prisma where clause from validated query data.
 */
function buildWhereClause(
  queryData: Record<string, unknown>,
  config: KnowledgeRouteConfig
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  // isActive filter (defaults to true if not specified)
  if (queryData.isActive !== undefined) {
    where.isActive = queryData.isActive;
  } else {
    where.isActive = true;
  }

  // Custom filters
  if (config.filters) {
    for (const filter of config.filters) {
      const value = queryData[filter.param];
      if (value !== undefined && value !== null) {
        const field = filter.field ?? filter.param;
        if (filter.mode === 'has') {
          where[field] = { has: value };
        } else {
          where[field] = value;
        }
      }
    }
  }

  // Search
  const search = queryData.search as string | undefined;
  if (search && config.searchFields.length > 0) {
    where.OR = config.searchFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    }));
  }

  return where;
}

/**
 * Cast JSON fields in data object for Prisma writes.
 */
function castJsonFields(
  data: Record<string, unknown>,
  jsonFields?: JsonFieldName[]
): Record<string, unknown> {
  if (!jsonFields || jsonFields.length === 0) return data;

  const result = { ...data };
  for (const field of jsonFields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = result[field] as Prisma.InputJsonValue;
    }
  }
  return result;
}

/**
 * Build the create data, adding isActive: true and casting JSON fields.
 */
function buildCreateData(
  validatedData: Record<string, unknown>,
  jsonFields?: JsonFieldName[]
): Record<string, unknown> {
  const data = castJsonFields({ ...validatedData }, jsonFields);
  data.isActive = true;
  return data;
}

/**
 * Build update data from validated partial data.
 * Only includes fields that are present (not undefined).
 */
function buildUpdateData(
  validatedData: Record<string, unknown>,
  jsonFields?: JsonFieldName[]
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(validatedData)) {
    if (value !== undefined) {
      data[key] = value;
    }
  }

  return castJsonFields(data, jsonFields);
}

/**
 * Build the unique key where clause for finding duplicates.
 */
function buildUniqueKeyWhere(
  config: KnowledgeRouteConfig,
  data: Record<string, unknown>
): Record<string, unknown> | null {
  if (config.uniqueKey.field) {
    const value = data[config.uniqueKey.field];
    if (value === undefined || value === null) return null;
    return { [config.uniqueKey.field]: value };
  }

  // Composite key
  if (config.uniqueKey.compositeKey && config.uniqueKey.fields) {
    const composite: Record<string, unknown> = {};
    for (const field of config.uniqueKey.fields) {
      const value = data[field];
      if (value === undefined || value === null) return null;
      composite[field] = value;
    }
    return { [config.uniqueKey.compositeKey]: composite };
  }

  return null;
}

/**
 * Get the display value for a unique key conflict error message.
 */
function getUniqueKeyDisplayValue(
  config: KnowledgeRouteConfig,
  data: Record<string, unknown>
): string {
  if (config.uniqueKey.field) {
    return String(data[config.uniqueKey.field] ?? '');
  }

  if (config.uniqueKey.fields) {
    return config.uniqueKey.fields.map((f) => String(data[f] ?? '')).join('/');
  }

  return '';
}

/**
 * Get the unique key field name for display in error messages.
 */
function getUniqueKeyFieldName(config: KnowledgeRouteConfig): string {
  if (config.uniqueKey.field) {
    return config.uniqueKey.field;
  }
  if (config.uniqueKey.fields) {
    return config.uniqueKey.fields.join('/');
  }
  return 'id';
}

/**
 * Standard error handler for all routes.
 */
function handleError(
  error: unknown,
  log: ReturnType<typeof createLogger>,
  operation: string,
  resourceNameKo: string
): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  log.error(
    `${resourceNameKo} ${operation} 실패`,
    error instanceof Error ? error : undefined
  );
  return NextResponse.json(
    { error: `${resourceNameKo} ${operation}에 실패했습니다` },
    { status: 500 }
  );
}

/**
 * Build query parse input from search params.
 * Extracts all base params + extra query params.
 */
function buildQueryParseInput(
  searchParams: URLSearchParams,
  extraQueryParams?: string[]
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    search: searchParams.get('search') || undefined,
    isActive: searchParams.get('isActive') || undefined,
    tags: searchParams.get('tags') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  };

  if (extraQueryParams) {
    for (const param of extraQueryParams) {
      input[param] = searchParams.get(param) || undefined;
    }
  }

  return input;
}

// ============================================
// Route Context type (Next.js App Router)
// ============================================

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================
// Factory: List Route (GET + POST)
// ============================================

/**
 * Creates GET (list) and POST (create) handlers for a knowledge resource.
 */
export function createKnowledgeListRoute(config: KnowledgeRouteConfig) {
  const log = createLogger(`KnowledgeAPI:${config.loggerName}`);
  const model = getModel(config.modelName);

  async function GET(request: NextRequest) {
    try {
      await requireAdmin();

      const { searchParams } = new URL(request.url);
      const queryResult = config.querySchema.safeParse(
        buildQueryParseInput(searchParams, config.extraQueryParams)
      );

      if (!queryResult.success) {
        return NextResponse.json(
          {
            error: '잘못된 쿼리 파라미터',
            details: queryResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      const queryData = queryResult.data as Record<string, unknown>;
      const { page, limit, sortBy, sortOrder } = queryData as {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: string;
      };

      const where = buildWhereClause(queryData, config);
      const total = await model.count({ where });

      const data = await model.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      return handleError(error, log, '목록 조회', config.resourceNameKo);
    }
  }

  async function POST(request: NextRequest) {
    try {
      await requireAdmin();

      const body = await request.json();
      const validationResult = config.createSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: '유효하지 않은 입력 데이터',
            details: validationResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      const validatedData = validationResult.data as Record<string, unknown>;

      // Duplicate check
      const uniqueWhere = buildUniqueKeyWhere(config, validatedData);
      if (uniqueWhere) {
        const existing = await model.findUnique({ where: uniqueWhere });
        if (existing) {
          const fieldName = getUniqueKeyFieldName(config);
          const displayValue = getUniqueKeyDisplayValue(config, validatedData);
          return NextResponse.json(
            { error: `${fieldName} '${displayValue}'가 이미 존재합니다` },
            { status: 409 }
          );
        }
      }

      const createData = buildCreateData(validatedData, config.jsonFields);
      const created = await model.create({ data: createData });

      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      return handleError(error, log, '생성', config.resourceNameKo);
    }
  }

  return { GET, POST };
}

// ============================================
// Factory: Detail Route (GET + PUT + DELETE)
// ============================================

/**
 * Creates GET (detail), PUT (update), and DELETE handlers for a knowledge resource.
 */
export function createKnowledgeDetailRoute(config: KnowledgeRouteConfig) {
  const log = createLogger(`KnowledgeAPI:${config.loggerName}Detail`);
  const model = getModel(config.modelName);

  async function GET(_request: NextRequest, context: RouteContext) {
    try {
      await requireAdmin();
      const { id } = await context.params;

      // Primary lookup by id
      let record = await model.findUnique({ where: { id } });

      // Fallback to semantic ID if configured
      if (!record && config.semanticIdField) {
        record = await model.findUnique({
          where: { [config.semanticIdField]: id },
        });
      }

      if (!record) {
        return NextResponse.json(
          { error: `${config.resourceNameKo}을(를) 찾을 수 없습니다` },
          { status: 404 }
        );
      }

      return NextResponse.json(record);
    } catch (error) {
      return handleError(error, log, '조회', config.resourceNameKo);
    }
  }

  async function PUT(request: NextRequest, context: RouteContext) {
    try {
      await requireAdmin();
      const { id } = await context.params;
      const body = await request.json();

      const validationResult = config.updateSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: '유효하지 않은 입력 데이터',
            details: validationResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      const validatedData = validationResult.data as Record<string, unknown>;

      // Check record exists
      const existing = await model.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { error: `${config.resourceNameKo}을(를) 찾을 수 없습니다` },
          { status: 404 }
        );
      }

      // Duplicate check on unique key change
      if (config.uniqueKey.field) {
        // Simple unique key
        const newValue = validatedData[config.uniqueKey.field];
        const existingRecord = existing as Record<string, unknown>;
        if (
          newValue &&
          newValue !== existingRecord[config.uniqueKey.field]
        ) {
          const duplicate = await model.findUnique({
            where: { [config.uniqueKey.field]: newValue },
          });
          if (duplicate) {
            return NextResponse.json(
              {
                error: `${config.uniqueKey.field} '${String(newValue)}'가 이미 존재합니다`,
              },
              { status: 409 }
            );
          }
        }
      } else if (config.uniqueKey.compositeKey && config.uniqueKey.fields) {
        // Composite unique key
        const existingRecord = existing as Record<string, unknown>;
        const compositeFields = config.uniqueKey.fields;
        const newValues: Record<string, unknown> = {};
        let hasChange = false;

        for (const field of compositeFields) {
          newValues[field] =
            validatedData[field] ?? existingRecord[field];
          if (newValues[field] !== existingRecord[field]) {
            hasChange = true;
          }
        }

        if (hasChange) {
          const duplicate = await model.findUnique({
            where: {
              [config.uniqueKey.compositeKey]: newValues,
            },
          });

          if (duplicate && (duplicate as Record<string, unknown>).id !== id) {
            const displayValue = compositeFields
              .map((f) => String(newValues[f] ?? ''))
              .join('/');
            return NextResponse.json(
              {
                error: `${compositeFields.join('/')} '${displayValue}'가 이미 존재합니다`,
              },
              { status: 409 }
            );
          }
        }
      }

      const updateData = buildUpdateData(validatedData, config.jsonFields);
      const updated = await model.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(updated);
    } catch (error) {
      return handleError(error, log, '수정', config.resourceNameKo);
    }
  }

  async function DELETE(request: NextRequest, context: RouteContext) {
    try {
      await requireAdmin();
      const { id } = await context.params;
      const { searchParams } = new URL(request.url);
      const hard = searchParams.get('hard') === 'true';

      const existing = await model.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { error: `${config.resourceNameKo}을(를) 찾을 수 없습니다` },
          { status: 404 }
        );
      }

      if (hard) {
        await model.delete({ where: { id } });
        return NextResponse.json({
          message: `${config.resourceNameKo}이(가) 영구 삭제되었습니다`,
        });
      } else {
        const softDeleted = await model.update({
          where: { id },
          data: { isActive: false },
        });
        return NextResponse.json({
          message: `${config.resourceNameKo}이(가) 비활성화되었습니다`,
          data: softDeleted,
        });
      }
    } catch (error) {
      return handleError(error, log, '삭제', config.resourceNameKo);
    }
  }

  return { GET, PUT, DELETE };
}

// ============================================
// Re-export config type for route files
// ============================================
export type { KnowledgeRouteConfig, FilterConfig, UniqueKeyConfig };
