import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock chromadb — must be declared before imports
// ---------------------------------------------------------------------------

const mockAdd = vi.fn().mockResolvedValue(undefined);
const mockCount = vi.fn().mockResolvedValue(0);
const mockGetOrCreateCollection = vi.fn().mockResolvedValue({
  add: mockAdd,
  count: mockCount,
});
const mockHeartbeat = vi.fn();

vi.mock('chromadb', () => {
  const MockChromaClient = vi.fn().mockImplementation(function (
    this: {
      heartbeat: typeof mockHeartbeat;
      getOrCreateCollection: typeof mockGetOrCreateCollection;
    },
  ) {
    this.heartbeat = mockHeartbeat;
    this.getOrCreateCollection = mockGetOrCreateCollection;
  });
  return { ChromaClient: MockChromaClient };
});

// ---------------------------------------------------------------------------
// Mock OpenAI embeddings
// ---------------------------------------------------------------------------

vi.mock('openai', () => ({
  default: class MockOpenAI {
    embeddings = {
      create: vi.fn().mockImplementation(({ input }: { input: string[] }) => {
        return Promise.resolve({
          data: input.map(() => ({
            embedding: new Array(1536).fill(0.1),
          })),
        });
      }),
    };
  },
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { resetChromaClient } from '../chromaClient';
import {
  indexAISoftware,
  indexCloudServices,
  indexProductIntelligence,
  indexAll,
} from '../indexer';
import { allAISoftware } from '@/lib/knowledge/aiCatalog';
import { CLOUD_SERVICES } from '@/lib/knowledge/cloudCatalog';
import { allProductIntelligence } from '@/lib/knowledge/productIntelligence';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Count total deployment profiles across all PI entries */
function countDeploymentDocs(): number {
  return allProductIntelligence.reduce(
    (sum, pi) => sum + pi.deploymentProfiles.length,
    0,
  );
}

/** Count total integrations across all PI entries */
function countIntegrationDocs(): number {
  return allProductIntelligence.reduce(
    (sum, pi) => sum + pi.integrations.length,
    0,
  );
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  resetChromaClient();
  mockHeartbeat.mockReset();
  mockAdd.mockClear();
  mockGetOrCreateCollection.mockClear();
  mockCount.mockClear();
});

// ---------------------------------------------------------------------------
// indexAISoftware
// ---------------------------------------------------------------------------

describe('indexAISoftware', () => {
  it('calls collection.add with correct number of documents', async () => {
    mockHeartbeat.mockResolvedValue(true);

    const count = await indexAISoftware();

    expect(mockGetOrCreateCollection).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'infraflow-ai-software' }),
    );
    expect(mockAdd).toHaveBeenCalledTimes(1);

    const addCall = mockAdd.mock.calls[0][0];
    expect(addCall.ids).toHaveLength(allAISoftware.length);
    expect(addCall.documents).toHaveLength(allAISoftware.length);
    expect(addCall.metadatas).toHaveLength(allAISoftware.length);
    expect(addCall.embeddings).toHaveLength(allAISoftware.length);
  });

  it('returns count > 0', async () => {
    mockHeartbeat.mockResolvedValue(true);

    const count = await indexAISoftware();
    expect(count).toBe(allAISoftware.length);
    expect(count).toBeGreaterThan(0);
  });

  it('populates metadata fields correctly for AI software', async () => {
    mockHeartbeat.mockResolvedValue(true);

    await indexAISoftware();

    const addCall = mockAdd.mock.calls[0][0];
    const firstMeta = addCall.metadatas[0];

    // Every AI Software metadata should have these keys
    expect(firstMeta).toHaveProperty('category');
    expect(firstMeta).toHaveProperty('license');
    expect(firstMeta).toHaveProperty('deploymentModel');
    expect(firstMeta).toHaveProperty('infraNodeTypes');

    // Verify the first entry matches allAISoftware[0]
    const first = allAISoftware[0];
    expect(firstMeta.category).toBe(first.category);
    expect(firstMeta.license).toBe(first.license);
    expect(firstMeta.deploymentModel).toBe(first.deploymentModel.join(','));
    expect(firstMeta.infraNodeTypes).toBe(first.infraNodeTypes.join(','));
  });

  it('document text contains product name and description', async () => {
    mockHeartbeat.mockResolvedValue(true);

    await indexAISoftware();

    const addCall = mockAdd.mock.calls[0][0];
    const firstDoc = addCall.documents[0] as string;
    const first = allAISoftware[0];

    expect(firstDoc).toContain(first.name);
    expect(firstDoc).toContain(first.description);
  });
});

// ---------------------------------------------------------------------------
// indexCloudServices
// ---------------------------------------------------------------------------

