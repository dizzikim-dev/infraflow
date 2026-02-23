/**
 * Analyze Route Factory
 *
 * Lightweight factory for generating POST handlers for /api/analyze/* routes.
 * Extracts the common boilerplate (CSRF, rate-limit, JSON parsing, spec validation)
 * into a reusable wrapper, leaving only domain-specific logic in each route file.
 *
 * Two modes:
 *   - `createAnalyzeRoute(config)` — standard: validates InfraSpec, passes (spec, params) to handler
 *   - `createAnalyzeRawRoute(config)` — raw: skips spec validation, passes full parsed body to handler
 *
 * @module lib/api/analyzeRouteFactory
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAnalyzeRequest, checkRequestSize } from './analyzeRouteUtils';
import { isInfraSpec } from '@/types/guards';
import type { InfraSpec } from '@/types/infra';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('AnalyzeRouteFactory');

// ============================================
// Types
// ============================================

/**
 * Config for a standard analyze route that requires a valid InfraSpec.
 *
 * The handler receives the validated spec plus any additional body params.
 */
export interface AnalyzeRouteConfig<TResult> {
  /** Human-readable name for error messages (e.g., 'Vulnerability') */
  name: string;
  /** Domain-specific analysis function */
  handler: (spec: InfraSpec, params: Record<string, unknown>) => TResult;
}

/**
 * Config for a raw analyze route that handles its own body validation.
 *
 * Useful for multi-action routes (e.g., cloud) where spec validation
 * is conditional on the action.
 */
export interface AnalyzeRawRouteConfig<TResult> {
  /** Human-readable name for error messages */
  name: string;
  /** Handler receives the full parsed body and returns a NextResponse or result */
  handler: (body: Record<string, unknown>) => TResult | NextResponse;
}

// ============================================
// Factory: standard (spec-validated)
// ============================================

/**
 * Create a POST handler that validates CSRF, rate-limit, JSON, and InfraSpec,
 * then delegates to the provided handler.
 *
 * @example
 * ```ts
 * export const POST = createAnalyzeRoute({
 *   name: 'Vulnerability',
 *   handler: (spec) => {
 *     const vulnerabilities = getVulnerabilitiesForSpec(spec);
 *     return { vulnerabilities };
 *   },
 * });
 * ```
 */
export function createAnalyzeRoute<TResult>(config: AnalyzeRouteConfig<TResult>) {
  return async function POST(request: NextRequest) {
    // Check request size
    const sizeError = checkRequestSize(request);
    if (sizeError) return sizeError;

    // CSRF + rate-limit check
    const check = await validateAnalyzeRequest(request);
    if (!check.passed) return check.errorResponse!;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    try {
      const { spec, ...params } = body as Record<string, unknown>;

      if (!spec || !isInfraSpec(spec)) {
        return NextResponse.json({ error: 'Invalid spec' }, { status: 400 });
      }

      const result = config.handler(spec, params);
      return NextResponse.json(result);
    } catch (error) {
      log.error(
        `${config.name} analysis failed`,
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
  };
}

// ============================================
// Factory: raw (no spec validation)
// ============================================

/**
 * Create a POST handler that validates CSRF, rate-limit, and JSON,
 * but delegates all body validation to the handler.
 *
 * If the handler returns a NextResponse, it is returned directly.
 * Otherwise, the return value is wrapped in NextResponse.json().
 *
 * @example
 * ```ts
 * export const POST = createAnalyzeRawRoute({
 *   name: 'Cloud',
 *   handler: (body) => {
 *     const { action, spec } = body;
 *     if (action === 'deprecations') { ... }
 *     return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
 *   },
 * });
 * ```
 */
export function createAnalyzeRawRoute<TResult>(config: AnalyzeRawRouteConfig<TResult>) {
  return async function POST(request: NextRequest) {
    // Check request size
    const sizeError = checkRequestSize(request);
    if (sizeError) return sizeError;

    // CSRF + rate-limit check
    const check = await validateAnalyzeRequest(request);
    if (!check.passed) return check.errorResponse!;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    try {
      const result = config.handler(body as Record<string, unknown>);

      // If handler returns a NextResponse, pass it through directly
      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json(result);
    } catch (error) {
      log.error(
        `${config.name} analysis failed`,
        error instanceof Error ? error : new Error(String(error))
      );
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
  };
}
