# team.stats.timeSeries

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/team.stats.timeSeries

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `date_range` | no | string |  |
| `team_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `available_date_range` | { |
| `start_date` | string |
| `start_date_ts` | number |
| `computed_ts` | number |
| `membership` | { |
| `total_members` | { |
| `number` | number |
| `change` | number |
| `change_in_percentage` | number |
| `total_claimed_members` | { |
| `monthly_active_users` | { |
| `stats` | Array<{ |
| `ds` | string |
| `full_members_count` | number |
| `guests_count` | number |
| `readers_count_1d` | number |
| `writers_count_1d` | number |
| `readers_count_7d` | number |
| `writers_count_7d` | number |
| `chats_channels_count_1d` | number |
| `chats_groups_count_1d` | number |
| `chats_shared_channels_count_1d` | number |
| `chats_dms_count_1d` | number |
| `cursor_marks_channels_count_1d` | number |
| `cursor_marks_groups_count_1d` | number |
| `cursor_marks_shared_channels_count_1d` | number |
| `cursor_marks_dms_count_1d` | number |
| `total_full_members_count` | number |
| `total_guests_count` | number |
| `claimed_full_members_count` | number |
| `claimed_guests_count` | number |
| `active_users_1d` | number |
| `active_users_7d` | number |
| `active_users_28d` | number |
| `writers_count_28d` | number |
| `files_count_1d` | number |
| `chats_count_1d` | number |
| `channels_count` | number |
| `files_size` | number |
| `messages_count_1d` | number |
| `messages_channels_count_from_apps_1d` | number |
| `users_channels_count` | number |
| `total_members_count` | number |
| `total_claimed_count` | number |
| `chats_channels_count_percentage_1d` | number |
| `chats_groups_count_percentage_1d` | number |
| `chats_dms_count_percentage_1d` | number |
| `cursor_marks_groups_percentage_1d` | number |
| `cursor_marks_dms_percentage_1d` | number |
| `cursor_marks_percentage_1d` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/team.stats.timeSeries.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
