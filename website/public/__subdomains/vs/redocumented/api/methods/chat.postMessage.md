# chat.postMessage

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/chat.postMessage

Sends a message to a channel.

## Params

| name | required | type | description |
|---|---|---|---|
| `as_user` | no | boolean | (Legacy) Pass true to post the message as the authed user instead of as a bot. Defaults to false. Can only be used by classic apps. See legacy as_user parameter below. |
| `attachments` | no | ['string', 'boolean'] | A JSON-based array of structured attachments, presented as a URL-encoded string. |
| `blocks` | no | string | A JSON-based array of structured blocks, presented as a URL-encoded string. |
| `channel` | yes | channel | An encoded ID or channel name that represents a channel, private group, or IM channel to send the message to. See below for more details. |
| `current_draft_last_updated_ts` | no | string | This field represents the timestamp of the draft's last update at the time this API is called. If the current message is a draft, this field can be provided to ensure synchronization with the server. |
| `icon_emoji` | no | string | Emoji to use as the icon for this message. Overrides icon_url. |
| `icon_url` | no | string | URL to an image to use as the icon for this message. |
| `link_names` | no | boolean | Find and link user groups. No longer supports linking individual users; use syntax shown in Mentioning Users instead. |
| `markdown_text` | no | string | Accepts message text formatted in markdown. This argument should not be used in conjunction with blocks or text. Limit this field to 12,000 characters. |
| `metadata` | no | string | JSON object with event_type and event_payload fields, presented as a URL-encoded string. You can also provide Work Object entity metadata using this parameter. Metadata you post to Slack is accessible to any app or user who is a member of that workspace. |
| `mrkdwn` | no | boolean | Disable Slack markup parsing by setting to false. Enabled by default. |
| `parse` | no | string | Change how messages are treated. See below. |
| `reply_broadcast` | no | boolean | Used in conjunction with thread_ts and indicates whether reply should be made visible to everyone in the channel or conversation. Defaults to false. |
| `text` | no | string | How this field works and whether it is required depends on other fields you use in your API call. See below for more detail. |
| `thread_ts` | no | string | Provide another message's ts value to make this message a reply. Avoid using a reply's ts value; use its parent instead. |
| `unfurl_links` | no | boolean | Pass true to enable unfurling of primarily text-based content. |
| `unfurl_media` | no | boolean | Pass false to disable unfurling of media content. |
| `username` | no | string | Set your bot's user name. |
| `unfurl_app_links` | no | boolean | Pass true to unfurl links from installed apps, or false to prevent app links from unfurling. When omitted, app links follow the unfurl_links setting. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel` | string |
| `ts` | string |
| `message` | { |
| `user` | string |
| `type` | string |
| `client_msg_id` | string |
| `text` | string |
| `team` | string |
| `thread_ts` | string |
| `parent_user_id` | string |
| `blocks` | Array<{ |
| `block_id` | string |
| `user_team` | string |
| `source_team` | string |
| `subtype` | string |
| `root` | { |
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

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/chat.postMessage.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
