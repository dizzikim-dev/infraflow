/**
 * GitHub README Fetcher
 *
 * Fetches and parses GitHub repository README files for RAG indexing.
 * Uses raw.githubusercontent.com to avoid API rate limits (no auth needed).
 */

import { createLogger } from '@/lib/utils/logger';
import { fetchUrl, type FetchUrlOptions } from './webFetcher';

const log = createLogger('GitHubFetcher');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface ReadmeSections {
  title: string;
  description: string;
  installation: string;
  requirements: string;
  features: string;
  fullText: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a GitHub URL to extract owner and repo.
 * Supports:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/main/...
 * - https://github.com/owner/repo.git
 *
 * @returns GitHubRepo or null if not a valid GitHub URL
 */
export function parseGitHubUrl(url: string): GitHubRepo | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ''),
    };
  } catch {
    return null;
  }
}

/**
 * Check whether a URL points to a GitHub repository.
 */
export function isGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}

/**
 * Fetch a GitHub repo's README.md using raw.githubusercontent.com.
 *
 * Tries HEAD branch first (GitHub's default alias), which resolves
 * to the repo's default branch (main, master, etc.).
 */
export async function fetchGitHubReadme(
  url: string,
  options?: FetchUrlOptions,
): Promise<string> {
  const repo = parseGitHubUrl(url);
  if (!repo) {
    throw new Error(`Not a valid GitHub URL: ${url}`);
  }

  const rawUrl = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/HEAD/README.md`;

  log.debug('Fetching GitHub README', { owner: repo.owner, repo: repo.repo });

  const result = await fetchUrl(rawUrl, options);
  return result.content;
}

/**
 * Extract structured sections from a README markdown text.
 *
 * Parses common headings (Installation, Requirements, Features) and
 * extracts the content under each. Returns a structured object.
 */
export function extractReadmeSections(markdown: string): ReadmeSections {
  const lines = markdown.split('\n');

  // Extract title from first heading
  let title = '';
  let description = '';
  const sections: Record<string, string[]> = {};
  let currentSection = '_preamble';
  sections[currentSection] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      const heading = headingMatch[1].trim().toLowerCase();
      if (!title) {
        title = headingMatch[1].trim();
        currentSection = '_preamble';
        continue;
      }

      if (heading.includes('install')) {
        currentSection = 'installation';
      } else if (heading.includes('require') || heading.includes('prerequisite') || heading.includes('depend')) {
        currentSection = 'requirements';
      } else if (heading.includes('feature') || heading.includes('highlight')) {
        currentSection = 'features';
      } else {
        currentSection = heading;
      }

      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
    } else {
      sections[currentSection]?.push(line);
    }
  }

  // Description is the preamble text (first non-heading, non-empty content)
  const preamble = (sections['_preamble'] ?? []).join('\n').trim();
  description = preamble.split('\n\n')[0] ?? '';

  return {
    title,
    description,
    installation: (sections['installation'] ?? []).join('\n').trim(),
    requirements: (sections['requirements'] ?? []).join('\n').trim(),
    features: (sections['features'] ?? []).join('\n').trim(),
    fullText: markdown,
  };
}
