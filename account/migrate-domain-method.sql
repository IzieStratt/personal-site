-- run once: how a domain was proven. dns (TXT record; covers subdomains) | web (meta tag or .well-known file; that host only)
ALTER TABLE account_domains ADD COLUMN method TEXT NOT NULL DEFAULT 'dns';
