-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'PRICING_UPDATE';

-- CreateTable
CREATE TABLE "pack_price" (
    "pack" "CreditPack" NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "pricePaise" INTEGER NOT NULL,
    "blurb" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pack_price_pkey" PRIMARY KEY ("pack")
);

-- CreateTable
CREATE TABLE "analysis_price" (
    "type" "AnalysisType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_price_pkey" PRIMARY KEY ("type")
);

-- Guard rails behind the API's validation
ALTER TABLE "pack_price" ADD CONSTRAINT "pack_price_credits_positive" CHECK ("credits" > 0);
ALTER TABLE "pack_price" ADD CONSTRAINT "pack_price_price_positive" CHECK ("pricePaise" > 0);
ALTER TABLE "analysis_price" ADD CONSTRAINT "analysis_price_credits_positive" CHECK ("credits" > 0);
ALTER TABLE "analysis_price" ADD CONSTRAINT "analysis_price_paid_types_only" CHECK ("type" <> 'PREVIEW');

-- Launch prices (the values that were hardcoded in apps/web/constants/pricing.ts)
INSERT INTO "pack_price" ("pack", "name", "credits", "pricePaise", "blurb", "updatedAt") VALUES
  ('STARTER',  'Starter',  5,  4900,  'Polish one resume before a deadline.',              now()),
  ('STANDARD', 'Standard', 15, 12900, 'Tailor your resume for a round of applications.',   now()),
  ('PRO',      'Pro',      40, 29900, 'For placement season, when you apply everywhere.',  now());

INSERT INTO "analysis_price" ("type", "credits", "updatedAt") VALUES
  ('FULL',      1, now()),
  ('JOB_MATCH', 2, now());
