# conversations.permissions.accountTypes.list

- status: undocumented
- verified: existence-only
- tokens: unknown - not live-tested
- write-shaped name: no
- source: 3kh0/slack-datamine, build 132396 (committed webpack mining)
- call: POST https://slack.com/api/conversations.permissions.accountTypes.list

(inferred from name only; see methods/datamine-2026-09.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `channel_id` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `channel_id` | string |
| `account_types` | Array<{ |
| `account_type` | string |
| `permissions` | Array<{ |
| `permission` | string |
| `is_allowed` | boolean |
| `is_configurable` | boolean |
| `localized_permission_display_name` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.permissions.accountTypes.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
