/**
 * Diagram Zod Validation Schemas
 */

import { z } from 'zod';

const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValue), z.record(z.string(), jsonValue)])
);

const jsonObject = z.record(z.string(), jsonValue);

export const CreateDiagramSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(200, '제목은 200자 이하여야 합니다'),
  description: z.string().max(2000).optional(),
  spec: jsonObject,
  nodesJson: z.array(jsonObject).optional(),
  edgesJson: z.array(jsonObject).optional(),
  isPublic: z.boolean().default(false),
});

export const UpdateDiagramSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  spec: jsonObject.optional(),
  nodesJson: z.array(jsonObject).optional().nullable(),
  edgesJson: z.array(jsonObject).optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  isPublic: z.boolean().optional(),
});

export type CreateDiagramInput = z.infer<typeof CreateDiagramSchema>;
export type UpdateDiagramInput = z.infer<typeof UpdateDiagramSchema>;
