# drafts.list

- status: undocumented
- verified: live-verified
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/drafts.list

List scheduled/unsent drafts

## Params

| name | required | type | description |
|---|---|---|---|
| `is_active` | no | boolean |  |
| `limit` | no | number |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `drafts` | Array<{ |
| `id` | string |
| `date_created` | number |
| `user_id` | string |
| `team_id` | string |
| `last_updated_ts` | string |
| `last_updated_client` | string |
| `blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `file_ids` | unknown[] |
| `is_from_composer` | boolean |
| `is_deleted` | boolean |
| `is_sent` | boolean |
| `client_msg_id` | string |
| `date_scheduled` | number |
| `destinations` | Array<{ |
| `channel_id` | string |
| `user_ids` | string[] |
| `thread_ts` | string |
| `broadcast` | boolean |
| `unfurl` | Array<{ |
| `url` | string |
| `files` | unknown[] |
| `has_more` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/drafts.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
