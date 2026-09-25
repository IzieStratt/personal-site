# pins.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/pins.list

Lists items pinned to a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel to get pinned items for. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `items` | Array<{ |
| `type` | string |
| `created` | number |
| `created_by` | string |
| `channel` | string |
| `message` | { |
| `subtype` | string |
| `user` | string |
| `thread_ts` | string |
| `root` | { |
| `ts` | string |
| `client_msg_id` | string |
| `text` | string |
| `team` | string |
| `user_team` | string |
| `source_team` | string |
| `user_profile` | { |
| `avatar_hash` | string |
| `image_72` | string |
| `first_name` | string |
| `real_name` | string |
| `display_name` | string |
| `name` | string |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `last_read` | string |
| `blocks` | Array<{ |
| `block_id` | string |
| `pinned_to` | string[] |
| `reactions` | Array<{ |
| `users` | string[] |
| `count` | number |
| `permalink` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/pins.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
