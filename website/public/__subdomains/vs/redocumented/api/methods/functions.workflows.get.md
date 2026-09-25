# functions.workflows.get

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/functions.workflows.get

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `workflow` | { |
| `id` | string |
| `team_id` | string |
| `workflow_function_id` | string |
| `callback_id` | string |
| `title` | string |
| `description` | string |
| `input_parameters` | Array<{ |
| `type` | string |
| `name` | string |
| `is_required` | boolean |
| `steps` | Array<{ |
| `function_id` | string |
| `inputs` | { |
| `message` | { |
| `value` | string |
| `hidden` | boolean |
| `locked` | boolean |
| `user_id` | { |
| `channel_id` | { |
| `interactive_blocks` | { |
| `interactivity_configuration` | { |
| `actions` | { |
| `allowed_entities` | { |
| `member_ids` | string[] |
| `is_button_multi_click` | boolean |
| `is_mutually_exclusive` | boolean |
| `user_ids` | { |
| `channel_ids` | { |
| `fields` | { |
| `required` | unknown[] |
| `interactivity` | { |
| `usergroup_id` | { |
| `is_pristine` | boolean |
| `function` | { |
| `is_hidden` | boolean |
| `items` | { |
| `nullable` | boolean |
| `additionalProperties` | boolean |
| `properties` | { |
| `maxItems` | number |
| `minItems` | number |
| `hint` | string |
| `maxLength` | number |
| `output_parameters` | Array<{ |
| `product_level_availability` | { |
| `is_available` | boolean |
| `available_to` | string |
| `category_id` | string |
| `category_label` | string |
| `form_enabled` | boolean |
| `collaborators` | string[] |
| `icons` | { |
| `image_96` | string |
| `image_192` | string |
| `is_published` | boolean |
| `is_home_team_only` | boolean |
| `last_updated_by` | string |
| `unpublished_change_count` | number |
| `app_id` | string |
| `source` | string |
| `date_updated` | number |
| `is_billable` | boolean |
| `creation_source_type` | number |
| `creation_source_id` | string |
| `is_empty` | boolean |
| `last_published_version_id` | string |
| `last_published_date` | string |
| `bot_user_id` | string |
| `installation_count` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.workflows.get.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
