-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('PREVIEW', 'FULL', 'JOB_MATCH');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "history" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "type" "AnalysisType" NOT NULL,
    "status" "AnalysisStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
