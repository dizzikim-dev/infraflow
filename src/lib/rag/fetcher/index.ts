/**
 * RAG Fetcher Module — Public API
 *
 * Provides external content fetching, caching, indexing, and live augmentation
 * for the RAG pipeline.
 */

// Web Fetcher
export { fetchUrl, htmlToText, contentHash, type FetchUrlOptions, type FetchUrlResult } from './webFetcher';

// GitHub Fetcher
export { parseGitHubUrl, isGitHubUrl, fetchGitHubReadme, extractReadmeSections, type GitHubRepo, type ReadmeSections } from './githubFetcher';

// Fetch Cache
export { isCached, getCachedContent, invalidateCache, normalizeUrl } from './fetchCache';

// Live Indexer
export { indexExternalContent, indexExternalContentBatch, type IndexResult } from './liveIndexer';

// Live Augmenter
export { liveAugment, extractProductNames, type LiveAugmentOptions } from './liveAugmenter';
