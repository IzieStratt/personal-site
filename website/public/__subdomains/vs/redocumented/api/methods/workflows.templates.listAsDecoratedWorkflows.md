# workflows.templates.listAsDecoratedWorkflows

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/workflows.templates.listAsDecoratedWorkflows

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `template_ids` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `templates` | Array<{ |
| `id` | string |
| `name` | string |
| `description` | string |
| `categories` | string[] |
| `date_created` | number |
| `date_updated` | number |
| `state` | string |
| `localization_state` | string |
| `trigger` | { |
| `type` | string |
| `subtype` | string |
| `inputs` | { |
| `TRIGGER_ID_PLACE_HOLDER__record_url` | { |
| `value` | string |
| `locked` | boolean |
| `hidden` | boolean |
| `TRIGGER_ID_PLACE_HOLDER__user_id` | { |
| `TRIGGER_ID_PLACE_HOLDER__channel_id` | { |
| `outputs` | string[] |
| `title` | string |
| `is_required` | boolean |
| `available_data` | Record<string, { |
| `coachmark` | string |
| `workflow` | { |
| `input_parameters` | Array<{ |
| `steps` | Array<{ |
| `function` | { |
| `app_id` | string |
| `callback_id` | string |
| `is_hidden` | boolean |
| `additionalProperties` | boolean |
| `properties` | { |
| `salesforce` | { |
| `actions` | { |
| `items` | { |
| `maxLength` | number |
| `output_parameters` | Array<{ |
| `message` | { |
| `is_localizable` | boolean |
| `channel_id` | { |
| `user_id` | { |
| `interactive_blocks` | { |
| `fields` | { |
| `required` | string[] |
| `interactivity` | { |
| `icons` | { |
| `image_96` | string |
| `image_192` | string |
| `source` | string |
| `source_id` | string |
| `collaborator_ids` | unknown[] |
| `madlibs_config` | { |
| `sentence` | string |
| `keyword_mapping` | { |
| `default` | Array<{ |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.templates.listAsDecoratedWorkflows.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
