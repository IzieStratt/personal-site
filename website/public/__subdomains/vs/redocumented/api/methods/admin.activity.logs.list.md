# admin.activity.logs.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.activity.logs.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `team_id` | no | string |  |
| `page` | no | number |  |
| `limit` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `logs` | Array<{ |
| `api_app_id` | string |
| `is_workflow_app` | boolean |
| `is_connector` | boolean |
| `is_workspace_change` | boolean |
| `team_id` | string |
| `service_instance_id` | string |
| `date` | number |
| `log_author` | { |
| `id` | string |
| `real_name` | string |
| `name` | string |
| `is_deleted` | boolean |
| `is_disabled` | boolean |
| `icons` | { |
| `icon_32` | string |
| `paging` | { |
| `count` | number |
| `total` | number |
| `page` | number |
| `pages` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.activity.logs.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
