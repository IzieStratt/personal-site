# admin.analytics.getChannelAnalytics

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.analytics.getChannelAnalytics

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `date_interval` | no | string |  |
| `count` | no | number |  |
| `sort_column` | no | string |  |
| `sort_direction` | no | string |  |
| `privacy` | no | string |  |
| `query` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `next_cursor_mark` | string |
| `num_found` | number |
| `channel_analytics` | Array<{ |
| `channel_id` | string |
| `team_id` | string |
| `date_create` | number |
| `is_shared` | boolean |
| `name` | string |
| `topic` | { |
| `purpose` | { |
| `total_members_count` | number |
| `full_members_count` | number |
| `guest_members_count` | number |
| `chats_count` | number |
| `messages_count` | number |
| `reactions_count` | number |
| `users_who_reacted_count` | number |
| `writers_count` | number |
| `is_private` | boolean |
| `last_message_posted` | number |
| `readers_count` | number |
| `writers_percentage` | number |
| `huddles_count` | number |
| `channels` | Array<{ |
| `id` | string |
| `is_channel` | boolean |
| `is_group` | boolean |
| `is_im` | boolean |
| `is_mpim` | boolean |
| `created` | number |
| `is_archived` | boolean |
| `is_general` | boolean |
| `unlinked` | number |
| `name_normalized` | string |
| `is_frozen` | boolean |
| `is_org_shared` | boolean |
| `is_pending_ext_shared` | boolean |
| `pending_shared` | unknown[] |
| `context_team_id` | string |
| `updated` | number |
| `parent_conversation` | null |
| `creator` | string |
| `is_moved` | number |
| `is_ext_shared` | boolean |
| `shared_team_ids` | string[] |
| `internal_team_ids` | string[] |
| `pending_connected_team_ids` | unknown[] |
| `is_member` | boolean |
| `members` | unknown[] |
| `value` | string |
| `last_set` | number |
| `properties` | { |
| `is_dormant` | boolean |
| `tabs` | Array<{ |
| `type` | string |
| `label` | string |
| `is_disabled` | boolean |
| `data` | { |
| `file_id` | string |
| `shared_ts` | string |
| `folder_bookmark_id` | string |
| `tabz` | Array<{ |
| `who_can_manage_tabs` | string |
| `canvas` | { |
| `is_empty` | boolean |
| `quip_thread_id` | string |
| `is_migrated` | boolean |
| `meeting_notes` | { |
| `huddles` | { |
| `ai_notes_settings_restricted` | boolean |
| `is_huddle_channel` | boolean |
| `previous_names` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.analytics.getChannelAnalytics.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
