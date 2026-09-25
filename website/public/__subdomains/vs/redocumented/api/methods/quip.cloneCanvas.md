# quip.cloneCanvas

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/quip.cloneCanvas

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `file_id` | no | string |  |
| `keep_original_title` | no | boolean |  |
| `remove_title_section` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

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
| `permalink` | string |
| `permalink_public` | string |
| `url_static_preview` | string |
| `quip_thread_id` | string |
| `update_notification` | null |
| `comments_count` | number |
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
| `title_blocks` | Array<{ |
| `type` | string |
| `canvas_creator_id` | string |
| `team_pref_version_history_enabled` | boolean |
| `canvas_printing_enabled` | boolean |
| `source_canvas_id` | string |
| `is_ai_suggested` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/quip.cloneCanvas.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
