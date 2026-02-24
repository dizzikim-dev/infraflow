/**
 * RAG Indexer
 *
 * Converts InfraFlow catalog data (AI Software, Cloud Services,
 * Product Intelligence) into ChromaDB documents for semantic search.
 *
 * Each indexer function:
 * 1. Checks ChromaDB availability
 * 2. Builds document text and metadata for each catalog entry
 * 3. Generates vector embeddings (batch)
 * 4. Upserts documents into the appropriate ChromaDB collection
 *
 * Graceful degradation: when ChromaDB is unavailable, functions
 * log a warning and return 0 instead of throwing.
 */

import { createLogger } from '@/lib/utils/logger';
import { getChromaClient, COLLECTIONS } from './chromaClient';
import { generateEmbeddings } from './embeddings';
import { allAISoftware } from '@/lib/knowledge/aiCatalog';
import { CLOUD_SERVICES } from '@/lib/knowledge/cloudCatalog';
import { allProductIntelligence } from '@/lib/knowledge/productIntelligence';

const logger = createLogger('RAGIndexer');

// ---------------------------------------------------------------------------
// AI Software Indexer
// ---------------------------------------------------------------------------

/**
 * Index all AI software catalog data into ChromaDB.
 * Converts AISoftware entries into searchable documents.
 *
 * @returns The number of indexed documents, or 0 if ChromaDB is unavailable
 */
export async function indexAISoftware(): Promise<number> {
  const client = await getChromaClient();
  if (!client) {
    logger.warn('ChromaDB unavailable — skipping AI software indexing');
    return 0;
  }

  const collection = await client.getOrCreateCollection({
    name: COLLECTIONS.AI_SOFTWARE,
  });

  const ids: string[] = [];
  const documents: string[] = [];
  const metadatas: Record<string, string>[] = [];

  for (const software of allAISoftware) {
    ids.push(software.id);

    documents.push(
      `${software.name}: ${software.description}. ${software.recommendedFor.join(', ')}. ${software.architectureRole}`,
    );

    metadatas.push({
      category: software.category,
      license: software.license,
      deploymentModel: software.deploymentModel.join(','),
      infraNodeTypes: software.infraNodeTypes.join(','),
    });
  }

  const embeddings = await generateEmbeddings(documents);

  await collection.add({ ids, documents, metadatas, embeddings });

  logger.info(`Indexed ${ids.length} AI software documents`);
  return ids.length;
}

// ---------------------------------------------------------------------------
// Cloud Services Indexer
// ---------------------------------------------------------------------------

/**
 * Index all cloud service catalog data into ChromaDB.
 * Converts CloudService entries into searchable documents.
 *
 * @returns The number of indexed documents, or 0 if ChromaDB is unavailable
 */
export async function indexCloudServices(): Promise<number> {
  const client = await getChromaClient();
  if (!client) {
    logger.warn('ChromaDB unavailable — skipping cloud services indexing');
    return 0;
  }

  const collection = await client.getOrCreateCollection({
    name: COLLECTIONS.CLOUD_SERVICES,
  });

  const ids: string[] = [];
  const documents: string[] = [];
  const metadatas: Record<string, string>[] = [];

  for (const service of CLOUD_SERVICES) {
    ids.push(service.id);

    documents.push(
      `${service.serviceName}: ${service.features.join(', ')}. ${service.serviceCategory ?? ''}. ${service.architectureRole ?? ''}`,
    );

    metadatas.push({
      provider: service.provider,
      serviceCategory: service.serviceCategory ?? '',
      architectureRole: service.architectureRole ?? '',
    });
  }

  const embeddings = await generateEmbeddings(documents);

  await collection.add({ ids, documents, metadatas, embeddings });

  logger.info(`Indexed ${ids.length} cloud service documents`);
  return ids.length;
}

// ---------------------------------------------------------------------------
// Product Intelligence Indexer
// ---------------------------------------------------------------------------

/**
 * Index Product Intelligence data into deployment and integration collections.
 *
 * Creates one document per deployment profile and one per integration,
 * spread across two separate ChromaDB collections for targeted retrieval.
 *
 * @returns The total number of indexed documents (deployments + integrations),
 *          or 0 if ChromaDB is unavailable
 */
export async function indexProductIntelligence(): Promise<number> {
  const client = await getChromaClient();
  if (!client) {
    logger.warn('ChromaDB unavailable — skipping product intelligence indexing');
    return 0;
  }

  // ── Deployment Scenarios ──────────────────────────────────────────────

  const deployCollection = await client.getOrCreateCollection({
    name: COLLECTIONS.DEPLOYMENT_SCENARIOS,
  });

  const deployIds: string[] = [];
  const deployDocs: string[] = [];
  const deployMetas: Record<string, string>[] = [];

  for (const pi of allProductIntelligence) {
    for (let i = 0; i < pi.deploymentProfiles.length; i++) {
      const profile = pi.deploymentProfiles[i];

      deployIds.push(`${pi.id}-deploy-${i}`);

      deployDocs.push(
        `${pi.name} ${profile.platform} deployment: ${profile.notes}. Install: ${profile.installMethod}. Requires: ${profile.infraComponents.join(', ')}`,
      );

      deployMetas.push({
        productName: pi.name,
        platform: profile.platform,
        os: profile.os.join(','),
        category: pi.category,
      });
    }
  }

  const deployEmbeddings = await generateEmbeddings(deployDocs);

  if (deployIds.length > 0) {
    await deployCollection.add({
      ids: deployIds,
      documents: deployDocs,
      metadatas: deployMetas,
      embeddings: deployEmbeddings,
    });
  }

  // ── Integration Patterns ──────────────────────────────────────────────

  const integCollection = await client.getOrCreateCollection({
    name: COLLECTIONS.INTEGRATION_PATTERNS,
  });

  const integIds: string[] = [];
  const integDocs: string[] = [];
  const integMetas: Record<string, string>[] = [];

  for (const pi of allProductIntelligence) {
    for (let i = 0; i < pi.integrations.length; i++) {
      const integ = pi.integrations[i];

      integIds.push(`${pi.id}-integ-${i}`);

      integDocs.push(
        `${pi.name} integrates with ${integ.target} via ${integ.method}: ${integ.description}. Requires: ${integ.infraComponents.join(', ')}`,
      );

      integMetas.push({
        productName: pi.name,
        target: integ.target,
        method: integ.method,
      });
    }
  }

  const integEmbeddings = await generateEmbeddings(integDocs);

  if (integIds.length > 0) {
    await integCollection.add({
      ids: integIds,
      documents: integDocs,
      metadatas: integMetas,
      embeddings: integEmbeddings,
    });
  }

  const totalCount = deployIds.length + integIds.length;
  logger.info(
    `Indexed ${totalCount} product intelligence documents (${deployIds.length} deployments, ${integIds.length} integrations)`,
  );
  return totalCount;
}

// ---------------------------------------------------------------------------
// Index All
// ---------------------------------------------------------------------------

/**
 * Index all data sources into ChromaDB. Convenience function.
 *
 * @returns Object with counts for each data source and the total
 */
export async function indexAll(): Promise<{
  aiSoftware: number;
  cloudServices: number;
  productIntelligence: number;
  total: number;
}> {
  const aiSoftware = await indexAISoftware();
  const cloudServices = await indexCloudServices();
  const productIntelligence = await indexProductIntelligence();

  const total = aiSoftware + cloudServices + productIntelligence;

  logger.info(`Total indexed: ${total} documents across all collections`);

  return { aiSoftware, cloudServices, productIntelligence, total };
}
