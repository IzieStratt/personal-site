# conversations.info

- status: documented
- verified: live-verified
- tokens: Live-verified 2026-09-25 with an xoxb: canvas tabs are in channel.properties.tabs (type: canvas, data.file_id), plus a near-duplicate properties.tabz; no properties.canvas. See methods/grid-admin-sandbox-2026-09.md.
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/conversations.info

Retrieve information about a conversation.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Conversation ID to learn more about. |
| `include_locale` | no | boolean | Set this to true to receive the locale for this conversation. Defaults to false. |
| `include_num_members` | no | boolean | Set to true to include the member count for the specified conversation. Defaults to false. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel` | { |
| `id` | string |
| `created` | number |
| `is_org_shared` | boolean |
| `is_im` | boolean |
| `is_archived` | boolean |
| `context_team_id` | string |
| `updated` | number |
| `is_frozen` | boolean |
| `user` | string |
| `last_read` | string |
| `is_open` | boolean |
| `priority` | number |
| `unread_count` | number |
| `unread_count_display` | number |
| `latest` | { |
| `type` | string |
| `ts` | string |
| `text` | string |
| `team` | string |
| `blocks` | Array<{ |
| `block_id` | string |
| `verbatim` | boolean |
| `accessory` | { |
| `action_id` | string |
| `bot_id` | string |
| `app_id` | string |
| `bot_profile` | { |
| `deleted` | boolean |
| `name` | string |
| `user_id` | string |
| `icons` | { |
| `image_36` | string |
| `image_48` | string |
| `image_72` | string |
| `team_id` | string |
| `attachments` | Array<{ |
| `from_url` | string |
| `msg_subtype` | string |
| `channel_id` | string |
| `channel_team` | string |
| `is_msg_unfurl` | boolean |
| `is_thread_root_unfurl` | boolean |
| `original_url` | string |
| `fallback` | string |
| `author_name` | string |
| `author_link` | string |
| `author_icon` | string |
| `author_subname` | string |
| `mrkdwn_in` | string[] |
| `footer` | string |
| `service_icon` | string |
| `title` | { |
| `title_link` | string |
| `service_name` | string |
| `is_shared` | boolean |
| `properties` | { |
| `is_dormant` | boolean |
| `app_home` | { |
| `app_installed_team_id` | string |
| `conversation_id` | string |
| `home_tab_enabled` | boolean |
| `messages_tab_enabled` | boolean |
| `messages_tab_read_only_enabled` | boolean |
| `home_view_id` | string |
| `home_view` | { |
| `image_url` | string |
| `alt_text` | string |
| `url` | string |
| `private_metadata` | string |
| `callback_id` | string |
| `state` | { |
| `values` | Record<string, unknown> |
| `hash` | string |
| `clear_on_close` | boolean |
| `notify_on_close` | boolean |
| `close` | null |
| `submit` | null |
| `previous_view_id` | null |
| `root_view_id` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.info.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
