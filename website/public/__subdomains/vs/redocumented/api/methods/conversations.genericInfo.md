# conversations.genericInfo

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/conversations.genericInfo

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `updated_channels` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channels` | Array<{ |
| `id` | string |
| `created` | number |
| `is_org_shared` | boolean |
| `is_im` | boolean |
| `is_archived` | boolean |
| `context_team_id` | string |
| `updated` | number |
| `is_shared` | boolean |
| `is_frozen` | boolean |
| `user` | string[] |
| `last_read` | string |
| `is_open` | boolean |
| `properties` | { |
| `is_dormant` | boolean |
| `tabs` | Array<{ |
| `type` | string[] |
| `label` | string |
| `data` | { |
| `file_id` | string |
| `shared_ts` | string |
| `mute_edit_updates` | boolean |
| `is_disabled` | boolean |
| `tabz` | Array<{ |
| `posting_restricted_to` | { |
| `threads_restricted_to` | { |
| `canvas` | { |
| `is_empty` | boolean |
| `quip_thread_id` | string |
| `is_migrated` | boolean |
| `meeting_notes` | { |
| `is_locked` | boolean |
| `who_can_manage_tabs` | string |
| `name` | string |
| `is_channel` | boolean |
| `is_group` | boolean |
| `is_mpim` | boolean |
| `is_private` | boolean |
| `is_general` | boolean |
| `unlinked` | number |
| `name_normalized` | string |
| `is_pending_ext_shared` | boolean |
| `pending_shared` | unknown[] |
| `parent_conversation` | null |
| `creator` | string |
| `is_thread_only` | boolean |
| `is_moved` | number |
| `is_ext_shared` | boolean |
| `is_global_shared` | boolean |
| `is_org_default` | boolean |
| `is_org_mandatory` | boolean |
| `pending_connected_team_ids` | unknown[] |
| `topic` | { |
| `value` | string |
| `last_set` | number |
| `purpose` | { |
| `is_file` | boolean |
| `shared_team_ids` | string[] |
| `internal_team_ids` | string[] |
| `previous_names` | string[] |
| `unchanged_channel_ids` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.genericInfo.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
