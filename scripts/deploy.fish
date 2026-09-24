#!/usr/bin/env fish

set -l message $argv[1]
if test -z "$message"
  set message "update personal site"
end

git add worker.js hmojis.js wrangler.jsonc quicklinks.js scripts website/public
or exit 1

git commit -m "$message"
or exit 1

git push origin HEAD
