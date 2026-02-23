/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the server starts. Used for environment validation
 * and startup checks.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run on server (not edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateProductionEnv } = await import('@/lib/config/env');
    validateProductionEnv();
  }
}
