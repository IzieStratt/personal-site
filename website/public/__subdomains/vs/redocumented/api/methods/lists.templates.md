# lists.templates

- status: undocumented
- verified: existence-only (sample-checked)
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/lists.templates

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

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
| `icon` | string |
| `description` | string |
| `schema` | Array<{ |
| `key` | string |
| `is_primary_column` | boolean |
| `type` | string |
| `options` | { |
| `choices` | Array<{ |
| `value` | number |
| `label` | string |
| `color` | string |
| `default_value` | string |
| `default_value_typed` | { |
| `select` | string[] |
| `max` | number |
| `format` | string |
| `date_format` | string |
| `preview_records` | Array<Array<{ |
| `rich_text` | Array<{ |
| `block_id` | string |
| `text` | string |
| `rating` | number[] |
| `user` | string[] |
| `channel` | string[] |
| `timestamp` | number[] |
| `message` | Array<{ |
| `channel_id` | string |
| `ts` | string |
| `number` | number[] |
| `phone` | string[] |
| `date` | string[] |
| `view` | { |
| `grouping` | { |
| `group_by` | string |
| `sorts` | Array<{ |
| `ascending` | boolean |
| `starter_templates` | unknown[] |
| `template_files` | Array<{ |
| `show_member_name` | boolean |
| `precision` | number |
| `description_blocks` | Array<{ |
| `group_by_column_id` | string |
| `filters` | unknown[] |
| `column_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/lists.templates.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
