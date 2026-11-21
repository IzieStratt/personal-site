-- run once: messages shown on someone's account page (e.g. "another account now covers your domain")
CREATE TABLE IF NOT EXISTS account_notices (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS account_notices_owner ON account_notices (account_id, created);
