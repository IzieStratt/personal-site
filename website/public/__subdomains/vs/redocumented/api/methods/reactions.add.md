# reactions.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/reactions.add

Adds a reaction to an item.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | yes | channel | Channel where the message to add reaction to was posted. |
| `name` | yes | string | Reaction (emoji) name. |
| `timestamp` | yes | string | Timestamp of the message to add reaction to. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/reactions.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
