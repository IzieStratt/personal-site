# functions.workflows.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/functions.workflows.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `filter_options` | no | string |  |
| `sort_options` | no | string |  |
| `workflow_builder_only` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `workflows` | Array<{ |
| `id` | string |
| `team_id` | string |
| `workflow_function_id` | string |
| `callback_id` | string |
| `title` | string |
| `description` | string |
| `input_parameters` | unknown[] |
| `type` | string |
| `name` | string |
| `steps` | Array<{ |
| `function_id` | string |
| `inputs` | Record<string, unknown> |
| `user` | { |
| `value` | string |
| `hidden` | boolean |
| `locked` | boolean |
| `message` | { |
| `is_localizable` | boolean |
| `user_id` | { |
| `interactive_blocks` | { |
| `interactivity_configuration` | { |
| `actions` | { |
| `allowed_entities` | { |
| `member_ids` | string[] |
| `is_button_multi_click` | boolean |
| `is_mutually_exclusive` | boolean |
| `user_ids` | { |
| `channel_ids` | { |
| `channel_id` | { |
| `usergroup_id` | { |
| `fields` | { |
| `required` | string[] |
| `interactivity` | { |
| `action` | { |
| `label` | { |
| `prepend` | string |
| `content` | { |
| `canvas_tab` | { |
| `canvas_update_type` | { |
| `canvas_tab_section_id` | { |
| `canvas` | string |
| `message_context` | { |
| `is_pristine` | boolean |
| `function` | { |
| `is_required` | boolean |
| `hint` | string |
| `is_hidden` | boolean |
| `items` | { |
| `nullable` | boolean |
| `additionalProperties` | boolean |
| `properties` | { |
| `salesforce` | { |
| `maxItems` | number |
| `minItems` | number |
| `maxLength` | number |
| `default` | string |
| `render_condition` | { |
| `operator` | string |
| `conditions` | Array<{ |
| `parameter_name` | string |
| `dynamic_options` | { |
| `canvas_id` | { |
| `options` | { |
| `target_array` | { |
| `value_path` | string |
| `label_path` | string |
| `choices` | Array<{ |
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
| `date_created` | number |
| `date_released` | number |
| `date_updated` | number |
| `date_deleted` | number |
| `form_enabled` | boolean |
| `collaborators` | string[] |
| `image_96` | string |
| `image_192` | string |
| `is_published` | boolean |
| `is_home_team_only` | boolean |
| `last_updated_by` | string |
| `unpublished_change_count` | number |
| `source` | string |
| `is_billable` | boolean |
| `creation_source_type` | number |
| `creation_source_id` | string |
| `is_empty` | boolean |
| `last_published_version_id` | string |
| `last_published_date` | string |
| `bot_user_id` | string |
| `workflow_triggers` | Record<string, unknown> |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.workflows.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
