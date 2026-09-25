# lists.records.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/lists.records.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `list_id` | no | string |  |
| `include_subtasks` | no | boolean |  |
| `archived` | no | boolean |  |
| `include_suggested` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `records` | Array<{ |
| `id` | string |
| `list_id` | string |
| `fields` | Array<{ |
| `key` | string |
| `value` | number |
| `rating` | number[] |
| `text` | string |
| `rich_text` | Array<{ |
| `type` | string |
| `block_id` | string |
| `select` | string[] |
| `checkbox` | boolean |
| `column_id` | string |
| `date_created` | number |
| `view_positions` | Record<string, unknown> |
| `created_by` | string |
| `updated_by` | string |
| `platform_refs` | Record<string, unknown> |
| `updated_timestamp` | string |
| `position` | string |
| `limits` | { |
| `over_row_maximum` | boolean |
| `row_count_limit` | number |
| `row_count` | number |
| `archived_row_count` | number |
| `over_column_maximum` | boolean |
| `column_count` | number |
| `column_count_limit` | number |
| `over_view_maximum` | boolean |
| `view_count` | number |
| `view_count_limit` | number |
| `max_attachments_per_cell` | number |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/lists.records.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
