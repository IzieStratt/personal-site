# conversations.emailaddresses.update

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/conversations.emailaddresses.update

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `conversation_id` | no | string |  |
| `name` | no | string |  |
| `emoji` | no | string |  |
| `address` | no | string |  |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

## Response

| field | type |
|---|---|
| `ok` | true |
| `conversation_email_address` | { |
| `team_id` | string |
| `user_id` | string |
| `conversation_id` | string |
| `date_created` | number |
| `address` | string |
| `name` | string |
| `icons` | Record<string, unknown> |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.emailaddresses.update.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
