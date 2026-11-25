-- run once: when the session last proved its passkey (risky actions ask again after a while),
-- and who asked for each challenge (rate limiting)
ALTER TABLE account_sessions ADD COLUMN auth_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE account_challenges ADD COLUMN ip_hash TEXT;
CREATE INDEX IF NOT EXISTS account_challenges_ip ON account_challenges (ip_hash, expires);
