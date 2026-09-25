# activity.feed

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/activity.feed

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `types` | no | string |  |
| `mode` | no | string |  |
| `cursor` | no | string |  |
| `archive_only` | no | boolean |  |
| `unread_only` | no | boolean |  |
| `priority_only` | no | boolean |  |
| `only_salesforce_channels` | no | boolean |  |
| `is_activity_inbox` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `items` | Array<{ |
| `is_unread` | boolean |
| `feed_ts` | string |
| `item` | { |
| `type` | string |
| `message` | { |
| `ts` | string |
| `channel` | string |
| `is_broadcast` | boolean |
| `thread_ts` | string |
| `author_user_id` | string |
| `bundle_info` | { |
| `payload` | { |
| `thread_entry` | { |
| `channel_id` | string |
| `latest_ts` | string |
| `unread_msg_count` | number |
| `min_unread_ts` | string |
| `reaction` | { |
| `user` | string |
| `name` | string |
| `invite` | string |
| `linked_item_id` | string |
| `generic_system_alert_payload` | { |
| `category` | string |
| `blocks` | Array<{ |
| `block_id` | string |
| `reason` | string |
| `click_target_id` | string |
| `key` | string |
| `priority` | { |
| `vip` | Record<string, unknown> |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/activity.feed.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
