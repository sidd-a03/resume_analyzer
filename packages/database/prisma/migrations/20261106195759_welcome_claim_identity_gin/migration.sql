-- CreateIndex
CREATE INDEX "welcome_claim_identityHashes_idx" ON "welcome_claim" USING GIN ("identityHashes");
