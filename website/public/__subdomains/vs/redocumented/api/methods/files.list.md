# files.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/files.list

List files for a team, in a channel, or from a user with applied filters.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | channel | Filter files appearing in a specific channel, indicated by its ID. |
| `show_files_hidden_by_limit` | no | boolean | Show truncated file info for files hidden due to being too old, and the team who owns the file being over the file limit. |
| `team_id` | no | string | encoded team id to list files in, required if org token is used. |
| `ts_from` | no | string | Filter files created after this timestamp (inclusive). |
| `ts_to` | no | string | Filter files created before this timestamp (inclusive). |
| `types` | no | string | Filter files by type (see below). You can pass multiple values in the types argument, like types=spaces,snippets.The default value is all, which does not filter the list. |
| `user` | no | user | Filter files created by a single user. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
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
| `permalink` | string |
| `permalink_public` | string |
| `url_static_preview` | string |
| `quip_thread_id` | string |
| `updated` | number |
| `update_notification` | number |
| `canvas_readtime` | number |
| `canvas_creator_id` | string |
| `title_blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `channels` | unknown[] |
| `groups` | string[] |
| `ims` | string[] |
| `teams_shared_with` | string[] |
| `is_restricted_sharing_enabled` | boolean |
| `access` | string |
| `comments_count` | number |
| `is_ai_suggested` | boolean |
| `last_read` | number |
| `show_badge` | boolean |
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
| `list_metadata` | { |
| `schema` | Array<{ |
| `key` | string |
| `is_primary_column` | boolean |
| `options` | { |
| `max` | number |
| `choices` | Array<{ |
| `value` | string |
| `label` | string |
| `color` | string |
| `format` | string |
| `default_value` | null |
| `default_value_typed` | { |
| `select` | string[] |
| `precision` | number |
| `show_member_name` | boolean |
| `notify_users` | boolean |
| `date_format` | string |
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
| `sorts` | Array<{ |
| `ascending` | boolean |
| `column_id` | string |
| `grouping` | { |
| `group_by` | string |
| `group_by_column_id` | string |
| `filters` | Array<{ |
| `operator` | string |
| `values` | string[] |
| `typed_values` | unknown[] |
| `info_column_filters` | unknown[] |
| `integrations` | unknown[] |
| `icon` | string |
| `description` | string |
| `description_blocks` | Array<{ |
| `is_trial` | boolean |
| `subtask_schema` | Array<{ |
| `creation_source` | { |
| `reference_id` | string |
| `todo_mode` | boolean |
| `default_view` | string |
| `last_editor` | string |
| `list_csv_download_url` | string |
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
| `thumb_pdf` | string |
| `thumb_pdf_w` | number |
| `thumb_pdf_h` | number |
| `favorites` | Array<{ |
| `collection_id` | string |
| `collection_name` | string |
| `canvas_template_mode` | string |
| `template_conversion_ts` | number |
| `template_converter_id` | string |
| `paging` | { |
| `count` | number |
| `total` | number |
| `page` | number |
| `pages` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
