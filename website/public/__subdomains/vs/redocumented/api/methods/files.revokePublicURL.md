# files.revokePublicURL

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.revokePublicURL

Revokes public/external sharing access for a file

## Params

| name | required | type | description |
|---|---|---|---|
| `file` | yes | file | File to revoke. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `file` | { |
| `id` | string |
| `created` | number |
| `timestamp` | number |
| `name` | string |
| `title` | string |
| `mimetype` | string |
| `filetype` | string |
| `pretty_type` | string |
| `user` | string |
| `user_team` | string |
| `size` | number |
| `mode` | string |
| `is_external` | boolean |
| `is_public` | boolean |
| `public_url_shared` | boolean |
| `display_as_bot` | boolean |
| `username` | string |
| `url_private` | string |
| `url_private_download` | string |
| `media_display_type` | string |
| `thumb_64` | string |
| `thumb_80` | string |
| `thumb_360` | string |
| `thumb_360_w` | number |
| `thumb_360_h` | number |
| `thumb_480` | string |
| `thumb_480_w` | number |
| `thumb_480_h` | number |
| `thumb_160` | string |
| `original_w` | number |
| `original_h` | number |
| `thumb_tiny` | string |
| `permalink` | string |
| `permalink_public` | string |
| `comments_count` | number |
| `is_starred` | boolean |
| `shares` | { |
| `private` | Record<string, unknown> |
| `channels` | unknown[] |
| `groups` | string[] |
| `ims` | unknown[] |
| `has_more_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.revokePublicURL.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
