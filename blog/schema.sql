-- comments for blog.izie.top. apply with:  wrangler d1 execute izie-blog --remote --file blog/schema.sql
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post       TEXT    NOT NULL,                       -- post slug
  parent     INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  site       TEXT,                                   -- bare domain, shown as a link
  email      TEXT,                                   -- private: never sent to browsers
  body       TEXT    NOT NULL,                       -- markdown, rendered in the browser
  status     TEXT    NOT NULL DEFAULT 'pending',     -- pending | approved | hidden
  created    TEXT    NOT NULL,                       -- ISO 8601 UTC
  ip_hash    TEXT                                    -- sha-256 of ip + salt, for rate limiting only
);
CREATE INDEX IF NOT EXISTS comments_post ON comments (post, status, created);
CREATE INDEX IF NOT EXISTS comments_ip ON comments (ip_hash, created);

-- mode: review (hold new comments until approved) | open (show immediately) | off (no new comments)
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO settings (key, value) VALUES ('mode', 'review');

-- online blog editor sign-in (blog-passkeys.js). One owner; passkeys are WebAuthn public keys as JWK.
CREATE TABLE IF NOT EXISTS passkeys (
  id         TEXT PRIMARY KEY,                       -- credential id, base64url
  public_key TEXT    NOT NULL,                       -- JWK (ES256 / P-256)
  sign_count INTEGER NOT NULL DEFAULT 0,
  created    TEXT    NOT NULL,
  last_used  TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,                       -- sha-256 of the cookie value
  expires    INTEGER NOT NULL                        -- ms since epoch
);
CREATE TABLE IF NOT EXISTS challenges (
  id         TEXT PRIMARY KEY,
  challenge  TEXT    NOT NULL,
  purpose    TEXT    NOT NULL,                       -- register | login
  expires    INTEGER NOT NULL
);
