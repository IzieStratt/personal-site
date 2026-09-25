# apps.scopes.groupedInfo

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/apps.scopes.groupedInfo

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `app_id` | no | string |  |
| `perspective` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `scope_info` | { |
| `actions` | { |
| `heading` | string |
| `secondary_groups` | { |
| `channel_actions` | { |
| `scopes_info` | Array<{ |
| `scopes` | string[] |
| `description` | string |
| `workspace_actions` | { |
| `user_actions` | { |
| `content` | { |
| `channel_content` | { |
| `workspace_content` | { |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/apps.scopes.groupedInfo.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
