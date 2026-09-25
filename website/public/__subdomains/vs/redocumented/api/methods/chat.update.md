# chat.update

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.update

Updates a message.

## Params

| name | required | type | description |
|---|---|---|---|
| `as_user` | no | ['boolean', 'string'] | Pass true to update the message as the authed user. Bot users in this context are considered authed users. |
| `attachments` | no | string | A JSON-based array of structured attachments, presented as a URL-encoded string. |
| `unfurled_attachments` | no | string | A JSON-based array of structured attachments, presented as a URL-encoded string. |
| `blocks` | no | string | A JSON-based array of structured blocks, presented as a URL-encoded string. |
| `markdown_text` | no | string | Accepts message text formatted in markdown. This argument should not be used in conjunction with blocks or text. Limit this field to 12,000 characters. |
| `metadata` | no | string | JSON object with event_type and event_payload fields, presented as a URL-encoded string. If you don't include this field, the message's previous metadata will be retained. To remove previous metadata, include an empty object for this field. Metadata you post to Slack is accessible to any app or user who is a member of that workspace. |
| `channel` | yes | channel | Channel containing the message to be updated. For direct messages, ensure that this value is a DM ID (starts with D) instead of a User ID (starts with either U or W). |
| `link_names` | no | ['boolean', 'string'] | Find and link channel names and usernames. Defaults to none. If you do not specify a value for this field, the original value set for the message will be overwritten with the default, none. |
| `parse` | no | string | Change how messages are treated. Defaults to client, unlike chat.postMessage. Accepts either none or full. If you do not specify a value for this field, the original value set for the message will be overwritten with the default, client. |
| `text` | no | string | How this field works and whether it is required depends on other fields you use in your API call. See below for more detail. |
| `ts` | yes | timestamp | Timestamp of the message to be updated. |
| `reply_broadcast` | no | boolean | Broadcast an existing thread reply to make it visible to everyone in the channel or conversation. |
| `file_ids` | no | array | Array of new file ids that will be sent with this message. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel` | string |
| `ts` | string |
| `text` | string |
| `message` | { |
| `user` | string |
| `type` | string |
| `client_msg_id` | string |
| `team` | string |
| `thread_ts` | string |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `last_read` | string |
| `attachments` | Array<{ |
| `from_url` | string |
| `service_icon` | string |
| `thumb_url` | string |
| `thumb_width` | number |
| `thumb_height` | number |
| `audio_html` | string |
| `audio_html_width` | number |
| `audio_html_height` | number |
| `id` | string |
| `original_url` | string |
| `fallback` | string |
| `title` | string |
| `title_link` | string |
| `service_name` | string |
| `service_url` | string |
| `author_id` | string |
| `channel_id` | string |
| `channel_team` | string |
| `is_msg_unfurl` | boolean |
| `is_reply_unfurl` | boolean |
| `message_blocks` | Array<{ |
| `blocks` | Array<{ |
| `block_id` | string |
| `author_name` | string |
| `author_link` | string |
| `author_icon` | string |
| `author_subname` | string |
| `mrkdwn_in` | string[] |
| `footer` | string |
| `parent_user_id` | string |
| `files` | Array<{ |
| `created` | number |
| `timestamp` | number |
| `name` | string |
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
| `source_team` | string |
| `user_profile` | { |
| `avatar_hash` | string |
| `image_72` | string |
| `first_name` | string |
| `real_name` | string |
| `display_name` | string |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
