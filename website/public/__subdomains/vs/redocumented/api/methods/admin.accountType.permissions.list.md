# admin.accountType.permissions.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.accountType.permissions.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `entity_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `permissions` | Array<{ |
| `permission_name` | string |
| `assigned_account_types` | string[] |
| `always_assigned_account_types` | string[] |
| `configurable_account_types` | string[] |
| `is_top_level_only` | boolean |
| `who_can_configure_account_types` | string[] |
| `configurable_team_types` | string[] |
| `localized_permission_display_name` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.accountType.permissions.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
