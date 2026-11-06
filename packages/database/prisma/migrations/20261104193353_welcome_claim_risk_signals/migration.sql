/*
  Warnings:

  - The primary key for the `welcome_claim` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `phoneHash` on the `welcome_claim` table. All the data in the column will be lost.
  - The required column `id` was added to the `welcome_claim` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "welcome_claim" DROP CONSTRAINT "welcome_claim_pkey",
DROP COLUMN "phoneHash",
ADD COLUMN     "deviceHash" TEXT,
ADD COLUMN     "id" UUID NOT NULL,
ADD COLUMN     "identityHashes" TEXT[],
ADD COLUMN     "ipHash" TEXT,
ADD CONSTRAINT "welcome_claim_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "welcome_claim_deviceHash_idx" ON "welcome_claim"("deviceHash");

-- CreateIndex
CREATE INDEX "welcome_claim_ipHash_idx" ON "welcome_claim"("ipHash");

-- CreateIndex
CREATE INDEX "welcome_claim_claimedAt_idx" ON "welcome_claim"("claimedAt");
