# search.modules.messages

- status: undocumented
- verified: partial
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.modules.messages

Modular message search

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
| `search_exclude_bots` | no | boolean |  |
| `search_only_my_channels` | no | boolean |  |
| `spell_correction` | no | string |  |
| `search_only_team` | no | string |  |
| `facets_result_count` | no | number |  |
| `query_refinement_suggestions_version` | no | number |  |
| `recent_channels` | no | string |  |
| `sort` | no | string |  |
| `sort_dir` | no | string |  |
| `max_filter_suggestions` | no | number |  |
| `request_context` | no | string |  |
| `search_tab_filter` | no | string |  |
| `search_tab_sort` | no | string |  |

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
| `in` | Array<{ |
| `from` | Array<{ |
| `ai_filters` | Record<string, unknown> |
| `manual_filters` | { |
| `module` | string |
| `items` | Array<{ |
| `iid` | string |
| `team` | string |
| `channel` | string |
| `id` | string |
| `is_channel` | boolean |
| `is_group` | boolean |
| `is_im` | boolean |
| `is_mpim` | boolean |
| `is_shared` | boolean |
| `is_org_shared` | boolean |
| `is_ext_shared` | boolean |
| `is_private` | boolean |
| `name` | string |
| `pending_shared` | unknown[] |
| `is_pending_ext_shared` | boolean |
| `teams` | string[] |
| `user` | string |
| `messages` | Array<{ |
| `ts` | string |
| `text` | string |
| `permalink` | string |
| `subtype` | string |
| `username` | string |
| `bot_id` | string |
| `bot_profile` | { |
| `app_id` | string |
| `icons` | { |
| `image_36` | string |
| `image_48` | string |
| `image_72` | string |
| `deleted` | boolean |
| `updated` | number |
| `blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `verbatim` | boolean |
| `image_url` | string |
| `alt_text` | string |
| `image_width` | number |
| `image_height` | number |
| `image_bytes` | number |
| `fallback` | string |
| `is_animated` | boolean |
| `accessory` | { |
| `action_id` | string |
| `options` | Array<{ |
| `url` | string |
| `blocks_extracts` | Array<{ |
| `truncated_head` | boolean |
| `truncated_tail` | boolean |
| `thread_ts` | string |
| `reply_count` | number |
| `latest_reply` | string |
| `attachments` | Array<{ |
| `from_url` | string |
| `service_icon` | string |
| `original_url` | string |
| `title` | string |
| `title_link` | string |
| `service_name` | string |
| `fields` | Array<{ |
| `value` | string |
| `short` | boolean |
| `thumb_url` | string |
| `thumb_width` | number |
| `thumb_height` | number |
| `author_id` | string |
| `channel_id` | string |
| `channel_team` | string |
| `is_msg_unfurl` | boolean |
| `is_reply_unfurl` | boolean |
| `message_blocks` | Array<{ |
| `message` | { |
| `author_name` | string |
| `author_link` | string |
| `author_icon` | string |
| `author_subname` | string |
| `mrkdwn_in` | string[] |
| `footer` | string |
| `is_thread_root_unfurl` | boolean |
| `color` | string |
| `is_share` | boolean |
| `private_channel_prompt` | boolean |
| `file_id` | string |
| `document_section` | { |
| `section_id` | string |
| `snippet` | { |
| `authors` | Array<{ |
| `user_id` | string |
| `is_author` | boolean |
| `is_recent_editor` | boolean |
| `is_most_recent_editor` | boolean |
| `section_edited_ts` | number |
| `file_ids` | unknown[] |
| `bot_team_id` | string |
| `app_unfurl_url` | string |
| `is_app_unfurl` | boolean |
| `footer_icon` | string |
| `msg_subtype` | string |
| `reactions` | Array<{ |
| `users` | string[] |
| `count` | number |
| `files` | Array<{ |
| `created` | number |
| `timestamp` | number |
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
| `permalink_public` | string |
| `is_starred` | boolean |
| `skipped_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `filter_suggestions` | { |
| `facet_count` | number |
| `checked` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.modules.messages.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
