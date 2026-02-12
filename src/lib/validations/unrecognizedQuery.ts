import { z } from 'zod';

/**
 * Schema for logging an unrecognized query (POST /api/log-unrecognized)
 */
export const logUnrecognizedSchema = z.object({
  query: z.string().min(1).max(1000),
  confidence: z.number().min(0).max(1),
  sessionId: z.string().max(100).optional(),
});

/**
 * Schema for querying unrecognized queries (GET list)
 */
export const unrecognizedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(200).optional(),
  isResolved: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'confidence']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Schema for creating an unrecognized query (POST admin)
 */
export const createUnrecognizedQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  confidence: z.number().min(0).max(1).optional().default(0.3),
  sessionId: z.string().max(100).optional(),
  userAgent: z.string().max(500).optional(),
});

/**
 * Schema for updating an unrecognized query (PUT admin)
 */
export const updateUnrecognizedQuerySchema = z.object({
  adminNotes: z.string().max(2000).optional(),
  suggestedType: z.string().max(100).optional(),
  isResolved: z.boolean().optional(),
});

export type LogUnrecognizedInput = z.infer<typeof logUnrecognizedSchema>;
export type UnrecognizedQueryInput = z.infer<typeof unrecognizedQuerySchema>;
export type CreateUnrecognizedQueryInput = z.infer<typeof createUnrecognizedQuerySchema>;
export type UpdateUnrecognizedQueryInput = z.infer<typeof updateUnrecognizedQuerySchema>;
