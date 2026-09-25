# files.docs.fetchAccessLevelForUsers

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/files.docs.fetchAccessLevelForUsers

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `users` | no | string |  |
| `file_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `users` | Array<{ |
| `user_id` | string |
| `is_explicitly_shared_with` | boolean |
| `access` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.docs.fetchAccessLevelForUsers.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
