-- AlterTable
ALTER TABLE "analysis" ADD COLUMN     "inputTokens" INTEGER,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "outputTokens" INTEGER;

-- CreateIndex
CREATE INDEX "analysis_type_inputHash_idx" ON "analysis"("type", "inputHash");
