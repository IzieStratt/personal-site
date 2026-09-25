# workflows.triggers.update

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/workflows.triggers.update

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `type` | no | string |  |
| `trigger_id` | no | string |  |
| `inputs` | no | string |  |
| `workflow` | no | string |  |
| `name` | no | string |  |
| `description` | no | string |  |
| `event` | no | string |  |
| `workflow_app_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `trigger` | { |
| `id` | string |
| `inputs` | Record<string, unknown> |
| `outputs` | Record<string, { |
| `type` | string |
| `name` | string |
| `title` | string |
| `is_required` | boolean |
| `description` | string |
| `available_data` | Record<string, { |
| `date_created` | number |
| `date_updated` | number |
| `owning_team_id` | string |
| `subtype` | string |
| `share_url` | string |
| `channel_ids` | string[] |
| `workflow` | { |
| `callback_id` | string |
| `input_parameters` | Array<{ |
| `output_parameters` | unknown[] |
| `product_level_availability` | { |
| `is_available` | boolean |
| `available_to` | string |
| `category_id` | string |
| `category_label` | string |
| `app_id` | string |
| `app` | { |
| `icons` | { |
| `image_32` | string |
| `image_48` | string |
| `image_64` | string |
| `image_72` | string |
| `is_workflow_app` | boolean |
| `sales_home_workflow_app_type` | number |
| `date_released` | number |
| `date_deleted` | number |
| `form_enabled` | boolean |
| `workflow_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
