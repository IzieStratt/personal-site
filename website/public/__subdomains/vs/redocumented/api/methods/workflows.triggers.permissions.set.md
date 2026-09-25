# workflows.triggers.permissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/workflows.triggers.permissions.set

Set the permission type for who can run a trigger

## Params

| name | required | type | description |
|---|---|---|---|
| `trigger_id` | yes | string | Encoded ID of the trigger. |
| `permission_type` | yes | enum | The type of permission that defines who can run a trigger. |
| `user_ids` | no | array | List of encoded user IDs. |
| `channel_ids` | no | array | List of encoded channel IDs. |
| `team_ids` | no | array | List of encoded workspace IDs. |
| `org_ids` | no | array | List of encoded organization IDs. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `permission_type` | string |
| `user_ids` | string[] |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.permissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
