-- Word suggestions for the Shiritori game (vs.izie.top/shatori). Apply with:
--   wrangler d1 execute izie-blog --remote --file suggestions-schema.sql
-- Same database as the blog comments (binding COMMENTS), its own table.
CREATE TABLE IF NOT EXISTS word_suggestions (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  word    TEXT    NOT NULL UNIQUE,            -- lowercase a-z, 4 to 29 letters
  count   INTEGER NOT NULL DEFAULT 1,         -- how many times players suggested it
  status  TEXT    NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
  created TEXT    NOT NULL,                   -- ISO 8601 UTC
  ip_hash TEXT                                -- sha-256 of ip + salt, for rate limiting only
);
CREATE INDEX IF NOT EXISTS word_suggestions_status ON word_suggestions (status, count);
CREATE INDEX IF NOT EXISTS word_suggestions_ip ON word_suggestions (ip_hash, created);

-- running total of D1 operations the suggestions endpoint has spent each UTC day (server-side cap)
CREATE TABLE IF NOT EXISTS suggestion_budget (
  day TEXT PRIMARY KEY, -- YYYY-MM-DD, UTC
  ops INTEGER NOT NULL DEFAULT 0
);
