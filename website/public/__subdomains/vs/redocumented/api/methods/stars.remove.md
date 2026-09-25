# stars.remove

- status: documented
- verified: docs-only
- tokens: per official docs
- write-shaped name: yes, do not call without a human in the loop
- source: docs.slack.dev / slack-ruby/slack-api-ref mirror
- call: POST https://slack.com/api/stars.remove

Removes a saved item (star) from an item.

## Params

| name | required | type | description |
|---|---|---|---|
| `channel` | no | channel | Channel to remove star from, or channel where the message to remove star from was posted (used with timestamp). |
| `file` | no | file | File to remove star from. |
| `file_comment` | no | string | File comment to remove star from. |
| `timestamp` | no | string | Timestamp of the message to remove star from. |

Source: slack-ruby/slack-api-ref (mirrors official docs.slack.dev args)

## Response

| field | type |
|---|---|
| `ok` | true |

Source: ImShyMike/slack-undoc-client (generated TS types, cross-referenced not independently verified)

---
JSON: https://vs.izie.top/redocumented/api/methods/stars.remove.json · Full catalog: https://vs.izie.top/redocumented/llms.txt
