/*
  Apply keyPrefix addition. We will delete existing rows as per user's instruction
  to avoid NOT NULL constraint issues.
*/

-- Clear existing keys so we can add a NOT NULL column without default
DELETE FROM "api_keys";

-- Add the required column
ALTER TABLE "api_keys" ADD COLUMN "keyPrefix" TEXT NOT NULL;

-- Create index on prefix for fast lookup
CREATE INDEX "api_keys_keyPrefix_idx" ON "api_keys"("keyPrefix");
