import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseGitHubUrl, isGitHubUrl, fetchGitHubReadme, extractReadmeSections } from '../githubFetcher';

// ---------------------------------------------------------------------------
// Mock global.fetch (used by webFetcher internally)
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// parseGitHubUrl
// ---------------------------------------------------------------------------

describe('parseGitHubUrl', () => {
  it('parses standard github URL', () => {
    const result = parseGitHubUrl('https://github.com/ollama/ollama');
    expect(result).toEqual({ owner: 'ollama', repo: 'ollama' });
  });

  it('parses URL with .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/ollama/ollama.git');
    expect(result).toEqual({ owner: 'ollama', repo: 'ollama' });
  });

  it('parses URL with tree path', () => {
    const result = parseGitHubUrl('https://github.com/langchain-ai/langchain/tree/main/docs');
    expect(result).toEqual({ owner: 'langchain-ai', repo: 'langchain' });
  });

  it('returns null for non-GitHub URL', () => {
    expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
  });

  it('returns null for invalid URL', () => {
    expect(parseGitHubUrl('not-a-url')).toBeNull();
  });

  it('returns null for GitHub URL without repo', () => {
    expect(parseGitHubUrl('https://github.com/owner')).toBeNull();
  });

  it('returns null for GitHub root', () => {
    expect(parseGitHubUrl('https://github.com')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isGitHubUrl
// ---------------------------------------------------------------------------

describe('isGitHubUrl', () => {
  it('returns true for valid GitHub URL', () => {
    expect(isGitHubUrl('https://github.com/ollama/ollama')).toBe(true);
  });

  it('returns false for non-GitHub URL', () => {
    expect(isGitHubUrl('https://example.com')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fetchGitHubReadme
// ---------------------------------------------------------------------------

describe('fetchGitHubReadme', () => {
  it('fetches README from raw.githubusercontent.com', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/plain; charset=utf-8' }),
      text: () => Promise.resolve('# Ollama\n\nRun LLMs locally.'),
    });

    const result = await fetchGitHubReadme('https://github.com/ollama/ollama');

    expect(result).toBe('# Ollama\n\nRun LLMs locally.');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/ollama/ollama/HEAD/README.md',
      expect.any(Object),
    );
  });

  it('throws for non-GitHub URL', async () => {
    await expect(fetchGitHubReadme('https://example.com')).rejects.toThrow(
      'Not a valid GitHub URL',
    );
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchGitHubReadme('https://github.com/no/repo')).rejects.toThrow('HTTP 404');
  });
});

// ---------------------------------------------------------------------------
// extractReadmeSections
// ---------------------------------------------------------------------------

describe('extractReadmeSections', () => {
  const sampleReadme = `# Ollama

Run large language models locally.

## Features

- Run models locally
- API compatible
- Cross-platform

## Installation

\`\`\`bash
curl -fsSL https://ollama.ai/install.sh | sh
\`\`\`

## Requirements

- macOS 12+
- 8GB RAM minimum

## Usage

\`\`\`bash
ollama run llama2
\`\`\`
`;

  it('extracts title', () => {
    const result = extractReadmeSections(sampleReadme);
    expect(result.title).toBe('Ollama');
  });

  it('extracts description from preamble', () => {
    const result = extractReadmeSections(sampleReadme);
    expect(result.description).toContain('Run large language models locally');
  });

  it('extracts features section', () => {
    const result = extractReadmeSections(sampleReadme);
    expect(result.features).toContain('Run models locally');
    expect(result.features).toContain('API compatible');
  });

  it('extracts installation section', () => {
    const result = extractReadmeSections(sampleReadme);
    expect(result.installation).toContain('curl');
  });

  it('extracts requirements section', () => {
    const result = extractReadmeSections(sampleReadme);
    expect(result.requirements).toContain('macOS 12+');
    expect(result.requirements).toContain('8GB RAM');
  });

  it('preserves full text', () => {
    const result = extractReadmeSections(sampleReadme);
    expect(result.fullText).toBe(sampleReadme);
  });

  it('handles README with no sections', () => {
    const result = extractReadmeSections('# Simple Project\n\nJust a description.');
    expect(result.title).toBe('Simple Project');
    expect(result.description).toBe('Just a description.');
    expect(result.installation).toBe('');
    expect(result.requirements).toBe('');
    expect(result.features).toBe('');
  });

  it('handles empty README', () => {
    const result = extractReadmeSections('');
    expect(result.title).toBe('');
    expect(result.description).toBe('');
  });

  it('matches Prerequisites heading to requirements', () => {
    const md = '# Tool\n\n## Prerequisites\n\n- Node.js 18+';
    const result = extractReadmeSections(md);
    expect(result.requirements).toContain('Node.js 18+');
  });

  it('matches Dependencies heading to requirements', () => {
    const md = '# Tool\n\n## Dependencies\n\n- Python 3.10+';
    const result = extractReadmeSections(md);
    expect(result.requirements).toContain('Python 3.10+');
  });

  it('matches Highlights heading to features', () => {
    const md = '# Tool\n\n## Highlights\n\n- Fast execution';
    const result = extractReadmeSections(md);
    expect(result.features).toContain('Fast execution');
  });
});
