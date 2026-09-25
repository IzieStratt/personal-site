# workflows.triggers.list

- status: undocumented
- verified: live-verified
- tokens: team xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/workflows.triggers.list

List Workflow Builder triggers

## Params

| name | required | type | description |
|---|---|---|---|
| `app_ids` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `triggers` | Array<{ |
| `id` | string |
| `inputs` | Record<WorkflowTriggerId, { |
| `value` | string |
| `locked` | boolean |
| `hidden` | boolean |
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
| `filter` | { |
| `root` | { |
| `statement` | string |
| `version` | number |
| `subtype` | string |
| `share_url` | string |
| `channel_ids` | string[] |
| `workflow` | { |
| `callback_id` | string |
| `input_parameters` | Array<{ |
| `is_hidden` | boolean |
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
| `shortcut_url` | string |
| `schedule` | { |
| `start_time` | string |
| `timezone` | string |
| `frequency` | { |
| `webhook_url` | string |
| `rejected_triggers` | unknown[] |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
