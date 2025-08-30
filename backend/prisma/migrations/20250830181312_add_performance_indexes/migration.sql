-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE INDEX "api_keys_keyHash_idx" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "contact_history_contactId_idx" ON "contact_history"("contactId");

-- CreateIndex
CREATE INDEX "contact_history_contactId_createdAt_idx" ON "contact_history"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "contacts_ownerId_idx" ON "contacts"("ownerId");

-- CreateIndex
CREATE INDEX "contacts_ownerId_lastName_idx" ON "contacts"("ownerId", "lastName");

-- CreateIndex
CREATE INDEX "contacts_externalId_idx" ON "contacts"("externalId");
