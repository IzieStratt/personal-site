-- run once on databases made before migrate-notices.sql had it: who sent a message
ALTER TABLE account_notices ADD COLUMN sender TEXT;