describe('indexCloudServices', () => {
  it('calls collection.add with correct number of documents', async () => {
    mockHeartbeat.mockResolvedValue(true);

    await indexCloudServices();

    expect(mockGetOrCreateCollection).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'infraflow-cloud-services' }),
    );
    expect(mockAdd).toHaveBeenCalledTimes(1);

    const addCall = mockAdd.mock.calls[0][0];
    expect(addCall.ids).toHaveLength(CLOUD_SERVICES.length);
    expect(addCall.documents).toHaveLength(CLOUD_SERVICES.length);
    expect(addCall.metadatas).toHaveLength(CLOUD_SERVICES.length);
    expect(addCall.embeddings).toHaveLength(CLOUD_SERVICES.length);
  });

  it('returns correct count', async () => {
    mockHeartbeat.mockResolvedValue(true);

    const count = await indexCloudServices();
    expect(count).toBe(CLOUD_SERVICES.length);
    expect(count).toBeGreaterThan(0);
  });

  it('populates metadata fields correctly for cloud services', async () => {
    mockHeartbeat.mockResolvedValue(true);

    await indexCloudServices();

    const addCall = mockAdd.mock.calls[0][0];
    const firstMeta = addCall.metadatas[0];

    expect(firstMeta).toHaveProperty('provider');
    expect(firstMeta).toHaveProperty('serviceCategory');
    expect(firstMeta).toHaveProperty('architectureRole');

    const first = CLOUD_SERVICES[0];
    expect(firstMeta.provider).toBe(first.provider);
    expect(firstMeta.serviceCategory).toBe(first.serviceCategory ?? '');
    expect(firstMeta.architectureRole).toBe(first.architectureRole ?? '');
  });
});

// ---------------------------------------------------------------------------
// indexProductIntelligence
// ---------------------------------------------------------------------------

describe('indexProductIntelligence', () => {
  it('creates docs for deployment profiles AND integrations', async () => {
    mockHeartbeat.mockResolvedValue(true);

    const count = await indexProductIntelligence();

    const expectedDeployDocs = countDeploymentDocs();
    const expectedIntegDocs = countIntegrationDocs();
    const expectedTotal = expectedDeployDocs + expectedIntegDocs;

    expect(count).toBe(expectedTotal);
    expect(count).toBeGreaterThan(0);

    // Two collections: deployment-scenarios and integration-patterns
    expect(mockGetOrCreateCollection).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'infraflow-deployment-scenarios' }),
    );
    expect(mockGetOrCreateCollection).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'infraflow-integration-patterns' }),
    );
  });

  it('populates deployment metadata correctly', async () => {
    mockHeartbeat.mockResolvedValue(true);

    await indexProductIntelligence();

    // Find the deployment add call (first collection call)
    const deployAddCall = mockAdd.mock.calls[0][0];
    const firstMeta = deployAddCall.metadatas[0];

    expect(firstMeta).toHaveProperty('productName');
    expect(firstMeta).toHaveProperty('platform');
    expect(firstMeta).toHaveProperty('os');
    expect(firstMeta).toHaveProperty('category');
  });

  it('populates integration metadata correctly', async () => {
    mockHeartbeat.mockResolvedValue(true);

    await indexProductIntelligence();

    // Integration add call is the second call
    const integAddCall = mockAdd.mock.calls[1][0];
    const firstMeta = integAddCall.metadatas[0];

    expect(firstMeta).toHaveProperty('productName');
    expect(firstMeta).toHaveProperty('target');
    expect(firstMeta).toHaveProperty('method');
  });
});

// ---------------------------------------------------------------------------
// indexAll
// ---------------------------------------------------------------------------

describe('indexAll', () => {
  it('returns totals for all three sources', async () => {
    mockHeartbeat.mockResolvedValue(true);

    const result = await indexAll();

    expect(result).toHaveProperty('aiSoftware');
    expect(result).toHaveProperty('cloudServices');
    expect(result).toHaveProperty('productIntelligence');
    expect(result).toHaveProperty('total');

    expect(result.aiSoftware).toBe(allAISoftware.length);
    expect(result.cloudServices).toBe(CLOUD_SERVICES.length);
    expect(result.productIntelligence).toBe(
      countDeploymentDocs() + countIntegrationDocs(),
    );
  });

  it('total equals sum of individual counts', async () => {
    mockHeartbeat.mockResolvedValue(true);

    const result = await indexAll();

    expect(result.total).toBe(
      result.aiSoftware + result.cloudServices + result.productIntelligence,
    );
  });
});

// ---------------------------------------------------------------------------
// Graceful degradation — ChromaDB unavailable
// ---------------------------------------------------------------------------

describe('when ChromaDB is unavailable', () => {
  beforeEach(() => {
    mockHeartbeat.mockRejectedValue(new Error('Connection refused'));
  });

  it('indexAISoftware returns 0', async () => {
    const count = await indexAISoftware();
    expect(count).toBe(0);
  });

  it('indexCloudServices returns 0', async () => {
    const count = await indexCloudServices();
    expect(count).toBe(0);
  });

  it('indexProductIntelligence returns 0', async () => {
    const count = await indexProductIntelligence();
    expect(count).toBe(0);
  });

  it('indexAll returns all zeros', async () => {
    const result = await indexAll();
    expect(result).toEqual({
      aiSoftware: 0,
      cloudServices: 0,
      productIntelligence: 0,
      total: 0,
    });
  });

  it('does not call collection.add', async () => {
    await indexAll();
    expect(mockAdd).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// ID uniqueness
// ---------------------------------------------------------------------------

describe('ID uniqueness', () => {
  it('IDs are unique across all indexed documents', async () => {
    mockHeartbeat.mockResolvedValue(true);

    // Collect all IDs from add calls
    await indexAll();

    const allIds: string[] = [];
    for (const call of mockAdd.mock.calls) {
      allIds.push(...(call[0].ids as string[]));
    }

    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
