-- run once: site admins (can claim izie.top domains, verify accounts and set who can comment from account.izie.top)
ALTER TABLE accounts ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;
