# admin.analytics.export

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.analytics.export

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `export_type` | no | string |  |
| `sort_direction` | no | string |  |
| `sort_column` | no | string |  |
| `query` | no | string |  |
| `columns` | no | string |  |
| `offline` | no | boolean |  |
| `date_interval` | no | string |  |
| `privacy` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.analytics.export.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
