# lists.history.load

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/lists.history.load

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | no | string |  |
| `timestamp` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `list` | { |
| `id` | string |
| `user` | string |
| `user_team` | string |
| `created` | number |
| `timestamp` | number |
| `filetype` | string |
| `title` | string |
| `updated` | number |
| `list_metadata` | { |
| `schema` | Array<{ |
| `name` | string |
| `key` | string |
| `type` | string |
| `is_primary_column` | boolean |
| `views` | Array<{ |
| `is_locked` | boolean |
| `position` | string |
| `columns` | Array<{ |
| `visible` | boolean |
| `width` | number |
| `should_wrap_text` | boolean |
| `date_created` | number |
| `created_by` | string |
| `stick_column_left` | boolean |
| `is_all_items_view` | boolean |
| `default_view_key` | string |
| `show_completed_items` | boolean |
| `integrations` | unknown[] |
| `icon` | string |
| `description` | string |
| `description_blocks` | unknown[] |
| `todo_mode` | boolean |
| `list_records` | Array<{ |
| `list_id` | string |
| `updated_by` | string |
| `platform_refs` | Record<string, unknown> |
| `fields` | Array<{ |
| `value` | boolean |
| `checkbox` | boolean |
| `column_id` | string |
| `updated_timestamp` | string |
| `view_positions` | Record<string, unknown> |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/lists.history.load.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
