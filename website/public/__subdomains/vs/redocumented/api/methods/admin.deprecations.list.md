# admin.deprecations.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.deprecations.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_type` | no | string |  |
| `cursor` | no | string |  |
| `deprecation_name` | no | string |  |
| `limit` | no | number |  |
| `team_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `last_updated_ts` | number |
| `deprecations` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.deprecations.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
