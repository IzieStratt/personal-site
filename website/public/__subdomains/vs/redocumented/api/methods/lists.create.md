# lists.create

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/lists.create

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | no | string |  |
| `template_id` | no | string |  |
| `todo_mode` | no | boolean |  |
| `include_copied_list_records` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `list` | { |
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
| `list_metadata` | { |
| `schema` | Array<{ |
| `key` | string |
| `type` | string |
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
| `url_private` | string |
| `url_private_download` | string |
| `permalink` | string |
| `permalink_public` | string |
| `last_editor` | string |
| `list_csv_download_url` | string |
| `updated` | number |
| `is_starred` | boolean |
| `shares` | Record<string, unknown> |
| `channels` | unknown[] |
| `groups` | unknown[] |
| `ims` | unknown[] |
| `has_more_shares` | boolean |
| `access` | string |
| `private_channels_with_file_access_count` | number |
| `dm_mpdm_users_with_file_access` | Array<{ |
| `user_id` | string |
| `teams_shared_with` | string[] |
| `is_restricted_sharing_enabled` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `org_or_workspace_access` | string |
| `is_ai_suggested` | boolean |
| `list_template_mode` | string |
| `list_template_type` | string |
| `list_template_localization_status` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/lists.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
