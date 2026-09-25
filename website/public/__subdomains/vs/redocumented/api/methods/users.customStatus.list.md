# users.customStatus.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/users.customStatus.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `statuses_count_per_section` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `statuses` | Array<{ |
| `id` | string |
| `user_id` | string |
| `text` | string |
| `duration` | string |
| `is_active` | boolean |
| `date_created` | number |
| `date_expire` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/users.customStatus.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
