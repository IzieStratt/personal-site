# workflows.triggers.types.list

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/workflows.triggers.types.list

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_builder_only` | no | boolean |  |
| `app_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `trigger_types` | Array<{ |
| `is_available_to_user` | boolean |
| `trigger_type` | { |
| `id` | string |
| `icon` | string |
| `label` | string |
| `group` | string |
| `type` | string |
| `app_id` | string |
| `description` | string |
| `subtype` | string |
| `service_config` | { |
| `default_inputs` | { |
| `value` | string |
| `locked` | boolean |
| `hidden` | boolean |
| `webhook_url` | { |
| `types` | { |
| `generated_secret` | { |
| `function` | string |
| `callback_id` | string |
| `title` | string |
| `input_parameters` | Array<{ |
| `name` | string |
| `is_required` | boolean |
| `dynamic_options` | { |
| `inputs` | { |
| `asana_access_token` | { |
| `project_name` | { |
| `workspace_gid` | { |
| `basecamp_access_token` | { |
| `domain` | { |
| `project_id` | { |
| `todo_list_id` | { |
| `bitbucket_access_token` | { |
| `query` | { |
| `workspace_uuid` | { |
| `clickup_access_token` | { |
| `team_id` | { |
| `space_id` | { |
| `folder_id` | { |
| `options` | { |
| `target_array` | { |
| `value_path` | string |
| `label_path` | string |
| `oauth2_provider_key` | string |
| `is_hidden` | boolean |
| `default` | string[] |
| `hint` | string |
| `choices` | Array<{ |
| `items` | { |
| `output_parameters` | Array<{ |
| `product_level_availability` | { |
| `is_available` | boolean |
| `available_to` | string |
| `category_id` | string |
| `category_label` | string |
| `app` | { |
| `icons` | { |
| `image_32` | string |
| `image_48` | string |
| `image_64` | string |
| `image_72` | string |
| `is_workflow_app` | boolean |
| `sales_home_workflow_app_type` | number |
| `date_created` | number |
| `date_released` | number |
| `date_updated` | number |
| `date_deleted` | number |
| `form_enabled` | boolean |
| `private_channel_access` | string |
| `private_channel_message` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.types.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
