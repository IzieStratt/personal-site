# workflows.triggers.permissions.list

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: no
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/workflows.triggers.permissions.list

Returns the permission type of a trigger and if applicable, includes the entities that have been granted access

## Params

| name | required | type | description |
|---|---|---|---|
| `trigger_id` | yes | string | Encoded ID of the trigger. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |
| `permission_type` | string |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/workflows.triggers.permissions.list.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
