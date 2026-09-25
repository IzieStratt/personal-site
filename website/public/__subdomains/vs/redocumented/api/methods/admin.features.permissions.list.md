# admin.features.permissions.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.features.permissions.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `category` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `permissions` | Array<{ |
| `permission_id` | number |
| `permission_name` | string |
| `localized_permission_display_name` | string |
| `localized_permission_display_header` | string |
| `feature_group` | string |
| `team_prefs` | string[] |
| `supported_enablements` | unknown[] |
| `in_grace_period` | boolean |
| `is_sampling_supported` | boolean |
| `state` | string |
| `feature_groups` | Array<{ |
| `name` | string |
| `id` | string |
| `category` | string |
| `is_team_on_v2_package` | boolean |
| `future_permissions` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.features.permissions.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
