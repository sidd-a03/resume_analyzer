/*
  Warnings:

  - `credit.credits` is renamed to `balance` (edited by hand; Prisma generated a drop + add).

*/
-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('PREVIEW', 'FULL', 'JOB_MATCH');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "LedgerReason" AS ENUM ('WELCOME', 'PURCHASE', 'ANALYSIS', 'UNLOCK', 'REFUND', 'GRANT', 'REVOKE');

-- CreateEnum
CREATE TYPE "CreditPack" AS ENUM ('STARTER', 'STANDARD', 'PRO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_BAN', 'USER_UNBAN', 'USER_SET_ROLE', 'USER_IMPERSONATE', 'USER_DELETE', 'SESSION_REVOKE', 'CREDITS_GRANT', 'CREDITS_REVOKE', 'ANALYSIS_DELETE');

-- DropForeignKey
ALTER TABLE "credit" DROP CONSTRAINT "credit_userId_fkey";

-- AlterTable
-- Renamed by hand so existing balances are kept
ALTER TABLE "credit" RENAME COLUMN "credits" TO "balance";
ALTER TABLE "credit" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "credit" ALTER COLUMN "updatedAt" DROP DEFAULT;
-- Prisma can't express this; a balance can never go negative
ALTER TABLE "credit" ADD CONSTRAINT "credit_balance_nonnegative" CHECK ("balance" >= 0);

-- CreateTable
CREATE TABLE "resume" (
    "id" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "pages" INTEGER NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis" (
    "id" UUID NOT NULL,
    "type" "AnalysisType" NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'QUEUED',
    "inputHash" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "jobTitle" TEXT,
    "jobDescription" TEXT,
    "score" INTEGER,
    "result" JSONB,
    "error" TEXT,
    "progressStep" INTEGER NOT NULL DEFAULT 0,
    "creditsSpent" INTEGER NOT NULL DEFAULT 0,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "resumeId" UUID NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_transaction" (
    "id" UUID NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" "LedgerReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "analysisId" UUID,
    "paymentId" UUID,
    "actorId" UUID,

    CONSTRAINT "credit_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" UUID NOT NULL,
    "pack" "CreditPack" NOT NULL,
    "credits" INTEGER NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL,
    "providerOrderId" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "userId" UUID,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_claim" (
    "phoneNumber" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,

    CONSTRAINT "welcome_claim_pkey" PRIMARY KEY ("phoneNumber")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "targetId" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" UUID,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_contentHash_idx" ON "resume"("contentHash");

-- CreateIndex
CREATE INDEX "resume_userId_createdAt_idx" ON "resume"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "resume_userId_contentHash_key" ON "resume"("userId", "contentHash");

-- CreateIndex
CREATE INDEX "analysis_userId_createdAt_idx" ON "analysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "analysis_status_idx" ON "analysis"("status");

-- CreateIndex
CREATE UNIQUE INDEX "analysis_userId_type_inputHash_promptVersion_key" ON "analysis"("userId", "type", "inputHash", "promptVersion");

-- CreateIndex
CREATE UNIQUE INDEX "credit_transaction_paymentId_key" ON "credit_transaction"("paymentId");

-- CreateIndex
CREATE INDEX "credit_transaction_userId_createdAt_idx" ON "credit_transaction"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "credit_transaction_analysisId_reason_key" ON "credit_transaction"("analysisId", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "payment_providerOrderId_key" ON "payment"("providerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_providerPaymentId_key" ON "payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "payment_userId_createdAt_idx" ON "payment"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "welcome_claim_userId_key" ON "welcome_claim"("userId");

-- CreateIndex
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- CreateIndex
CREATE INDEX "audit_log_actorId_idx" ON "audit_log"("actorId");

-- AddForeignKey
ALTER TABLE "credit" ADD CONSTRAINT "credit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis" ADD CONSTRAINT "analysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analysis" ADD CONSTRAINT "analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_claim" ADD CONSTRAINT "welcome_claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
