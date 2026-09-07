#!/usr/bin/env fish

set -l message $argv[1]
if test -z "$message"
  set message "update personal site"
end

node scripts/sync-subdomains.mjs
or exit 1

git add worker.js wrangler.jsonc scripts website/public/__subdomains subdomains
or exit 1

git commit -m "$message"
or exit 1

git push origin HEAD
