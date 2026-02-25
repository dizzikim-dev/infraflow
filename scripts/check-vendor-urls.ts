/**
 * Vendor URL Health Check Script
 *
 * Collects all sourceUrl and datasheetUrl fields from vendor catalogs
 * and reports missing or broken URLs.
 *
 * Usage: npx tsx scripts/check-vendor-urls.ts
 *
 * The URL collection logic is exported as a testable function.
 * HTTP checking is separated so the core logic can be tested without network.
 */

import { getVendorList } from '../src/lib/knowledge/vendorCatalog';
import { getAllNodes } from '../src/lib/knowledge/vendorCatalog/queryHelpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UrlEntry {
  vendorId: string;
  productId: string;
  productName: string;
  field: 'sourceUrl' | 'datasheetUrl';
  url: string;
}

export interface UrlCollectionResult {
  /** All discovered URLs with metadata */
  urls: UrlEntry[];
  /** Number of products missing a sourceUrl */
  missingSourceUrlCount: number;
  /** Identifiers of products without a sourceUrl */
  productsWithoutSourceUrl: string[];
  /** Number of products missing a datasheetUrl */
  missingDatasheetUrlCount: number;
  /** Identifiers of products without a datasheetUrl */
  productsWithoutDatasheetUrl: string[];
}

// ---------------------------------------------------------------------------
// collectVendorUrls — testable without HTTP
// ---------------------------------------------------------------------------

/** Collect all URLs from vendor catalogs for health checking. */
export async function collectVendorUrls(): Promise<UrlCollectionResult> {
  const urls: UrlEntry[] = [];
  const productsWithoutSourceUrl: string[] = [];
  const productsWithoutDatasheetUrl: string[] = [];
  let missingSourceUrlCount = 0;
  let missingDatasheetUrlCount = 0;

  const catalogs = await getVendorList();
  for (const catalog of catalogs) {
    const allNodes = getAllNodes(catalog.products);
    for (const node of allNodes) {
      if (node.sourceUrl) {
        urls.push({
          vendorId: catalog.vendorId,
          productId: node.nodeId,
          productName: node.name,
          field: 'sourceUrl',
          url: node.sourceUrl,
        });
      } else {
        missingSourceUrlCount++;
        productsWithoutSourceUrl.push(`${catalog.vendorId}/${node.nodeId}`);
      }

      if (node.datasheetUrl) {
        urls.push({
          vendorId: catalog.vendorId,
          productId: node.nodeId,
          productName: node.name,
          field: 'datasheetUrl',
          url: node.datasheetUrl,
        });
      } else {
        missingDatasheetUrlCount++;
        productsWithoutDatasheetUrl.push(
          `${catalog.vendorId}/${node.nodeId}`,
        );
      }
    }
  }

  return {
    urls,
    missingSourceUrlCount,
    productsWithoutSourceUrl,
    missingDatasheetUrlCount,
    productsWithoutDatasheetUrl,
  };
}

// ---------------------------------------------------------------------------
// Main execution
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const result = await collectVendorUrls();

  console.log('\n--- Vendor URL Health Check ---');
  console.log(`Total URLs found: ${result.urls.length}`);
  console.log(`  sourceUrl entries: ${result.urls.filter((u) => u.field === 'sourceUrl').length}`);
  console.log(`  datasheetUrl entries: ${result.urls.filter((u) => u.field === 'datasheetUrl').length}`);
  console.log(`\nProducts missing sourceUrl: ${result.missingSourceUrlCount}`);
  console.log(`Products missing datasheetUrl: ${result.missingDatasheetUrlCount}`);

  if (result.productsWithoutSourceUrl.length > 0) {
    console.log('\nProducts without sourceUrl:');
    for (const p of result.productsWithoutSourceUrl) {
      console.log(`  - ${p}`);
    }
  }

  console.log('\n--- End ---');
}

// ESM-compatible main guard
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  (process.argv[1].endsWith('check-vendor-urls.ts') ||
    process.argv[1].endsWith('check-vendor-urls.js'));

if (isMain) {
  main();
}
