-- izie accounts (account.izie.top, account.js). Lives in the izie-blog D1 database next to the comments.
-- apply with:  wrangler d1 execute izie-blog --remote --file account/schema.sql
-- then, once:  wrangler d1 execute izie-blog --remote --file account/migrate-comments.sql
-- and:         wrangler d1 execute izie-blog --remote --file account/migrate-admin.sql
CREATE TABLE IF NOT EXISTS accounts (
  id              TEXT PRIMARY KEY,                  -- random, base64url
  handle          TEXT NOT NULL UNIQUE,              -- lowercase, shown on the account page
  display_name    TEXT NOT NULL,                     -- default comment name
  created         TEXT NOT NULL,
  ip_hash         TEXT,                              -- for sign-up rate limiting only
  manual_verified INTEGER NOT NULL DEFAULT 0,        -- set by izie in the blog editor
  manual_note     TEXT,                              -- internal: who this is. never sent to the account holder
  manual_at       TEXT
);
CREATE INDEX IF NOT EXISTS accounts_ip ON accounts (ip_hash, created);

-- passkeys only, no passwords. RP ID is izie.top so one passkey works for every subdomain.
CREATE TABLE IF NOT EXISTS account_passkeys (
  id         TEXT PRIMARY KEY,                       -- credential id, base64url
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  public_key TEXT NOT NULL,                          -- JWK (ES256 / P-256)
  sign_count INTEGER NOT NULL DEFAULT 0,
  label      TEXT,
  created    TEXT NOT NULL,
  last_used  TEXT
);
CREATE INDEX IF NOT EXISTS account_passkeys_owner ON account_passkeys (account_id);

CREATE TABLE IF NOT EXISTS account_sessions (
  token_hash TEXT PRIMARY KEY,                       -- sha-256 of the cookie value
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS account_challenges (
  id         TEXT PRIMARY KEY,
  challenge  TEXT NOT NULL,
  purpose    TEXT NOT NULL,                          -- signup | login | add
  data       TEXT,                                   -- JSON: pending handle/name, or the account id
  expires    INTEGER NOT NULL
);

-- domain ownership through a TXT record at _izie-verify.<domain>. A verified domain belongs to one account,
-- and only that account can comment with it.
CREATE TABLE IF NOT EXISTS account_domains (
  account_id   TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  domain       TEXT NOT NULL,
  token        TEXT NOT NULL,
  created      TEXT NOT NULL,
  verified_at  TEXT,
  last_checked TEXT,
  PRIMARY KEY (account_id, domain)
);
CREATE UNIQUE INDEX IF NOT EXISTS account_domains_verified ON account_domains (domain) WHERE verified_at IS NOT NULL;

-- other things on the site that have their own accounts (vibetime, hmojis), linked by proving you hold them
CREATE TABLE IF NOT EXISTS account_links (
  service     TEXT NOT NULL,                         -- vibetime | hmojis
  external_id TEXT NOT NULL,                         -- vibetime handle / hmoji token id (never the token)
  account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  label       TEXT,
  slack_id    TEXT,
  created     TEXT NOT NULL,
  PRIMARY KEY (service, external_id)
);
CREATE INDEX IF NOT EXISTS account_links_owner ON account_links (account_id);

-- who may comment: anyone | verified (a verified domain, or manually verified by izie)
INSERT OR IGNORE INTO settings (key, value) VALUES ('who', 'anyone');
