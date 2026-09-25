# conversations.view

- status: undocumented
- verified: not-live-tested
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/conversations.view

Mark a conversation viewed (possible side effect)

## Params

| name | required | type | description |
|---|---|---|---|
| `canonical_avatars` | no | boolean |  |
| `no_user_profile` | no | boolean |  |
| `ignore_replies` | no | boolean |  |
| `no_self` | no | boolean |  |
| `include_full_users` | no | boolean |  |
| `include_use_case` | no | boolean |  |
| `include_stories` | no | boolean |  |
| `no_members` | no | boolean |  |
| `include_mutation_timestamps` | no | boolean |  |
| `count` | no | number |  |
| `include_free_team_extra_messages` | no | boolean |  |
| `channel` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `history` | { |
| `messages` | Array<{ |
| `text` | string |
| `files` | Array<{ |
| `id` | string |
| `created` | number |
| `timestamp` | number |
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
| `permalink` | string |
| `permalink_public` | string |
| `is_starred` | boolean |
| `skipped_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `subject` | string |
| `to` | Array<{ |
| `address` | string |
| `original` | string |
| `from` | Array<{ |
| `cc` | unknown[] |
| `attachments` | Array<{ |
| `original_attachment_count` | number |
| `inline_attachment_count` | number |
| `plain_text` | string |
| `preview` | string |
| `preview_plain_text` | string |
| `headers` | { |
| `date` | string |
| `in_reply_to` | null |
| `reply_to` | null |
| `message_id` | string |
| `has_more` | boolean |
| `sent_to_self` | boolean |
| `bot_id` | string |
| `app_id` | string |
| `thumb_64` | string |
| `thumb_80` | string |
| `thumb_360` | string |
| `thumb_360_w` | number |
| `thumb_360_h` | number |
| `thumb_160` | string |
| `original_w` | number |
| `original_h` | number |
| `thumb_tiny` | string |
| `thumb_480` | string |
| `thumb_480_w` | number |
| `thumb_480_h` | number |
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
| `upload` | boolean |
| `type` | string[] |
| `ts` | string |
| `team` | string |
| `blocks` | Array<{ |
| `block_id` | string |
| `verbatim` | boolean |
| `subtype` | string |
| `fallback` | string |
| `callback_id` | string |
| `mrkdwn_in` | string[] |
| `actions` | Array<{ |
| `value` | string |
| `style` | string |
| `url` | string |
| `author_id` | string |
| `channel_id` | string |
| `channel_team` | string |
| `is_msg_unfurl` | boolean |
| `is_reply_unfurl` | boolean |
| `color` | string |
| `from_url` | string |
| `is_share` | boolean |
| `author_name` | string |
| `author_link` | string |
| `author_icon` | string |
| `author_subname` | string |
| `footer` | string |
| `image_url` | string |
| `image_width` | number |
| `image_height` | number |
| `image_bytes` | number |
| `service_icon` | string |
| `original_url` | string |
| `title_link` | string |
| `service_name` | string |
| `is_thread_root_unfurl` | boolean |
| `msg_subtype` | string |
| `comments_count` | number |
| `source_team` | string |
| `user_profile` | { |
| `avatar_hash` | string |
| `image_72` | string |
| `first_name` | string |
| `real_name` | string |
| `display_name` | string |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `client_msg_id` | string |
| `thread_ts` | string |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `last_read` | string |
| `root` | { |
| `language` | { |
| `locale` | string |
| `is_reliable` | boolean |
| `icons` | { |
| `image_48` | string |
| `reactions` | Array<{ |
| `users` | Array<{ |
| `count` | number |
| `mutation_timestamps` | { |
| `latest` | string |
| `updated` | number |
| `history_invalid` | string |
| `channel_actions_ts` | null |
| `channel_actions_count` | number |
| `next_ts` | number |
| `is_bot` | boolean |
| `is_app_user` | boolean |
| `deleted` | boolean |
| `is_email_confirmed` | boolean |
| `tz` | string |
| `tz_label` | string |
| `tz_offset` | number |
| `is_admin` | boolean |
| `is_owner` | boolean |
| `is_primary_owner` | boolean |
| `who_can_share_contact_card` | string |
| `profile` | { |
| `real_name_normalized` | string |
| `display_name_normalized` | string |
| `last_name` | string |
| `phone` | string |
| `skype` | string |
| `status_text` | string |
| `status_text_canonical` | string |
| `status_emoji` | string |
| `status_emoji_display_info` | Array<{ |
| `display_url` | string |
| `unicode` | string |
| `display_alias` | string |
| `status_expiration` | number |
| `guest_invited_by` | string |
| `image_original` | string |
| `is_custom_image` | boolean |
| `pronouns` | string |
| `huddle_state` | string |
| `huddle_state_expiration_ts` | number |
| `start_date` | string |
| `ooo_message` | string |
| `api_app_id` | string |
| `always_active` | boolean |
| `team_id` | string |
| `has_2fa` | boolean |
| `bots` | Array<{ |
| `image_36` | string |
| `channels` | Array<{ |
| `creator` | string |
| `is_org_shared` | boolean |
| `is_im` | boolean |
| `context_team_id` | string |
| `name_normalized` | string |
| `is_channel` | boolean |
| `is_group` | boolean |
| `is_mpim` | boolean |
| `is_private` | boolean |
| `is_archived` | boolean |
| `is_general` | boolean |
| `is_shared` | boolean |
| `is_ext_shared` | boolean |
| `unlinked` | number |
| `is_pending_ext_shared` | boolean |
| `pending_shared` | unknown[] |
| `parent_conversation` | null |
| `purpose` | { |
| `last_set` | number |
| `topic` | { |
| `shared_team_ids` | string[] |
| `internal_team_ids` | string[] |
| `pending_connected_team_ids` | unknown[] |
| `is_member` | boolean |
| `parent_user_id` | string |
| `unread_count` | number |
| `unread_count_display` | number |
| `properties` | { |
| `canvas` | { |
| `file_id` | string |
| `is_empty` | boolean |
| `quip_thread_id` | string |
| `is_migrated` | boolean |
| `meeting_notes` | { |
| `tabs` | Array<{ |
| `label` | string |
| `data` | { |
| `shared_ts` | string |
| `is_disabled` | boolean |
| `tabz` | Array<{ |
| `is_moved` | number |
| `previous_names` | string[] |
| `im` | { |
| `is_frozen` | boolean |
| `is_open` | boolean |
| `is_dormant` | boolean |
| `response_metadata` | { |
| `next_cursor` | string |
| `channel` | { |
| `use_case` | string |
| `folder_bookmark_id` | string |
| `who_can_manage_tabs` | string |
| `huddles` | { |
| `ai_notes_settings_restricted` | boolean |
| `is_huddle_channel` | boolean |
| `posting_restricted_to` | { |
| `threads_restricted_to` | { |
| `is_thread_only` | boolean |
| `is_read_only` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.view.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
