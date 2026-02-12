-- CreateEnum
CREATE TYPE "KnowledgeRelType" AS ENUM ('requires', 'recommends', 'conflicts', 'enhances', 'protects');

-- CreateEnum
CREATE TYPE "KnowledgeStrength" AS ENUM ('mandatory', 'strong', 'weak');

-- CreateEnum
CREATE TYPE "KnowledgeDirection" AS ENUM ('upstream', 'downstream', 'bidirectional');

-- CreateEnum
CREATE TYPE "AntiPatternSeverity" AS ENUM ('critical', 'high', 'medium');

-- CreateEnum
CREATE TYPE "FailureImpact" AS ENUM ('service_down', 'degraded', 'data_loss', 'security_breach');

-- CreateEnum
CREATE TYPE "Likelihood" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "ScalingStrategy" AS ENUM ('horizontal', 'vertical', 'both');

-- CreateEnum
CREATE TYPE "CloudProvider" AS ENUM ('aws', 'azure', 'gcp');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('active', 'deprecated', 'preview', 'end_of_life');

-- CreateEnum
CREATE TYPE "PricingTier" AS ENUM ('free', 'low', 'medium', 'high', 'enterprise');

-- CreateEnum
CREATE TYPE "TrafficTier" AS ENUM ('small', 'medium', 'large', 'enterprise');

-- CreateEnum
CREATE TYPE "IndustryType" AS ENUM ('financial', 'healthcare', 'government', 'ecommerce', 'general');

-- CreateEnum
CREATE TYPE "SecurityLevel" AS ENUM ('basic', 'standard', 'enhanced', 'maximum');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('rfc', 'nist', 'cis', 'owasp', 'vendor', 'academic', 'industry', 'user_verified', 'user_unverified');

