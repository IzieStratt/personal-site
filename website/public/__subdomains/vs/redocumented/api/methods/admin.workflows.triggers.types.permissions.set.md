# admin.workflows.triggers.types.permissions.set

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/admin.workflows.triggers.types.permissions.set

Set the permissions for using a trigger type

## Params

| name | required | type | description |
|---|---|---|---|
| `id` | yes | string | The trigger type ID for which to set the permissions. |
| `visibility` | no | enum | The function visibility. |
| `user_ids` | no | array | List of user IDs to allow for named_entities visibility. |
| `permissions` | no | object |  |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/admin.workflows.triggers.types.permissions.set.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
