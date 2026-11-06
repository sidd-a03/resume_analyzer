-- One Google and one GitHub per user
CREATE UNIQUE INDEX "account_userId_providerId_key" ON "account"("userId", "providerId");