-- CreateEnum
CREATE TYPE "VulnSeverity" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateTable
CREATE TABLE "knowledge_relationships" (
    "id" TEXT NOT NULL,
    "knowledgeId" TEXT NOT NULL,
    "sourceComponent" TEXT NOT NULL,
    "targetComponent" TEXT NOT NULL,
    "relationshipType" "KnowledgeRelType" NOT NULL,
    "strength" "KnowledgeStrength" NOT NULL,
    "direction" "KnowledgeDirection" NOT NULL,
    "reason" TEXT NOT NULL,
    "reasonKo" TEXT NOT NULL,
    "tags" TEXT[],
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_patterns" (
    "id" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "requiredComponents" JSONB NOT NULL,
    "optionalComponents" JSONB NOT NULL,
    "scalability" TEXT NOT NULL,
    "complexity" INTEGER NOT NULL,
    "bestForKo" TEXT[],
    "notSuitableForKo" TEXT[],
    "evolvesTo" TEXT[],
    "evolvesFrom" TEXT[],
    "tags" TEXT[],
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_antipatterns" (
    "id" TEXT NOT NULL,
    "antiPatternId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "severity" "AntiPatternSeverity" NOT NULL,
    "detectionRuleId" TEXT NOT NULL,
    "detectionDescriptionKo" TEXT NOT NULL,
    "problemKo" TEXT NOT NULL,
    "impactKo" TEXT NOT NULL,
    "solutionKo" TEXT NOT NULL,
    "tags" TEXT[],
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_antipatterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_failures" (
    "id" TEXT NOT NULL,
    "failureId" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "scenarioKo" TEXT NOT NULL,
    "impact" "FailureImpact" NOT NULL,
    "likelihood" "Likelihood" NOT NULL,
    "affectedComponents" TEXT[],
    "preventionKo" TEXT[],
    "mitigationKo" TEXT[],
    "estimatedMTTR" TEXT NOT NULL,
    "tags" TEXT[],
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_performance" (
    "id" TEXT NOT NULL,
    "performanceId" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "latencyRange" JSONB NOT NULL,
    "throughputRange" JSONB NOT NULL,
    "scalingStrategy" "ScalingStrategy" NOT NULL,
    "bottleneckIndicators" TEXT[],
    "bottleneckIndicatorsKo" TEXT[],
    "optimizationTipsKo" TEXT[],
    "tags" TEXT[],
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_vulnerabilities" (
    "id" TEXT NOT NULL,
    "vulnId" TEXT NOT NULL,
    "cveId" TEXT,
    "affectedComponents" TEXT[],
    "severity" "VulnSeverity" NOT NULL,
    "cvssScore" DOUBLE PRECISION,
    "title" TEXT NOT NULL,
    "titleKo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "mitigation" TEXT NOT NULL,
    "mitigationKo" TEXT NOT NULL,
    "publishedDate" TEXT NOT NULL,
    "references" TEXT[],
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_vulnerabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_cloud_services" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "provider" "CloudProvider" NOT NULL,
    "componentType" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceNameKo" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL,
    "successor" TEXT,
    "features" TEXT[],
    "featuresKo" TEXT[],
    "pricingTier" "PricingTier" NOT NULL,
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_cloud_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_benchmarks" (
    "id" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "trafficTier" "TrafficTier" NOT NULL,
    "recommendedInstanceCount" INTEGER NOT NULL,
    "recommendedSpec" TEXT NOT NULL,
    "recommendedSpecKo" TEXT NOT NULL,
    "minimumInstanceCount" INTEGER NOT NULL,
    "minimumSpec" TEXT NOT NULL,
    "minimumSpecKo" TEXT NOT NULL,
    "scalingNotes" TEXT NOT NULL,
    "scalingNotesKo" TEXT NOT NULL,
    "estimatedMonthlyCost" DOUBLE PRECISION,
    "maxRPS" INTEGER NOT NULL,
    "trustMetadata" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_industry_presets" (
    "id" TEXT NOT NULL,
    "industryType" "IndustryType" NOT NULL,
    "name" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "requiredFrameworks" TEXT[],
    "requiredComponents" TEXT[],
    "recommendedComponents" TEXT[],
    "minimumSecurityLevel" "SecurityLevel" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_industry_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "section" TEXT,
    "publishedDate" TEXT,
    "accessedDate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_relationships_knowledgeId_key" ON "knowledge_relationships"("knowledgeId");

-- CreateIndex
CREATE INDEX "knowledge_relationships_sourceComponent_idx" ON "knowledge_relationships"("sourceComponent");

-- CreateIndex
CREATE INDEX "knowledge_relationships_targetComponent_idx" ON "knowledge_relationships"("targetComponent");

-- CreateIndex
CREATE INDEX "knowledge_relationships_relationshipType_idx" ON "knowledge_relationships"("relationshipType");

-- CreateIndex
CREATE INDEX "knowledge_relationships_isActive_idx" ON "knowledge_relationships"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_patterns_patternId_key" ON "knowledge_patterns"("patternId");

-- CreateIndex
CREATE INDEX "knowledge_patterns_scalability_idx" ON "knowledge_patterns"("scalability");

-- CreateIndex
CREATE INDEX "knowledge_patterns_isActive_idx" ON "knowledge_patterns"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_antipatterns_antiPatternId_key" ON "knowledge_antipatterns"("antiPatternId");

-- CreateIndex
CREATE INDEX "knowledge_antipatterns_severity_idx" ON "knowledge_antipatterns"("severity");

-- CreateIndex
CREATE INDEX "knowledge_antipatterns_isActive_idx" ON "knowledge_antipatterns"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_failures_failureId_key" ON "knowledge_failures"("failureId");

-- CreateIndex
CREATE INDEX "knowledge_failures_component_idx" ON "knowledge_failures"("component");

-- CreateIndex
CREATE INDEX "knowledge_failures_impact_idx" ON "knowledge_failures"("impact");

-- CreateIndex
CREATE INDEX "knowledge_failures_isActive_idx" ON "knowledge_failures"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_performance_performanceId_key" ON "knowledge_performance"("performanceId");

-- CreateIndex
CREATE INDEX "knowledge_performance_component_idx" ON "knowledge_performance"("component");

-- CreateIndex
CREATE INDEX "knowledge_performance_scalingStrategy_idx" ON "knowledge_performance"("scalingStrategy");

-- CreateIndex
CREATE INDEX "knowledge_performance_isActive_idx" ON "knowledge_performance"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_vulnerabilities_vulnId_key" ON "knowledge_vulnerabilities"("vulnId");

-- CreateIndex
CREATE INDEX "knowledge_vulnerabilities_severity_idx" ON "knowledge_vulnerabilities"("severity");

-- CreateIndex
CREATE INDEX "knowledge_vulnerabilities_isActive_idx" ON "knowledge_vulnerabilities"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_cloud_services_serviceId_key" ON "knowledge_cloud_services"("serviceId");

-- CreateIndex
CREATE INDEX "knowledge_cloud_services_provider_idx" ON "knowledge_cloud_services"("provider");

-- CreateIndex
CREATE INDEX "knowledge_cloud_services_componentType_idx" ON "knowledge_cloud_services"("componentType");

-- CreateIndex
CREATE INDEX "knowledge_cloud_services_status_idx" ON "knowledge_cloud_services"("status");

-- CreateIndex
CREATE INDEX "knowledge_cloud_services_isActive_idx" ON "knowledge_cloud_services"("isActive");

-- CreateIndex
CREATE INDEX "knowledge_benchmarks_isActive_idx" ON "knowledge_benchmarks"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_benchmarks_componentType_trafficTier_key" ON "knowledge_benchmarks"("componentType", "trafficTier");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_industry_presets_industryType_key" ON "knowledge_industry_presets"("industryType");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_sources_sourceId_key" ON "knowledge_sources"("sourceId");

-- CreateIndex
CREATE INDEX "knowledge_sources_sourceType_idx" ON "knowledge_sources"("sourceType");

-- CreateIndex
CREATE INDEX "knowledge_sources_isActive_idx" ON "knowledge_sources"("isActive");
