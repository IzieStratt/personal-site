# search.autocomplete.topEngagedFiles

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/search.autocomplete.topEngagedFiles

(inferred from name only; see methods/datamine-2026-09.md)

## Params

Unknown. Nothing here is guessed; do not invent params for this method.

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
| `skipped_shares` | boolean |
| `has_rich_preview` | boolean |
| `file_access` | string |
| `url_static_preview` | string |
| `quip_thread_id` | string |
| `updated` | number |
| `update_notification` | number |
| `teams_shared_with` | string[] |
| `is_restricted_sharing_enabled` | boolean |
| `access` | string |
| `org_or_workspace_access` | string |
| `title_blocks` | Array<{ |
| `type` | string |
| `block_id` | string |
| `canvas_creator_id` | string |
| `team_pref_version_history_enabled` | boolean |
| `canvas_printing_enabled` | boolean |
| `last_read` | number |
| `is_ai_suggested` | boolean |
| `is_transcription_region_supported` | boolean |
| `transcription` | { |
| `status` | string |
| `mp4` | string |
| `hls` | string |
| `hls_embed` | string |
| `mp4_low` | string |
| `duration_ms` | number |
| `thumb_video` | string |
| `thumb_video_w` | number |
| `thumb_video_h` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/search.autocomplete.topEngagedFiles.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
