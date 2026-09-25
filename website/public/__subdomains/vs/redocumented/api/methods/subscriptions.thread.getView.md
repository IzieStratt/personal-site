# subscriptions.thread.getView

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/subscriptions.thread.getView

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `fetch_threads_state` | no | boolean |  |
| `priority_mode` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `total_unread_replies` | number |
| `new_threads_count` | number |
| `threads` | Array<{ |
| `root_msg` | { |
| `text` | string |
| `files` | Array<{ |
| `id` | string |
| `created` | number |
| `timestamp` | string |
| `name` | string |
| `title` | string |
| `mimetype` | string |
| `filetype` | string |
| `pretty_type` | string |
| `user` | string |
| `user_team` | string |
| `size` | number |
| `mode` | string |
| `is_external` | boolean |
| `is_public` | boolean |
| `public_url_shared` | boolean |
| `display_as_bot` | boolean |
| `username` | string |
| `url_private` | string |
| `url_private_download` | string |
| `media_display_type` | string |
| `thumb_64` | string |
| `thumb_80` | string |
| `thumb_360` | string |
| `thumb_360_w` | number |
| `thumb_360_h` | number |
| `thumb_480` | string |
| `thumb_480_w` | number |
| `thumb_480_h` | number |
| `thumb_160` | string |
| `thumb_720` | string |
| `thumb_720_w` | number |
| `thumb_720_h` | number |
| `thumb_800` | string |
| `thumb_800_w` | number |
| `thumb_800_h` | number |
| `thumb_960` | string |
| `thumb_960_w` | number |
| `thumb_960_h` | number |
| `thumb_1024` | string |
| `thumb_1024_w` | number |
| `thumb_1024_h` | number |
| `original_w` | number |
| `original_h` | number |
| `thumb_tiny` | string |
| `permalink` | string |
| `permalink_public` | string |
| `is_starred` | boolean |
| `skipped_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `upload` | boolean |
| `type` | string |
| `ts` | string |
| `client_msg_id` | string |
| `thread_ts` | string |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `last_read` | string |
| `reactions` | Array<{ |
| `users` | string[] |
| `count` | number |
| `channel` | string |
| `team` | string |
| `source_team` | string |
| `user_profile` | { |
| `avatar_hash` | string |
| `image_72` | string |
| `first_name` | string |
| `real_name` | string |
| `display_name` | string |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `blocks` | Array<{ |
| `block_id` | string |
| `pinned_to` | string[] |
| `pinned_info` | { |
| `pinned_by` | string |
| `pinned_ts` | number |
| `unread_replies` | Array<{ |
| `parent_user_id` | string |
| `priority` | Record<string, unknown> |
| `latest_replies` | Array<{ |
| `has_more` | boolean |
| `max_ts` | string |
| `threads_state` | { |
| `has_unreads` | boolean |
| `unread_count_by_channel` | Record<string, unknown> |
| `mention_count` | number |
| `mention_count_by_channel` | Record<string, unknown> |
| `vip_count` | number |
| `channel_badges` | { |
| `thread_mentions` | number |
| `thread_unreads` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/subscriptions.thread.getView.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
