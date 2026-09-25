# developer.apps.appLevelTokens.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.appLevelTokens.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `app_level_tokens` | Array<{ |
| `id` | number |
| `description` | string |
| `scope` | string |
| `creator_display_name` | string |
| `creator_user_id` | string |
| `date_created` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.appLevelTokens.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
