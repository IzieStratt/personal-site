# developer.apps.actions.v2.update

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.actions.v2.update

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |
| `action_url` | no | string |  |
| `actions` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `actions` | Array<{ |
| `action_id` | string |
| `app_id` | string |
| `name` | string |
| `desc` | string |
| `description` | string |
| `payload` | null |
| `callback_id` | string |
| `type` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.actions.v2.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
