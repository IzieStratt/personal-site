# admin.sessions.accessLogs

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: no
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/admin.sessions.accessLogs

params per slack-undoc-client generated types: limit?: number; team_id?: string;

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `team_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `logins` | Array<{ |
| `team_id` | string |
| `user_id` | string |
| `checksum` | string |
| `user_agent` | string |
| `ip` | string |
| `date_first` | number |
| `date_last` | number |
| `num` | number |
| `ip_info` | null |
| `ua` | { |
| `simple` | string |
| `icon` | string |
| `full` | string |
| `id` | number |
| `username` | string |
| `profile_info` | { |
| `title` | string |
| `phone` | string |
| `skype` | string |
| `real_name` | string |
| `real_name_normalized` | string |
| `display_name` | string |
| `display_name_normalized` | string |
| `fields` | null |
| `status_text` | string |
| `status_emoji` | string |
| `status_emoji_display_info` | unknown[] |
| `status_expiration` | number |
| `avatar_hash` | string |
| `first_name` | string |
| `last_name` | string |
| `image_24` | string |
| `image_32` | string |
| `image_48` | string |
| `image_72` | string |
| `image_192` | string |
| `image_512` | string |
| `status_text_canonical` | string |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.sessions.accessLogs.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
