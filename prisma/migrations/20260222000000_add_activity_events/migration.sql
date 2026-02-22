-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('prompt_submit', 'llm_modify', 'template_select', 'node_add', 'node_delete', 'node_duplicate', 'node_update', 'edge_add', 'edge_delete', 'edge_reverse', 'diagram_create', 'diagram_update', 'export');

-- CreateTable
CREATE TABLE "activity_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "diagramId" TEXT,
    "prompt" TEXT,
    "detail" JSONB,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_events_userId_idx" ON "activity_events"("userId");

-- CreateIndex
CREATE INDEX "activity_events_diagramId_idx" ON "activity_events"("diagramId");

-- CreateIndex
CREATE INDEX "activity_events_type_idx" ON "activity_events"("type");

-- CreateIndex
CREATE INDEX "activity_events_createdAt_idx" ON "activity_events"("createdAt");

-- CreateIndex
CREATE INDEX "activity_events_sessionId_idx" ON "activity_events"("sessionId");

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
