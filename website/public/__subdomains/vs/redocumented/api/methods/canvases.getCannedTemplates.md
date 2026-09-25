# canvases.getCannedTemplates

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/canvases.getCannedTemplates

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `template_names` | no | string |  |
| `is_user_locale` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

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
| `source_team` | string |
| `skipped_shares` | boolean |
| `teams_shared_with` | unknown[] |
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
| `canvas_template_mode` | string |
| `template_conversion_ts` | number |
| `template_name` | string |
| `template_title` | string |
| `template_description` | string |
| `template_icon` | string |
| `is_global_template` | boolean |
| `template_locale` | string |
| `is_ai_suggested` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/canvases.getCannedTemplates.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
