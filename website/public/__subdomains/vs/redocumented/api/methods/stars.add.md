# stars.add

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/stars.add

Save an item for later. Formerly known as adding a star.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | channel | Channel to add star to, or channel where the message to add star to was posted (used with timestamp). |
| `file` | no | file | File to add star to. |
| `file_comment` | no | string | File comment to add star to. |
| `timestamp` | no | string | Timestamp of the message to add star to. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/stars.add.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
