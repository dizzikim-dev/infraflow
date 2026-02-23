/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // CSP is now set dynamically in middleware with per-request nonce
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

// Wrap with @next/bundle-analyzer when ANALYZE=true.
// Usage: ANALYZE=true npm run build
// The dynamic import uses a variable to prevent Vite's static analysis from
// resolving the optional devDependency during test runs.
let finalConfig = nextConfig;

if (process.env.ANALYZE === 'true') {
  try {
    const pkg = '@next/bundle-analyzer';
    const { default: bundleAnalyzer } = await import(/* @vite-ignore */ pkg);
    const withBundleAnalyzer = bundleAnalyzer({ enabled: true });
    finalConfig = withBundleAnalyzer(nextConfig);
  } catch {
    console.warn(
      'ANALYZE=true but @next/bundle-analyzer is not installed. Run: npm install -D @next/bundle-analyzer',
    );
  }
}

export default finalConfig;
