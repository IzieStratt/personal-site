# enterprise.teams.directory

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/enterprise.teams.directory

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `count` | no | number |  |
| `query` | no | string |  |
| `sort` | no | string |  |
| `search` | no | string |  |
| `set_active` | no | boolean |  |
| `type` | no | string |  |
| `id` | no | string |  |
| `enterprise_token` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `items` | Array<{ |
| `id` | string |
| `name` | string |
| `url` | string |
| `domain` | string |
| `avatar_base_url` | string |
| `is_verified` | boolean |
| `icon` | { |
| `image_default` | boolean |
| `image_34` | string |
| `image_44` | string |
| `image_68` | string |
| `image_88` | string |
| `image_102` | string |
| `image_230` | string |
| `image_132` | string |
| `discoverable` | string |
| `archived` | boolean |
| `deleted` | boolean |
| `is_enterprise` | number |
| `created` | number |
| `description` | string |
| `joined_date` | number |
| `can_leave` | boolean |
| `cannot_leave_reasons` | unknown[] |
| `is_member` | boolean |
| `is_assigned` | boolean |
| `user_counts` | { |
| `active_members` | number |
| `active` | boolean |
| `has_join_request` | boolean |
| `date_requested_join` | number |
| `teams` | unknown[] |
| `num_found` | number |
| `next_cursor_mark` | string |
| `on_workspaces` | boolean |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/enterprise.teams.directory.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
