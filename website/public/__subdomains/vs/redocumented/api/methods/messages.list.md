# messages.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/messages.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `message_ids` | no | string |  |
| `org_wide_aware` | no | boolean |  |
| `cached_latest_updates` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `messages` | Array<{ |
| `messages_data` | Record<ChannelId / DmId / GroupId, { |
| `user` | string |
| `type` | string |
| `ts` | string |
| `client_msg_id` | string |
| `text` | string |
| `thread_ts` | string |
| `parent_user_id` | string |
| `blocks` | Array<{ |
| `block_id` | string |
| `reactions` | Array<{ |
| `name` | string |
| `users` | string[] |
| `count` | number |
| `saved` | { |
| `is_archived` | boolean |
| `date_completed` | number |
| `state` | string |
| `files` | Array<{ |
| `id` | number |
| `created` | number |
| `timestamp` | number |
| `title` | string |
| `mimetype` | string |
| `filetype` | string |
| `pretty_type` | string |
| `user_team` | string |
| `size` | number |
| `mode` | string |
| `is_external` | boolean |
| `is_public` | boolean |
| `public_url_shared` | boolean |
| `display_as_bot` | boolean |
| `username` | string |
| `is_transcription_region_supported` | boolean |
| `transcription` | { |
| `status` | string |
| `mp4` | string |
| `url_private` | string |
| `url_private_download` | string |
| `hls` | string |
| `hls_embed` | string |
| `mp4_low` | string |
| `duration_ms` | number |
| `media_display_type` | string |
| `thumb_video` | string |
| `thumb_video_w` | number |
| `thumb_video_h` | number |
| `permalink` | string |
| `permalink_public` | string |
| `is_starred` | boolean |
| `skipped_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
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
| `upload` | boolean |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `last_read` | string |
| `attachments` | Array<{ |
| `msg_subtype` | string |
| `channel_id` | string |
| `channel_team` | string |
| `is_msg_unfurl` | boolean |
| `is_thread_root_unfurl` | boolean |
| `color` | string |
| `from_url` | string |
| `is_share` | boolean |
| `fallback` | string |
| `author_name` | string |
| `author_link` | string |
| `author_icon` | string |
| `author_subname` | string |
| `mrkdwn_in` | string[] |
| `footer` | string |
| `author_id` | string |
| `message_blocks` | Array<{ |
| `team` | string |
| `channel` | string |
| `message` | { |
| `comments_count` | number |
| `image_url` | string |
| `image_width` | number |
| `image_height` | number |
| `image_bytes` | number |
| `service_icon` | string |
| `original_url` | string |
| `title_link` | string |
| `service_name` | string |
| `latest_updates` | Record<Timestamp, string> |
| `unchanged_messages` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/messages.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
