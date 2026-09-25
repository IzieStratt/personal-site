# reactions.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/reactions.remove

Removes a reaction from an item.

## Params

| name | required | type | description |
|---|---|---|---|
| `name` | yes | string | Reaction (emoji) name. |
| `file` | no | file | File to remove reaction from. |
| `file_comment` | no | string | File comment to remove reaction from. |
| `channel` | no | channel | Channel where the message to remove reaction from was posted. |
| `timestamp` | no | string | Timestamp of the message to remove reaction from. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/reactions.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
