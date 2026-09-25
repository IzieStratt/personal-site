# huddles.history

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: no
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/huddles.history

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `limit` | no | number |  |
| `missed_huddles_only` | no | boolean |  |
| `users` | no | string |  |
| `users_only` | no | boolean |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `huddles` | Array<{ |
| `id` | string |
| `name` | string |
| `created_by` | string |
| `date_start` | number |
| `date_end` | number |
| `participants` | unknown[] |
| `participant_history` | string[] |
| `channels` | string[] |
| `has_ended` | boolean |
| `huddle_link` | string |
| `thread_root_ts` | string |
| `background_id` | string |
| `attached_file_ids` | unknown[] |
| `pending_invitees` | Record<string, unknown> |
| `last_invite_status_by_user` | Record<UserId, string> |
| `prototypes` | { |
| `is_prewarmed` | boolean |
| `is_scheduled` | boolean |
| `recording` | { |
| `can_record_summary` | string |
| `missed_participants` | Record<UserId, string> |
| `channel_type` | string |
| `access_type_by_user` | Record<UserId, number> |
| `response_metadata` | { |
| `next_cursor` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/huddles.history.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
