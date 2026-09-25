# search.modules.files

- status: undocumented
- verified: existence-only
- tokens: enterprise xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/search.modules.files

Modular file search

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
| `search_only_team` | no | string |  |
| `facets_result_count` | no | number |  |
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
| `in` | string[] |
| `file_types` | string[] |
| `from` | string[] |
| `ai_filters` | Record<string, unknown> |
| `manual_filters` | { |
| `module` | string |
| `items` | Array<{ |
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
| `permalink` | string |
| `permalink_public` | string |
| `url_static_preview` | string |
| `quip_thread_id` | string |
| `updated` | number |
| `update_notification` | number |
| `skipped_shares` | boolean |
| `teams_shared_with` | string[] |
| `is_restricted_sharing_enabled` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `access` | string |
| `org_or_workspace_access` | string |
| `title_blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `canvas_creator_id` | string |
| `team_pref_version_history_enabled` | boolean |
| `canvas_printing_enabled` | boolean |
| `is_ai_suggested` | boolean |
| `last_read` | number |
| `iid` | string |
| `search_title` | string |
| `search_name` | string |
| `preview` | null |
| `search_preview` | null |
| `canvas_readtime` | number |
| `list_metadata` | { |
| `schema` | Array<{ |
| `key` | string |
| `is_primary_column` | boolean |
| `views` | Array<{ |
| `is_locked` | boolean |
| `position` | string |
| `columns` | Array<{ |
| `visible` | boolean |
| `width` | number |
| `should_wrap_text` | boolean |
| `date_created` | number |
| `created_by` | string |
| `stick_column_left` | boolean |
| `is_all_items_view` | boolean |
| `default_view_key` | string |
| `show_completed_items` | boolean |
| `integrations` | unknown[] |
| `icon` | string |
| `description` | string |
| `description_blocks` | unknown[] |
| `is_trial` | boolean |
| `subtask_schema` | Array<{ |
| `options` | { |
| `format` | string |
| `default_value` | null |
| `show_member_name` | boolean |
| `creation_source` | { |
| `reference_id` | string |
| `todo_mode` | boolean |
| `default_view` | string |
| `list_limits` | { |
| `over_row_maximum` | boolean |
| `row_count_limit` | number |
| `row_count` | number |
| `archived_row_count` | number |
| `over_column_maximum` | boolean |
| `column_count` | number |
| `column_count_limit` | number |
| `over_view_maximum` | boolean |
| `view_count` | number |
| `view_count_limit` | number |
| `max_attachments_per_cell` | number |
| `last_editor` | string |
| `list_csv_download_url` | string |
| `favorites` | Array<{ |
| `collection_id` | string |
| `collection_name` | string |
| `canvas_template_mode` | string |
| `template_conversion_ts` | number |
| `template_converter_id` | string |
| `subtype` | string |
| `is_transcription_region_supported` | boolean |
| `transcription` | { |
| `status` | string |
| `duration_ms` | number |
| `aac` | string |
| `audio_wave_samples` | number[] |
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
| `mp4` | string |
| `hls` | string |
| `hls_embed` | string |
| `mp4_low` | string |
| `thumb_video` | string |
| `thumb_video_w` | number |
| `thumb_video_h` | number |
| `thumb_960` | string |
| `thumb_960_w` | number |
| `thumb_960_h` | number |
| `thumb_1024` | string |
| `thumb_1024_w` | number |
| `thumb_1024_h` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.modules.files.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
