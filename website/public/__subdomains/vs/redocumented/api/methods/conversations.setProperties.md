# conversations.setProperties

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: yes, do not call without a human in the loop
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/conversations.setProperties

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `props` | no | string |  |
| `channel_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `props` | { |
| `posting_restricted_to` | { |
| `type` | string |
| `threads_restricted_to` | { |
| `canvas` | { |
| `file_id` | string |
| `quip_thread_id` | string |
| `is_migrated` | boolean |
| `meeting_notes` | { |
| `tabs` | Array<{ |
| `id` | string |
| `data` | { |
| `shared_ts` | string |
| `label` | string |
| `is_disabled` | boolean |
| `tabz` | Array<{ |
| `who_can_manage_tabs` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.setProperties.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
