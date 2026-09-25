# files.getShares

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/files.getShares

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `file_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `tab_shares` | { |
| `count` | number |
| `shares` | Record<string, unknown> |
| `public` | Record<ChannelId, Array<{ |
| `private` | Record<string, unknown> |
| `reply_users` | unknown[] |
| `reply_users_count` | number |
| `reply_count` | number |
| `ts` | string |
| `channel_name` | string |
| `team_id` | string |
| `access` | string |
| `share_user_id` | string |
| `source` | string |
| `is_silent_share` | boolean |
| `conversation_shares` | { |
| `file_channel_shares` | { |
| `viewer_count` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.getShares.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
