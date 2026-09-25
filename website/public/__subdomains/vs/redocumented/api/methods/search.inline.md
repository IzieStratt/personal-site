# search.inline

- status: undocumented
- verified: existence-only
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.inline

Inline as-you-type search suggestions

## Params

| name | required | type | description |
|---|---|---|---|
| `search_session_id` | no | string |  |
| `client_req_id` | no | string |  |
| `max_ts` | no | number |  |
| `channel` | no | string |  |
| `count` | no | number |  |
| `page` | no | number |  |
| `query` | no | string |  |
| `thread_replies` | no | string |  |
| `extract_len` | no | number |  |
| `from_me` | no | boolean |  |
| `with_me` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `query` | string |
| `pagination` | { |
| `total_count` | number |
| `page` | number |
| `per_page` | number |
| `page_count` | number |
| `first` | number |
| `last` | number |
| `items` | Array<{ |
| `ts` | string |
| `user` | string |
| `permalink` | string |
| `iid` | string |
| `subtype` | string |
| `bot_id` | string |
| `channel_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.inline.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
