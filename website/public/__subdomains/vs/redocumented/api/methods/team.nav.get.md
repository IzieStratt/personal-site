# team.nav.get

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/team.nav.get

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

## Response

| field | type |
|---|---|
| `ok` | true |
| `is_blocked_agent` | boolean |
| `data_residency_enabled` | boolean |
| `view_permissions_enabled` | boolean |
| `view_roles_enabled` | boolean |
| `signout_crumb` | string |
| `is_plan_frozen` | boolean |
| `is_view_overview_analytics_enabled` | boolean |
| `is_view_member_analytics_enabled` | boolean |
| `is_view_channels_analytics_enabled` | boolean |
| `is_view_app_analytics_enabled` | boolean |
| `is_developer_identity_workspace` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.nav.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
