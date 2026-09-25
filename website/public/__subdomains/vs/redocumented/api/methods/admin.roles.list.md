# admin.roles.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.roles.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `include_counts` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `roles` | Array<{ |
| `name` | string |
| `description` | string |
| `type` | string |
| `is_top_level_only` | boolean |
| `id` | string |
| `is_new` | boolean |
| `permissions` | string[] |
| `num_users_assigned` | number |
| `num_usergroups_assigned` | number |
| `localized_type` | string |
| `localized_name` | string |
| `localized_description` | string |
| `localized_permissions` | Array<{ |
| `permission_id` | number |
| `permission_name` | string |
| `localized_permission_display_name` | string |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.roles.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
