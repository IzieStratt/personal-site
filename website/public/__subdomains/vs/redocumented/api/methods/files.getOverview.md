# files.getOverview

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/files.getOverview

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
| `users_count` | number |
| `channels_count` | number |
| `files_count` | number |
| `visible_users` | unknown[] |
| `visible_channels` | unknown[] |
| `automations_count` | number |
| `max_users_counted` | boolean |
| `max_channels_counted` | boolean |
| `max_files_counted` | boolean |
| `teams_shared_with` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.getOverview.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
