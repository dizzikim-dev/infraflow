-- CreateEnum
CREATE TYPE "ComponentCategory" AS ENUM ('security', 'network', 'compute', 'cloud', 'storage', 'auth', 'external');

-- CreateEnum
CREATE TYPE "TierType" AS ENUM ('external', 'dmz', 'internal', 'data');

-- CreateEnum
CREATE TYPE "PolicyPriority" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "PolicyCategory" AS ENUM ('access', 'security', 'monitoring', 'compliance', 'performance');

-- CreateTable
CREATE TABLE "infra_components" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "category" "ComponentCategory" NOT NULL,
    "tier" "TierType" NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionKo" TEXT NOT NULL,
    "functions" TEXT[],
    "functionsKo" TEXT[],
    "features" TEXT[],
    "featuresKo" TEXT[],
    "ports" TEXT[],
    "protocols" TEXT[],
    "vendors" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "infra_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_recommendations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "PolicyPriority" NOT NULL,
    "category" "PolicyCategory" NOT NULL,
    "componentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policy_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "infra_components_componentId_key" ON "infra_components"("componentId");

-- CreateIndex
CREATE INDEX "infra_components_category_idx" ON "infra_components"("category");

-- CreateIndex
CREATE INDEX "infra_components_tier_idx" ON "infra_components"("tier");

-- CreateIndex
CREATE INDEX "infra_components_isActive_idx" ON "infra_components"("isActive");

-- CreateIndex
CREATE INDEX "policy_recommendations_componentId_idx" ON "policy_recommendations"("componentId");

-- CreateIndex
CREATE INDEX "policy_recommendations_priority_idx" ON "policy_recommendations"("priority");

-- AddForeignKey
ALTER TABLE "policy_recommendations" ADD CONSTRAINT "policy_recommendations_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "infra_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;
