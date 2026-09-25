# functions.workflows.steps.move

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/functions.workflows.steps.move

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `workflow_id` | no | string |  |
| `step_id` | no | string |  |
| `after_step_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `available_data` | string[] |
| `type` | string |
| `name` | string |
| `title` | { |
| `description` | string |
| `is_hidden` | boolean |
| `source` | string |
| `source_id` | string |
| `decorated_workflow` | { |
| `id` | string |
| `team_id` | string |
| `workflow_function_id` | string |
| `callback_id` | string |
| `input_parameters` | Array<{ |
| `steps` | Array<{ |
| `function` | { |
| `is_required` | boolean |
| `items` | { |
| `additionalProperties` | boolean |
| `properties` | { |
| `actions` | { |
| `salesforce` | { |
| `maxLength` | number |
| `output_parameters` | Array<{ |
| `product_level_availability` | { |
| `is_available` | boolean |
| `available_to` | string |
| `category_id` | string |
| `category_label` | string |
| `form_enabled` | boolean |
| `inputs` | { |
| `message` | { |
| `value` | string |
| `hidden` | boolean |
| `locked` | boolean |
| `user_id` | { |
| `interactive_blocks` | { |
| `channel_id` | { |
| `fields` | { |
| `required` | string[] |
| `interactivity` | { |
| `outputs` | string[] |
| `step_type` | string |
| `is_pristine` | boolean |
| `collaborators` | string[] |
| `icons` | { |
| `image_96` | string |
| `image_192` | string |
| `is_published` | boolean |
| `is_home_team_only` | boolean |
| `last_updated_by` | string |
| `unpublished_change_count` | number |
| `app_id` | string |
| `date_updated` | number |
| `is_billable` | boolean |
| `creation_source_type` | number |
| `creation_source_id` | string |
| `is_empty` | boolean |
| `is_valid` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/functions.workflows.steps.move.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
