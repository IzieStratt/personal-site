# search.modules.dms

- status: undocumented
- verified: existence-only
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.modules.dms

Modular DM search

## Params

| name | required | type | description |
|---|---|---|---|
| `module` | no | string |  |
| `query` | no | string |  |
| `page` | no | number |  |
| `client_req_id` | no | string |  |
| `search_session_id` | no | string |  |
| `extracts` | no | number |  |
| `highlight` | no | number |  |
| `max_extract_len` | no | number |  |
| `extra_message_data` | no | number |  |
| `no_user_profile` | no | number |  |
| `count` | no | number |  |
| `file_title_only` | no | boolean |  |
| `query_rewrite_disabled` | no | boolean |  |
| `include_files_shares` | no | number |  |
| `search_context` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `pagination` | { |
| `total_count` | number |
| `page` | number |
| `per_page` | number |
| `page_count` | number |
| `first` | number |
| `last` | number |
| `query` | string |
| `filters` | { |
| `in` | string[] |
| `from` | string[] |
| `ai_filters` | Record<string, unknown> |
| `manual_filters` | Record<string, unknown> |
| `module` | string |
| `items` | Array<{ |
| `channel` | { |
| `id` | number |
| `created` | number |
| `is_im` | boolean |
| `is_org_shared` | boolean |
| `context_team_id` | string |
| `updated` | number |
| `channel_name_highlighted` | string |
| `message` | { |
| `user` | string |
| `type` | string |
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
| `blocks` | Array<{ |
| `block_id` | string |
| `verbatim` | boolean |
| `image_url` | string |
| `alt_text` | string |
| `title` | { |
| `image_width` | number |
| `image_height` | number |
| `image_bytes` | number |
| `is_animated` | boolean |
| `fallback` | string |
| `subtype` | string |
| `username` | string |
| `bot_id` | string |
| `app_id` | string |
| `trigger_id` | string |
| `workflow_id` | string |
| `bot_profile` | { |
| `deleted` | boolean |
| `user_id` | string |
| `icons` | { |
| `image_36` | string |
| `image_48` | string |
| `is_workflow_bot` | boolean |
| `team_id` | string |
| `thread_ts` | string |
| `root` | { |
| `reply_count` | number |
| `reply_users_count` | number |
| `latest_reply` | string |
| `reply_users` | string[] |
| `is_locked` | boolean |
| `subscribed` | boolean |
| `last_read` | string |
| `attachments` | Array<{ |
| `bot_team_id` | string |
| `app_unfurl_url` | string |
| `is_app_unfurl` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.modules.dms.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
