/**
 * Knowledge Vulnerability API 엔드포인트
 *
 * GET  /api/knowledge/vulnerabilities - 취약점 목록 조회 (페이지네이션, 필터링)
 * POST /api/knowledge/vulnerabilities - 새 취약점 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/generated/prisma';
import { requireAdmin, AuthError } from '@/lib/auth/authHelpers';
import { createLogger } from '@/lib/utils/logger';
import {
  VulnerabilityQuerySchema,
  CreateVulnerabilitySchema,
} from '@/lib/validations/knowledge';

const log = createLogger('KnowledgeAPI:Vulnerabilities');

/**
 * GET /api/knowledge/vulnerabilities
 * 취약점 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const queryResult = VulnerabilityQuerySchema.safeParse({
      severity: searchParams.get('severity') || undefined,
      component: searchParams.get('component') || undefined,
      search: searchParams.get('search') || undefined,
      isActive: searchParams.get('isActive') || undefined,
      tags: searchParams.get('tags') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: '잘못된 쿼리 파라미터', details: queryResult.error.flatten() },
        { status: 400 }
      );
    }

    const { severity, component, search, isActive, page, limit, sortBy, sortOrder } = queryResult.data;

    const where: Prisma.KnowledgeVulnerabilityWhereInput = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else {
      where.isActive = true;
    }

    if (severity) {
      where.severity = severity;
    }

    if (component) {
      where.affectedComponents = { has: component };
    }

    if (search) {
      where.OR = [
        { vulnId: { contains: search, mode: 'insensitive' } },
        { cveId: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { titleKo: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { descriptionKo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.knowledgeVulnerability.count({ where });

    const data = await prisma.knowledgeVulnerability.findMany({
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
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('취약점 목록 조회 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '취약점 목록 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/knowledge/vulnerabilities
 * 새 취약점 생성
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const validationResult = CreateVulnerabilitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력 데이터', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // vulnId 중복 확인
    const existing = await prisma.knowledgeVulnerability.findUnique({
      where: { vulnId: data.vulnId },
    });

    if (existing) {
      return NextResponse.json(
        { error: `vulnId '${data.vulnId}'가 이미 존재합니다` },
        { status: 409 }
      );
    }

    const vulnerability = await prisma.knowledgeVulnerability.create({
      data: {
        vulnId: data.vulnId,
        cveId: data.cveId,
        affectedComponents: data.affectedComponents,
        severity: data.severity,
        cvssScore: data.cvssScore,
        title: data.title,
        titleKo: data.titleKo,
        description: data.description,
        descriptionKo: data.descriptionKo,
        mitigation: data.mitigation,
        mitigationKo: data.mitigationKo,
        publishedDate: data.publishedDate,
        references: data.references,
        trustMetadata: data.trustMetadata as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return NextResponse.json(vulnerability, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    log.error('취약점 생성 실패', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: '취약점 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
