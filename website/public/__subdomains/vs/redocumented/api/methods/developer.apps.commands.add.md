# developer.apps.commands.add

- status: undocumented
- verified: not-live-tested (source-only, typed but unverified)
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: ImShyMike/slack-undoc-client (generated types); see methods/slack-undoc-client-2026.md
- call: POST https://slack.com/api/developer.apps.commands.add

params per slack-undoc-client generated types: app?: string; name?: string; desc?: string; usage?: string; parse_full?: string; set_active?: boolean;

## Params

| name | required | type | description |
|---|---|---|---|
| `app` | no | string |  |
| `name` | no | string |  |
| `desc` | no | string |  |
| `usage` | no | string |  |
| `parse_full` | no | string |  |
| `set_active` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `command` | { |
| `name` | string |
| `url` | string |
| `desc` | string |
| `usage` | string |
| `parse_full` | boolean |
| `id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.commands.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
