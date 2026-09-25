# admin.analytics.getMemberAnalytics

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.analytics.getMemberAnalytics

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `date_range` | no | string |  |
| `count` | no | number |  |
| `sort_column` | no | string |  |
| `sort_direction` | no | string |  |
| `query` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `next_cursor_mark` | string |
| `num_found` | number |
| `member_activity` | Array<{ |
| `user_id` | string |
| `team_id` | string |
| `username` | string |
| `date_created` | number |
| `is_primary_owner` | boolean |
| `is_owner` | boolean |
| `is_admin` | boolean |
| `is_restricted` | boolean |
| `is_ultra_restricted` | boolean |
| `is_invited_member` | boolean |
| `is_invited_guest` | boolean |
| `real_name` | string |
| `display_name` | string |
| `messages_posted_in_channel` | number |
| `reactions_added` | number |
| `days_active` | number |
| `days_active_desktop` | number |
| `days_active_android` | number |
| `days_active_ios` | number |
| `files_added_count` | number |
| `days_active_apps` | number |
| `days_active_workflows` | number |
| `days_active_slack_connect` | number |
| `total_calls_count` | number |
| `slack_calls_count` | number |
| `slack_huddles_count` | number |
| `search_count` | number |
| `is_billable_seat` | boolean |
| `messages_posted` | number |
| `date_claimed` | number |
| `date_last_active` | number |
| `date_last_active_ios` | number |
| `date_last_active_android` | number |
| `date_last_active_desktop` | number |
| `user_title` | string |
| `date_deleted` | number |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.analytics.getMemberAnalytics.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
