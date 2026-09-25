# apps.team.variables.get

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/apps.team.variables.get

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `team` | no | string |  |
| `names` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `variables` | Array<{ |
| `source` | string |
| `name` | string |
| `value` | string |
| `note` | string |
| `is_secret` | boolean |
| `is_locked` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.team.variables.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
