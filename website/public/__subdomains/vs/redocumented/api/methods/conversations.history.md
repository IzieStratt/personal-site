# conversations.history

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.history

Fetches a conversation's history of messages and events.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Conversation ID to fetch history for. |
| `cursor` | no | string | Paginate through collections of data by setting the cursor parameter to a next_cursor attribute returned by a previous request's response_metadata. Default value fetches the first "page" of the collection. See pagination for more detail. |
| `include_all_metadata` | no | boolean | Return all metadata associated with this message. |
| `inclusive` | no | boolean | Include messages with oldest or latest timestamps in results. Ignored unless either timestamp is specified. |
| `latest` | no | timestamp | Only messages before this Unix timestamp will be included in results. Default is the current time. |
| `limit` | no | number | The maximum number of items to return. Fewer than the requested number of items may be returned, even if the end of the conversation history hasn't been reached. Maximum of 999. |
| `oldest` | no | timestamp | Only messages after this Unix timestamp will be included in results. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `latest_updates` | Record<Timestamp, string> |
| `unchanged_messages` | string[] |
| `messages` | Array<{ |
| `user` | string |
| `type` | string |
| `ts` | string |
| `bot_id` | string |
| `app_id` | string |
| `text` | string |
| `team` | string |
| `bot_profile` | { |
| `id` | string |
| `deleted` | boolean |
| `name` | string |
| `updated` | number |
| `icons` | { |
| `image_36` | string |
| `image_48` | string |
| `image_72` | string |
| `team_id` | string |
| `user_id` | string |
| `metadata` | Record<string, unknown> |
| `blocks` | Array<{ |
| `block_id` | string |
| `verbatim` | boolean |
| `image_url` | string |
| `alt_text` | string |
| `image_width` | number |
| `image_height` | number |
| `image_bytes` | number |
| `is_animated` | boolean |
| `fallback` | string |
| `pinned_to` | string[] |
| `pinned_info` | { |
| `channel` | string |
| `pinned_by` | string |
| `pinned_ts` | number |
| `files` | Array<{ |
| `upload` | boolean |
| `display_as_bot` | boolean |
| `client_msg_id` | string |
| `reactions` | Array<{ |
| `users` | string[] |
| `count` | number |
| `subtype` | string |
| `thread_ts` | string |
| `root` | { |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `last_read` | string |
| `created` | number |
| `timestamp` | number |
| `title` | string |
| `mimetype` | string |
| `filetype` | string |
| `pretty_type` | string |
| `user_team` | Record<string, unknown> |
| `size` | number |
| `mode` | string |
| `is_external` | boolean |
| `is_public` | boolean |
| `public_url_shared` | boolean |
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
| `original_w` | number |
| `original_h` | number |
| `thumb_tiny` | string |
| `permalink` | string |
| `permalink_public` | string |
| `is_starred` | boolean |
| `skipped_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `thumb_960` | string |
| `thumb_960_w` | number |
| `thumb_960_h` | number |
| `thumb_1024` | string |
| `thumb_1024_w` | number |
| `thumb_1024_h` | number |
| `thumb_pdf` | string |
| `thumb_pdf_w` | number |
| `thumb_pdf_h` | number |
| `thumb_360_gif` | string |
| `thumb_480_gif` | string |
| `deanimate` | string |
| `deanimate_gif` | string |
| `attachments` | Array<{ |
| `footer_icon` | string |
| `color` | string |
| `pretext` | string |
| `callback_id` | string |
| `footer` | string |
| `fields` | Array<{ |
| `value` | string |
| `short` | boolean |
| `mrkdwn_in` | string[] |
| `actions` | Array<{ |
| `style` | string |
| `from_url` | string |
| `service_icon` | string |
| `original_url` | string |
| `title_link` | string |
| `service_name` | string |
| `author_id` | string |
| `channel_id` | string |
| `channel_team` | string |
| `is_msg_unfurl` | boolean |
| `is_thread_root_unfurl` | boolean |
| `message_blocks` | Array<{ |
| `message` | { |
| `author_name` | string |
| `author_link` | string |
| `author_icon` | string |
| `author_subname` | string |
| `is_share` | boolean |
| `room` | { |
| `media_server` | string |
| `created_by` | string |
| `date_start` | number |
| `date_end` | number |
| `participants` | string[] |
| `participant_history` | string[] |
| `participants_events` | Record<UserId, { |
| `joined` | boolean |
| `camera_on` | boolean |
| `camera_off` | boolean |
| `screenshare_on` | boolean |
| `screenshare_off` | boolean |
| `participants_camera_on` | unknown[] |
| `participants_camera_off` | unknown[] |
| `participants_screenshare_on` | unknown[] |
| `participants_screenshare_off` | string[] |
| `canvas_thread_ts` | string |
| `thread_root_ts` | string |
| `channels` | string[] |
| `is_dm_call` | boolean |
| `was_rejected` | boolean |
| `was_missed` | boolean |
| `was_accepted` | boolean |
| `has_ended` | boolean |
| `background_id` | string |
| `canvas_background` | string |
| `is_prewarmed` | boolean |
| `is_scheduled` | boolean |
| `recording` | { |
| `can_record_summary` | string |
| `locale` | string |
| `attached_file_ids` | unknown[] |
| `media_backend_type` | string |
| `display_id` | string |
| `call_family` | string |
| `pending_invitees` | Record<string, unknown> |
| `last_invite_status_by_user` | Record<UserId, string> |
| `knocks` | Record<string, unknown> |
| `huddle_link` | string |
| `no_notifications` | boolean |
| `comments_count` | number |
| `is_transcription_region_supported` | boolean |
| `transcription` | { |
| `status` | string |
| `mp4` | string |
| `hls` | string |
| `hls_embed` | string |
| `mp4_low` | string |
| `duration_ms` | number |
| `thumb_video` | string |
| `thumb_video_w` | number |
| `thumb_video_h` | number |
| `bot_team_id` | string |
| `app_unfurl_url` | string |
| `is_app_unfurl` | boolean |
| `is_reply_unfurl` | boolean |
| `private_channel_prompt` | boolean |
| `thumb_url` | string |
| `thumb_width` | number |
| `thumb_height` | number |
| `video_html` | string |
| `video_html_width` | number |
| `video_html_height` | number |
| `service_url` | string |
| `msg_subtype` | string |
| `accessory` | { |
| `action_id` | string |
| `missed_participants` | Record<UserId, string> |
| `parent_user_id` | string |
| `x_files` | string[] |
| `saved` | { |
| `is_archived` | boolean |
| `date_completed` | number |
| `state` | string |
| `inviter` | string |
| `canvas_update_user_ids` | string[] |
| `canvas_update_section_ids` | string[] |
| `canvas_update_canvas_id` | string |
| `canvas_update_ai_summary_blocks` | unknown[] |
| `has_more` | boolean |
| `pin_count` | number |
| `channel_actions_ts` | null |
| `channel_actions_count` | number |
| `response_metadata` | { |
| `next_cursor` | string |
| `latest` | string |
| `date_joined` | number |
| `oldest` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.history.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
