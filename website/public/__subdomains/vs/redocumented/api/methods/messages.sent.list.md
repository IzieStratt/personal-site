# messages.sent.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/messages.sent.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `count` | no | number |  |
| `page` | no | number |  |
| `view` | no | string |  |
| `client_req_id` | no | string |  |
| `search_session_id` | no | string |  |
| `cursor` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `pagination` | { |
| `total_count` | number |
| `page` | number |
| `per_page` | number |
| `page_count` | number |
| `first` | number |
| `last` | number |
| `next_cursor` | string |
| `items` | Array<{ |
| `msg_timestamp` | string |
| `ts` | string |
| `id` | string |
| `channel_id` | string |
| `channel` | string |
| `user` | string |
| `thread_root_timestamp` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/messages.sent.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
