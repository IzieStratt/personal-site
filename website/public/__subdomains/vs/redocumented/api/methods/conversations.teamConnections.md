# conversations.teamConnections

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/conversations.teamConnections

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel` | { |
| `id` | string |
| `conversation_host_id` | string |
| `connected_team_ids` | string[] |
| `connected_limited_team_ids` | unknown[] |
| `is_sponsored` | boolean |
| `connections` | Array<{ |
| `team` | { |
| `name` | string |
| `icon` | { |
| `image_default` | boolean |
| `image_34` | string |
| `image_44` | string |
| `image_68` | string |
| `image_88` | string |
| `image_102` | string |
| `image_230` | string |
| `image_132` | string |
| `avatar_base_url` | string |
| `is_verified` | boolean |
| `domain` | string |
| `date_created` | number |
| `requires_sponsorship` | boolean |
| `is_private` | boolean |
| `allows_flag_content` | boolean |
| `is_disconnect_in_progress` | boolean |
| `pending_connections` | unknown[] |
| `previous_connections` | unknown[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.teamConnections.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
