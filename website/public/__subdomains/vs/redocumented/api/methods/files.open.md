# files.open

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/files.open

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `supports_read_only_check` | no | boolean |  |
| `last_updated` | no | number |  |
| `file_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `viewers` | Array<{ |
| `user_id` | string |
| `date_created` | number |
| `date_updated` | number |
| `is_focused` | boolean |
| `should_subscribe_and_ping` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.open.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
