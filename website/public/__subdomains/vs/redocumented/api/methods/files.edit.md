# files.edit

- status: undocumented
- verified: not-live-tested
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/files.edit

Edit an uploaded file's content/title in place

## Params

| name | required | type | description |
|---|---|---|---|
| `file` | yes | string | ID of the file to be edited |
| `title` | yes | string | New title of the file |
| `filetype` | no | string | New filetype of the file. See https://api.slack.com/types/file#file_types for a list of all supported types. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `file` | { |
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
| `permalink` | string |
| `permalink_public` | string |
| `alt_txt` | string |
| `comments_count` | number |
| `is_starred` | boolean |
| `shares` | { |
| `private` | Record<string, unknown> |
| `channels` | unknown[] |
| `groups` | string[] |
| `ims` | string[] |
| `has_more_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `url_static_preview` | string |
| `quip_thread_id` | string |
| `updated` | number |
| `update_notification` | number |
| `access` | string |
| `private_channels_with_file_access_count` | number |
| `dm_mpdm_users_with_file_access` | Array<{ |
| `user_id` | string |
| `teams_shared_with` | string[] |
| `is_restricted_sharing_enabled` | boolean |
| `org_or_workspace_access` | string |
| `title_blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `canvas_creator_id` | string |
| `team_pref_version_history_enabled` | boolean |
| `canvas_printing_enabled` | boolean |
| `canvas_template_mode` | string |
| `template_conversion_ts` | number |
| `template_converter_id` | string |
| `is_ai_suggested` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/files.edit.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
