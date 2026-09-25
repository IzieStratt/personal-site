# saved.list

- status: undocumented
- verified: live-verified
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/saved.list

List Saved-for-later items

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `cursor` | no | string |  |
| `filter` | no | string |  |
| `include_tombstones` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `saved_items` | Array<{ |
| `item_id` | string |
| `item_type` | string |
| `date_created` | number |
| `date_due` | number |
| `date_completed` | number |
| `date_updated` | number |
| `is_archived` | boolean |
| `date_snoozed_until` | number |
| `ts` | string |
| `state` | string |
| `todo_state` | string |
| `counts` | { |
| `uncompleted_count` | number |
| `uncompleted_overdue_count` | number |
| `archived_count` | number |
| `completed_count` | number |
| `total_count` | number |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/saved.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
