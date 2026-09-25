# admin.analytics.getAppsAnalytics

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/admin.analytics.getAppsAnalytics

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `sort_direction` | no | string |  |
| `sort_column` | no | string |  |
| `team_id` | no | string |  |
| `date_range` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `num_found` | number |
| `apps_analytics` | Array<{ |
| `id` | string |
| `name` | string |
| `type` | unknown[] |
| `categories` | string[] |
| `source` | string |
| `icons` | { |
| `image_32` | string |
| `image_48` | string |
| `image_64` | string |
| `image_72` | string |
| `first_message_sent_date` | number |
| `last_message_sent_date` | number |
| `first_active_date` | number |
| `last_active_date` | number |
| `first_automation_date` | number |
| `last_automation_date` | number |
| `member_reads` | { |
| `avg` | number |
| `min` | number |
| `max` | number |
| `min_observed_start_date` | string |
| `min_observed_end_date` | string |
| `max_observed_start_date` | string |
| `max_observed_end_date` | string |
| `active_users` | { |
| `messages_read` | { |
| `actions_taken` | { |
| `member_automations` | { |
| `messages_sent` | { |
| `automations_executed` | { |
| `messages_consumed` | { |
| `messages_consumed_web` | { |
| `messages_consumed_discovery` | { |
| `messages_consumed_events` | { |
| `messages_consumed_real_time_search` | { |
| `messages_consumed_admin_oversight` | { |
| `files_consumed` | { |
| `next_cursor_mark` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.analytics.getAppsAnalytics.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
