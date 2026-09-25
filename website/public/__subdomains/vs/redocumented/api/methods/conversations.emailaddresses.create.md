# conversations.emailaddresses.create

- status: undocumented
- verified: existence-only
- tokens: unknown
- write-shaped name: yes, do not call without a human in the loop
- source: internal Canvas (private, hackclub workspace; bonus 4th source, user-linked mid-task)
- call: POST https://slack.com/api/conversations.emailaddresses.create

(from internal-canvas cross-reference; see methods/internal-canvas-2026.md)

## Params

| name | required | type | description |
|---|---|---|---|
| `conversation_id` | no | string |  |

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
| `icons` | { |
| `image_36` | string |
| `image_48` | string |
| `image_72` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/conversations.emailaddresses.create.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
