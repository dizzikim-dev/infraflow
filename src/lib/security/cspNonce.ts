/**
 * CSP Nonce Generator & Header Builder
 *
 * Generates cryptographic nonces for Content-Security-Policy headers,
 * replacing 'unsafe-inline' in script-src with nonce-based allowlisting.
 *
 * Uses Web Crypto API (crypto.getRandomValues) for Edge Runtime compatibility.
 *
 * @module security/cspNonce
 */

/**
 * Generate a cryptographic nonce suitable for CSP headers.
 * Uses crypto.getRandomValues (Edge Runtime compatible) to produce
 * 16 random bytes encoded as base64.
 *
 * @returns Base64-encoded nonce string (24 characters)
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // Convert Uint8Array to base64 string (Edge Runtime compatible)
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Build a Content-Security-Policy header string with the given nonce.
 *
 * - script-src uses nonce instead of 'unsafe-inline' (keeps 'unsafe-eval' for Next.js dev)
 * - style-src keeps 'unsafe-inline' (Tailwind CSS / next/font requirement)
 * - All other directives remain unchanged from the static CSP
 *
 * @param nonce - Base64-encoded nonce from generateNonce()
 * @returns Complete CSP header value string
 */
export function buildCspHeader(nonce: string): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-eval' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self' https://api.anthropic.com",
    "frame-ancestors 'none'",
  ];

  return directives.join('; ');
}
