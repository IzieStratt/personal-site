-- run once after account/schema.sql: ties comments to the account that wrote them
ALTER TABLE comments ADD COLUMN account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS comments_account ON comments (account_id);
