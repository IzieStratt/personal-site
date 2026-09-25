# developer.apps.scope.list

- status: undocumented
- verified: existence-only (sample-checked)
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/developer.apps.scope.list

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
| `submission_id` | null |
| `install_url` | string |
| `scope_constraints` | { |
| `user` | Array<{ |
| `type` | string |
| `name` | string |
| `requires` | string[] |
| `bot` | Array<{ |
| `legacy_scopes` | unknown[] |
| `bot_token_scopes` | Array<{ |
| `id` | string |
| `description` | string |
| `methods` | string[] |
| `is_required` | boolean |
| `is_selected` | boolean |
| `is_deprecated` | boolean |
| `reason` | string |
| `parent_scope` | null |
| `child_scopes` | null |
| `is_optional` | boolean |
| `user_token_scopes` | Array<{ |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/developer.apps.scope.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
