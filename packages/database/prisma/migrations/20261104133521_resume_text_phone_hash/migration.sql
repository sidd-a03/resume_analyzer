/*
  Warnings:

  - You are about to drop the column `fileKey` on the `resume` table. All the data in the column will be lost.
  - The primary key for the `welcome_claim` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `phoneNumber` on the `welcome_claim` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneHash` to the `welcome_claim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resume" DROP COLUMN "fileKey",
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "textContent" TEXT;

-- AlterTable
ALTER TABLE "welcome_claim" DROP CONSTRAINT "welcome_claim_pkey",
DROP COLUMN "phoneNumber",
ADD COLUMN     "phoneHash" TEXT NOT NULL,
ADD CONSTRAINT "welcome_claim_pkey" PRIMARY KEY ("phoneHash");

-- CreateIndex
CREATE INDEX "resume_expiresAt_idx" ON "resume"("expiresAt");
