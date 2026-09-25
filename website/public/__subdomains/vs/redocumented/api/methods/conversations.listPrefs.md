# conversations.listPrefs

- status: undocumented
- verified: not-live-tested
- tokens: session xoxc/xoxd
- write-shaped name: no
- source: first pass -- see methods/*.md and undocumented/INDEX.md for per-method citation
- call: POST https://slack.com/api/conversations.listPrefs

Per-conversation client prefs list

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `prefs` | { |
| `can_huddle` | boolean |
| `can_upload_files` | boolean |
| `space_icon` | string |
| `channel_canvas_summary` | string |
| `space_is_primary` | boolean |
| `space_file_id` | string |
| `space_open_by_default` | boolean |
| `who_can_post` | { |
| `type` | string[] |
| `user` | string[] |
| `can_thread` | { |
| `canvas_share_status` | string |
| `list_share_status` | string |
| `shared_channel_invite_requested` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.listPrefs.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
