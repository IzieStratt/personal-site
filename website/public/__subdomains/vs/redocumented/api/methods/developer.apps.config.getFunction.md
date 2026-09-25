# developer.apps.config.getFunction

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.config.getFunction

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |
| `function_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `id` | string |
| `callback_id` | string |
| `name` | string |
| `description` | string |
| `date_created` | number |
| `date_updated` | number |
| `input` | unknown[] |
| `output` | unknown[] |
| `permission_type` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.config.getFunction.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
