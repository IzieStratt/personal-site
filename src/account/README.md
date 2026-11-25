# izie accounts (account.izie.top)

One sign-in for the whole site. Worker code in `src/account/account.js`, page in `website/public/__subdomains/account/`.

- **Passkeys only.** RP ID `izie.top`, ceremonies on `https://account.izie.top`. No passwords.
- **Session** cookie `__Secure-izie_account` on `.izie.top`; any route can call `currentAccount(request, env)`.
- **Domains**: TXT `_izie-verify.<domain>` = `izie-verify=<token>`, checked over DoH and re-checked weekly.
  A verified domain can only be used on comments by its account. Cloudflare zones get a dashboard link and an
  "add it for me" that takes a one-off DNS-edit API token (used once, never stored).
- **Linked**: vibetime (API token), hmojis (token; only the token id is kept), blog comments (by account).
- **Manual verification**: blog editor → accounts → verify, with a private note on who it is.
- **Who can comment**: blog editor → "who can comment" (`anyone` | `verified`), stored as settings key `who`.

Schema: `src/account/schema.sql`, then `src/account/migrate-comments.sql` once (both already applied to izie-blog).
