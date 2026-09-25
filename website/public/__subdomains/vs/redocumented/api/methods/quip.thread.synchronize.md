# quip.thread.synchronize

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/quip.thread.synchronize

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string |  |
| `thread_ts` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `message` | { |
| `user` | string |
| `subtype` | string |
| `document_comment` | { |
| `thread_id` | string |
| `authors` | string[] |
| `section_edited_ts` | number |
| `section_created_ts` | number |
| `is_archived` | boolean |
| `is_visible` | boolean |
| `most_recent_editor` | string |
| `type` | string |
| `ts` | string |
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
| `thread_ts` | string |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `blocks` | Array<{ |
| `block_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/quip.thread.synchronize.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
